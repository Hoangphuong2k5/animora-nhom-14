"use client";

import React from "react";
import { ExpertPet } from "@/types/expert.type";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PetSelectorBarProps {
  pets: ExpertPet[];
  selectedPetId: string;
  onSelect: (id: string) => void;
}

export function PetSelectorBar({
  pets,
  selectedPetId,
  onSelect,
}: PetSelectorBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-xs font-bold text-zinc-400 shrink-0">Chọn bé thú cưng:</span>
      <Tabs
        value={selectedPetId}
        onValueChange={(val) => {
          if (val !== null && val !== undefined) onSelect(String(val));
        }}
      >
        <TabsList className="h-auto flex-wrap justify-start gap-1.5 p-1 rounded-2xl bg-zinc-100/80 dark:bg-card/80 border border-zinc-200/80 dark:border-border">
          {pets.map((pet) => (
            <TabsTrigger
              key={pet.id}
              value={pet.id}
              className="h-auto flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 text-zinc-700 dark:text-foreground/80 hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E] data-active:text-white dark:data-active:bg-[#6B1F2E] dark:data-active:text-white data-active:shadow-sm transition-all"
            >
              <img
                src={pet.photo}
                alt={pet.name}
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
              <span>{pet.name}</span>
              <span className="text-[10px] opacity-75">({pet.breed})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

