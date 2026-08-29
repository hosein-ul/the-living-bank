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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Setup Three.js Scene safely
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f4f1ea");
    scene.fog = new THREE.FogExp2("#f4f1ea", 0.05);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6, 12);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL not supported in current environment; using graceful fallback.", err);
      setWebGLSupported(false);
      return;
    }

    // Warm Lighting
    const ambientLight = new THREE.AmbientLight("#f4f1ea", 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#c9a961", 2.2);
    sunLight.position.set(10, 15, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight("#e9e4d8", 1.0);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    // Island Group
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Matte paper materials
    const paperMat = new THREE.MeshLambertMaterial({ color: "#e9e4d8", flatShading: true });
    const darkMat = new THREE.MeshLambertMaterial({ color: "#1a1a18", flatShading: true });
    const goldMat = new THREE.MeshLambertMaterial({ color: "#c9a961", flatShading: true });
    const goldDimMat = new THREE.MeshLambertMaterial({ color: "#b08d2e", flatShading: true });

    // 1. Island Base (Low-poly hexagonal cylinder)
    const baseGeo = new THREE.CylinderGeometry(5.2, 4.4, 1.6, 7);
    const baseMesh = new THREE.Mesh(baseGeo, paperMat);
    baseMesh.position.y = -0.8;
    baseMesh.receiveShadow = true;
    islandGroup.add(baseMesh);

    // 2. Central Bank (Monumental low-poly rotunda with dome)
    const bankGroup = new THREE.Group();
    bankGroup.position.set(0, 0, 0);

    const rotundaGeo = new THREE.CylinderGeometry(1.6, 1.7, 1.8, 12);
    const rotundaMesh = new THREE.Mesh(rotundaGeo, paperMat);
    rotundaMesh.position.y = 0.9;
    rotundaMesh.castShadow = true;
    rotundaMesh.receiveShadow = true;
    bankGroup.add(rotundaMesh);

    const domeGeo = new THREE.SphereGeometry(1.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, goldDimMat);
    domeMesh.position.y = 1.8;
    domeMesh.castShadow = true;
    bankGroup.add(domeMesh);

    // Ornate Door facing forward
    const doorGeo = new THREE.BoxGeometry(0.5, 0.9, 0.2);
    const doorMesh = new THREE.Mesh(doorGeo, darkMat);
    doorMesh.position.set(0, 0.45, 1.65);
    bankGroup.add(doorMesh);

    islandGroup.add(bankGroup);

    // 3. Surrounding 5 Low-Poly Structures
    const structureData = [
      { name: "Pool", angle: 0, r: 3.4, color: goldMat, scale: [0.9, 0.5, 0.9] },
      { name: "Standard", angle: (Math.PI * 2) / 5, r: 3.5, color: paperMat, scale: [0.7, 1.4, 0.7] },
      { name: "Charters", angle: (Math.PI * 4) / 5, r: 3.3, color: goldDimMat, scale: [0.8, 1.0, 0.8] },
      { name: "Branches", angle: (Math.PI * 6) / 5, r: 3.5, color: paperMat, scale: [0.6, 0.8, 0.6] },
      { name: "Vaults", angle: (Math.PI * 8) / 5, r: 3.4, color: darkMat, scale: [1.1, 0.7, 1.1] },
    ];

    const structureMeshes: THREE.Mesh[] = [];

    structureData.forEach((st, i) => {
      const geo = new THREE.BoxGeometry(st.scale[0], st.scale[1], st.scale[2]);
      const mesh = new THREE.Mesh(geo, st.color);
      const x = Math.cos(st.angle) * st.r;
      const z = Math.sin(st.angle) * st.r;
      mesh.position.set(x, st.scale[1] / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      islandGroup.add(mesh);
      structureMeshes.push(mesh);
    });

    // Pointer Parallax Listener (±5°)
    const handlePointerMove = (e: PointerEvent) => {
      if (reducedMotion) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.x = nx * 0.08; // ~5°
      mouseRef.current.y = ny * 0.06;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Render Animation Loop
    let animId: number;
    let currentOrbit = 0;

    const render = () => {
      // 300° orbit driven by scroll progress
      const targetOrbit = progress * ((300 * Math.PI) / 180);
      currentOrbit += (targetOrbit - currentOrbit) * 0.1;

      islandGroup.rotation.y = currentOrbit + (reducedMotion ? 0 : mouseRef.current.x);
      islandGroup.rotation.x = reducedMotion ? 0 : mouseRef.current.y;

      // Pulse active structure gently
      structureMeshes.forEach((mesh, idx) => {
        const isHighlight = activeIndex === idx + 1 || (activeIndex === 0 && idx === 0);
        if (isHighlight) {
          mesh.scale.set(1.15, 1.15, 1.15);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

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
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      baseGeo.dispose();
      rotundaGeo.dispose();
      domeGeo.dispose();
      doorGeo.dispose();
    };
  }, [progress, activeIndex]);

  if (!webGLSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-paper-deep text-center select-none">
        <svg viewBox="0 0 200 160" className="w-48 h-36 mb-2 drop-shadow-sm">
          {/* Island Fallback SVG */}
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
