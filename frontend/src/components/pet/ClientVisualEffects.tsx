"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { PawBubbleLayer } from "./PawBubbleLayer";
import { CursorPawTrail } from "./CursorPawTrail";

export function ClientVisualEffects() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { darkMode } = useTheme();

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsMounted(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Các trang nội bộ admin, quản lý, nhân viên, bác sĩ hoàn toàn không chạy hiệu ứng
  const isInternalPortal =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/manager") ||
    pathname?.startsWith("/expert") ||
    pathname?.startsWith("/supplier") ||
    pathname?.startsWith("/rescue") ||
    pathname?.startsWith("/staff") ||
    pathname?.startsWith("/doctor");

  if (!isMounted || isInternalPortal) {
    return null;
  }

  return (
    <>
      <PawBubbleLayer darkMode={darkMode} />
      <CursorPawTrail />
    </>
  );
}
