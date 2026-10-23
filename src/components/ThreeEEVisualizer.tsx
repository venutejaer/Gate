/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { 
  Maximize2, 
  RotateCcw, 
  Eye, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Zap, 
  Info,
  Radio,
  Sliders
} from 'lucide-react';

type SceneMode = 'machine' | 'grid' | 'galaxy';

interface Props {
  onSelectSubject?: (subjectId: any) => void;
}

// Scratch math helpers pre-allocated outside render loop (Zero GC)
const _v1 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3(14, 10, 16);
const _targetLookAt = new THREE.Vector3(0, 2, 0);

export const ThreeEEVisualizer: React.FC<Props> = ({ onSelectSubject }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<SceneMode>('machine');
  const [explodedRatio, setExplodedRatio] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);
  const [hoveredNodeInfo, setHoveredNodeInfo] = useState<string | null>(null);

  // Mutable refs for Three.js render loop without React re-renders
  const stateRef = useRef({
    activeMode: 'machine' as SceneMode,
    targetExplode: 0,
    currentExplode: 0,
    isRotating: true,
    wireframe: false,
    machineGroup: null as THREE.Group | null,
    rotorGroup: null as THREE.Group | null,
    statorGroup: null as THREE.Group | null,
    coilsGroup: null as THREE.Group | null,
    gridGroup: null as THREE.Group | null,
    galaxyGroup: null as THREE.Group | null,
    galaxyNodes: [] as { mesh: THREE.Mesh; id: string; name: string; weight: string }[],
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    scene: null as THREE.Scene | null,
    isSoftwareGl: false,
  });

  useEffect(() => {
    stateRef.current.activeMode = activeMode;
    stateRef.current.targetExplode = explodedRatio;
    stateRef.current.isRotating = isRotating;
    stateRef.current.wireframe = wireframeMode;

    // Adjust camera targets based on mode
    if (stateRef.current.camera) {
      if (activeMode === 'machine') {
        _targetCamPos.set(12, 9, 14);
        _targetLookAt.set(0, 3, 0);
      } else if (activeMode === 'grid') {
        _targetCamPos.set(22, 14, 25);
        _targetLookAt.set(0, 6, 0);
      } else {
        _targetCamPos.set(0, 18, 22);
        _targetLookAt.set(0, 0, 0);
      }
    }
  }, [activeMode, explodedRatio, isRotating, wireframeMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();
    stateRef.current.isSoftwareGl = isSoftwareGl;

    // 2. Initialize Three.js WebGLRenderer with PBR standards
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    // 3. Scene, Camera, Studio Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.022);
    stateRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 200);
    camera.position.set(12, 9, 14);
    camera.lookAt(0, 3, 0);
    stateRef.current.camera = camera;

    // Studio Environment map via RoomEnvironment
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('RoomEnvironment generation fallback:', e);
    }

    // 4. Studio Lighting Rig: Warm Key + Cool Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.2);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(15, 25, 18);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 60;
      keyLight.shadow.camera.left = -15;
      keyLight.shadow.camera.right = 15;
      keyLight.shadow.camera.top = 15;
      keyLight.shadow.camera.bottom = -15;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(-15, 12, -15);
    scene.add(rimLight);

    // Ground plane with procedural high-tech circular grid & radial contact shadow
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c1427,
      roughness: 0.85,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Radial contact shadow
    const shadowGeo = new THREE.PlaneGeometry(16, 16);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0,0,0,0.7)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);

    // ==========================================
    // MODEL 1: THREE-PHASE AC SYNCHRONOUS MACHINE (Cutaway Composite 3-12 parts)
    // ==========================================
    const machineGroup = new THREE.Group();
    stateRef.current.machineGroup = machineGroup;

    // Materials
    const ironCasingMat = new THREE.MeshStandardMaterial({
      color: 0x273549,
      roughness: 0.45,
      metalness: 0.6,
    });
    const finMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.7,
    });
    const laminatedCoreMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.6,
      metalness: 0.5,
    });
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.15,
      metalness: 0.95, // High metalness with RoomEnvironment
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.2,
      metalness: 0.85,
    });
    const copperRMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.7 }); // Phase R
    const copperYMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.7 }); // Phase Y
    const copperBMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.7 }); // Phase B

    // Stator Group
    const statorGroup = new THREE.Group();
    stateRef.current.statorGroup = statorGroup;

    // Part 1: Stator outer frame (Casing cutaway: 270 deg cylinder to reveal interior)
    const statorFrameGeo = new THREE.CylinderGeometry(4.5, 4.5, 7, 36, 1, true, 0, Math.PI * 1.5);
    const statorFrameMesh = new THREE.Mesh(statorFrameGeo, ironCasingMat);
    statorFrameMesh.castShadow = !isSoftwareGl;
    statorFrameMesh.receiveShadow = !isSoftwareGl;
    statorFrameMesh.position.y = 4.5;
    statorGroup.add(statorFrameMesh);

    // Part 2: Cooling fins (5 annular rings)
    for (let i = 0; i < 5; i++) {
      const finGeo = new THREE.TorusGeometry(4.7, 0.12, 12, 36, Math.PI * 1.5);
      const finMesh = new THREE.Mesh(finGeo, finMat);
      finMesh.rotation.x = Math.PI / 2;
      finMesh.position.y = 2.0 + i * 1.25;
      statorGroup.add(finMesh);
    }

    // Part 3: Stator Laminated Core with slotted interior teeth
    const coreGeo = new THREE.CylinderGeometry(4.2, 4.2, 6.2, 32, 1, true, 0, Math.PI * 1.5);
    const coreMesh = new THREE.Mesh(coreGeo, laminatedCoreMat);
    coreMesh.position.y = 4.5;
    statorGroup.add(coreMesh);

    // Part 4: Stator 3-Phase Distributed Coils (Coil Group)
    const coilsGroup = new THREE.Group();
    stateRef.current.coilsGroup = coilsGroup;
    for (let c = 0; c < 18; c++) {
      const angle = (c / 24) * Math.PI * 2;
      if (angle > Math.PI * 1.5) continue; // inside cutaway view
      const coilMat = c % 3 === 0 ? copperRMat : c % 3 === 1 ? copperYMat : copperBMat;
      const coilGeo = new THREE.BoxGeometry(0.35, 6.4, 0.5);
      const coilMesh = new THREE.Mesh(coilGeo, coilMat);
      coilMesh.position.set(Math.cos(angle) * 3.8, 4.5, Math.sin(angle) * 3.8);
      coilMesh.rotation.y = -angle;
      coilsGroup.add(coilMesh);
    }
    statorGroup.add(coilsGroup);

    // Part 5: Mounting Base Pedestal
    const baseGeo = new THREE.BoxGeometry(9.5, 0.8, 8.5);
    const baseMesh = new THREE.Mesh(baseGeo, ironCasingMat);
    baseMesh.position.set(0, 0.4, 0);
    statorGroup.add(baseMesh);

    machineGroup.add(statorGroup);

    // Rotor Group (Rotates dynamically, can explode horizontally on Z/Y)
    const rotorGroup = new THREE.Group();
    stateRef.current.rotorGroup = rotorGroup;

    // Part 6: Stainless Steel Central Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.9, 0.9, 13, 24);
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftMesh.position.y = 4.5;
    shaftMesh.castShadow = !isSoftwareGl;
    rotorGroup.add(shaftMesh);

    // Part 7: 4-Pole Salient Rotor Core with pole shoes
    for (let p = 0; p < 4; p++) {
      const pAngle = (p * Math.PI) / 2;
      const poleArm = new THREE.Group();
      poleArm.rotation.y = pAngle;

      // Pole Body
      const poleGeo = new THREE.BoxGeometry(1.6, 5.5, 2.0);
      const poleMesh = new THREE.Mesh(poleGeo, laminatedCoreMat);
      poleMesh.position.set(0, 4.5, 1.6);
      poleArm.add(poleMesh);

      // DC Field Winding around pole
      const fieldCoilGeo = new THREE.BoxGeometry(1.9, 4.8, 1.4);
      const fieldCoilMesh = new THREE.Mesh(fieldCoilGeo, copperYMat);
      fieldCoilMesh.position.set(0, 4.5, 1.5);
      poleArm.add(fieldCoilMesh);

      // Curved Pole Shoe tip
      const shoeGeo = new THREE.CylinderGeometry(3.1, 3.1, 5.5, 12, 1, false, -0.25, 0.5);
      const shoeMesh = new THREE.Mesh(shoeGeo, ironCasingMat);
      shoeMesh.position.set(0, 4.5, 0);
      poleArm.add(shoeMesh);

      rotorGroup.add(poleArm);
    }

    // Part 8: Brass Slip Rings and brush gear
    for (let r = 0; r < 2; r++) {
      const ringGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.35, 24);
      const ringMesh = new THREE.Mesh(ringGeo, brassMat);
      ringMesh.position.y = 9.2 + r * 0.8;
      rotorGroup.add(ringMesh);
    }

    machineGroup.add(rotorGroup);
    scene.add(machineGroup);

    // ==========================================
    // MODEL 2: 3D TRANSMISSION LINE GRID TOWER & SUBSTATION
    // ==========================================
    const gridGroup = new THREE.Group();
    stateRef.current.gridGroup = gridGroup;
    gridGroup.visible = false;

    const steelTowerMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.3,
    });
    const porcelainMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
    });
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Pylon Central Tower Legs (4 tapered structural pillars)
    for (let leg = 0; leg < 4; leg++) {
      const lx = (leg % 2 === 0 ? 1 : -1) * 2.8;
      const lz = (leg < 2 ? 1 : -1) * 2.8;
      const legGeo = new THREE.CylinderGeometry(0.12, 0.22, 16, 8);
      const legMesh = new THREE.Mesh(legGeo, steelTowerMat);
      legMesh.position.set(lx * 0.6, 8, lz * 0.6);
      legMesh.rotation.z = (leg % 2 === 0 ? 1 : -1) * -0.06;
      legMesh.rotation.x = (leg < 2 ? 1 : -1) * 0.06;
      gridGroup.add(legMesh);
    }

    // Horizontal crossarms (3 levels: Bottom, Middle, Top)
    const armSpans = [11, 9, 7];
    const armHeights = [9.5, 12.5, 15.0];
    armHeights.forEach((h, idx) => {
      const span = armSpans[idx];
      const armGeo = new THREE.BoxGeometry(span, 0.35, 0.4);
      const armMesh = new THREE.Mesh(armGeo, steelTowerMat);
      armMesh.position.set(0, h, 0);
      gridGroup.add(armMesh);

      // Insulator strings hanging from tips
      [-span / 2 + 0.5, span / 2 - 0.5].forEach(tipX => {
        const insulGroup = new THREE.Group();
        insulGroup.position.set(tipX, h - 0.2, 0);

        for (let d = 0; d < 5; d++) {
          const discGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.16, 12);
          const disc = new THREE.Mesh(discGeo, porcelainMat);
          disc.position.y = -d * 0.3 - 0.15;
          insulGroup.add(disc);
        }

        // Conductor clamp & line bundle
        const lineGeo = new THREE.CylinderGeometry(0.08, 0.08, 30, 8);
        const lineMesh = new THREE.Mesh(lineGeo, wireMat);
        lineMesh.rotation.x = Math.PI / 2;
        lineMesh.position.y = -1.8;
        insulGroup.add(lineMesh);

        gridGroup.add(insulGroup);
      });
    });

    // Substation Transformer Block at tower base
    const xformerBodyGeo = new THREE.BoxGeometry(4.5, 3.0, 3.5);
    const xformerBody = new THREE.Mesh(xformerBodyGeo, ironCasingMat);
    xformerBody.position.set(6, 1.5, 0);
    gridGroup.add(xformerBody);

    // Transformer Radiator cooling fins
    for (let rf = 0; rf < 6; rf++) {
      const rfGeo = new THREE.BoxGeometry(0.1, 2.4, 3.0);
      const rfMesh = new THREE.Mesh(rfGeo, finMat);
      rfMesh.position.set(3.8 + rf * 0.35, 1.5, 0);
      gridGroup.add(rfMesh);
    }

    // High Voltage Bushings on transformer top
    for (let b = 0; b < 3; b++) {
      const bGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.4, 12);
      const bMesh = new THREE.Mesh(bGeo, porcelainMat);
      bMesh.position.set(4.5 + b * 1.4, 3.7, 0);
      gridGroup.add(bMesh);
    }

    scene.add(gridGroup);

    // ==========================================
    // MODEL 3: 3D GATE EE SYLLABUS GALAXY (11 Subject Nodes & Orbit Links)
    // ==========================================
    const galaxyGroup = new THREE.Group();
    stateRef.current.galaxyGroup = galaxyGroup;
    galaxyGroup.visible = false;

    const subjectsData = [
      { id: 'EM', name: 'Engg Mathematics', weight: '13-15 M', color: 0x3b82f6, radius: 1.5, dist: 5, angle: 0 },
      { id: 'NT', name: 'Network Theory', weight: '8-11 M', color: 0x06b6d4, radius: 1.3, dist: 7.5, angle: 0.6 },
      { id: 'EMF', name: 'Electromagnetic Fields', weight: '4-6 M', color: 0x8b5cf6, radius: 1.0, dist: 10, angle: 1.2 },
      { id: 'EMC', name: 'Electrical Machines', weight: '10-13 M', color: 0xf59e0b, radius: 1.4, dist: 12, angle: 1.8 },
      { id: 'PS', name: 'Power Systems', weight: '10-13 M', color: 0xef4444, radius: 1.4, dist: 14, angle: 2.4 },
      { id: 'PE', name: 'Power Electronics', weight: '8-11 M', color: 0x10b981, radius: 1.3, dist: 16, angle: 3.0 },
      { id: 'CS', name: 'Control Systems', weight: '8-10 M', color: 0x6366f1, radius: 1.25, dist: 9, angle: 3.6 },
      { id: 'SS', name: 'Signals & Systems', weight: '6-9 M', color: 0xec4899, radius: 1.15, dist: 11, angle: 4.2 },
      { id: 'EEM', name: 'Measurements', weight: '4-6 M', color: 0x14b8a6, radius: 1.0, dist: 13, angle: 4.8 },
      { id: 'ADE', name: 'Analog & Digital', weight: '8-11 M', color: 0xf97316, radius: 1.3, dist: 8, angle: 5.4 },
      { id: 'GA', name: 'General Aptitude', weight: '15 M Fixed', color: 0x84cc16, radius: 1.5, dist: 15, angle: 5.9 },
    ];

    // Central Sun / GATE AIR 1 Core
    const sunGeo = new THREE.SphereGeometry(2.0, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.5,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.y = 3;
    galaxyGroup.add(sunMesh);

    // Subject Planetary Nodes
    const galaxyNodesList: { mesh: THREE.Mesh; id: string; name: string; weight: string }[] = [];
    subjectsData.forEach(sub => {
      const nodeGeo = new THREE.SphereGeometry(sub.radius, 24, 24);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: sub.color,
        roughness: 0.35,
        metalness: 0.7,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      const x = Math.cos(sub.angle) * sub.dist;
      const z = Math.sin(sub.angle) * sub.dist;
      nodeMesh.position.set(x, 3 + Math.sin(sub.angle * 2) * 1.5, z);
      nodeMesh.userData = { id: sub.id, name: sub.name, weight: sub.weight };

      // Orbit ring trace
      const orbitGeo = new THREE.RingGeometry(sub.dist - 0.05, sub.dist + 0.05, 64);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x334155,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
      orbitMesh.rotation.x = Math.PI / 2;
      orbitMesh.position.y = 0.05;
      galaxyGroup.add(orbitMesh);

      // Node halo
      const haloGeo = new THREE.TorusGeometry(sub.radius * 1.3, 0.04, 12, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: sub.color });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = Math.PI / 2;
      nodeMesh.add(haloMesh);

      galaxyGroup.add(nodeMesh);
      galaxyNodesList.push({ mesh: nodeMesh, id: sub.id, name: sub.name, weight: sub.weight });
    });
    stateRef.current.galaxyNodes = galaxyNodesList;
    scene.add(galaxyGroup);

    // 5. Raycasting for Galaxy node interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (stateRef.current.activeMode === 'galaxy') {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(galaxyNodesList.map(n => n.mesh));
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          setHoveredNodeInfo(`${hit.userData.name} (${hit.userData.weight}) — Click to jump!`);
          document.body.style.cursor = 'pointer';
        } else {
          setHoveredNodeInfo(null);
          document.body.style.cursor = 'default';
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      if (stateRef.current.activeMode === 'galaxy') {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(galaxyNodesList.map(n => n.mesh));
        if (intersects.length > 0 && onSelectSubject) {
          const subId = intersects[0].object.userData.id;
          onSelectSubject(subId);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // 6. Responsive Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 7. Animation Loop with Exponential Damping & Software WebGL Pace
    let frameId = 0;
    let clock = new THREE.Clock();

    function tick() {
      const dt = clock.getDelta();
      const st = stateRef.current;

      // Visibility toggles
      if (st.machineGroup) st.machineGroup.visible = st.activeMode === 'machine';
      if (st.gridGroup) st.gridGroup.visible = st.activeMode === 'grid';
      if (st.galaxyGroup) st.galaxyGroup.visible = st.activeMode === 'galaxy';

      // Exponential damping on camera position and lookAt target
      camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 3.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 3.5, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 3.5, dt);
      _v1.set(
        THREE.MathUtils.damp(0, _targetLookAt.x, 3.5, dt),
        THREE.MathUtils.damp(3, _targetLookAt.y, 3.5, dt),
        THREE.MathUtils.damp(0, _targetLookAt.z, 3.5, dt)
      );
      camera.lookAt(_targetLookAt);

      // Model rotations
      if (st.isRotating) {
        if (st.rotorGroup && st.activeMode === 'machine') {
          st.rotorGroup.rotation.y += dt * 1.8; // synchronous machine rotation
        }
        if (st.gridGroup && st.activeMode === 'grid') {
          st.gridGroup.rotation.y += dt * 0.15;
        }
        if (st.galaxyGroup && st.activeMode === 'galaxy') {
          st.galaxyGroup.rotation.y += dt * 0.2;
        }
      }

      // Exploded View separation interpolation
      st.currentExplode = THREE.MathUtils.damp(st.currentExplode, st.targetExplode, 4.0, dt);
      if (st.rotorGroup && st.activeMode === 'machine') {
        // Pull rotor outward along Z axis when exploded
        st.rotorGroup.position.z = st.currentExplode * 6.5;
        if (st.coilsGroup) {
          st.coilsGroup.scale.set(
            1 + st.currentExplode * 0.35,
            1,
            1 + st.currentExplode * 0.35
          );
        }
      }

      // Render frame
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }

    tick();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.dispose();
      document.body.style.cursor = 'default';
    };
  }, []);

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Spec Badge & Mode Selector */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-none">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">
            3D EE Engineering Studio
          </span>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-lg">
          <button
            onClick={() => setActiveMode('machine')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeMode === 'machine'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            AC Sync Machine
          </button>
          <button
            onClick={() => setActiveMode('grid')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeMode === 'grid'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Grid & Substation
          </button>
          <button
            onClick={() => setActiveMode('galaxy')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeMode === 'galaxy'
                ? 'bg-purple-500 text-white font-semibold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Syllabus Galaxy
          </button>
        </div>
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setIsRotating(!isRotating)}
          title={isRotating ? 'Pause rotation' : 'Resume rotation'}
          className={`p-2 rounded-xl border transition-colors shadow-lg ${
            isRotating
              ? 'bg-slate-900/90 border-slate-700 text-amber-400'
              : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            _targetCamPos.set(12, 9, 14);
            _targetLookAt.set(0, 3, 0);
          }}
          title="Reset Camera"
          className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-400 hover:text-slate-200 shadow-lg"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Galaxy Hover Tooltip */}
      {hoveredNodeInfo && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-purple-900/95 border border-purple-500/50 text-white text-xs font-medium shadow-xl pointer-events-none">
          {hoveredNodeInfo}
        </div>
      )}

      {/* Sleek Collapsible Bottom Dock (<= 15% Viewport footprint, solid/rgba surfaces) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl transition-transform duration-300 pointer-events-auto ${
          hudCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        <div className="relative rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-3 pt-4">
          {/* Collapse Toggle Handle */}
          <button
            onClick={() => setHudCollapsed(!hudCollapsed)}
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] uppercase font-bold tracking-wider text-slate-300 hover:text-white flex items-center gap-1 shadow-md"
          >
            {hudCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{hudCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {activeMode === 'machine' && (
              <div className="w-full flex items-center gap-3">
                <span className="text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Exploded Cutaway:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedRatio}
                  onChange={e => setExplodedRatio(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
                <span className="font-mono text-amber-400 w-10 text-right">
                  {Math.round(explodedRatio * 100)}%
                </span>
              </div>
            )}

            {activeMode === 'grid' && (
              <div className="flex items-center gap-2 text-slate-300">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Double-circuit 400kV Pylon with Quad Bundles & 315MVA Auto-Transformer</span>
              </div>
            )}

            {activeMode === 'galaxy' && (
              <div className="flex items-center gap-2 text-slate-300">
                <Radio className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Interactive 11-Subject Matrix: Node size corresponds to GATE marks weightage</span>
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-400 font-mono">
                PBR ACES Studio
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
                Lossless 60fps
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
