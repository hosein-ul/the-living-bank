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
    camera.position.set(0, 7.5, 17.0);
    camera.lookAt(0, 1.2, 0);

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

    // Plaza Border Inlay
    const plazaBorderGeo = new THREE.CylinderGeometry(8.25, 8.25, 0.1, 36);
    geometriesToDispose.push(plazaBorderGeo);
    const plazaBorderMesh = new THREE.Mesh(plazaBorderGeo, goldAccentMat);
    plazaBorderMesh.position.y = 0.02;
    bankGroup.add(plazaBorderMesh);

    // 2. Grand Stepped Stone Plinth (5 shallow steps leading up)
    const stepCount = 5;
    for (let s = 0; s < stepCount; s++) {
      const stepW = 8.8 - s * 0.35;
      const stepD = 6.8 - s * 0.25;
      const stepH = 0.18;
      const stepGeo = new THREE.BoxGeometry(stepW, stepH, stepD);
      geometriesToDispose.push(stepGeo);
      const stepMesh = new THREE.Mesh(stepGeo, s % 2 === 0 ? limestoneLightMat : limestoneMat);
      stepMesh.position.set(0, s * stepH + stepH / 2, 0.4 - s * 0.1);
      stepMesh.receiveShadow = true;
      stepMesh.castShadow = true;
      bankGroup.add(stepMesh);
    }

    const plinthTopY = stepCount * 0.18; // ~0.90

    // Main Bank Base Plinth Box
    const mainPlinthGeo = new THREE.BoxGeometry(7.2, 0.5, 5.2);
    geometriesToDispose.push(mainPlinthGeo);
    const mainPlinthMesh = new THREE.Mesh(mainPlinthGeo, limestoneMat);
    mainPlinthMesh.position.set(0, plinthTopY + 0.25, -0.4);
    mainPlinthMesh.castShadow = true;
    mainPlinthMesh.receiveShadow = true;
    bankGroup.add(mainPlinthMesh);

    const buildingBaseY = plinthTopY + 0.5; // ~1.40

    // 3. Rectangular Banking Hall Body (Behind colonnade)
    const hallGeo = new THREE.BoxGeometry(6.6, 2.6, 3.8);
    geometriesToDispose.push(hallGeo);
    const hallMesh = new THREE.Mesh(hallGeo, limestoneLightMat);
    hallMesh.position.set(0, buildingBaseY + 1.3, -1.0);
    hallMesh.castShadow = true;
    hallMesh.receiveShadow = true;
    bankGroup.add(hallMesh);

    // 4. Colonnade of 8 Classical Columns (Front Facade)
    const columnCount = 8;
    const colSpacing = 0.82;
    const colStartX = -((columnCount - 1) * colSpacing) / 2;
    const colHeight = 2.4;
    const colRadius = 0.14;
    const colZ = 0.85;

    for (let i = 0; i < columnCount; i++) {
      const colX = colStartX + i * colSpacing;

      // Base Block
      const colBaseGeo = new THREE.BoxGeometry(0.36, 0.12, 0.36);
      geometriesToDispose.push(colBaseGeo);
      const colBaseMesh = new THREE.Mesh(colBaseGeo, limestoneDarkMat);
      colBaseMesh.position.set(colX, buildingBaseY + 0.06, colZ);
      colBaseMesh.castShadow = true;
      bankGroup.add(colBaseMesh);

      // Column Shaft
      const colShaftGeo = new THREE.CylinderGeometry(colRadius * 0.88, colRadius, colHeight, 12);
      geometriesToDispose.push(colShaftGeo);
      const colShaftMesh = new THREE.Mesh(colShaftGeo, limestoneLightMat);
      colShaftMesh.position.set(colX, buildingBaseY + 0.12 + colHeight / 2, colZ);
      colShaftMesh.castShadow = true;
      colShaftMesh.receiveShadow = true;
      bankGroup.add(colShaftMesh);

      // Capital Block (Top)
      const colCapGeo = new THREE.BoxGeometry(0.38, 0.14, 0.38);
      geometriesToDispose.push(colCapGeo);
      const colCapMesh = new THREE.Mesh(colCapGeo, goldAccentMat);
      colCapMesh.position.set(colX, buildingBaseY + 0.12 + colHeight + 0.07, colZ);
      colCapMesh.castShadow = true;
      bankGroup.add(colCapMesh);
    }

    const colonnadeTopY = buildingBaseY + 0.12 + colHeight + 0.14; // ~4.06

    // 5. Entablature & Architrave (Wide horizontal stone beam)
    const entablatureGeo = new THREE.BoxGeometry(7.0, 0.45, 2.2);
    geometriesToDispose.push(entablatureGeo);
    const entablatureMesh = new THREE.Mesh(entablatureGeo, limestoneMat);
    entablatureMesh.position.set(0, colonnadeTopY + 0.225, 0.0);
    entablatureMesh.castShadow = true;
    entablatureMesh.receiveShadow = true;
    bankGroup.add(entablatureMesh);

    // Gold Cornice Line
    const corniceGeo = new THREE.BoxGeometry(7.15, 0.08, 2.3);
    geometriesToDispose.push(corniceGeo);
    const corniceMesh = new THREE.Mesh(corniceGeo, goldAccentMat);
    corniceMesh.position.set(0, colonnadeTopY + 0.45 + 0.04, 0.0);
    bankGroup.add(corniceMesh);

    // 6. Classical Triangular Pediment (Front Gable)
    const pedimentShape = new THREE.Shape();
    pedimentShape.moveTo(-3.45, 0);
    pedimentShape.lineTo(3.45, 0);
    pedimentShape.lineTo(0, 1.25);
    pedimentShape.closePath();

    const extrudeSettings = { depth: 0.6, bevelEnabled: false };
    const pedimentGeo = new THREE.ExtrudeGeometry(pedimentShape, extrudeSettings);
    geometriesToDispose.push(pedimentGeo);
    const pedimentMesh = new THREE.Mesh(pedimentGeo, limestoneLightMat);
    pedimentMesh.position.set(0, colonnadeTopY + 0.49, 0.55);
    pedimentMesh.castShadow = true;
    bankGroup.add(pedimentMesh);

    // Gold Tympanum Emblem
    const emblemGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
    geometriesToDispose.push(emblemGeo);
    const emblemMesh = new THREE.Mesh(emblemGeo, goldAccentMat);
    emblemMesh.rotation.x = Math.PI / 2;
    emblemMesh.position.set(0, colonnadeTopY + 0.9, 1.18);
    bankGroup.add(emblemMesh);

    // 7. Small Square Drum Dome at Rear (Set back, not a minaret)
    const drumGeo = new THREE.BoxGeometry(2.4, 0.8, 2.4);
    geometriesToDispose.push(drumGeo);
    const drumMesh = new THREE.Mesh(drumGeo, limestoneDarkMat);
    drumMesh.position.set(0, colonnadeTopY + 0.4, -1.6);
    drumMesh.castShadow = true;
    bankGroup.add(drumMesh);

    const lowDomeGeo = new THREE.SphereGeometry(1.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    geometriesToDispose.push(lowDomeGeo);
    const lowDomeMesh = new THREE.Mesh(lowDomeGeo, goldAccentMat);
    lowDomeMesh.position.set(0, colonnadeTopY + 0.8, -1.6);
    lowDomeMesh.castShadow = true;
    bankGroup.add(lowDomeMesh);

    // 8. THE ONE DOOR — Centered Dark Bronze Double Door (The singular dark hero focal point)
    const doorFrameGeo = new THREE.BoxGeometry(1.25, 2.2, 0.2);
    geometriesToDispose.push(doorFrameGeo);
    const doorFrameMesh = new THREE.Mesh(doorFrameGeo, goldAccentMat);
    doorFrameMesh.position.set(0, buildingBaseY + 1.1, 0.82);
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
