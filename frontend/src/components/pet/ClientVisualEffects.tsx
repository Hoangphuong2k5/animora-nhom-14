"use client";

import React, { useEffect, useState } from "react";
import { PawBubbleLayer } from "./PawBubbleLayer";
import { CursorPawTrail } from "./CursorPawTrail";

export function ClientVisualEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <PawBubbleLayer darkMode={false} />
      <CursorPawTrail />
    </>
  );
}

