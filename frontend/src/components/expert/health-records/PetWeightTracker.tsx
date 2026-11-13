"use client";

import React from "react";
import { Scale } from "lucide-react";
import { LineChart, LinePoint } from "@/components/expert/Charts";

interface PetWeightTrackerProps {
  currentWeight: number;
  points: LinePoint[];
}

export function PetWeightTracker({
  currentWeight,
  points,
}: PetWeightTrackerProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Scale className="w-4 h-4 text-[#FF7F6B]" />
        <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
          Biểu Đồ Cân Nặng (kg)
        </h3>
      </div>
      <p className="text-[11px] text-zinc-400">
        Hiện tại:{" "}
        <strong className="text-zinc-800 dark:text-foreground/90">
          {currentWeight} kg
        </strong>
      </p>
      <LineChart points={points} unit="kg" height={160} strokeColor="#6B1F2E" />
    </div>
  );
}

