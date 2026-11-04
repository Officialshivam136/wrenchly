import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Navigation, MapPin, Gauge, ShieldCheck, Radio,
  Camera, Zap, Clock3, RotateCcw, Compass
} from 'lucide-react';

export default function DispatchTracker3D({
  mechanicName = 'Bengaluru Mobile Mechanics',
  etaMinutes = 11,
  distanceKm = '1.4 km',
  statusText = 'In Route to Your Location',
  onCallMechanic
}) {
  const mountRef = useRef(null);
  const [viewMode, setViewMode] = useState('isometric'); // 'isometric' | 'topdown' | 'follow'
  const [progress, setProgress] = useState(0.42); // 42% arrived
  const [speed, setSpeed] = useState(38);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const vanGroupRef = useRef(null);
  const animFrameId = useRef(null);
  const curveRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a1128, 0.04);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 5, 6);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 15;
    controls.target.set(0, 0.3, 0);
    controlsRef.current = controls;

    // 5. Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const redRim = new THREE.DirectionalLight(0xdc2626, 1.2);
    redRim.position.set(-6, 3, -4);
    scene.add(redRim);

    // 6. Ground & City Grid
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070e1b,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Overlay
    const grid = new THREE.GridHelper(24, 24, 0x1e3a8a, 0x0f2042);
    grid.position.y = 0.02;
    scene.add(grid);

    // Low-poly City Block Outlines (Procedural)
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0d1f3d,
      roughness: 0.7,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85
    });
    const buildingEdgeMat = new THREE.LineBasicMaterial({ color: 0x1d4ed8 });

    const buildingCoords = [
      [-3.5, 1.2, -2.5, 1.4, 2.4, 1.6],
      [-3.5, 0.8, 1.5, 1.6, 1.6, 1.8],
      [3.8, 1.4, -2.0, 1.8, 2.8, 1.6],
      [3.6, 1.0, 2.2, 1.6, 2.0, 1.4],
      [-1.5, 0.6, -4.5, 2.2, 1.2, 1.4],
      [1.8, 0.9, 4.8, 1.8, 1.8, 1.5]
    ];

    buildingCoords.forEach(([bx, by, bz, bw, bh, bd]) => {
      const bGeo = new THREE.BoxGeometry(bw, bh, bd);
      const bMesh = new THREE.Mesh(bGeo, buildingMat);
      bMesh.position.set(bx, by, bz);
      scene.add(bMesh);

      const edges = new THREE.EdgesGeometry(bGeo);
      const line = new THREE.LineSegments(edges, buildingEdgeMat);
      line.position.copy(bMesh.position);
      scene.add(line);
    });

    // 7. Curving Route Path (Spline)
    const routePoints = [
      new THREE.Vector3(-4.5, 0.05, -3.5),
      new THREE.Vector3(-2.0, 0.05, -2.2),
      new THREE.Vector3(0.0, 0.05, -0.5),
      new THREE.Vector3(1.5, 0.05, 1.2),
      new THREE.Vector3(3.5, 0.05, 3.2)
    ];
    const curve = new THREE.CatmullRomCurve3(routePoints);
    curveRef.current = curve;

    // Glowing Neon Road Mesh
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.14, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x004f9c,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tube);

    // Road dashed line
    const roadPoints = curve.getPoints(50);
    const roadLineGeo = new THREE.BufferGeometry().setFromPoints(roadPoints);
    const roadLineMat = new THREE.LineDashedMaterial({
      color: 0xffffff,
      dashSize: 0.25,
      gapSize: 0.15,
      linewidth: 2
    });
    const roadLine = new THREE.Line(roadLineGeo, roadLineMat);
    roadLine.computeLineDistances();
    roadLine.position.y = 0.08;
    scene.add(roadLine);

    // 8. User Destination Beacon
    const destGroup = new THREE.Group();
    destGroup.position.copy(routePoints[routePoints.length - 1]);
    scene.add(destGroup);

    // Glowing destination pin
    const pinGeo = new THREE.ConeGeometry(0.22, 0.5, 16);
    pinGeo.rotateX(Math.PI);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xef4444,
      emissiveIntensity: 2.0
    });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.y = 0.6;
    destGroup.add(pin);

    // Radar Concentric Rings
    const radarRingGeo = new THREE.RingGeometry(0.3, 0.35, 32);
    const radarRingMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const radarRing = new THREE.Mesh(radarRingGeo, radarRingMat);
    radarRing.rotation.x = -Math.PI / 2;
    radarRing.position.y = 0.06;
    destGroup.add(radarRing);

    // User stationary car model
    const userCarGeo = new THREE.BoxGeometry(0.6, 0.3, 1.2);
    const userCarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const userCar = new THREE.Mesh(userCarGeo, userCarMat);
    userCar.position.set(0.3, 0.15, 0.4);
    destGroup.add(userCar);

    // 9. Mechanic 3D Van Model
    const vanGroup = new THREE.Group();
    vanGroupRef.current = vanGroup;
    scene.add(vanGroup);

    // Van body
    const vanBodyGeo = new THREE.BoxGeometry(0.65, 0.45, 1.3);
    const vanBodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.2
    });
    const vanBody = new THREE.Mesh(vanBodyGeo, vanBodyMat);
    vanBody.position.y = 0.32;
    vanBody.castShadow = true;
    vanGroup.add(vanBody);

    // Van cabin
    const vanCabinGeo = new THREE.BoxGeometry(0.63, 0.38, 0.6);
    const vanCabinMat = new THREE.MeshStandardMaterial({
      color: 0x004f9c,
      metalness: 0.7,
      roughness: 0.2
    });
    const vanCabin = new THREE.Mesh(vanCabinGeo, vanCabinMat);
    vanCabin.position.set(0, 0.34, 0.36);
    vanGroup.add(vanCabin);

    // Emergency beacon roof flasher
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 3.5
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 0.6, 0.2);
    vanGroup.add(beacon);

    // Van Headlights (Spotlights)
    const vanHeadlight = new THREE.SpotLight(0xa5f3fc, 3.5, 6, Math.PI / 6, 0.4);
    vanHeadlight.position.set(0, 0.35, 0.7);
    vanGroup.add(vanHeadlight);

    // 4 Van Wheels
    const vanWheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    vanWheelGeo.rotateZ(Math.PI / 2);
    const vanWheelMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    [
      [-0.34, 0.12, 0.4],
      [0.34, 0.12, 0.4],
      [-0.34, 0.12, -0.4],
      [0.34, 0.12, -0.4]
    ].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(vanWheelGeo, vanWheelMat);
      w.position.set(wx, wy, wz);
      vanGroup.add(w);
    });

    // 10. Animation Loop
    let clock = new THREE.Clock();
    let currentT = 0.2;

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Pulsing radar ring
      const ringScale = 1 + (Math.sin(elapsed * 3) + 1) * 0.8;
      radarRing.scale.set(ringScale, ringScale, 1);
      radarRingMat.opacity = Math.max(0.1, 1 - (ringScale - 1) / 1.6);

      // Flashing amber beacon
      beaconMat.emissiveIntensity = 2.0 + Math.sin(elapsed * 10) * 2.0;

      // Move Van smoothly along curve
      currentT = (currentT + delta * 0.045) % 0.92;
      setProgress(currentT);

      const vanPos = curve.getPointAt(currentT);
      vanGroup.position.copy(vanPos);

      // Orient Van forward along path tangent
      const tangent = curve.getTangentAt(currentT).normalize();
      const lookTarget = vanPos.clone().add(tangent);
      vanGroup.lookAt(lookTarget);

      // Dynamic Speed variance
      setSpeed(Math.round(36 + Math.sin(elapsed * 2) * 6));

      // Adjust camera depending on view mode
      if (viewMode === 'follow') {
        const camOffset = tangent.clone().multiplyScalar(-2.5).add(new THREE.Vector3(0, 1.8, 0));
        camera.position.lerp(vanPos.clone().add(camOffset), 0.08);
        controls.target.lerp(vanPos, 0.08);
      } else if (viewMode === 'topdown') {
        camera.position.lerp(new THREE.Vector3(0, 9, 0.1), 0.05);
        controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [viewMode]);

  const switchCameraView = (mode) => {
    setViewMode(mode);
    if (!cameraRef.current || !controlsRef.current) return;
    if (mode === 'isometric') {
      cameraRef.current.position.set(4, 5, 6);
      controlsRef.current.target.set(0, 0.3, 0);
    }
  };

  return (
    <div className="dispatch-3d-wrap">
      {/* 3D Canvas */}
      <div ref={mountRef} className="dispatch-3d-canvas" />

      {/* Live HUD Header */}
      <div className="dispatch-hud-top">
        <div className="dispatch-live-badge">
          <span className="live-dot" />
          <Radio size={14} /> LIVE 3D GPS RADAR
        </div>
        <div className="dispatch-view-modes">
          <button
            type="button"
            className={`view-pill ${viewMode === 'isometric' ? 'active' : ''}`}
            onClick={() => switchCameraView('isometric')}
          >
            <Compass size={12} /> Isometric 3D
          </button>
          <button
            type="button"
            className={`view-pill ${viewMode === 'follow' ? 'active' : ''}`}
            onClick={() => switchCameraView('follow')}
          >
            <Camera size={12} /> Chase Cam
          </button>
          <button
            type="button"
            className={`view-pill ${viewMode === 'topdown' ? 'active' : ''}`}
            onClick={() => switchCameraView('topdown')}
          >
            <Navigation size={12} /> Radar 2D
          </button>
        </div>
      </div>

      {/* Floating Diagnostics HUD Overlay */}
      <div className="dispatch-hud-telemetry">
        <div className="telemetry-card">
          <div className="telemetry-item">
            <span className="telemetry-label">
              <Gauge size={12} /> Dispatch Speed
            </span>
            <strong>{speed} km/h</strong>
          </div>
          <div className="telemetry-divider" />
          <div className="telemetry-item">
            <span className="telemetry-label">
              <Clock3 size={12} /> Estimated Arrival
            </span>
            <strong style={{ color: '#004f9c' }}>{etaMinutes} Mins</strong>
          </div>
          <div className="telemetry-divider" />
          <div className="telemetry-item">
            <span className="telemetry-label">
              <MapPin size={12} /> Distance
            </span>
            <strong>{distanceKm}</strong>
          </div>
        </div>
      </div>

      {/* Bottom Dispatch Progress Banner */}
      <div className="dispatch-hud-bottom">
        <div className="dispatch-progress-info">
          <div className="mechanic-avatar-mini">
            <ShieldCheck size={16} />
          </div>
          <div>
            <strong>{mechanicName}</strong>
            <p>{statusText} • GPS Beacon Synced</p>
          </div>
        </div>
        <div className="dispatch-progress-bar-wrap">
          <div
            className="dispatch-progress-bar-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
