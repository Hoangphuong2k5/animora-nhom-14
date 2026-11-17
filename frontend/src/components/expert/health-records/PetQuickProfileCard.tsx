"use client";

import React from "react";
import { ExpertPet } from "@/types/expert.type";

interface PetQuickProfileCardProps {
  pet: ExpertPet;
  latestWeightKg?: number;
}

export function PetQuickProfileCard({ pet, latestWeightKg }: PetQuickProfileCardProps) {
  const displayWeight = latestWeightKg ?? pet.weightKg;
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-3 text-xs">
      <div className="flex items-center gap-3">
        <img
          src={pet.photo}
          alt={pet.name}
          className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-border"
        />
        <div>
          <h4 className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
            {pet.name}
          </h4>
          <div className="text-zinc-500">
            {pet.breed} • {displayWeight} kg
          </div>
          <div className="text-[11px] text-zinc-400">Sinh: {pet.birthDate}</div>
        </div>
      </div>

      {pet.allergies && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold text-[11px]">
          Tiền sử dị ứng: {pet.allergies}
        </div>
      )}
    </div>
  );
}

