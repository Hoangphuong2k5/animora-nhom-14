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
  PrescriptionLine,
} from "@/types/expert.type";
import { useExpert } from "@/components/expert/ExpertProvider";
import { useLivePrescriptionCatalog } from "@/hooks/expert/useLivePrescriptionCatalog";
import { PET_SPECIES_LABELS } from "@/constants/expert.constant";

type CatalogFilter =
  | "all"
  | "species_match"
  | "antibiotic"
  | "topical"
  | "parasite";

function matchCategory(
  med: MedicineItem,
  filter: CatalogFilter,
  pet?: ExpertPet
): boolean {
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
  const { profile } = useExpert();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>("all");
  const catalog = useLivePrescriptionCatalog(profile.id);

  const filteredMedicines = catalog.filter((m) => {
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
    { id: "all", label: `Tất cả (${catalog.length})` },
    {
      id: "species_match",
      label: selectedPet
        ? `Phù hợp cho ${PET_SPECIES_LABELS[selectedPet.species]}`
        : "Theo loài",
    },
    { id: "antibiotic", label: "Kháng sinh & Kháng viêm" },
    { id: "topical", label: "Nhỏ tai & Mắt" },
    { id: "parasite", label: "Ký sinh & Tiêu hóa" },
  ];

  return (
    <div className="p-5 rounded-3xl border border-[#EBCFC6]/80 dark:border-[#6E2E40] bg-white dark:bg-card/95 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EBCFC6]/60 dark:border-[#6E2E40]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-[#FFF4E8]">
              Kho Dược Phẩm Chung Animora
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-[#E5BFC4]/80">
              Thuốc đồng bộ trực tiếp từ Kho chung — bấm chọn để đưa sang Tờ đơn thuốc bên phải.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FBE3E3]/70 dark:bg-[#4D1B2A] text-[#6B1F2E] dark:text-[#FF7F6B] border border-[#EBCFC6]/70 dark:border-[#6E2E40] shrink-0">
          <Pill className="w-3 h-3" />
          Kho Dược
        </span>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 dark:text-[#E5BFC4]/60 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm tên thuốc, biệt dược, hoạt chất..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EBCFC6] dark:border-[#6E2E40] bg-[#FFF4E8]/50 dark:bg-[#2A0C14]/85 text-xs text-zinc-900 dark:text-[#FFF4E8] placeholder:text-zinc-400 dark:placeholder:text-[#E5BFC4]/50 outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
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
                ? "bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-[#2A0C14] shadow-xs"
                : "bg-[#FBE3E3]/60 dark:bg-[#4D1B2A] text-[#6B1F2E] dark:text-[#E5BFC4] hover:bg-[#FBE3E3] dark:hover:bg-[#5A2031]"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Medicine Shelf List */}
      <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
        {filteredMedicines.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-400 dark:text-[#E5BFC4]/60 border border-dashed border-[#EBCFC6] dark:border-[#6E2E40] rounded-2xl">
            Không tìm thấy dược phẩm phù hợp.
          </div>
        ) : (
          filteredMedicines.map((med) => {
            const isInPrescription = lines.some((l) => l.medicineId === med.id);
            const isOutOfStock = med.stock <= 0;
            const isSpeciesMismatch =
              selectedPet && !med.speciesHint.includes(selectedPet.species);

            return (
              <div
                key={med.id}
                className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                  isInPrescription
                    ? "border-[#6B1F2E] dark:border-[#FF7F6B] bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/10"
                    : "border-[#EBCFC6]/80 dark:border-[#6E2E40] bg-[#FFF4E8]/35 dark:bg-[#2A0C14]/55 hover:border-[#6B1F2E]/40 dark:hover:border-[#FF7F6B]/45"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-zinc-900 dark:text-[#FFF4E8] flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0" />
                      <span className="truncate">{med.name}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-[#E5BFC4]/75 mt-0.5">
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
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isOutOfStock
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {isOutOfStock
                        ? "Hết tồn kho chung"
                        : `Tồn kho chung: ${med.stock} ${med.unit}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FBE3E3]/70 dark:bg-[#4D1B2A] text-[#6B1F2E] dark:text-[#E5BFC4]">
                      Loài:{" "}
                      {med.speciesHint
                        .map((sp) => PET_SPECIES_LABELS[sp])
                        .join(", ")}
                    </span>
                    {isSpeciesMismatch && selectedPet && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Khác loài ({PET_SPECIES_LABELS[selectedPet.species]})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => onAddMedicine(med.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors shrink-0 ${
                      isOutOfStock
                        ? "bg-zinc-200 dark:bg-[#3A1420] text-zinc-400 dark:text-[#E5BFC4]/40 cursor-not-allowed"
                        : isInPrescription
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                        : "bg-[#6B1F2E] text-white hover:bg-[#521723] cursor-pointer"
                    }`}
                  >
                    {isOutOfStock ? (
                      <span>Hết hàng</span>
                    ) : isInPrescription ? (
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
