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
      const centerY = canvas.height * 0.62;

      // Intense 7-particle bursts
      for (let burst = 0; burst < 4; burst++) {
        for (let i = 0; i < 7; i++) {
          const angle = Math.PI * 1.05 + Math.random() * Math.PI * 0.9;
          const speed = 60 + Math.random() * 110;
          particlesRef.current.push({
            x: centerX + (Math.random() - 0.5) * 24,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2.5 + Math.random() * 4,
            opacity: 1.0,
            life: 0,
            maxLife: 0.7,
            color: Math.random() > 0.35 ? "#c9a961" : "#b08d2e",
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
    const width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 260);
    const centerX = width / 2;
    const centerY = height * 0.66;

    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Ambient idle glow embers
      if (Math.random() < 0.4) {
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 36,
          y: centerY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 20,
          vy: -20 - Math.random() * 35,
          size: 1.8 + Math.random() * 2.2,
          opacity: 0.85,
          life: 0,
          maxLife: 0.85,
          color: Math.random() > 0.4 ? "#b08d2e" : "#c9a961",
        });
      }

      // Draw dynamic fire flame tongue in center chamber
      const flameTime = now * 0.005;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX - 28, centerY + 14);
      ctx.quadraticCurveTo(
        centerX - 12 + Math.sin(flameTime * 1.5) * 8,
        centerY - 32 + Math.cos(flameTime * 2) * 12,
        centerX + Math.sin(flameTime * 2.2) * 6,
        centerY - 48 + Math.sin(flameTime * 3) * 14
      );
      ctx.quadraticCurveTo(
        centerX + 14 + Math.cos(flameTime * 1.8) * 8,
        centerY - 28 + Math.sin(flameTime * 1.6) * 10,
        centerX + 28,
        centerY + 14
      );
      ctx.closePath();
      const flameGrad = ctx.createLinearGradient(centerX, centerY + 14, centerX, centerY - 48);
      flameGrad.addColorStop(0, "#b08d2e");
      flameGrad.addColorStop(0.5, "#c9a961");
      flameGrad.addColorStop(1, "rgba(244,241,234,0.1)");
      ctx.fillStyle = flameGrad;
      ctx.globalAlpha = 0.75;
      ctx.fill();
      ctx.restore();

      // Update & Draw Embers
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += delta;
        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        p.x += p.vx * delta + Math.sin(now * 0.01 + p.y) * 0.4;
        p.y += p.vy * delta;
        const progress = p.life / p.maxLife;
        p.opacity = (1 - progress) * 0.95;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
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
    <div className={`relative w-full h-[220px] sm:h-[260px] flex items-center justify-center ${className}`}>
      {/* SVG Furnace Crucible Illustration */}
      <svg
        viewBox="0 0 260 200"
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md"
      >
        {/* Stone Furnace Body */}
        <path
          d="M 40 180 L 65 75 L 195 75 L 220 180 Z"
          fill="#e9e4d8"
          stroke="#1a1a18"
          strokeWidth="2"
        />
        {/* Masonry Lines */}
        <line x1="50" y1="110" x2="210" y2="110" stroke="#1a1a18" strokeWidth="0.75" strokeOpacity="0.4" />
        <line x1="45" y1="145" x2="215" y2="145" stroke="#1a1a18" strokeWidth="0.75" strokeOpacity="0.4" />

        {/* Fire Chamber Arch */}
        <path
          d="M 85 180 L 85 115 Q 130 75 175 115 L 175 180 Z"
          fill="#1a1a18"
          stroke="#1a1a18"
          strokeWidth="2"
        />
        {/* Gold Grate bars */}
        <line x1="100" y1="140" x2="160" y2="140" stroke="#b08d2e" strokeWidth="2.5" />
        <line x1="94" y1="158" x2="166" y2="158" stroke="#b08d2e" strokeWidth="2.5" />
        
        {/* Top Rim */}
        <rect x="58" y="62" width="144" height="14" fill="#d8d2c2" stroke="#1a1a18" strokeWidth="1.8" />
        <text
          x="130"
          y="52"
          textAnchor="middle"
          fill="#1a1a18"
          fontFamily="var(--font-ibm-plex-mono), monospace"
          fontSize="9.5"
          letterSpacing="2.2"
          fontWeight="600"
        >
          THE SUPPLY FURNACE
        </text>
      </svg>

      {/* Canvas for EMBER particle physics & Flame */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};
