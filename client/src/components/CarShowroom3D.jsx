import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Wrench, Zap, Gauge, CarFront, ShieldCheck, Sparkles,
  Eye, RotateCcw, Play, Pause, ChevronRight, Activity, Check
} from 'lucide-react';

const CAR_COLORS = [
  { name: 'Valencia Red', hex: '#dc2626', metallic: 0.85, roughness: 0.22 },
  { name: 'Indiranagar Blue', hex: '#004f9c', metallic: 0.9, roughness: 0.18 },
  { name: 'Midnight Onyx', hex: '#0f172a', metallic: 0.95, roughness: 0.15 },
  { name: 'Glacier Pearl', hex: '#f1f5f9', metallic: 0.7, roughness: 0.25 },
  { name: 'Cyber Amber', hex: '#d97706', metallic: 0.88, roughness: 0.2 },
  { name: 'Emerald British', hex: '#047857', metallic: 0.85, roughness: 0.22 }
];

const DIAGNOSTIC_HOTSPOTS = [
  {
    id: 'engine',
    title: 'Engine & Powertrain',
    service: 'Diagnostics & Electrical',
    position: [0, 0.65, 1.35],
    camTarget: [1.8, 1.2, 2.2],
    status: 'OBD-II Scan Recommended',
    severity: 'warning',
    price: 'From ₹850',
    symptoms: ['Check engine light', 'Engine stutter / knocking', 'Loss of power', 'Rough idle'],
    description: 'Complete 40-point OBD-II engine scan, spark plug test, ignition coil analysis, and fluid check.'
  },
  {
    id: 'battery',
    title: '12V Battery & Alternator',
    service: 'Battery & Jumpstart',
    position: [0.65, 0.65, 1.05],
    camTarget: [2.0, 1.3, 1.8],
    status: 'Voltage: 12.4V (Fair)',
    severity: 'attention',
    price: 'From ₹650',
    symptoms: ['Slow cranking', 'Battery indicator on', 'Dim headlights', 'Clicking sound on turn'],
    description: 'Rapid on-site jumpstarts, terminal anti-corrosion cleaning, alternator output test, and mobile battery swap.'
  },
  {
    id: 'brakes',
    title: 'Ceramic Brakes & Rotors',
    service: 'Brakes & Suspension',
    position: [-0.96, 0.35, 1.35],
    camTarget: [-2.1, 0.7, 1.9],
    status: 'Pad Wear: 65% (Inspect)',
    severity: 'urgent',
    price: 'From ₹900',
    symptoms: ['Squeaking or grinding', 'Vibration during braking', 'Spongy brake pedal', 'ABS warning'],
    description: 'Brembo-grade ceramic brake pad replacements, rotor resurfacing, brake fluid flush, and ABS sensor check.'
  },
  {
    id: 'tires',
    title: 'Wheels, Tyres & Suspension',
    service: 'Flat Tyre & Wheel Service',
    position: [0.96, 0.35, -1.35],
    camTarget: [2.2, 0.7, -1.9],
    status: 'Tread Depth: 4.2mm',
    severity: 'normal',
    price: 'From ₹600',
    symptoms: ['Tyre pressure alert', 'Uneven tread wear', 'Steering wheel pull', 'Punctures'],
    description: 'Doorstep tubeless puncture patch, emergency spare wheel mount, laser wheel alignment, and rotation.'
  },
  {
    id: 'exhaust',
    title: 'Exhaust & Catalytic System',
    service: 'Engine & Oil Service',
    position: [0, 0.35, -2.15],
    camTarget: [0, 1.1, -3.2],
    status: 'Emissions: Nominal',
    severity: 'normal',
    price: 'From ₹1,200',
    symptoms: ['Excessive smoke', 'Loud rumbling or rattling', 'Sulfur odor', 'Reduced fuel mileage'],
    description: 'Muffler and catalytic converter inspection, oxygen sensor diagnostic, and complete exhaust leak sealing.'
  },
  {
    id: 'climate',
    title: 'AC Compressor & Cabin Air',
    service: 'Diagnostics & Electrical',
    position: [0, 1.05, 0.2],
    camTarget: [1.8, 1.8, 0.8],
    status: 'Cabin Filter: Due',
    severity: 'attention',
    price: 'From ₹750',
    symptoms: ['Weak cooling air', 'Musty odor from vents', 'Unusual compressor hissing', 'Fogging windshield'],
    description: 'R134a refrigerant gas top-up, antibacterial evaporator foam wash, and high-efficiency HEPA cabin filter replacement.'
  }
];

export default function CarShowroom3D({ onSelectService, onCheckCar }) {
  const mountRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState(CAR_COLORS[0]);
  const [xrayMode, setXrayMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [headlightsOn, setHeadlightsOn] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [hotspot2DPos, setHotspot2DPos] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // References to 3D objects
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const carGroupRef = useRef(null);
  const carPaintMaterialsRef = useRef([]);
  const carWireframeMaterialsRef = useRef([]);
  const headlightLightsRef = useRef([]);
  const animFrameId = useRef(null);
  const targetCamPos = useRef(null);
  const targetLookAt = useRef(null);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a1120, 0.035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.8, 2.1, 4.4);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below floor
    controls.minDistance = 2.4;
    controls.maxDistance = 8.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.target.set(0, 0.6, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainKeyLight.position.set(5, 7, 5);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 2048;
    mainKeyLight.shadow.mapSize.height = 2048;
    mainKeyLight.shadow.camera.near = 1;
    mainKeyLight.shadow.camera.far = 20;
    mainKeyLight.shadow.bias = -0.0005;
    scene.add(mainKeyLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    blueRimLight.position.set(-6, 4, -4);
    scene.add(blueRimLight);

    const frontFillLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    frontFillLight.position.set(0, 3, 6);
    scene.add(frontFillLight);

    // 6. Floor & Stage
    // Circular cyber grid floor
    const floorRadius = 6;
    const floorGeo = new THREE.CircleGeometry(floorRadius, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070d18,
      roughness: 0.35,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor glow rings
    const ringGeo = new THREE.RingGeometry(2.8, 2.85, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x004f9c, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    const outerRingGeo = new THREE.RingGeometry(4.2, 4.23, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x1479ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.01;
    scene.add(outerRing);

    // Floating tech dust particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = Math.random() * 3 + 0.1;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. BUILD PROCEDURAL HIGH-TECH 3D CAR
    const carGroup = new THREE.Group();
    carGroupRef.current = carGroup;
    scene.add(carGroup);

    // Materials
    const bodyPaintMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(CAR_COLORS[0].hex),
      metalness: CAR_COLORS[0].metallic,
      roughness: CAR_COLORS[0].roughness,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1
    });
    carPaintMaterialsRef.current.push(bodyPaintMat);

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.95,
      roughness: 0.1
    });

    const darkPlasticMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.65,
      metalness: 0.2
    });

    const windowGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a1128,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.75
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x93c5fd,
      emissiveIntensity: 2.5,
      roughness: 0.1
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xff0033,
      emissive: 0xff0022,
      emissiveIntensity: 3.0,
      roughness: 0.1
    });

    const tireRubberMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.85,
      metalness: 0.05
    });

    const brakeCaliperMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.3,
      metalness: 0.7
    });

    const brakeRotorMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.25,
      metalness: 0.9
    });

    // --- CAR BODY COMPONENTS ---
    // A. Main lower chassis / fenders
    const chassisGeo = new THREE.BoxGeometry(1.8, 0.45, 4.3);
    const chassis = new THREE.Mesh(chassisGeo, bodyPaintMat);
    chassis.position.set(0, 0.42, 0);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    carGroup.add(chassis);

    // Front hood slope
    const hoodGeo = new THREE.BoxGeometry(1.76, 0.28, 1.45);
    const hood = new THREE.Mesh(hoodGeo, bodyPaintMat);
    hood.position.set(0, 0.58, 1.15);
    hood.rotation.x = -0.07;
    hood.castShadow = true;
    carGroup.add(hood);

    // Front grille / lower bumper
    const grilleGeo = new THREE.BoxGeometry(1.5, 0.25, 0.2);
    const grille = new THREE.Mesh(grilleGeo, darkPlasticMat);
    grille.position.set(0, 0.36, 2.14);
    carGroup.add(grille);

    // Front splitter
    const splitterGeo = new THREE.BoxGeometry(1.7, 0.05, 0.4);
    const splitter = new THREE.Mesh(splitterGeo, darkPlasticMat);
    splitter.position.set(0, 0.2, 2.05);
    carGroup.add(splitter);

    // B. Cabin & Roof
    const cabinGeo = new THREE.BoxGeometry(1.5, 0.52, 2.2);
    const cabin = new THREE.Mesh(cabinGeo, bodyPaintMat);
    cabin.position.set(0, 0.88, -0.2);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Windshield (front)
    const windshieldGeo = new THREE.BoxGeometry(1.44, 0.48, 0.06);
    const windshield = new THREE.Mesh(windshieldGeo, windowGlassMat);
    windshield.position.set(0, 0.92, 0.88);
    windshield.rotation.x = -0.62;
    carGroup.add(windshield);

    // Rear windshield
    const rearGlassGeo = new THREE.BoxGeometry(1.42, 0.48, 0.06);
    const rearGlass = new THREE.Mesh(rearGlassGeo, windowGlassMat);
    rearGlass.position.set(0, 0.92, -1.28);
    rearGlass.rotation.x = 0.58;
    carGroup.add(rearGlass);

    // Side windows (Left & Right)
    const sideWindowGeo = new THREE.BoxGeometry(0.04, 0.38, 1.6);
    const leftWindow = new THREE.Mesh(sideWindowGeo, windowGlassMat);
    leftWindow.position.set(-0.76, 0.92, -0.2);
    carGroup.add(leftWindow);

    const rightWindow = new THREE.Mesh(sideWindowGeo, windowGlassMat);
    rightWindow.position.set(0.76, 0.92, -0.2);
    carGroup.add(rightWindow);

    // Side Mirrors
    const mirrorGeo = new THREE.BoxGeometry(0.24, 0.12, 0.16);
    const leftMirror = new THREE.Mesh(mirrorGeo, bodyPaintMat);
    leftMirror.position.set(-0.95, 0.82, 0.7);
    carGroup.add(leftMirror);

    const rightMirror = new THREE.Mesh(mirrorGeo, bodyPaintMat);
    rightMirror.position.set(0.95, 0.82, 0.7);
    carGroup.add(rightMirror);

    // C. Rear trunk spoiler & Diffuser
    const spoilerGeo = new THREE.BoxGeometry(1.65, 0.08, 0.3);
    const spoiler = new THREE.Mesh(spoilerGeo, darkPlasticMat);
    spoiler.position.set(0, 0.78, -2.12);
    carGroup.add(spoiler);

    const diffuserGeo = new THREE.BoxGeometry(1.6, 0.15, 0.25);
    const diffuser = new THREE.Mesh(diffuserGeo, darkPlasticMat);
    diffuser.position.set(0, 0.24, -2.12);
    carGroup.add(diffuser);

    // Dual exhaust tips
    const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 16);
    exhaustGeo.rotateX(Math.PI / 2);
    const leftExhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    leftExhaust.position.set(-0.45, 0.22, -2.2);
    carGroup.add(leftExhaust);

    const rightExhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    rightExhaust.position.set(0.45, 0.22, -2.2);
    carGroup.add(rightExhaust);

    // D. Headlights & Taillights
    const headlightGeo = new THREE.BoxGeometry(0.36, 0.12, 0.15);
    const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    leftHeadlight.position.set(-0.66, 0.52, 2.14);
    carGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    rightHeadlight.position.set(0.66, 0.52, 2.14);
    carGroup.add(rightHeadlight);

    // Headlight Spotlights
    const leftSpot = new THREE.SpotLight(0xa5f3fc, 4.0, 10, Math.PI / 6, 0.4);
    leftSpot.position.set(-0.66, 0.52, 2.2);
    leftSpot.target.position.set(-0.66, 0, 8);
    carGroup.add(leftSpot);
    carGroup.add(leftSpot.target);

    const rightSpot = new THREE.SpotLight(0xa5f3fc, 4.0, 10, Math.PI / 6, 0.4);
    rightSpot.position.set(0.66, 0.52, 2.2);
    rightSpot.target.position.set(0.66, 0, 8);
    carGroup.add(rightSpot);
    carGroup.add(rightSpot.target);
    headlightLightsRef.current = [leftSpot, rightSpot];

    // Taillights
    const taillightGeo = new THREE.BoxGeometry(1.6, 0.08, 0.08);
    const taillightBar = new THREE.Mesh(taillightGeo, taillightMat);
    taillightBar.position.set(0, 0.62, -2.16);
    carGroup.add(taillightBar);

    // E. 4 Wheels with Rims & Brake Assemblies
    const wheelPositions = [
      { x: -0.92, y: 0.35, z: 1.35, isLeft: true },  // Front Left
      { x: 0.92, y: 0.35, z: 1.35, isLeft: false },  // Front Right
      { x: -0.92, y: 0.35, z: -1.35, isLeft: true }, // Rear Left
      { x: 0.92, y: 0.35, z: -1.35, isLeft: false }  // Rear Right
    ];

    const tireRadius = 0.35;
    const tireWidth = 0.24;
    const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 32);
    tireGeo.rotateZ(Math.PI / 2);

    const rimGeo = new THREE.CylinderGeometry(tireRadius * 0.72, tireRadius * 0.72, tireWidth + 0.01, 16);
    rimGeo.rotateZ(Math.PI / 2);

    const rotorGeo = new THREE.CylinderGeometry(tireRadius * 0.55, tireRadius * 0.55, 0.03, 24);
    rotorGeo.rotateZ(Math.PI / 2);

    const caliperGeo = new THREE.BoxGeometry(0.08, 0.16, 0.14);

    wheelPositions.forEach((wp) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(wp.x, wp.y, wp.z);

      // Rubber Tire
      const tire = new THREE.Mesh(tireGeo, tireRubberMat);
      tire.castShadow = true;
      wheelAssembly.add(tire);

      // Alloy Rim
      const rim = new THREE.Mesh(rimGeo, chromeMat);
      wheelAssembly.add(rim);

      // Brake Rotor
      const rotor = new THREE.Mesh(rotorGeo, brakeRotorMat);
      rotor.position.x = wp.isLeft ? 0.05 : -0.05;
      wheelAssembly.add(rotor);

      // Brake Caliper
      const caliper = new THREE.Mesh(caliperGeo, brakeCaliperMat);
      caliper.position.set(wp.isLeft ? 0.07 : -0.07, 0.08, 0.06);
      wheelAssembly.add(caliper);

      carGroup.add(wheelAssembly);
    });

    // F. Internal X-Ray Mechanisms (Engine Block, Battery, Drive Shaft)
    const engineBlockGeo = new THREE.BoxGeometry(0.9, 0.5, 0.8);
    const engineMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.8
    });
    const engineBlock = new THREE.Mesh(engineBlockGeo, engineMat);
    engineBlock.position.set(0, 0.55, 1.25);
    carGroup.add(engineBlock);

    const batteryGeo = new THREE.BoxGeometry(0.35, 0.3, 0.4);
    const batteryMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.9,
      roughness: 0.3
    });
    const batteryMesh = new THREE.Mesh(batteryGeo, batteryMat);
    batteryMesh.position.set(0.55, 0.55, 1.0);
    carGroup.add(batteryMesh);

    // Wireframe Diagnostic Mesh
    const wireframeGeo = new THREE.EdgesGeometry(chassisGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
    wireframeMesh.position.copy(chassis.position);
    carGroup.add(wireframeMesh);
    carWireframeMaterialsRef.current = [wireframeMat];

    setIsLoading(false);

    // 8. Animation & Render Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Slow floating dust particles
      const positions = particles.geometry.attributes.position.array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += Math.sin(elapsedTime * 0.5 + i) * 0.002;
        if (positions[i] > 3.2) positions[i] = 0.2;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Outer stage ring pulse
      outerRing.scale.setScalar(1 + Math.sin(elapsedTime * 1.5) * 0.015);

      // Smooth camera interpolation if targeting a hotspot
      if (targetCamPos.current && targetLookAt.current) {
        camera.position.lerp(targetCamPos.current, 0.05);
        controls.target.lerp(targetLookAt.current, 0.05);
        if (camera.position.distanceTo(targetCamPos.current) < 0.05) {
          targetCamPos.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      // Calculate 2D Screen Positions for Hotspot Markers
      if (container && cameraRef.current) {
        const rect = container.getBoundingClientRect();
        const newPos = {};
        DIAGNOSTIC_HOTSPOTS.forEach(spot => {
          const vec = new THREE.Vector3(...spot.position);
          vec.applyMatrix4(carGroup.matrixWorld);
          vec.project(camera);

          // Check if hotspot is in front of camera (z < 1)
          const isVisible = vec.z < 1.0;
          const x = (vec.x * 0.5 + 0.5) * rect.width;
          const y = (-(vec.y * 0.5) + 0.5) * rect.height;

          newPos[spot.id] = { x, y, isVisible };
        });
        setHotspot2DPos(newPos);
      }
    };
    animate();

    // 9. Resize Handling
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
  }, []);

  // Update Body Paint Color
  useEffect(() => {
    carPaintMaterialsRef.current.forEach(mat => {
      mat.color.set(selectedColor.hex);
      mat.metalness = selectedColor.metallic;
      mat.roughness = selectedColor.roughness;
    });
  }, [selectedColor]);

  // Toggle X-Ray Diagnostic Mode
  useEffect(() => {
    carPaintMaterialsRef.current.forEach(mat => {
      if (xrayMode) {
        mat.transparent = true;
        mat.opacity = 0.28;
        mat.wireframe = true;
        mat.color.set(0x0284c7);
      } else {
        mat.transparent = false;
        mat.opacity = 1.0;
        mat.wireframe = false;
        mat.color.set(selectedColor.hex);
      }
    });

    carWireframeMaterialsRef.current.forEach(mat => {
      mat.opacity = xrayMode ? 0.8 : 0;
    });
  }, [xrayMode, selectedColor]);

  // Toggle Auto Rotation
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Toggle Headlights
  useEffect(() => {
    headlightLightsRef.current.forEach(light => {
      light.intensity = headlightsOn ? 4.0 : 0.0;
    });
  }, [headlightsOn]);

  // Focus Camera onto a Hotspot
  const handleHotspotClick = useCallback((spot) => {
    setActiveHotspot(spot);
    setAutoRotate(false);
    targetCamPos.current = new THREE.Vector3(...spot.camTarget);
    targetLookAt.current = new THREE.Vector3(...spot.position);
  }, []);

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    setActiveHotspot(null);
    targetCamPos.current = new THREE.Vector3(3.8, 2.1, 4.4);
    targetLookAt.current = new THREE.Vector3(0, 0.6, 0);
  }, []);

  return (
    <div className="car-showroom-3d-wrap">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="car-showroom-canvas-container" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="car-showroom-loading">
          <div className="loading-spinner" />
          <span>Calibrating 3D Diagnostics Engine...</span>
        </div>
      )}

      {/* Top Floating Control Bar */}
      <div className="car-showroom-topbar">
        <div className="car-showroom-title-badge">
          <Sparkles size={14} className="accent-pulse" />
          <span>Interactive 3D Vehicle Diagnostics</span>
        </div>
        <div className="car-showroom-mode-pills">
          <button
            type="button"
            className={`mode-pill ${!xrayMode ? 'active' : ''}`}
            onClick={() => setXrayMode(false)}
          >
            <CarFront size={13} /> Exterior Showroom
          </button>
          <button
            type="button"
            className={`mode-pill ${xrayMode ? 'active pulse-mode' : ''}`}
            onClick={() => setXrayMode(true)}
          >
            <Activity size={13} /> X-Ray Diagnostics
          </button>
        </div>
      </div>

      {/* 3D Diagnostic Hotspots Overlay */}
      <div className="car-hotspots-layer">
        {DIAGNOSTIC_HOTSPOTS.map(spot => {
          const pos = hotspot2DPos[spot.id];
          if (!pos || !pos.isVisible) return null;
          const isSelected = activeHotspot?.id === spot.id;

          return (
            <div
              key={spot.id}
              className={`hotspot-node ${isSelected ? 'active' : ''} severity-${spot.severity}`}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`
              }}
              onClick={() => handleHotspotClick(spot)}
            >
              <div className="hotspot-pulse" />
              <div className="hotspot-core">
                <Wrench size={12} />
              </div>
              <span className="hotspot-tooltip">{spot.title}</span>
            </div>
          );
        })}
      </div>

      {/* Active Hotspot 3D HUD Card */}
      {activeHotspot && (
        <div className="car-showroom-hud-card">
          <button
            className="hud-close-btn"
            onClick={() => setActiveHotspot(null)}
            title="Close Inspector"
          >
            ×
          </button>
          <div className="hud-badge-row">
            <span className={`hud-severity-tag severity-${activeHotspot.severity}`}>
              <ShieldCheck size={12} /> {activeHotspot.status}
            </span>
            <span className="hud-price">{activeHotspot.price}</span>
          </div>
          <h4 className="hud-title">{activeHotspot.title}</h4>
          <p className="hud-desc">{activeHotspot.description}</p>

          <div className="hud-symptoms-wrap">
            <span className="hud-label">COMMON SYMPTOMS</span>
            <div className="hud-symptoms-tags">
              {activeHotspot.symptoms.map(s => (
                <span key={s} className="symptom-tag">
                  <Check size={11} /> {s}
                </span>
              ))}
            </div>
          </div>

          <div className="hud-actions">
            <button
              className="vp-btn hud-book-btn"
              onClick={() => {
                if (onSelectService) {
                  onSelectService(activeHotspot.service, activeHotspot.title);
                }
              }}
            >
              Fix This Issue Now <ChevronRight size={14} />
            </button>
            <button
              className="vp-ghost-btn hud-check-btn"
              onClick={() => {
                if (onCheckCar) onCheckCar();
              }}
            >
              Run Guided Triage →
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="car-showroom-controls">
        {/* Color Palette Switcher */}
        <div className="color-palette-bar">
          <span className="palette-label">Car Paint</span>
          <div className="color-dots">
            {CAR_COLORS.map(c => (
              <button
                key={c.hex}
                type="button"
                className={`color-dot ${selectedColor.hex === c.hex ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setSelectedColor(c)}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* View & Lighting Toggles */}
        <div className="showroom-toggles-bar">
          <button
            type="button"
            className={`showroom-action-btn ${headlightsOn ? 'active' : ''}`}
            onClick={() => setHeadlightsOn(!headlightsOn)}
            title="Toggle Headlights"
          >
            <Zap size={14} />
            <span>Lights</span>
          </button>
          <button
            type="button"
            className={`showroom-action-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 360 Spin"
          >
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
            <span>Rotate</span>
          </button>
          <button
            type="button"
            className="showroom-action-btn"
            onClick={handleResetCamera}
            title="Reset 3D View"
          >
            <RotateCcw size={14} />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Orbit Tip */}
      <div className="car-showroom-hint">
        <Eye size={12} /> Drag to rotate 360° • Pinch or scroll to zoom • Click nodes for diagnostics
      </div>
    </div>
  );
}

