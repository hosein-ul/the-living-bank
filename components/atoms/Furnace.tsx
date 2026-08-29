"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
}

interface FurnaceProps {
  burnTrigger?: number; // timestamp or counter of recent burn
  className?: string;
}

export const Furnace: React.FC<FurnaceProps> = ({ burnTrigger = 0, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastBurnRef = useRef<number>(0);

  // Trigger burst of embers on burn event
  useEffect(() => {
    if (burnTrigger > 0 && burnTrigger !== lastBurnRef.current) {
      lastBurnRef.current = burnTrigger;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const centerX = canvas.width / 2;
      const centerY = canvas.height * 0.55;

      // 7-particle ember bursts per §3 spec
      for (let burst = 0; burst < 3; burst++) {
        for (let i = 0; i < 7; i++) {
          const angle = Math.PI * 1.1 + Math.random() * Math.PI * 0.8;
          const speed = 40 + Math.random() * 80;
          particlesRef.current.push({
            x: centerX + (Math.random() - 0.5) * 20,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2.5 + Math.random() * 3.5,
            opacity: 1.0,
            life: 0,
            maxLife: 0.6, // 600ms spec
            color: Math.random() > 0.4 ? "#c9a961" : "#b08d2e",
          });
        }
      }
    }
  }, [burnTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 240);
    const centerX = width / 2;
    const centerY = height * 0.65;

    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Ambient idle glow embers inside the furnace
      if (Math.random() < 0.25) {
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 30,
          y: centerY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 15,
          vy: -15 - Math.random() * 25,
          size: 1.5 + Math.random() * 2,
          opacity: 0.8,
          life: 0,
          maxLife: 0.8,
          color: Math.random() > 0.5 ? "#b08d2e" : "#c9a961",
        });
      }

      // Update & Draw Embers
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += delta;
        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        p.x += p.vx * delta;
        p.y += p.vy * delta;
        const progress = p.life / p.maxLife;
        p.opacity = (1 - progress) * 0.9;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className={`relative w-full h-[200px] sm:h-[240px] flex items-center justify-center ${className}`}>
      {/* SVG Furnace Crucible Illustration */}
      <svg
        viewBox="0 0 240 180"
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm"
      >
        {/* Stone Furnace Body */}
        <path
          d="M 40 160 L 60 70 L 180 70 L 200 160 Z"
          fill="#e9e4d8"
          stroke="#1a1a18"
          strokeWidth="2"
        />
        {/* Fire Chamber Arch */}
        <path
          d="M 80 160 L 80 110 Q 120 75 160 110 L 160 160 Z"
          fill="#1a1a18"
          stroke="#1a1a18"
          strokeWidth="1.5"
        />
        {/* Gold Grate bars */}
        <line x1="95" y1="130" x2="145" y2="130" stroke="#b08d2e" strokeWidth="2" />
        <line x1="90" y1="145" x2="150" y2="145" stroke="#b08d2e" strokeWidth="2" />
        {/* Top Rim */}
        <rect x="55" y="60" width="130" height="12" fill="#d8d2c2" stroke="#1a1a18" strokeWidth="1.5" />
        <text
          x="120"
          y="50"
          textAnchor="middle"
          fill="#1a1a18"
          fontFamily="var(--font-ibm-plex-mono), monospace"
          fontSize="9"
          letterSpacing="2"
          fontWeight="600"
        >
          THE SUPPLY FURNACE
        </text>
      </svg>

      {/* Canvas for EMBER particle physics */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};
