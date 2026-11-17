'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Language } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

export type BleedIntensity = 'natural' | 'vibrant' | 'subtle';

interface ColorBleedBackgroundProps {
  darkMode?: boolean;
  lang?: Language;
}

export const ColorBleedBackground = ({
  darkMode: propDarkMode,
}: ColorBleedBackgroundProps) => {
  const pathname = usePathname();
  const isInternalPortal =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/manager') ||
    pathname?.startsWith('/expert') ||
    pathname?.startsWith('/staff') ||
    pathname?.startsWith('/doctor');

  const { darkMode: contextDarkMode } = useTheme();
  const darkMode = propDarkMode !== undefined ? propDarkMode : contextDarkMode;
  const cursorBlobRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const savedEffects = localStorage.getItem('animora_effects_enabled');
        const savedPerf = localStorage.getItem('animora_performance_mode');
        if (savedEffects === 'false' || savedPerf === 'true') {
          setEnabled(false);
        } else {
          setEnabled(true);
        }
      } catch {
        setEnabled(true);
      }
    });

    const handleToggle = (e: CustomEvent<{ enabled: boolean }>) => {
      setEnabled(e.detail.enabled);
    };

    const handlePerfToggle = (e: CustomEvent<{ enabled: boolean }>) => {
      setEnabled(!e.detail.enabled);
    };

    window.addEventListener('animora_effects_toggle', handleToggle as EventListener);
    window.addEventListener('animora_bubble_toggle', handleToggle as EventListener);
    window.addEventListener('animora_performance_mode_toggle', handlePerfToggle as EventListener);
    return () => {
      cancelled = true;
      window.removeEventListener('animora_effects_toggle', handleToggle as EventListener);
      window.removeEventListener('animora_bubble_toggle', handleToggle as EventListener);
      window.removeEventListener('animora_performance_mode_toggle', handlePerfToggle as EventListener);
    };
  }, []);

  // Smooth mouse-follow trail using direct DOM transform (0 React re-renders)
  useEffect(() => {
    if (!enabled) return;
    const blobEl = cursorBlobRef.current;
    if (!blobEl) return;

    let animationFrameId: number | null = null;
    let targetX = -400;
    let targetY = -400;
    let currentX = -400;
    let currentY = -400;
    let isVisible = false;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        blobEl.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      blobEl.style.opacity = '0';
    };

    const updateLoop = () => {
      if (isVisible) {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        blobEl.style.transform = `translate3d(${currentX - 180}px, ${currentY - 180}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    animationFrameId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);

  if (!enabled || isInternalPortal) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        opacity: 0.65,
        transform: 'translate3d(0, 0, 0)',
        contain: 'strict',
      }}
    >
      {/* Blob 1: Top-Left Coral Rose Aura */}
      <div
        className="absolute -top-28 -left-28 w-112.5 h-112.5 sm:w-162.5 sm:h-162.5 rounded-full blur-[60px] sm:blur-[75px] pointer-events-none"
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          background: darkMode
            ? 'radial-gradient(circle at 40% 40%, rgba(244, 182, 194, 0.24) 0%, rgba(255, 127, 107, 0.18) 50%, transparent 75%)'
            : 'radial-gradient(circle at 40% 40%, rgba(255, 127, 107, 0.35) 0%, rgba(244, 182, 194, 0.26) 50%, transparent 75%)',
        }}
      />

      {/* Blob 2: Top-Right Warm Golden Amber & Apricot */}
      <div
        className="absolute -top-20 -right-24 w-105 h-105 sm:w-155 sm:h-155 rounded-full blur-[60px] sm:blur-[75px] pointer-events-none"
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          background: darkMode
            ? 'radial-gradient(circle at 60% 35%, rgba(251, 146, 60, 0.20) 0%, rgba(244, 182, 194, 0.14) 50%, transparent 75%)'
            : 'radial-gradient(circle at 60% 35%, rgba(251, 191, 36, 0.30) 0%, rgba(254, 215, 170, 0.24) 50%, transparent 75%)',
        }}
      />

      {/* Blob 3: Center-Left Lavender & Lilac Rose */}
      <div
        className="absolute top-[35%] -left-36 w-112.5 h-112.5 sm:w-170 sm:h-170 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          background: darkMode
            ? 'radial-gradient(circle at 45% 55%, rgba(168, 85, 247, 0.20) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 75%)'
            : 'radial-gradient(circle at 45% 55%, rgba(216, 180, 254, 0.32) 0%, rgba(244, 182, 194, 0.26) 50%, transparent 75%)',
        }}
      />

      {/* Blob 4: Center-Right Soft Coral & Peach */}
      <div
        className="absolute top-[55%] -right-32 w-115 h-115 sm:w-175 sm:h-175 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          background: darkMode
            ? 'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.18) 0%, rgba(255, 127, 107, 0.14) 50%, transparent 75%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255, 127, 107, 0.30) 0%, rgba(253, 164, 175, 0.24) 50%, transparent 75%)',
        }}
      />

      {/* Blob 5: Bottom Center Deep Wine Rose & Blush */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-137.5 h-120 sm:w-212.5 sm:h-150 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          background: darkMode
            ? 'radial-gradient(ellipse at center, rgba(244, 182, 194, 0.18) 0%, rgba(168, 85, 247, 0.14) 50%, transparent 75%)'
            : 'radial-gradient(ellipse at center, rgba(244, 182, 194, 0.36) 0%, rgba(255, 127, 107, 0.24) 50%, transparent 75%)',
        }}
      />

      {/* Cursor Watercolor Aura (Direct DOM transform - 0 React re-renders) */}
      <div
        ref={cursorBlobRef}
        className="absolute top-0 left-0 w-90 h-90 rounded-full blur-[50px] sm:blur-[65px] opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          transform: 'translate3d(-400px, -400px, 0)',
          willChange: 'transform',
          background: darkMode
            ? 'radial-gradient(circle, rgba(244, 182, 194, 0.24) 0%, rgba(255, 127, 107, 0.16) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 127, 107, 0.30) 0%, rgba(251, 191, 36, 0.22) 42%, transparent 70%)',
        }}
      />
    </div>
  );
};
