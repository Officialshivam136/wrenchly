import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CarFront, Check, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

const VEHICLE_PARTS = [
  { id: 'engine', label: 'Engine & Battery (Front)', position: [0, 0.45, 0.9], service: 'Diagnostics & Electrical' },
  { id: 'brakes', label: 'Brakes & Steering (Left)', position: [-0.65, 0.25, 0.7], service: 'Brakes & Suspension' },
  { id: 'flat-tire', label: 'Tyres & Suspension (Right)', position: [0.65, 0.25, -0.7], service: 'Flat Tyre & Wheel Service' },
  { id: 'overheating', label: 'Coolant & Radiator', position: [0, 0.35, 1.2], service: 'Engine & Oil Service' },
  { id: 'electrical', label: 'Cabin & Electrical', position: [0, 0.7, 0], service: 'Diagnostics & Electrical' }
];

export default function Vehicle3DPreview({
  vehicle,
  selectedIssue,
  onSelectIssue
}) {
  const mountRef = useRef(null);
  const [activePart, setActivePart] = useState(selectedIssue || 'engine');
  const [part2DPos, setPart2DPos] = useState({});

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const carGroupRef = useRef(null);
  const animFrameId = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(2.8, 1.8, 3.2);
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
    controls.minDistance = 2.0;
    controls.maxDistance = 6.0;
    controls.target.set(0, 0.35, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // 5. Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(4, 6, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const blueRim = new THREE.DirectionalLight(0x004f9c, 1.2);
    blueRim.position.set(-4, 3, -3);
    scene.add(blueRim);

    // 6. Ground Shadow Disc
    const discGeo = new THREE.CircleGeometry(2.2, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x004f9c,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.01;
    scene.add(disc);

    // 7. Compact 3D Car Model
    const carGroup = new THREE.Group();
    carGroupRef.current = carGroup;
    scene.add(carGroup);

    // Car Body Paint
    const isSUV = ['Thar', 'Creta', 'Nexon', 'Brezza', 'Fortuner', 'Scorpio', 'Safari'].some(m =>
      vehicle?.model?.includes(m)
    );

    const bodyHeight = isSUV ? 0.48 : 0.38;
    const cabinHeight = isSUV ? 0.52 : 0.42;

    const paintMat = new THREE.MeshStandardMaterial({
      color: 0x004f9c,
      metalness: 0.85,
      roughness: 0.2
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      transmission: 0.8,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7
    });

    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    const wheelChromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.2 });

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(1.3, bodyHeight, 2.8);
    const chassis = new THREE.Mesh(chassisGeo, paintMat);
    chassis.position.y = bodyHeight / 2 + 0.15;
    chassis.castShadow = true;
    carGroup.add(chassis);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.15, cabinHeight, 1.4);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, bodyHeight + cabinHeight / 2 + 0.12, -0.15);
    carGroup.add(cabin);

    // Wheels
    const wheelPositions = [
      [-0.68, 0.22, 0.85],
      [0.68, 0.22, 0.85],
      [-0.68, 0.22, -0.85],
      [0.68, 0.22, -0.85]
    ];
    const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.14, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(wx, wy, wz);
      carGroup.add(wheel);

      const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 8);
      hubGeo.rotateZ(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, wheelChromeMat);
      hub.position.set(wx, wy, wz);
      carGroup.add(hub);
    });

    // Headlights
    const lightGeo = new THREE.BoxGeometry(0.24, 0.1, 0.05);
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x93c5fd, emissiveIntensity: 2.0 });
    const leftLight = new THREE.Mesh(lightGeo, lightMat);
    leftLight.position.set(-0.45, 0.38, 1.41);
    carGroup.add(leftLight);

    const rightLight = new THREE.Mesh(lightGeo, lightMat);
    rightLight.position.set(0.45, 0.38, 1.41);
    carGroup.add(rightLight);

    // 8. Animation Loop
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);

      // Project part coordinates to 2D
      if (container && cameraRef.current) {
        const rect = container.getBoundingClientRect();
        const newPos = {};
        VEHICLE_PARTS.forEach(part => {
          const vec = new THREE.Vector3(...part.position);
          vec.applyMatrix4(carGroup.matrixWorld);
          vec.project(camera);

          const isVisible = vec.z < 1.0;
          const x = (vec.x * 0.5 + 0.5) * rect.width;
          const y = (-(vec.y * 0.5) + 0.5) * rect.height;

          newPos[part.id] = { x, y, isVisible };
        });
        setPart2DPos(newPos);
      }
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
  }, [vehicle]);

  const handlePartClick = (part) => {
    setActivePart(part.id);
    if (controlsRef.current) controlsRef.current.autoRotate = false;
    if (onSelectIssue) onSelectIssue(part.id);
  };

  return (
    <div className="vehicle-3d-box">
      <div className="vehicle-3d-header">
        <div>
          <span className="vehicle-3d-badge">
            <Sparkles size={12} /> 3D Vehicle Inspector
          </span>
          <h4>{vehicle?.year || 2022} {vehicle?.make || 'Hyundai'} {vehicle?.model || 'Creta'}</h4>
        </div>
        <button
          type="button"
          className="vehicle-3d-reset"
          onClick={() => {
            if (controlsRef.current) controlsRef.current.autoRotate = true;
          }}
          title="Auto-rotate"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      <div ref={mountRef} className="vehicle-3d-canvas-wrap" />

      {/* 3D Clickable Diagnostic Pins */}
      <div className="vehicle-3d-pins-layer">
        {VEHICLE_PARTS.map(part => {
          const pos = part2DPos[part.id];
          if (!pos || !pos.isVisible) return null;
          const isSelected = activePart === part.id || selectedIssue === part.id;

          return (
            <button
              key={part.id}
              type="button"
              className={`vehicle-part-pin ${isSelected ? 'active' : ''}`}
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
              onClick={() => handlePartClick(part)}
              title={part.label}
            >
              <span className="pin-pulse" />
              <span className="pin-dot">
                {isSelected ? <Check size={10} /> : <AlertCircle size={10} />}
              </span>
              <span className="pin-text">{part.label}</span>
            </button>
          );
        })}
      </div>

      <div className="vehicle-3d-footer">
        <CarFront size={14} /> Tap any part on the 3D car to target your service request
      </div>
    </div>
  );
}
