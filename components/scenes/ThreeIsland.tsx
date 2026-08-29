"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeIslandProps {
  progress: number; // 0 to 1
  activeIndex: number; // 0 to 5
}

export const ThreeIsland: React.FC<ThreeIslandProps> = ({ progress, activeIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  // References for live update without tearing down WebGL context
  const progressRef = useRef<number>(progress);
  const activeIndexRef = useRef<number>(activeIndex);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
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
        islandGroup.position.y = 0;
      }
    };
    reducedMediaQuery.addEventListener("change", handleReducedChange);

    // Setup Three.js Scene safely
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f4f1ea");
    scene.fog = new THREE.FogExp2("#f4f1ea", 0.045);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 7, 13);

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
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL not supported; using fallback.", err);
      setWebGLSupported(false);
      return;
    }

    // Warm Architectural Lighting
    const ambientLight = new THREE.AmbientLight("#f4f1ea", 2.0);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#c9a961", 2.4);
    sunLight.position.set(12, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight("#e9e4d8", 1.2);
    fillLight.position.set(-10, 6, -10);
    scene.add(fillLight);

    // Island Group
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Matte Paper-Gold Materials
    const paperMat = new THREE.MeshLambertMaterial({ color: "#e9e4d8", flatShading: true });
    const darkMat = new THREE.MeshLambertMaterial({ color: "#1a1a18", flatShading: true });
    const goldMat = new THREE.MeshLambertMaterial({ color: "#c9a961", flatShading: true });
    const goldBrightMat = new THREE.MeshLambertMaterial({ color: "#e6c374", flatShading: true });
    const goldDimMat = new THREE.MeshLambertMaterial({ color: "#b08d2e", flatShading: true });

    // 1. Water Ocean Disk with animated waves
    const waterGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.4, 32);
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

    // 2. Island Base (Low-poly stepped hexagonal cylinder)
    const baseGeo = new THREE.CylinderGeometry(5.2, 4.2, 1.8, 8);
    const baseMesh = new THREE.Mesh(baseGeo, paperMat);
    baseMesh.position.y = -0.7;
    baseMesh.receiveShadow = true;
    islandGroup.add(baseMesh);

    const baseRimGeo = new THREE.CylinderGeometry(5.4, 5.2, 0.2, 8);
    const baseRimMesh = new THREE.Mesh(baseRimGeo, goldDimMat);
    baseRimMesh.position.y = 0.1;
    islandGroup.add(baseRimMesh);

    // 3. Central Bank (Monumental low-poly rotunda with dome & columns)
    const bankGroup = new THREE.Group();
    bankGroup.position.set(0, 0, 0);

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

    // Ornate Portico & Door
    const doorGeo = new THREE.BoxGeometry(0.55, 1.0, 0.25);
    const doorMesh = new THREE.Mesh(doorGeo, darkMat);
    doorMesh.position.set(0, 0.5, 1.65);
    bankGroup.add(doorMesh);

    // Spire on top of Dome
    const spireGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
    const spireMesh = new THREE.Mesh(spireGeo, goldMat);
    spireMesh.position.y = 3.8;
    bankGroup.add(spireMesh);

    islandGroup.add(bankGroup);

    // 4. Surrounding 5 Low-Poly Structures
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

      // Gold cap on structures
      const capGeo = new THREE.ConeGeometry(st.scale[0] * 0.7, 0.5, 4);
      const capMesh = new THREE.Mesh(capGeo, goldBrightMat);
      capMesh.position.y = st.scale[1] + 0.25;
      capMesh.rotation.y = Math.PI / 4;
      group.add(capMesh);

      islandGroup.add(group);
      structureMeshes.push(group);
    });

    // 5. Floating Gold Dust Particles Field (120 particles)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 1] = Math.random() * 8 - 1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.005,
        y: 0.003 + Math.random() * 0.006,
        z: (Math.random() - 0.5) * 0.005,
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

    // Pointer Parallax Listener (±5°)
    const handlePointerMove = (e: PointerEvent) => {
      if (isReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.x = nx * 0.08;
      mouseRef.current.y = ny * 0.06;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Render Animation Loop
    let animId: number;
    let currentOrbit = 0;
    let clock = new THREE.Clock();

    const render = () => {
      clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const curProgress = progressRef.current;
      const curActiveIdx = activeIndexRef.current;

      // Smooth 300° orbit driven by scroll progress
      const targetOrbit = curProgress * ((300 * Math.PI) / 180);
      currentOrbit += (targetOrbit - currentOrbit) * 0.08;

      islandGroup.rotation.y = currentOrbit + (isReducedMotion ? 0 : mouseRef.current.x);
      islandGroup.rotation.x = isReducedMotion ? 0 : mouseRef.current.y;

      // Gentle floating bob on island (suppressed on reduced motion)
      islandGroup.position.y = isReducedMotion ? 0 : Math.sin(elapsed * 1.2) * 0.08;

      // Water subtle rotation & pulsing
      if (!isReducedMotion) {
        waterMesh.rotation.y = elapsed * 0.05;
      }

      // Pulse & Elevate active structure
      structureMeshes.forEach((group, idx) => {
        const isHighlight = curActiveIdx === idx + 1 || (curActiveIdx === 0 && idx === 0);
        const targetScale = isHighlight ? 1.2 : 1.0;
        const targetY = isHighlight ? 0.4 : 0.0;

        group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        group.position.y += (targetY - group.position.y) * 0.1;
      });

      // Animate floating gold dust particles (suppressed on reduced motion)
      if (!isReducedMotion) {
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleVelocities[i].y;
          positions[i * 3] += Math.sin(elapsed + i) * 0.002;
          positions[i * 3 + 2] += Math.cos(elapsed + i) * 0.002;

          if (positions[i * 3 + 1] > 8) {
            positions[i * 3 + 1] = -1;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
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
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      baseGeo.dispose();
      rotundaGeo.dispose();
      domeGeo.dispose();
      doorGeo.dispose();
      spireGeo.dispose();
      waterGeo.dispose();
      particleGeo.dispose();
    };
  }, []);

  if (!webGLSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-paper-deep text-center select-none">
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

  return <div ref={containerRef} className="w-full h-full min-h-[320px]" />;
};

export default ThreeIsland;
