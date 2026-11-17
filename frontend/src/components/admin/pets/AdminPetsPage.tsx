"use client";

import React from "react";
import { Dog } from "lucide-react";
import { useAdminPets } from "@/hooks/admin/useAdminPets";
import { PetsFilterBar } from "./PetsFilterBar";
import { PetsTable } from "./PetsTable";
import { PetDetailSheet } from "./PetDetailSheet";

export function AdminPetsPage() {
  const admin = useAdminPets();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
          <Dog className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
          Quản Lý Thú Cưng &amp; Sổ Sức Khỏe
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Hồ sơ vi-chip, sổ tiêm chủng điện tử, lịch tẩy giun và đơn thuốc lâm sàng
        </p>
      </div>

      {/* 2. Filter & Search */}
      <PetsFilterBar
        pets={admin.pets}
        searchQuery={admin.searchQuery}
        onChangeSearch={admin.setSearchQuery}
        filterSpecies={admin.filterSpecies}
        onChangeSpecies={admin.setFilterSpecies}
      />

      {/* 3. Pets Table */}
      <PetsTable
        pets={admin.filteredPets}
        onSelectPet={admin.setSelectedPet}
      />

      {/* 4. Slide-over Sổ Sức Khỏe Drawer */}
      <PetDetailSheet
        selectedPet={admin.selectedPet}
        onClose={() => admin.setSelectedPet(null)}
      />
    </div>
  );
}

