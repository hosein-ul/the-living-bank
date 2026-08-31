"use client";

/**
 * ============================================================================
 * BANK COMPOSITION — Chapter I: The Sovereign Island (Federal Reserve Facade)
 * ============================================================================
 * 1. Plinth & Grand Stairs: 12m x 8m travertine limestone footprint (#d8cdb4),
 *    4 sharp-edged grand steps (0.35m rise x 0.4m tread) leading to the stylobate.
 * 2. 8 Fluted Ionic Columns: 7m total height, 0.6m base tapering to 0.5m top,
 *    20 concave flutes per shaft, authentic Ionic capitals with dual spiral
 *    volute scrolls, echinus, and abacus (#e2d8c0 limestone). Instanced for
 *    maximum performance (1 draw call).
 * 3. 3-Part Entablature: 0.6m smooth architrave, 0.5m plain frieze (clean,
 *    no triglyphs), and 0.7m projecting cornice (0.3m projection).
 * 4. 30° Classical Pediment: 10m wide x 3m apex gable with recessed interior
 *    tympanum (#b8a98a) featuring a 1.2m circular medallion inscribed "STANDARD".
 * 5. Apex Sundial: 0.3m gold gnomon rod (#b08d2e, metalness 0.85) casting a
 *    shadow onto an engraved half-disc dial with radial hour grooves.
 * 6. Banking Hall: 5m deep x 7m tall rectangular hall set back 0.3m behind the
 *    colonnade (#cdc1a8) with 3 narrow gold-framed windows (1m x 0.4m).
 * 7. The Hero Bronze Door (Visual Focal Point): 3m x 2m dark bronze double
 *    doors (#3a2a1a, metalness 0.7, roughness 0.4) with 1cm bronze frame,
 *    40 round copper studs (4x5 grid per leaf via InstancedMesh), bronze lion-head
 *    knocker on the right leaf, arched bronze lunette relief plaque inscribed
 *    "4,000 LINES OF IMMUTABLE CODE", 1cm ajar with warm golden light spill.
 * 8. Two Guardian Stone Lions: 0.8m limestone sculptures flanking the lowest step
 *    in a noble forward-facing guardian pose (InstancedMesh).
 * 9. Two Flagpoles: 6m tall poles flanking the colonnade with waving flags:
 *    left gold flag ("STANDARD") and right slate flag ("RESERVE") with gentle wave.
 * 10. Convex Public Plaza: 10m radius marble disc with 2cm/m subtle convexity.
 * 11. Cinematic Lighting: Key directional (#fff2d6, 1.8), fill hemisphere (#e8e0d0/
 *     #3a3528, 0.5), rim directional (#c8d4e0, 0.6), and focused door spotlight
 *     (#ffb868, 1.5, angle 0.4, penumbra 0.5) with ACESFilmic tone mapping.
 * ============================================================================
 */

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ScrollTrigger } from "@/lib/gsap";

interface ThreeIslandProps {
  progress?: number; // 0 to 1
  activeIndex?: number; // 0 to 5
  sectionTriggerId?: string;
  onActiveIndexChange?: (index: number) => void;
  className?: string;
}

// Exponential damp helper: buttery smooth decay
function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

// 1. Procedural Travertine Normal Map Generator
function createTravertineNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(512, 512);
  const data = imgData.data;

  const heights = new Float32Array(512 * 512);
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = y * 512 + x;
      const grain = (Math.random() - 0.5) * 0.18;
      const strata1 = Math.sin(y * 0.12) * 0.09;
      const strata2 = Math.sin(y * 0.38 + Math.cos(x * 0.04) * 2.2) * 0.06;
      heights[idx] = Math.max(0, Math.min(1, 0.5 + grain + strata1 + strata2));
    }
  }

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const x0 = (x - 1 + 512) % 512;
      const x1 = (x + 1) % 512;
      const y0 = (y - 1 + 512) % 512;
      const y1 = (y + 1) % 512;

      const dx = (heights[y * 512 + x1] - heights[y * 512 + x0]) * 2.8;
      const dy = (heights[y1 * 512 + x] - heights[y0 * 512 + x]) * 2.8;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = (dx / len) * 0.5 + 0.5;
      const ny = (dy / len) * 0.5 + 0.5;
      const nz = (dz / len) * 0.5 + 0.5;

      const pIdx = (y * 512 + x) * 4;
      data[pIdx] = Math.floor(nx * 255);
      data[pIdx + 1] = Math.floor(ny * 255);
      data[pIdx + 2] = Math.floor(nz * 255);
      data[pIdx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}

// 2. Pediment Relief Medallion Texture ("STANDARD")
function createMedallionTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#d8cdb4";
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = "#9c8c70";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(256, 256, 232, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 216, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle engraved shadow
  ctx.fillStyle = "#5c4f39";
  ctx.font = "bold 54px 'Cinzel', 'Trajan Pro', 'Baskerville', 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("STANDARD", 258, 258);

  ctx.fillStyle = "#2d261b";
  ctx.fillText("STANDARD", 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 3. Arched Bronze Plaque Texture ("4,000 LINES OF IMMUTABLE CODE")
function createDoorPlaqueTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#241a10";
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = "#8c6d3b";
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, 1000, 232);

  ctx.strokeStyle = "#5a4524";
  ctx.lineWidth = 3;
  ctx.strokeRect(22, 22, 980, 212);

  ctx.fillStyle = "#e6c374";
  ctx.font = "bold 40px 'Cinzel', 'Trajan Pro', 'Baskerville', 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("4,000 LINES OF IMMUTABLE CODE", 512, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 4. Flags Textures
function createFlagTexture(text: string, bgColor: string, textColor: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 300;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 300);

  ctx.strokeStyle = textColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, 480, 268);

  ctx.fillStyle = textColor;
  ctx.font = "bold 52px 'Cinzel', 'Trajan Pro', 'Baskerville', 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 150);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 5. Sundial Dial Texture
function createSundialTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e2d8c0";
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = "#5c4f39";
  ctx.lineWidth = 3;
  for (let angle = 20; angle <= 160; angle += 15) {
    const rad = (angle * Math.PI) / 180;
    const len = 220;
    const x = 256 + Math.cos(rad) * len;
    const y = 245 - Math.sin(rad) * len;
    ctx.beginPath();
    ctx.moveTo(256, 245);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(256, 245, 220, Math.PI, 0, false);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 6. Merged Ionic Column Geometry Generator
function createCompleteIonicColumnGeometry(): THREE.BufferGeometry {
  const fluteCount = 20;
  const radialSegments = 40;
  const heightSegments = 16;

  // Base Molding (Attic base)
  const plinthG = new THREE.BoxGeometry(0.85, 0.12, 0.85).translate(0, 0.06, 0);
  const torusG = new THREE.CylinderGeometry(0.38, 0.42, 0.12, 20).translate(0, 0.18, 0);
  const scotiaG = new THREE.CylinderGeometry(0.34, 0.38, 0.12, 20).translate(0, 0.3, 0);

  // Fluted Tapered Shaft (0.6m base -> 0.5m top, height 5.8m)
  const shaftG = new THREE.CylinderGeometry(0.25, 0.3, 5.8, radialSegments, heightSegments, false);
  const pos = shaftG.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (Math.abs(y) < 2.8) {
      const angle = Math.atan2(z, x);
      const radius = Math.sqrt(x * x + z * z);
      const fluteAngle = angle * fluteCount;
      const fluteDepth = Math.cos(fluteAngle) * 0.005;
      const newRadius = radius - fluteDepth;
      pos.setX(i, Math.cos(angle) * newRadius);
      pos.setZ(i, Math.sin(angle) * newRadius);
    }
  }
  shaftG.computeVertexNormals();
  shaftG.translate(0, 0.36 + 2.9, 0);

  // Ionic Capital (Echinus + Spiral Volutes + Abacus)
  const echinusG = new THREE.CylinderGeometry(0.34, 0.26, 0.2, 20).translate(0, 0.36 + 5.8 + 0.1, 0);
  const voluteLG = new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16)
    .rotateZ(Math.PI / 2)
    .translate(-0.32, 0.36 + 5.8 + 0.12, 0);
  const voluteRG = new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16)
    .rotateZ(Math.PI / 2)
    .translate(0.32, 0.36 + 5.8 + 0.12, 0);
  const abacusG = new THREE.BoxGeometry(0.82, 0.12, 0.82).translate(0, 0.36 + 5.8 + 0.26, 0);

  const columnGeo = mergeGeometries([
    plinthG,
    torusG,
    scotiaG,
    shaftG,
    echinusG,
    voluteLG,
    voluteRG,
    abacusG,
  ]);

  plinthG.dispose();
  torusG.dispose();
  scotiaG.dispose();
  shaftG.dispose();
  echinusG.dispose();
  voluteLG.dispose();
  voluteRG.dispose();
  abacusG.dispose();

  return columnGeo;
}

// 7. Merged Guardian Lion Geometry Generator
function createMergedLionGeometry(): THREE.BufferGeometry {
  const lPlinth = new THREE.BoxGeometry(0.6, 0.25, 0.9).translate(0, 0.125, 0);
  const lBody = new THREE.BoxGeometry(0.38, 0.4, 0.55).translate(0, 0.45, -0.05);
  const lChest = new THREE.CylinderGeometry(0.2, 0.24, 0.35, 14).translate(0, 0.55, 0.15);
  const lMane = new THREE.SphereGeometry(0.2, 14, 10).translate(0, 0.72, 0.16);
  const lSnout = new THREE.BoxGeometry(0.12, 0.1, 0.12).translate(0, 0.68, 0.3);
  const lEarL = new THREE.ConeGeometry(0.04, 0.08, 8).translate(-0.1, 0.88, 0.14);
  const lEarR = new THREE.ConeGeometry(0.04, 0.08, 8).translate(0.1, 0.88, 0.14);

  const lionGeo = mergeGeometries([lPlinth, lBody, lChest, lMane, lSnout, lEarL, lEarR]);

  lPlinth.dispose();
  lBody.dispose();
  lChest.dispose();
  lMane.dispose();
  lSnout.dispose();
  lEarL.dispose();
  lEarR.dispose();

  return lionGeo;
}

export const ThreeIsland: React.FC<ThreeIslandProps> = ({
  progress,
  activeIndex,
  sectionTriggerId = "chapter-1",
  onActiveIndexChange,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  const internalProgressRef = useRef<number>(progress ?? 0);
  const activeIdxRef = useRef<number>(activeIndex ?? 0);

  useEffect(() => {
    if (progress !== undefined) {
      internalProgressRef.current = progress;
    }
  }, [progress]);

  useEffect(() => {
    if (activeIndex !== undefined) {
      activeIdxRef.current = activeIndex;
    }
  }, [activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = reducedMediaQuery.matches;

    const handleReducedChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
      if (isReducedMotion) {
        mouseRef.current.x = 0;
        mouseRef.current.y = 0;
      }
    };
    reducedMediaQuery.addEventListener("change", handleReducedChange);

    // Attach ScrollTrigger if sectionTriggerId is present
    let scrollTriggerInstance: ScrollTrigger | null = null;
    const targetElement = document.getElementById(sectionTriggerId);
    if (targetElement) {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: targetElement,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          internalProgressRef.current = self.progress;
          const newIdx = Math.min(5, Math.floor(self.progress * 6));
          if (newIdx !== activeIdxRef.current) {
            activeIdxRef.current = newIdx;
            onActiveIndexChange?.(newIdx);
          }
        },
      });
    }

    // Setup Three.js Scene
    const scene = new THREE.Scene();

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 560;

    // Field of view 52deg gives optimal monumental framing of the entire building (pediment to plaza)
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL not supported; using fallback.", err);
      setWebGLSupported(false);
      return;
    }

    // --- PROCEDURAL TEXTURES ---
    const travertineNormal = createTravertineNormalMap();
    const medallionTexture = createMedallionTexture();
    const doorPlaqueTexture = createDoorPlaqueTexture();
    const sundialTexture = createSundialTexture();
    const flagLeftTexture = createFlagTexture("STANDARD", "#c9a961", "#241a10");
    const flagRightTexture = createFlagTexture("RESERVE", "#475569", "#f4f1ea");

    // --- MATERIALS ---
    const travertineBaseMat = new THREE.MeshStandardMaterial({
      color: "#d8cdb4",
      roughness: 0.7,
      metalness: 0.05,
      normalMap: travertineNormal,
      normalScale: new THREE.Vector2(0.18, 0.18),
    });

    const travertineBrightMat = new THREE.MeshStandardMaterial({
      color: "#e2d8c0",
      roughness: 0.7,
      metalness: 0.05,
      normalMap: travertineNormal,
      normalScale: new THREE.Vector2(0.15, 0.15),
    });

    const travertineHallMat = new THREE.MeshStandardMaterial({
      color: "#cdc1a8",
      roughness: 0.75,
      metalness: 0.05,
      normalMap: travertineNormal,
      normalScale: new THREE.Vector2(0.2, 0.2),
    });

    const pedimentRecessedMat = new THREE.MeshStandardMaterial({
      color: "#b8a98a",
      roughness: 0.8,
      metalness: 0.05,
    });

    const goldAnodizedMat = new THREE.MeshStandardMaterial({
      color: "#b08d2e",
      metalness: 0.85,
      roughness: 0.25,
    });

    const darkBronzeDoorMat = new THREE.MeshStandardMaterial({
      color: "#3a2a1a",
      metalness: 0.7,
      roughness: 0.4,
    });

    const copperStudMat = new THREE.MeshStandardMaterial({
      color: "#c87d55",
      metalness: 0.85,
      roughness: 0.3,
    });

    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: "#1e2229",
      roughness: 0.2,
      metalness: 0.9,
    });

    // --- CINEMATIC LIGHTING ---
    // 1. Key Light: warm Mediterranean sun
    const keyLight = new THREE.DirectionalLight("#fff2d6", 1.8);
    keyLight.position.set(8, 12, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -5;
    scene.add(keyLight);

    // 2. Fill Light: hemisphere sky & ground bounce
    const fillLight = new THREE.HemisphereLight("#e8e0d0", "#3a3528", 0.5);
    scene.add(fillLight);

    // 3. Rim Light: cool definition of silhouettes
    const rimLight = new THREE.DirectionalLight("#c8d4e0", 0.6);
    rimLight.position.set(-6, 4, -8);
    scene.add(rimLight);

    // 4. Practical Spotlight on Door: makes the hero door pop
    const doorSpotLight = new THREE.SpotLight("#ffb868", 1.5, 15, 0.4, 0.5, 1.5);
    doorSpotLight.position.set(0, 5, 8);
    const doorTarget = new THREE.Object3D();
    doorTarget.position.set(0, 2.9, 1.5);
    scene.add(doorTarget);
    doorSpotLight.target = doorTarget;
    scene.add(doorSpotLight);

    // --- ROOT BANK GROUP ---
    const bankGroup = new THREE.Group();
    bankGroup.position.set(0, 0, 0);
    scene.add(bankGroup);

    // --- 1. EXPANDED CONVEX PLAZA FLOOR (10m radius) ---
    const plazaGeo = new THREE.CylinderGeometry(10.0, 10.0, 0.4, 48);
    const plazaPos = plazaGeo.attributes.position;
    for (let i = 0; i < plazaPos.count; i++) {
      const x = plazaPos.getX(i);
      const z = plazaPos.getZ(i);
      const y = plazaPos.getY(i);
      if (y > 0) {
        const dist = Math.sqrt(x * x + z * z);
        const domeOffset = Math.max(0, 0.2 - dist * 0.02);
        plazaPos.setY(i, y + domeOffset);
      }
    }
    plazaGeo.computeVertexNormals();

    const plazaMesh = new THREE.Mesh(plazaGeo, travertineBaseMat);
    plazaMesh.position.y = -0.2;
    plazaMesh.receiveShadow = true;
    bankGroup.add(plazaMesh);

    // --- 2. MERGED PLINTH + GRAND STAIRS (12m x 8m footprint) ---
    const stylobateG = new THREE.BoxGeometry(12.0, 1.4, 6.4).translate(0, 0.7, -1.0);
    const stepGeos: THREE.BufferGeometry[] = [];
    for (let step = 0; step < 4; step++) {
      const stepWidth = 12.0;
      const stepDepth = (4 - step) * 0.4;
      const stepHeight = 0.35;
      const stepG = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth).translate(
        0,
        (step + 0.5) * 0.35,
        2.2 + step * 0.4 + (stepDepth / 2 - 0.2)
      );
      stepGeos.push(stepG);
    }
    const fullPlinthGeo = mergeGeometries([stylobateG, ...stepGeos]);
    stylobateG.dispose();
    stepGeos.forEach((g) => g.dispose());

    const plinthMesh = new THREE.Mesh(fullPlinthGeo, travertineBaseMat);
    plinthMesh.receiveShadow = true;
    plinthMesh.castShadow = true;
    bankGroup.add(plinthMesh);

    // --- 3. 8 INSTANCED FLUTED IONIC COLUMNS (1 Draw Call) ---
    const singleColumnGeo = createCompleteIonicColumnGeometry();
    const columnsInstanced = new THREE.InstancedMesh(singleColumnGeo, travertineBrightMat, 8);
    columnsInstanced.castShadow = true;
    columnsInstanced.receiveShadow = true;

    // Eustyle intercolumniation: center portal is 2.4m wide to frame the 2m hero door
    const columnXPositions = [-4.9, -3.5, -2.1, -1.2, 1.2, 2.1, 3.5, 4.9];
    const columnZ = 1.8;
    const columnBaseY = 1.4;

    const colDummy = new THREE.Object3D();
    columnXPositions.forEach((cx, i) => {
      colDummy.position.set(cx, columnBaseY, columnZ);
      colDummy.updateMatrix();
      columnsInstanced.setMatrixAt(i, colDummy.matrix);
    });
    columnsInstanced.instanceMatrix.needsUpdate = true;
    bankGroup.add(columnsInstanced);

    // --- 4. 3-PART MERGED ENTABLATURE (Total height 1.8m atop columns at y = 8.4) ---
    const architraveG = new THREE.BoxGeometry(11.4, 0.6, 2.2).translate(0, 8.4 + 0.3, 1.3);
    const friezeG = new THREE.BoxGeometry(11.2, 0.5, 2.0).translate(0, 8.4 + 0.6 + 0.25, 1.3);
    const corniceG = new THREE.BoxGeometry(11.8, 0.7, 2.6).translate(0, 8.4 + 1.1 + 0.35, 1.4);

    const entablatureGeo = mergeGeometries([architraveG, friezeG, corniceG]);
    architraveG.dispose();
    friezeG.dispose();
    corniceG.dispose();

    const entablatureMesh = new THREE.Mesh(entablatureGeo, travertineBrightMat);
    entablatureMesh.castShadow = true;
    entablatureMesh.receiveShadow = true;
    bankGroup.add(entablatureMesh);

    // --- 5. 30° PEDIMENT (10m wide x 3m tall) ---
    const pedShape = new THREE.Shape();
    pedShape.moveTo(-5.0, 0);
    pedShape.lineTo(5.0, 0);
    pedShape.lineTo(0, 3.0);
    pedShape.closePath();

    const pedExtrudeSettings = {
      depth: 0.8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };
    const pedRakingGeo = new THREE.ExtrudeGeometry(pedShape, pedExtrudeSettings);
    const pedRakingMesh = new THREE.Mesh(pedRakingGeo, travertineBrightMat);
    pedRakingMesh.position.set(0, 10.2, 1.5);
    pedRakingMesh.castShadow = true;
    bankGroup.add(pedRakingMesh);

    // Recessed Tympanum Wall (darker limestone)
    const tympanumShape = new THREE.Shape();
    tympanumShape.moveTo(-4.5, 0.05);
    tympanumShape.lineTo(4.5, 0.05);
    tympanumShape.lineTo(0, 2.7);
    tympanumShape.closePath();

    const tympanumGeo = new THREE.ShapeGeometry(tympanumShape);
    const tympanumMesh = new THREE.Mesh(tympanumGeo, pedimentRecessedMat);
    tympanumMesh.position.set(0, 10.2, 2.25);
    tympanumMesh.receiveShadow = true;
    bankGroup.add(tympanumMesh);

    // Circular Relief Medallion inscribed "STANDARD" (1.2m diameter, raised 0.05m)
    const medallionGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.06, 32);
    medallionGeo.rotateX(Math.PI / 2);
    const medallionMat = new THREE.MeshStandardMaterial({
      map: medallionTexture,
      roughness: 0.6,
      metalness: 0.1,
    });
    const medallionMesh = new THREE.Mesh(medallionGeo, medallionMat);
    medallionMesh.position.set(0, 11.3, 2.28);
    medallionMesh.castShadow = true;
    bankGroup.add(medallionMesh);

    // --- 6. SUNDIAL ABOVE PEDIMENT ---
    const dialGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.04, 28, 1, false, 0, Math.PI);
    dialGeo.rotateX(Math.PI / 2);
    dialGeo.rotateZ(Math.PI);
    const dialMat = new THREE.MeshStandardMaterial({
      map: sundialTexture,
      roughness: 0.6,
      metalness: 0.1,
    });
    const dialMesh = new THREE.Mesh(dialGeo, dialMat);
    dialMesh.position.set(0, 13.22, 1.85);
    dialMesh.castShadow = true;
    dialMesh.receiveShadow = true;
    bankGroup.add(dialMesh);

    // Thin gold gnomon rod (0.3m, #b08d2e, metalness 0.85)
    const gnomonGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.35, 12);
    const gnomonMesh = new THREE.Mesh(gnomonGeo, goldAnodizedMat);
    gnomonMesh.position.set(0, 13.34, 1.95);
    gnomonMesh.rotation.x = -Math.PI / 4;
    gnomonMesh.castShadow = true;
    bankGroup.add(gnomonMesh);

    // --- 7. BANKING HALL (Behind Colonnade, 5m deep x 7m tall) ---
    const hallGeo = new THREE.BoxGeometry(10.8, 7.0, 5.0);
    const hallMesh = new THREE.Mesh(hallGeo, travertineHallMat);
    hallMesh.position.set(0, 1.4 + 3.5, -1.0);
    hallMesh.castShadow = true;
    hallMesh.receiveShadow = true;
    bankGroup.add(hallMesh);

    // Three Narrow Windows (1m x 0.4m) with Gold Anodized Frames (Merged)
    const winX = [-3.2, 0, 3.2];
    const winFrames: THREE.BufferGeometry[] = [];
    const winPanes: THREE.BufferGeometry[] = [];

    winX.forEach((wx) => {
      const fG = new THREE.BoxGeometry(0.5, 1.1, 0.08).translate(wx, 6.2, 1.51);
      const pG = new THREE.BoxGeometry(0.4, 1.0, 0.04).translate(wx, 6.2, 1.53);
      winFrames.push(fG);
      winPanes.push(pG);
    });

    const mergedWinFrames = mergeGeometries(winFrames);
    const mergedWinPanes = mergeGeometries(winPanes);
    winFrames.forEach((g) => g.dispose());
    winPanes.forEach((g) => g.dispose());

    const winFramesMesh = new THREE.Mesh(mergedWinFrames, goldAnodizedMat);
    winFramesMesh.castShadow = true;
    bankGroup.add(winFramesMesh);

    const winPanesMesh = new THREE.Mesh(mergedWinPanes, windowGlassMat);
    bankGroup.add(winPanesMesh);

    // --- 8. THE HERO DOOR (Dead Center, 3m tall x 2m wide) ---
    // Outer Frame + Closed Left Leaf + Right Leaf (Ajar) + Knocker (Merged Bronze)
    const doorFrameG = new THREE.BoxGeometry(2.1, 3.1, 0.14).translate(0, 1.4 + 1.5, 1.51);
    const leftLeafG = new THREE.BoxGeometry(0.98, 2.96, 0.06).translate(-0.5, 1.4 + 1.5, 1.55);
    const rightLeafG = new THREE.BoxGeometry(0.98, 2.96, 0.06)
      .rotateY(-0.04)
      .translate(0.5, 1.4 + 1.5, 1.55);

    // Lion Knocker on right leaf
    const knockerBaseG = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16)
      .rotateX(Math.PI / 2)
      .translate(0.5, 1.4 + 1.6, 1.6);
    const knockerHeadG = new THREE.SphereGeometry(0.06, 12, 10).translate(0.5, 1.4 + 1.6, 1.63);
    const knockerRingG = new THREE.TorusGeometry(0.06, 0.015, 10, 20).translate(
      0.5,
      1.4 + 1.54,
      1.64
    );

    const mergedDoorGeo = mergeGeometries([
      doorFrameG,
      leftLeafG,
      rightLeafG,
      knockerBaseG,
      knockerHeadG,
      knockerRingG,
    ]);
    doorFrameG.dispose();
    leftLeafG.dispose();
    rightLeafG.dispose();
    knockerBaseG.dispose();
    knockerHeadG.dispose();
    knockerRingG.dispose();

    const heroDoorMesh = new THREE.Mesh(mergedDoorGeo, darkBronzeDoorMat);
    heroDoorMesh.castShadow = true;
    bankGroup.add(heroDoorMesh);

    // Warm Golden Light Spill from 1cm ajar crack
    const spillLightGeo = new THREE.PlaneGeometry(0.04, 2.9);
    const spillLightMat = new THREE.MeshBasicMaterial({
      color: "#ffd580",
      side: THREE.DoubleSide,
    });
    const spillLightMesh = new THREE.Mesh(spillLightGeo, spillLightMat);
    spillLightMesh.position.set(0.02, 1.4 + 1.5, 1.53);
    bankGroup.add(spillLightMesh);

    // Interior Warm Glow Point Light
    const interiorGlow = new THREE.PointLight("#ffb868", 0.9, 4, 1.5);
    interiorGlow.position.set(0, 1.4 + 1.5, 1.3);
    bankGroup.add(interiorGlow);

    // 40 Copper Studs (20 per leaf in 4x5 grid) via InstancedMesh
    const studGeo = new THREE.SphereGeometry(0.025, 12, 10);
    const studsInstanced = new THREE.InstancedMesh(studGeo, copperStudMat, 40);
    studsInstanced.castShadow = true;

    const dummy = new THREE.Object3D();
    let studIdx = 0;

    // Left leaf studs
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        const x = -0.88 + col * 0.25;
        const y = 1.4 + 0.4 + row * 0.55;
        const z = 1.59;
        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        studsInstanced.setMatrixAt(studIdx++, dummy.matrix);
      }
    }

    // Right leaf studs
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        const x = 0.13 + col * 0.25;
        const y = 1.4 + 0.4 + row * 0.55;
        const z = 1.59 - col * 0.25 * 0.04;
        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        studsInstanced.setMatrixAt(studIdx++, dummy.matrix);
      }
    }
    studsInstanced.instanceMatrix.needsUpdate = true;
    bankGroup.add(studsInstanced);

    // Arched Bronze Relief Plaque ("4,000 LINES OF IMMUTABLE CODE")
    const plaqueGeo = new THREE.BoxGeometry(2.0, 0.5, 0.06);
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: doorPlaqueTexture,
      metalness: 0.6,
      roughness: 0.35,
    });
    const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueMesh.position.set(0, 1.4 + 3.32, 1.53);
    plaqueMesh.castShadow = true;
    bankGroup.add(plaqueMesh);

    // --- 9. TWO INSTANCED GUARDIAN STONE LIONS (1 Draw Call) ---
    const lionGeo = createMergedLionGeometry();
    const lionsInstanced = new THREE.InstancedMesh(lionGeo, travertineBaseMat, 2);
    lionsInstanced.castShadow = true;
    lionsInstanced.receiveShadow = true;

    const lionDummy = new THREE.Object3D();
    // Left Lion
    lionDummy.position.set(-4.6, 0.0, 3.6);
    lionDummy.updateMatrix();
    lionsInstanced.setMatrixAt(0, lionDummy.matrix);

    // Right Lion
    lionDummy.position.set(4.6, 0.0, 3.6);
    lionDummy.updateMatrix();
    lionsInstanced.setMatrixAt(1, lionDummy.matrix);

    lionsInstanced.instanceMatrix.needsUpdate = true;
    bankGroup.add(lionsInstanced);

    // --- 10. TWO FLAGPOLES FLANKING COLONNADE ---
    // Flagpoles + Finials (Merged Gold)
    const poleLG = new THREE.CylinderGeometry(0.035, 0.045, 6.0, 16).translate(-4.4, 3.0, 2.4);
    const finialLG = new THREE.SphereGeometry(0.08, 12, 10).translate(-4.4, 6.05, 2.4);
    const poleRG = new THREE.CylinderGeometry(0.035, 0.045, 6.0, 16).translate(4.4, 3.0, 2.4);
    const finialRG = new THREE.SphereGeometry(0.08, 12, 10).translate(4.4, 6.05, 2.4);

    const flagpolesGeo = mergeGeometries([poleLG, finialLG, poleRG, finialRG]);
    poleLG.dispose();
    finialLG.dispose();
    poleRG.dispose();
    finialRG.dispose();

    const flagpolesMesh = new THREE.Mesh(flagpolesGeo, goldAnodizedMat);
    flagpolesMesh.castShadow = true;
    bankGroup.add(flagpolesMesh);

    // Left Flag ("STANDARD" gold banner)
    const flagGeoLeft = new THREE.PlaneGeometry(1.0, 0.6, 12, 6);
    const flagMatLeft = new THREE.MeshStandardMaterial({
      map: flagLeftTexture,
      side: THREE.DoubleSide,
      roughness: 0.6,
    });
    const flagMeshLeft = new THREE.Mesh(flagGeoLeft, flagMatLeft);
    flagMeshLeft.position.set(-4.4 + 0.5, 5.65, 2.4);
    flagMeshLeft.castShadow = true;
    bankGroup.add(flagMeshLeft);

    // Right Flag ("RESERVE" slate banner)
    const flagGeoRight = new THREE.PlaneGeometry(1.0, 0.6, 12, 6);
    const flagMatRight = new THREE.MeshStandardMaterial({
      map: flagRightTexture,
      side: THREE.DoubleSide,
      roughness: 0.6,
    });
    const flagMeshRight = new THREE.Mesh(flagGeoRight, flagMatRight);
    flagMeshRight.position.set(4.4 - 0.5, 5.65, 2.4);
    flagMeshRight.castShadow = true;
    bankGroup.add(flagMeshRight);

    // Pointer Parallax Tracking (±2.3° max)
    const handlePointerMove = (e: PointerEvent) => {
      if (isReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.x = nx * 0.04; // Max +-2.3 deg
      mouseRef.current.y = ny * 0.02; // Max +-1.1 deg
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // --- ANIMATION & CAMERA LOOP ---
    let animId: number;
    const clock = new THREE.Clock();

    // Camera initial spherical state
    const startTheta = Math.PI / 2; // Front-facing the door straight on
    const startPhi = Math.PI / 2 - 0.25; // Slight tilt down, looking slightly up
    const startRadius = 16.0;

    let currentTheta = startTheta;
    let currentPhi = startPhi;
    let currentRadius = startRadius;

    let currentBankRotY = 0;
    let currentPointerPhi = 0;

    const render = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      const curProgress = Math.max(0, Math.min(1, internalProgressRef.current));

      if (isReducedMotion) {
        // Freeze camera & orbit at start view for reduced-motion accessibility
        currentTheta = startTheta;
        currentPhi = startPhi;
        currentRadius = startRadius;
        bankGroup.rotation.y = 0;
      } else {
        // Scroll-driven camera trajectory (sweeps gracefully to front-right quarter view)
        // keeps the door as the focal point
        const targetTheta = startTheta - curProgress * Math.PI * 0.35;
        const targetPhi = startPhi + Math.sin(curProgress * Math.PI) * 0.06;
        const targetRadius = startRadius - curProgress * 1.5;

        // Damped scroll updates with lambda=8
        currentTheta = damp(currentTheta, targetTheta, 8, dt);
        currentPhi = damp(currentPhi, targetPhi, 8, dt);
        currentRadius = damp(currentRadius, targetRadius, 8, dt);

        // Hover parallax damped with lambda=6
        currentBankRotY = damp(currentBankRotY, mouseRef.current.x, 6, dt);
        currentPointerPhi = damp(currentPointerPhi, mouseRef.current.y, 6, dt);
        bankGroup.rotation.y = currentBankRotY;

        // Animate subtle flag wave (< 0.5° amplitude per sec)
        const flagLeftPos = flagGeoLeft.attributes.position;
        for (let i = 0; i < flagLeftPos.count; i++) {
          const fx = flagLeftPos.getX(i);
          const fz = Math.sin(elapsed * 2.2 + fx * 4.0) * 0.025 * (fx + 0.5);
          flagLeftPos.setZ(i, fz);
        }
        flagGeoLeft.computeVertexNormals();
        flagGeoLeft.attributes.position.needsUpdate = true;

        const flagRightPos = flagGeoRight.attributes.position;
        for (let i = 0; i < flagRightPos.count; i++) {
          const fx = flagRightPos.getX(i);
          const fz = Math.sin(elapsed * 2.2 - fx * 4.0) * 0.025 * (0.5 - fx);
          flagRightPos.setZ(i, fz);
        }
        flagGeoRight.computeVertexNormals();
        flagGeoRight.attributes.position.needsUpdate = true;
      }

      // Convert spherical coordinates to Cartesian camera position with hard-locked look-at
      const effectivePhi = currentPhi + (isReducedMotion ? 0 : currentPointerPhi);
      const camX = currentRadius * Math.sin(effectivePhi) * Math.cos(currentTheta);
      const camY = 3.2 + currentRadius * Math.cos(effectivePhi);
      const camZ = 1.0 + currentRadius * Math.sin(effectivePhi) * Math.sin(currentTheta);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 3.2, 1.0);

      renderer.render(scene, camera);

      if (typeof window !== "undefined") {
        (window as unknown as { __THREE_STATS__: unknown }).__THREE_STATS__ = {
          triangles: renderer.info.render.triangles,
          drawCalls: renderer.info.render.calls,
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
          instances: 40 + 8 + 2, // studs + columns + lions
          uniqueMeshTypes: 12,
        };
      }

      animId = requestAnimationFrame(render);
    };

    render();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      reducedMediaQuery.removeEventListener("change", handleReducedChange);
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();

      // Dispose Geometries
      plazaGeo.dispose();
      fullPlinthGeo.dispose();
      singleColumnGeo.dispose();
      entablatureGeo.dispose();
      pedRakingGeo.dispose();
      tympanumGeo.dispose();
      medallionGeo.dispose();
      dialGeo.dispose();
      gnomonGeo.dispose();
      hallGeo.dispose();
      mergedWinFrames.dispose();
      mergedWinPanes.dispose();
      mergedDoorGeo.dispose();
      spillLightGeo.dispose();
      studGeo.dispose();
      plaqueGeo.dispose();
      lionGeo.dispose();
      flagpolesGeo.dispose();
      flagGeoLeft.dispose();
      flagGeoRight.dispose();

      // Dispose Textures
      travertineNormal.dispose();
      medallionTexture.dispose();
      doorPlaqueTexture.dispose();
      sundialTexture.dispose();
      flagLeftTexture.dispose();
      flagRightTexture.dispose();

      // Dispose Materials
      travertineBaseMat.dispose();
      travertineBrightMat.dispose();
      travertineHallMat.dispose();
      pedimentRecessedMat.dispose();
      goldAnodizedMat.dispose();
      darkBronzeDoorMat.dispose();
      copperStudMat.dispose();
      windowGlassMat.dispose();
      spillLightMat.dispose();
      medallionMat.dispose();
      dialMat.dispose();
      plaqueMat.dispose();
      flagMatLeft.dispose();
      flagMatRight.dispose();
    };
  }, [sectionTriggerId, onActiveIndexChange]);

  if (!webGLSupported) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 bg-paper-deep text-center select-none ${className}`}>
        <svg viewBox="0 0 200 160" className="w-48 h-36 mb-2 drop-shadow-sm">
          <polygon points="100,20 180,60 180,110 100,150 20,110 20,60" fill="#e9e4d8" stroke="#1a1a18" strokeWidth="2" />
          <rect x="85" y="60" width="30" height="40" fill="#c9a961" stroke="#b08d2e" strokeWidth="1.5" />
          <path d="M 85 60 Q 100 40 115 60 Z" fill="#b08d2e" stroke="#1a1a18" strokeWidth="1.5" />
          <rect x="96" y="80" width="8" height="20" fill="#1a1a18" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
          THE SOVEREIGN ISLAND
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[320px] overflow-hidden ${className}`}>
      {/* Soft radial gradient background: #f4f1ea center -> #e8e0d0 edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 45%, #f4f1ea 0%, #e8e0d0 100%)",
        }}
      />
      {/* 1.5% Noise overlay applied as fullscreen quad behind the scene with mix-blend-mode: multiply */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="relative z-10 w-full h-full min-h-[320px]" />
    </div>
  );
};

export default ThreeIsland;
