"use client";

import React, { useState, useEffect, useRef } from 'react';

interface PawStep {
  x: number;
  y: number;
  angleRad: number;
  scale: number;
  color: string;
  birthTime: number;
}

const STEP_DISTANCE = 36; // Minimum px between consecutive paw prints
const MIN_STEP_INTERVAL = 50; // Minimum ms between steps
const PAW_LIFESPAN_MS = 1800; // How long each paw stays on screen

export const CursorPawTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedPerf = localStorage.getItem('animora_performance_mode');
      if (savedPerf !== null) {
        setEnabled(savedPerf !== 'true');
      } else {
        const saved = localStorage.getItem('animora_effects_enabled') ?? localStorage.getItem('animora_paw_bubbles_enabled');
        if (saved !== null) {
          setEnabled(saved === 'true');
        }
      }
    } catch {
      // ignore
    }

    const handleToggle = (e: CustomEvent<{ enabled: boolean }>) => {
      setEnabled(e.detail.enabled);
    };

    const handlePerfToggle = (e: CustomEvent<{ enabled: boolean }>) => {
      setEnabled(!e.detail.enabled);
    };

    window.addEventListener('animora_effects_toggle', handleToggle as EventListener);
    window.addEventListener('animora_performance_mode_toggle', handlePerfToggle as EventListener);
    return () => {
      window.removeEventListener('animora_effects_toggle', handleToggle as EventListener);
      window.removeEventListener('animora_performance_mode_toggle', handlePerfToggle as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // Check if user prefers reduced motion or has touch-only device
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const paws: PawStep[] = [];
    let lastPos: { x: number; y: number } | null = null;
    let lastTime = 0;
    let stepCount = 0;
    let animId: number | null = null;

    // Helper to draw a single paw print onto canvas context
    const drawPaw = (ctx: CanvasRenderingContext2D, paw: PawStep, alpha: number) => {
      ctx.save();
      ctx.translate(paw.x, paw.y);
      ctx.rotate(paw.angleRad);
      ctx.scale(paw.scale * 0.9, paw.scale * 0.9);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = paw.color;

      // Draw Main Metacarpal Pad
      ctx.beginPath();
      ctx.ellipse(0, 5, 5.5, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Toe 1 (Inner Left)
      ctx.beginPath();
      ctx.ellipse(-2.8, -3.2, 1.8, 2.4, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Toe 2 (Inner Right)
      ctx.beginPath();
      ctx.ellipse(2.8, -3.2, 1.8, 2.4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Toe 3 (Outer Left)
      ctx.beginPath();
      ctx.ellipse(-6.0, -0.2, 1.6, 2.2, -0.45, 0, Math.PI * 2);
      ctx.fill();

      // Toe 4 (Outer Right)
      ctx.beginPath();
      ctx.ellipse(6.0, -0.2, 1.6, 2.2, 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const renderLoop = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      // Filter and draw active paws
      let i = 0;
      while (i < paws.length) {
        const paw = paws[i];
        const age = now - paw.birthTime;
        if (age >= PAW_LIFESPAN_MS) {
          // Remove expired paw
          paws.splice(i, 1);
        } else {
          const progress = age / PAW_LIFESPAN_MS;
          // Fade out smoothly using ease-out
          const alpha = (1 - progress) * 0.85;
          drawPaw(ctx, paw, alpha);
          i++;
        }
      }

      if (paws.length > 0) {
        animId = requestAnimationFrame(renderLoop);
      } else {
        animId = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTime < MIN_STEP_INTERVAL) return;

      const { clientX: x, clientY: y } = e;

      if (!lastPos) {
        lastPos = { x, y };
        return;
      }

      const dx = x - lastPos.x;
      const dy = y - lastPos.y;
      const distance = Math.hypot(dx, dy);

      if (distance < STEP_DISTANCE) return;

      const moveAngleRad = Math.atan2(dy, dx) + Math.PI / 2;
      const isLeft = stepCount % 2 === 0;
      const perpOffset = isLeft ? -7 : 7;
      const perpX = -Math.sin(moveAngleRad - Math.PI / 2) * perpOffset;
      const perpY = Math.cos(moveAngleRad - Math.PI / 2) * perpOffset;

      stepCount++;
      lastPos = { x, y };
      lastTime = now;

      paws.push({
        x: x + perpX,
        y: y + perpY,
        angleRad: moveAngleRad + (isLeft ? -0.1 : 0.1),
        scale: 0.88 + (stepCount % 3) * 0.08,
        color: stepCount % 2 === 0 ? '#FF7F6B' : '#6B1F2E',
        birthTime: now,
      });

      if (paws.length > 24) {
        paws.shift();
      }

      if (!animId) {
        animId = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 select-none"
      aria-hidden="true"
    />
  );
};
