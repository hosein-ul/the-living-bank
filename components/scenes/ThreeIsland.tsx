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

  // Plain progress tracking object tweened by GSAP ScrollTrigger
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
    const baseFogDensity = 0.04;
    scene.fog = new THREE.FogExp2("#f4f1ea", baseFogDensity);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8.5, 16.5);
    camera.lookAt(0, 0.6, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      });
      renderer.setSize(width, height);
      // DPR Capped at 1.5 per TASK2.md
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL not supported; using fallback.", err);
      setWebGLSupported(false);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight("#f4f1ea", 2.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#c9a961", 2.6);
    sunLight.position.set(12, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const goldRimLight = new THREE.DirectionalLight("#e6c374", 1.4);
    goldRimLight.position.set(-12, 8, -10);
    scene.add(goldRimLight);

    // Island Group
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Materials
    const paperMat = new THREE.MeshLambertMaterial({ color: "#e9e4d8", flatShading: true });
    const darkMat = new THREE.MeshLambertMaterial({ color: "#1a1a18", flatShading: true });
    const goldMat = new THREE.MeshLambertMaterial({ color: "#c9a961", flatShading: true });
    const goldBrightMat = new THREE.MeshLambertMaterial({ color: "#e6c374", flatShading: true });
    const goldDimMat = new THREE.MeshLambertMaterial({ color: "#b08d2e", flatShading: true });

    // 1. Water Ocean Disk
    const waterGeo = new THREE.CylinderGeometry(7.5, 7.5, 0.4, 32);
    const waterMat = new THREE.MeshLambertMaterial({
      color: "#e2ded2",
      flatShading: true,
      transparent: true,
      opacity: 0.85,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -1.1;
    waterMesh.receiveShadow = true;
    islandGroup.add(waterMesh);

    // 2. Island Base
    const baseGeo = new THREE.CylinderGeometry(5.2, 4.2, 1.8, 8);
    const baseMesh = new THREE.Mesh(baseGeo, paperMat);
    baseMesh.position.y = -0.7;
    baseMesh.receiveShadow = true;
    islandGroup.add(baseMesh);

    const baseRimGeo = new THREE.CylinderGeometry(5.4, 5.2, 0.2, 8);
    const baseRimMesh = new THREE.Mesh(baseRimGeo, goldDimMat);
    baseRimMesh.position.y = 0.1;
    islandGroup.add(baseRimMesh);

    // 3. Central Bank Rotunda
    const bankGroup = new THREE.Group();
    const rotundaGeo = new THREE.CylinderGeometry(1.6, 1.7, 2.0, 14);
    const rotundaMesh = new THREE.Mesh(rotundaGeo, paperMat);
    rotundaMesh.position.y = 1.0;
    rotundaMesh.castShadow = true;
    rotundaMesh.receiveShadow = true;
    bankGroup.add(rotundaMesh);

    const domeGeo = new THREE.SphereGeometry(1.65, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, goldBrightMat);
    domeMesh.position.y = 2.0;
    domeMesh.castShadow = true;
    bankGroup.add(domeMesh);

    const doorGeo = new THREE.BoxGeometry(0.55, 1.0, 0.25);
    const doorMesh = new THREE.Mesh(doorGeo, darkMat);
    doorMesh.position.set(0, 0.5, 1.65);
    bankGroup.add(doorMesh);

    const spireGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
    const spireMesh = new THREE.Mesh(spireGeo, goldMat);
    spireMesh.position.y = 3.8;
    bankGroup.add(spireMesh);

    islandGroup.add(bankGroup);

    // 4. Surrounding 5 Structures
    const structureData = [
      { name: "Pool", angle: 0, r: 3.5, color: goldMat, scale: [1.1, 0.6, 1.1] },
      { name: "Standard", angle: (Math.PI * 2) / 5, r: 3.6, color: paperMat, scale: [0.8, 1.6, 0.8] },
      { name: "Charters", angle: (Math.PI * 4) / 5, r: 3.4, color: goldDimMat, scale: [0.9, 1.1, 0.9] },
      { name: "Branches", angle: (Math.PI * 6) / 5, r: 3.6, color: paperMat, scale: [0.7, 0.9, 0.7] },
      { name: "Vaults", angle: (Math.PI * 8) / 5, r: 3.5, color: darkMat, scale: [1.2, 0.8, 1.2] },
    ];

    const structureMeshes: THREE.Group[] = [];
    structureData.forEach((st) => {
      const group = new THREE.Group();
      const x = Math.cos(st.angle) * st.r;
      const z = Math.sin(st.angle) * st.r;
      group.position.set(x, 0, z);

      const geo = new THREE.BoxGeometry(st.scale[0], st.scale[1], st.scale[2]);
      const mesh = new THREE.Mesh(geo, st.color);
      mesh.position.y = st.scale[1] / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      const capGeo = new THREE.ConeGeometry(st.scale[0] * 0.7, 0.5, 4);
      const capMesh = new THREE.Mesh(capGeo, goldBrightMat);
      capMesh.position.y = st.scale[1] + 0.25;
      capMesh.rotation.y = Math.PI / 4;
      group.add(capMesh);

      islandGroup.add(group);
      structureMeshes.push(group);
    });

    // 5. Floating Gold Dust Particles Field (80 particles)
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { y: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 1] = Math.random() * 8 - 1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      particleVelocities.push({
        y: 0.003 + Math.random() * 0.006,
      });
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: "#b08d2e",
      size: 0.12,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Pointer Parallax
    const handlePointerMove = (e: PointerEvent) => {
      if (isReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.x = nx * 0.08;
      mouseRef.current.y = ny * 0.06;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // GSAP ScrollTrigger to scrub plain object { p: 0 -> 1 }
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

      // Scroll-driven camera orbit (theta = p * Math.PI * 1.6)
      const targetOrbit = p * Math.PI * 1.6;
      currentOrbit += (targetOrbit - currentOrbit) * 0.1;

      islandGroup.rotation.y = currentOrbit + (isReducedMotion ? 0 : mouseRef.current.x);
      islandGroup.rotation.x = isReducedMotion ? 0 : mouseRef.current.y;
      islandGroup.position.y = isReducedMotion ? 0 : Math.sin(elapsed * 1.2) * 0.08;

      // Fog & Rim Light Modulation with scroll progress
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).density = baseFogDensity + p * 0.025;
      }
      goldRimLight.intensity = 1.4 + Math.sin(p * Math.PI) * 1.2;

      // Pulse active structure
      const curIdx = activeIdxRef.current;
      structureMeshes.forEach((group, idx) => {
        const isHighlight = curIdx === idx + 1 || (curIdx === 0 && idx === 0);
        const targetScale = isHighlight ? 1.2 : 1.0;
        const targetY = isHighlight ? 0.35 : 0.0;
        group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        group.position.y += (targetY - group.position.y) * 0.1;
      });

      // Animate particles
      if (!isReducedMotion) {
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleVelocities[i].y;
          if (positions[i * 3 + 1] > 8) positions[i * 3 + 1] = -1;
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    render();

    // IntersectionObserver to pause when offscreen
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
      camera.lookAt(0, 0.6, 0);
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
      baseGeo.dispose();
      rotundaGeo.dispose();
      domeGeo.dispose();
      doorGeo.dispose();
      spireGeo.dispose();
      waterGeo.dispose();
      particleGeo.dispose();
    };
  }, [sectionTriggerId, onActiveIndexChange]);

  if (!webGLSupported) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 bg-paper-deep text-center select-none ${className}`}>
        <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
          THE SOVEREIGN ISLAND (3D ENGINE)
        </span>
      </div>
    );
  }

  return <div ref={containerRef} className={`w-full h-full min-h-[320px] ${className}`} />;
};

export default ThreeIsland;
