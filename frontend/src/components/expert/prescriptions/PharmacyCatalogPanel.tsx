"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  Package,
  Pill,
  Plus,
  Search,
} from "lucide-react";
import {
  ExpertPet,
  MedicineItem,
  PetSpeciesCode,
  PrescriptionLine,
} from "@/types/expert.type";
import { MEDICINE_CATALOG } from "@/data/medicineCatalog";

const SPECIES_LABELS: Record<PetSpeciesCode, string> = {
  dog: "Chó",
  cat: "Mèo",
  rabbit: "Thỏ",
  hamster: "Hamster",
};

type CatalogFilter = "all" | "species_match" | "antibiotic" | "topical" | "parasite";

function matchCategory(med: MedicineItem, filter: CatalogFilter, pet?: ExpertPet): boolean {
  if (filter === "all") return true;
  if (filter === "species_match") {
    return pet ? med.speciesHint.includes(pet.species) : true;
  }
  const text = `${med.name} ${med.activeIngredient} ${med.form}`.toLowerCase();
  if (filter === "antibiotic") {
    return (
      text.includes("amoxicillin") ||
      text.includes("cefalexin") ||
      text.includes("enrofloxacin") ||
      text.includes("meloxicam") ||
      text.includes("prednisolone") ||
      text.includes("apoquel")
    );
  }
  if (filter === "topical") {
    return text.includes("nhỏ tai") || text.includes("tra mắt");
  }
  if (filter === "parasite") {
    return (
      text.includes("ký sinh") ||
      text.includes("giun") ||
      text.includes("nexgard") ||
      text.includes("men vi sinh")
    );
  }
  return true;
}

interface PharmacyCatalogPanelProps {
  selectedPet?: ExpertPet;
  lines: PrescriptionLine[];
  onAddMedicine: (medicineId: string) => void;
}

export function PharmacyCatalogPanel({
  selectedPet,
  lines,
  onAddMedicine,
}: PharmacyCatalogPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>("all");

  const filteredMedicines = MEDICINE_CATALOG.filter((m) => {
    if (!matchCategory(m, activeFilter, selectedPet)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.name.toLowerCase().includes(q) ||
      m.activeIngredient.toLowerCase().includes(q) ||
      m.form.toLowerCase().includes(q)
    );
  });

  const filterButtons: { id: CatalogFilter; label: string }[] = [
    { id: "all", label: `Tất cả (${MEDICINE_CATALOG.length})` },
    {
      id: "species_match",
      label: selectedPet
        ? `Phù hợp cho ${SPECIES_LABELS[selectedPet.species]}`
        : "Theo loài",
    },
    { id: "antibiotic", label: "Kháng sinh & Kháng viêm" },
    { id: "topical", label: "Nhỏ tai & Mắt" },
    { id: "parasite", label: "Ký sinh & Tiêu hóa" },
  ];

  return (
    <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Kệ Dược Phẩm Kho Animora
            </h2>
            <p className="text-[11px] text-zinc-500">
              Bấm chọn dược phẩm để đưa trực tiếp sang Tờ đơn thuốc bên phải.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          <Pill className="w-3 h-3 text-[#6B1F2E] dark:text-[#FF7F6B]" />
          Kho Dược
        </span>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm tên thuốc, biệt dược, hoạt chất..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {filterButtons.map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => setActiveFilter(btn.id)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
              activeFilter === btn.id
                ? "bg-[#6B1F2E] text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Medicine Shelf List */}
      <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
        {filteredMedicines.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            Không tìm thấy dược phẩm phù hợp.
          </div>
        ) : (
          filteredMedicines.map((med) => {
            const isInPrescription = lines.some((l) => l.medicineId === med.id);
            const isSpeciesMismatch =
              selectedPet && !med.speciesHint.includes(selectedPet.species);

            return (
              <div
                key={med.id}
                className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                  isInPrescription
                    ? "border-[#6B1F2E] dark:border-[#FF7F6B] bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/10"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0" />
                      <span className="truncate">{med.name}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Hoạt chất: <strong>{med.activeIngredient}</strong> ({med.form})
                    </div>
                  </div>

                  <span className="font-extrabold text-xs text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0">
                    {med.price.toLocaleString("vi-VN")}đ/{med.unit}
                  </span>
                </div>

                {/* Bottom row: Stock + Species tags + Add button */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                      Tồn: {med.stock} {med.unit}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      Loài:{" "}
                      {med.speciesHint.map((sp) => SPECIES_LABELS[sp]).join(", ")}
                    </span>
                    {isSpeciesMismatch && selectedPet && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Khác loài ({SPECIES_LABELS[selectedPet.species]})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddMedicine(med.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors cursor-pointer shrink-0 ${
                      isInPrescription
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-[#6B1F2E] text-white hover:bg-[#521723]"
                    }`}
                  >
                    {isInPrescription ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Đã trong đơn</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 text-[#FF7F6B]" />
                        <span>Đưa vào đơn</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

