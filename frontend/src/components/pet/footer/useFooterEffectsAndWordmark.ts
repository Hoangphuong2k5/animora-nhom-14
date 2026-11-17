'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Language } from '@/types';

export interface UseFooterEffectsAndWordmarkParams {
  lang: Language;
  copiedToastText: string;
  onShowToast?: (text: string) => void;
}

export const useFooterEffectsAndWordmark = ({
  lang,
  copiedToastText,
  onShowToast,
}: UseFooterEffectsAndWordmarkParams) => {
  const [copiedField, setCopiedField] = useState<'phone' | 'email' | null>(null);

  const handleCopy = async (value: string, field: 'phone' | 'email') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      }
    } catch {
      // Fallback if clipboard API is restricted
    }
    setCopiedField(field);
    onShowToast?.(copiedToastText);
    window.setTimeout(() => {
      setCopiedField((prev) => (prev === field ? null : prev));
    }, 2200);
  };

  // Effects enabled state: khởi tạo true giống SSR rồi khôi phục từ localStorage sau mount
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(true);
  const [isPerfHydrated, setIsPerfHydrated] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const savedEffects = localStorage.getItem('animora_effects_enabled');
        const savedPerf = localStorage.getItem('animora_performance_mode');
        if (savedEffects === 'false' || savedPerf === 'true') {
          setEffectsEnabled(false);
          document.documentElement.setAttribute('data-effects', 'disabled');
        } else {
          setEffectsEnabled(true);
          document.documentElement.removeAttribute('data-effects');
        }
      } catch {
        // ignore
      }
      setIsPerfHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync html data-effects attribute on change after hydration
  useEffect(() => {
    if (!isPerfHydrated) return;
    if (effectsEnabled) {
      document.documentElement.removeAttribute('data-effects');
    } else {
      document.documentElement.setAttribute('data-effects', 'disabled');
    }
  }, [effectsEnabled, isPerfHydrated]);

  const handleToggleEffects = (checked?: boolean) => {
    const nextVal = typeof checked === 'boolean' ? checked : !effectsEnabled;
    if (nextVal === effectsEnabled) return;
    setEffectsEnabled(nextVal);

    try {
      localStorage.setItem('animora_effects_enabled', String(nextVal));
      localStorage.setItem('animora_paw_bubbles_enabled', String(nextVal));
      localStorage.setItem('animora_performance_mode', String(!nextVal));
    } catch {
      // ignore
    }

    if (nextVal) {
      document.documentElement.removeAttribute('data-effects');
      onShowToast?.(
        lang === 'vi'
          ? 'Đã bật hiệu ứng động (Hiển thị đầy đủ bóng bay & vệt chuột)'
          : 'Visual effects ON (Full animations & bubbles enabled)'
      );
    } else {
      document.documentElement.setAttribute('data-effects', 'disabled');
      onShowToast?.(
        lang === 'vi'
          ? 'Đã tắt hiệu ứng động (Tối ưu mượt mà & tiết kiệm)'
          : 'Visual effects OFF (Optimized for performance)'
      );
    }

    window.dispatchEvent(
      new CustomEvent('animora_effects_toggle', { detail: { enabled: nextVal } })
    );
    window.dispatchEvent(
      new CustomEvent('animora_bubble_toggle', { detail: { enabled: nextVal } })
    );
    window.dispatchEvent(
      new CustomEvent('animora_performance_mode_toggle', { detail: { enabled: !nextVal } })
    );
  };

  // Fit-text font size for wordmark
  const [wordmarkFontSize, setWordmarkFontSize] = useState<number | null>(null);

  // Scroll entrance observers - initialized to true so content is never blank
  const [partAInView, setPartAInView] = useState(true);
  const [headlineInView, setHeadlineInView] = useState(true);
  const [infoInView, setInfoInView] = useState(true);

  const partARef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  // Fit-text calculation for "Animora"
  useEffect(() => {
    const calculateFontSize = () => {
      const containerWidth = partARef.current?.clientWidth || window.innerWidth;
      if (!containerWidth) return;

      // Measure the natural width of "Animora" at 100px font-size using off-screen canvas
      let measuredWidth = 0;
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.font = '800 100px "Baloo 2", system-ui, sans-serif';
          measuredWidth = ctx.measureText('Animora').width;
        }
      } catch {
        // Fallback below
      }

      // DOM fallback measurement
      if (!measuredWidth || measuredWidth < 50) {
        const span = document.createElement('span');
        span.style.fontFamily = '"Baloo 2", system-ui, sans-serif';
        span.style.fontWeight = '800';
        span.style.fontSize = '100px';
        span.style.letterSpacing = '-0.02em';
        span.style.whiteSpace = 'nowrap';
        span.style.position = 'absolute';
        span.style.visibility = 'hidden';
        span.textContent = 'Animora';
        document.body.appendChild(span);
        measuredWidth = span.getBoundingClientRect().width;
        document.body.removeChild(span);
      }

      if (measuredWidth > 0 && containerWidth > 0) {
        // Calculate font size so text width exactly equals container/viewport width
        const targetSize = (containerWidth / measuredWidth) * 100;
        setWordmarkFontSize(targetSize);
      }
    };

    calculateFontSize();

    // Re-calculate after custom fonts have fully loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        calculateFontSize();
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      calculateFontSize();
    });

    if (partARef.current) {
      resizeObserver.observe(partARef.current);
    }

    window.addEventListener('resize', calculateFontSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateFontSize);
    };
  }, []);

  // Intersection observers for scroll entrances with generous rootMargin
  useEffect(() => {
    const createObserver = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      return new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setter(true);
          }
        },
        { threshold: 0, rootMargin: '100px' }
      );
    };

    const obsA = createObserver(setPartAInView);
    const obs1 = createObserver(setHeadlineInView);
    const obs3 = createObserver(setInfoInView);

    if (partARef.current) obsA.observe(partARef.current);
    if (headlineRef.current) obs1.observe(headlineRef.current);
    if (infoRef.current) obs3.observe(infoRef.current);

    // Fallback timer to ensure content is never hidden if observer fails
    const timer = setTimeout(() => {
      setPartAInView(true);
      setHeadlineInView(true);
      setInfoInView(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      obsA.disconnect();
      obs1.disconnect();
      obs3.disconnect();
    };
  }, []);

  return {
    copiedField,
    handleCopy,
    effectsEnabled,
    handleToggleEffects,
    wordmarkFontSize,
    partAInView,
    headlineInView,
    infoInView,
    partARef,
    headlineRef,
    infoRef,
  };
};
