"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface ThreeIslandProps {
  sectionTriggerId?: string;
  onActiveIndexChange?: (index: number) => void;
  className?: string;
}

export const ThreeIsland: React.FC<ThreeIslandProps> = ({
  sectionTriggerId = "chapter-1",
  onActiveIndexChange,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  const scrollDataRef = useRef<{ p: number }>({ p: 0 });
  const activeIdxRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = reducedMediaQuery.matches;

    // Three.js Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f4f1ea");
    const baseFogDensity = 0.035;
    scene.fog = new THREE.FogExp2("#f4f1ea", baseFogDensity);

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 6.2, 15.5);
    camera.lookAt(0, 1.3, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL primary init failed, trying basic context:", err);
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          failIfMajorPerformanceCaveat: false,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(1);
        container.innerHTML = "";
        container.appendChild(renderer.domElement);
      } catch (err2) {
        console.warn("WebGL completely unavailable; using fallback SVG.", err2);
        setWebGLSupported(false);
        return;
      }
    }

    // Warm Architectural Lighting
    const ambientLight = new THREE.AmbientLight("#f8f4ec", 2.4);
    scene.add(ambientLight);

    // Warm Sun Key Light (Upper Left)
    const sunLight = new THREE.DirectionalLight("#e8cca0", 2.8);
    sunLight.position.set(-14, 20, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Subtle Gold Fill / Rim Light
    const goldRimLight = new THREE.DirectionalLight("#d4af37", 1.5);
    goldRimLight.position.set(12, 10, -12);
    scene.add(goldRimLight);

    // Root Bank Group
    const bankGroup = new THREE.Group();
    scene.add(bankGroup);

    // Architectural Materials (Warm Limestone & Neoclassical Marble)
    const limestoneMat = new THREE.MeshLambertMaterial({ color: "#d8cdb4", flatShading: true });
    const limestoneLightMat = new THREE.MeshLambertMaterial({ color: "#e4dbca", flatShading: true });
    const limestoneDarkMat = new THREE.MeshLambertMaterial({ color: "#baa98c", flatShading: true });
    const marblePlazaMat = new THREE.MeshLambertMaterial({ color: "#ece6d8", flatShading: true });
    const goldAccentMat = new THREE.MeshLambertMaterial({ color: "#c9a961", flatShading: true });
    const darkBronzeDoorMat = new THREE.MeshLambertMaterial({ color: "#161514", flatShading: true });

    const geometriesToDispose: THREE.BufferGeometry[] = [];

    // 1. Marble Plaza Ground Disc
    const plazaGeo = new THREE.CylinderGeometry(8.2, 8.2, 0.4, 36);
    geometriesToDispose.push(plazaGeo);
    const plazaMesh = new THREE.Mesh(plazaGeo, marblePlazaMat);
    plazaMesh.position.y = -0.2;
    plazaMesh.receiveShadow = true;
    bankGroup.add(plazaMesh);

    // Plaza Inset Gold Ring
    const ringGeo = new THREE.TorusGeometry(7.2, 0.04, 8, 36);
    geometriesToDispose.push(ringGeo);
    const ringMesh = new THREE.Mesh(ringGeo, goldAccentMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.02;
    bankGroup.add(ringMesh);

    // 2. Grand Stone Plinth & 5 Wide Steps
    const stepsCount = 5;
    for (let s = 0; s < stepsCount; s++) {
      const stepWidth = 7.8 - s * 0.22;
      const stepDepth = 5.8 - s * 0.18;
      const stepHeight = 0.18;
      const stepGeo = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
      geometriesToDispose.push(stepGeo);
      const stepMesh = new THREE.Mesh(stepGeo, s % 2 === 0 ? limestoneMat : limestoneLightMat);
      stepMesh.position.set(0, s * stepHeight + stepHeight / 2, 0.4 - s * 0.08);
      stepMesh.receiveShadow = true;
      stepMesh.castShadow = true;
      bankGroup.add(stepMesh);
    }

    // Main Upper Bank Plinth
    const plinthGeo = new THREE.BoxGeometry(7.2, 0.5, 5.2);
    geometriesToDispose.push(plinthGeo);
    const plinthMesh = new THREE.Mesh(plinthGeo, limestoneDarkMat);
    plinthMesh.position.set(0, 1.15, 0);
    plinthMesh.receiveShadow = true;
    plinthMesh.castShadow = true;
    bankGroup.add(plinthMesh);

    // Plinth Cornice Molding
    const plinthMoldingGeo = new THREE.BoxGeometry(7.4, 0.08, 5.4);
    geometriesToDispose.push(plinthMoldingGeo);
    const plinthMolding = new THREE.Mesh(plinthMoldingGeo, goldAccentMat);
    plinthMolding.position.set(0, 1.42, 0);
    bankGroup.add(plinthMolding);

    const buildingBaseY = 1.46;

    // 3. Colonnade of 8 Monumental Columns
    const columnCount = 8;
    const colonnadeWidth = 5.8;
    const colSpacing = colonnadeWidth / (columnCount - 1);
    const colRadius = 0.14;
    const colHeight = 2.4;
    const colZ = 0.85;

    for (let i = 0; i < columnCount; i++) {
      const colX = -colonnadeWidth / 2 + i * colSpacing;

      // Column Base Block
      const baseGeo = new THREE.BoxGeometry(0.38, 0.12, 0.38);
      geometriesToDispose.push(baseGeo);
      const baseMesh = new THREE.Mesh(baseGeo, limestoneMat);
      baseMesh.position.set(colX, buildingBaseY + 0.06, colZ);
      baseMesh.castShadow = true;
      bankGroup.add(baseMesh);

      // Column Shaft
      const shaftGeo = new THREE.CylinderGeometry(colRadius * 0.88, colRadius, colHeight, 14);
      geometriesToDispose.push(shaftGeo);
      const shaftMesh = new THREE.Mesh(shaftGeo, limestoneLightMat);
      shaftMesh.position.set(colX, buildingBaseY + 0.12 + colHeight / 2, colZ);
      shaftMesh.castShadow = true;
      shaftMesh.receiveShadow = true;
      bankGroup.add(shaftMesh);

      // Column Capital Block (Gold Accent)
      const capGeo = new THREE.BoxGeometry(0.42, 0.16, 0.42);
      geometriesToDispose.push(capGeo);
      const capMesh = new THREE.Mesh(capGeo, goldAccentMat);
      capMesh.position.set(colX, buildingBaseY + 0.12 + colHeight + 0.08, colZ);
      capMesh.castShadow = true;
      bankGroup.add(capMesh);
    }

    // 4. Entablature & Architrave
    const entablatureHeight = 0.45;
    const entablatureY = buildingBaseY + colHeight + 0.2 + entablatureHeight / 2;
    const entablatureGeo = new THREE.BoxGeometry(7.0, entablatureHeight, 2.2);
    geometriesToDispose.push(entablatureGeo);
    const entablatureMesh = new THREE.Mesh(entablatureGeo, limestoneMat);
    entablatureMesh.position.set(0, entablatureY, 0.4);
    entablatureMesh.castShadow = true;
    entablatureMesh.receiveShadow = true;
    bankGroup.add(entablatureMesh);

    // Entablature Gold Cornice Line
    const corniceGeo = new THREE.BoxGeometry(7.2, 0.08, 2.4);
    geometriesToDispose.push(corniceGeo);
    const corniceMesh = new THREE.Mesh(corniceGeo, goldAccentMat);
    corniceMesh.position.set(0, entablatureY + entablatureHeight / 2 + 0.04, 0.4);
    bankGroup.add(corniceMesh);

    // 5. Monumental Triangular Pediment
    const pedimentWidth = 6.9;
    const pedimentHeight = 1.25;
    const pedimentDepth = 0.6;
    const pedimentShape = new THREE.Shape();
    pedimentShape.moveTo(-pedimentWidth / 2, 0);
    pedimentShape.lineTo(pedimentWidth / 2, 0);
    pedimentShape.lineTo(0, pedimentHeight);
    pedimentShape.closePath();

    const pedimentExtrudeSettings = {
      depth: pedimentDepth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    };
    const pedimentGeo = new THREE.ExtrudeGeometry(pedimentShape, pedimentExtrudeSettings);
    geometriesToDispose.push(pedimentGeo);
    const pedimentMesh = new THREE.Mesh(pedimentGeo, limestoneLightMat);
    pedimentMesh.position.set(0, entablatureY + entablatureHeight / 2 + 0.08, 0.85);
    pedimentMesh.castShadow = true;
    bankGroup.add(pedimentMesh);

    // Pediment Tympanum Gold Medallion Emblem
    const medallionGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 24);
    geometriesToDispose.push(medallionGeo);
    const medallionMesh = new THREE.Mesh(medallionGeo, goldAccentMat);
    medallionMesh.rotation.x = Math.PI / 2;
    medallionMesh.position.set(0, entablatureY + entablatureHeight / 2 + 0.48, 1.48);
    bankGroup.add(medallionMesh);

    // 6. Banking Hall Body (Behind Colonnade)
    const hallGeo = new THREE.BoxGeometry(6.4, 2.7, 3.2);
    geometriesToDispose.push(hallGeo);
    const hallMesh = new THREE.Mesh(hallGeo, limestoneMat);
    hallMesh.position.set(0, buildingBaseY + 1.35, -0.5);
    hallMesh.castShadow = true;
    hallMesh.receiveShadow = true;
    bankGroup.add(hallMesh);

    // 7. Rear Drum & Low Sovereign Dome
    const drumGeo = new THREE.BoxGeometry(2.4, 0.8, 2.4);
    geometriesToDispose.push(drumGeo);
    const drumMesh = new THREE.Mesh(drumGeo, limestoneDarkMat);
    drumMesh.position.set(0, buildingBaseY + 2.7 + 0.4, -1.6);
    drumMesh.castShadow = true;
    bankGroup.add(drumMesh);

    const domeGeo = new THREE.SphereGeometry(1.3, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    geometriesToDispose.push(domeGeo);
    const domeMesh = new THREE.Mesh(domeGeo, goldAccentMat);
    domeMesh.position.set(0, buildingBaseY + 2.7 + 0.8, -1.6);
    domeMesh.castShadow = true;
    bankGroup.add(domeMesh);

    // 8. Centered Dark Bronze Double-Door (Singular Dark Focal Point)
    const doorFrameGeo = new THREE.BoxGeometry(1.25, 2.2, 0.2);
    geometriesToDispose.push(doorFrameGeo);
    const doorFrameMesh = new THREE.Mesh(doorFrameGeo, goldAccentMat);
    doorFrameMesh.position.set(0, buildingBaseY + 1.1, 0.85);
    doorFrameMesh.castShadow = true;
    bankGroup.add(doorFrameMesh);

    const doorDoubleGeo = new THREE.BoxGeometry(1.05, 2.0, 0.18);
    geometriesToDispose.push(doorDoubleGeo);
    const doorDoubleMesh = new THREE.Mesh(doorDoubleGeo, darkBronzeDoorMat);
    doorDoubleMesh.position.set(0, buildingBaseY + 1.05, 0.85);
    doorDoubleMesh.castShadow = true;
    bankGroup.add(doorDoubleMesh);

    // Bronze Door Center Seam
    const doorSeamGeo = new THREE.BoxGeometry(0.04, 2.0, 0.22);
    geometriesToDispose.push(doorSeamGeo);
    const doorSeamMesh = new THREE.Mesh(doorSeamGeo, goldAccentMat);
    doorSeamMesh.position.set(0, buildingBaseY + 1.05, 0.86);
    bankGroup.add(doorSeamMesh);

    // Ambient floating gold particles (50 particles)
    const particleCount = 50;
    const particleGeo = new THREE.BufferGeometry();
    geometriesToDispose.push(particleGeo);
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { y: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 1] = Math.random() * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      particleVelocities.push({
        y: 0.002 + Math.random() * 0.005,
      });
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: "#b08d2e",
      size: 0.1,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Pointer Parallax
    const handlePointerMove = (e: PointerEvent) => {
      if (isReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.x = nx * 0.06;
      mouseRef.current.y = ny * 0.04;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // GSAP ScrollTrigger to scrub progress
    const triggerEl = document.getElementById(sectionTriggerId) || container;
    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: triggerEl,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        scrollDataRef.current.p = self.progress;
        const newIdx = Math.min(5, Math.max(0, Math.floor(self.progress * 6)));
        if (newIdx !== activeIdxRef.current) {
          activeIdxRef.current = newIdx;
          onActiveIndexChange?.(newIdx);
        }
      },
    });

    // Render Animation Loop & IntersectionObserver
    let animId: number | null = null;
    let isVisible = true;
    let currentOrbit = 0;
    let clock = new THREE.Clock();

    const render = () => {
      if (!isVisible) {
        animId = null;
        return;
      }

      clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const p = scrollDataRef.current.p;

      // Scroll-driven camera orbit: starts directly facing front (stairs and bronze door), rotates as user scrubs
      const targetOrbit = p * Math.PI * 0.45;
      currentOrbit += (targetOrbit - currentOrbit) * 0.1;

      bankGroup.rotation.y = currentOrbit + (isReducedMotion ? 0 : mouseRef.current.x);
      bankGroup.rotation.x = (isReducedMotion ? 0 : mouseRef.current.y);

      // Camera elevation (pitch ~22-25 deg looking down on bank)
      camera.position.y = 6.2 + Math.sin(p * Math.PI) * 1.5;
      camera.position.z = 15.5 - p * 1.2;
      camera.lookAt(0, 1.3, 0);

      // Fog & Rim Light modulation
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).density = baseFogDensity + (1 - p) * 0.015;
      }
      goldRimLight.intensity = 1.3 + Math.sin(p * Math.PI) * 1.2;

      // Animate subtle floating particles
      if (!isReducedMotion) {
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleVelocities[i].y;
          if (positions[i * 3 + 1] > 8) positions[i * 3 + 1] = 0;
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    render();

    // IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && animId === null) {
          animId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 1.3, 0);
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      scrollTriggerInstance.kill();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      if (animId !== null) cancelAnimationFrame(animId);
      renderer.dispose();
      geometriesToDispose.forEach((g) => g.dispose());
    };
  }, [sectionTriggerId, onActiveIndexChange]);

  if (!webGLSupported) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 bg-transparent text-center select-none ${className}`}>
        <svg viewBox="0 0 500 350" className="w-full max-w-md max-h-[380px] drop-shadow-xl" fill="none">
          {/* Base Plinth & Stairs */}
          <rect x="50" y="240" width="400" height="24" fill="#baa98c" stroke="#b08d2e" strokeWidth="1.5" />
          <rect x="70" y="225" width="360" height="15" fill="#d8cdb4" stroke="#b08d2e" strokeWidth="1" />
          <rect x="90" y="210" width="320" height="15" fill="#e4dbca" stroke="#b08d2e" strokeWidth="1" />
          {/* 8 Columns */}
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i}>
              <rect x={110 + i * 40} y="110" width="16" height="100" fill="#e4dbca" stroke="#b08d2e" strokeWidth="1" />
              <rect x={108 + i * 40} y="105" width="20" height="5" fill="#c9a961" />
              <rect x={108 + i * 40} y="206" width="20" height="4" fill="#c9a961" />
            </g>
          ))}
          {/* Dark Bronze Center Door */}
          <rect x="232" y="140" width="36" height="70" fill="#161514" stroke="#c9a961" strokeWidth="2" />
          <line x1="250" y1="140" x2="250" y2="210" stroke="#c9a961" strokeWidth="1" />
          {/* Entablature & Pediment */}
          <rect x="90" y="90" width="320" height="18" fill="#d8cdb4" stroke="#b08d2e" strokeWidth="1.5" />
          <polygon points="250,35 85,90 415,90" fill="#e4dbca" stroke="#b08d2e" strokeWidth="2" />
          <circle cx="250" cy="70" r="12" fill="#c9a961" stroke="#b08d2e" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  return <div ref={containerRef} className={`w-full h-full min-h-[360px] ${className}`} />;
};

export default ThreeIsland;
