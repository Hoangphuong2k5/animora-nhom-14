"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  PawPrint,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import {
  ALLOWED_V14_SPECIES,
  type AllowedV14Species,
  type CustomerViolationAssessment,
  type WalkInCustomerRecord,
  type WalkInPetRecord,
} from "@/data/receptionistOpsData";

interface CounterPosCustomerPetSectionProps {
  customers: WalkInCustomerRecord[];
  selectedCustomer: WalkInCustomerRecord | null;
  customerPets: WalkInPetRecord[];
  selectedPetId: string;
  violationAssessment: CustomerViolationAssessment | null;
  phoneSearch: string;
  newCustomerName: string;
  showQuickPetForm: boolean;
  quickPetName: string;
  quickPetSpecies: AllowedV14Species;
  quickPetWeight: string;
  quickPetAllergies: string;
  onChangePhoneSearch: (value: string) => void;
  onChangeNewCustomerName: (value: string) => void;
  onLookupPhone: () => void;
  onCreateWalkInCustomer: () => void;
  onSelectCustomer: (customer: WalkInCustomerRecord) => void;
  onSelectPetId: (petId: string) => void;
  onToggleQuickPetForm: () => void;
  onChangeQuickPetName: (value: string) => void;
  onChangeQuickPetSpecies: (value: AllowedV14Species) => void;
  onChangeQuickPetWeight: (value: string) => void;
  onChangeQuickPetAllergies: (value: string) => void;
  onCreateQuickPet: () => void;
}

export function CounterPosCustomerPetSection({
  customers,
  selectedCustomer,
  customerPets,
  selectedPetId,
  violationAssessment,
  phoneSearch,
  newCustomerName,
  showQuickPetForm,
  quickPetName,
  quickPetSpecies,
  quickPetWeight,
  quickPetAllergies,
  onChangePhoneSearch,
  onChangeNewCustomerName,
  onLookupPhone,
  onCreateWalkInCustomer,
  onSelectCustomer,
  onSelectPetId,
  onToggleQuickPetForm,
  onChangeQuickPetName,
  onChangeQuickPetSpecies,
  onChangeQuickPetWeight,
  onChangeQuickPetAllergies,
  onCreateQuickPet,
}: CounterPosCustomerPetSectionProps) {
  return (
    <div className="space-y-4">
      {/* KHỐI 1: KHÁCH HÀNG TẠI QUẦY */}
      <section className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-zinc-950 text-xs font-extrabold inline-flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-foreground">
              Khách Hàng Tại Quầy
            </h2>
          </div>
          {selectedCustomer && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <UserCheck className="w-3.5 h-3.5" />
              {selectedCustomer.fullName} • {selectedCustomer.phone}
            </span>
          )}
        </div>

        {/* Tra cứu SĐT + Tạo nhanh vãng lai */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          <div className="md:col-span-6 flex gap-1.5">
            <div className="relative flex-1">
              <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phoneSearch}
                onChange={(e) => onChangePhoneSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onLookupPhone();
                  }
                }}
                placeholder="Gõ SĐT khách (VD: 0915 888 999)..."
                className="w-full h-9 pl-8 pr-3 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#6B1F2E]/30 dark:focus:ring-[#FF7F6B]/40"
              />
            </div>
            <button
              type="button"
              onClick={onLookupPhone}
              className="px-3 h-9 rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0 hover:opacity-90"
            >
              <Search className="w-3.5 h-3.5" />
              Tìm
            </button>
          </div>

          <div className="md:col-span-6 flex gap-1.5">
            <input
              type="text"
              value={newCustomerName}
              onChange={(e) => onChangeNewCustomerName(e.target.value)}
              placeholder="Tên khách mới (nếu chưa có SĐT)..."
              className="flex-1 h-9 px-3 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#6B1F2E]/30 dark:focus:ring-[#FF7F6B]/40"
            />
            <button
              type="button"
              onClick={onCreateWalkInCustomer}
              className="px-3 h-9 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Tạo vãng lai
            </button>
          </div>
        </div>

        {/* Danh sách chọn nhanh khách quen / gần đây */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-zinc-400 mr-1">
            Chọn nhanh:
          </span>
          {customers.slice(0, 6).map((c) => {
            const active = selectedCustomer?.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCustomer(c)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  active
                    ? "bg-[#6B1F2E] text-white border-[#6B1F2E] dark:bg-[#FF7F6B] dark:text-zinc-950 dark:border-[#FF7F6B]"
                    : "bg-zinc-50 dark:bg-muted text-zinc-700 dark:text-foreground border-zinc-200 dark:border-border hover:border-[#6B1F2E]/40"
                }`}
              >
                <span>{c.fullName}</span>
                <span className={active ? "opacity-80" : "text-zinc-400"}>
                  {c.phone}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cảnh báo vi phạm / khóa trả sau */}
        {violationAssessment &&
          (violationAssessment.isPostpaidLocked ||
            violationAssessment.violationCount > 0) && (
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                violationAssessment.isPostpaidLocked
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                  : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300"
              }`}
            >
              {violationAssessment.isPostpaidLocked ? (
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>
                {violationAssessment.lockReasonMessage ||
                  violationAssessment.warningMessage}
              </span>
            </div>
          )}
      </section>

      {/* KHỐI 2: THÚ CƯNG CỦA KHÁCH */}
      <section className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-zinc-950 text-xs font-extrabold inline-flex items-center justify-center">
              2
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-foreground">
              Chọn Thú Cưng (4 loài: Chó, Mèo, Chuột, Thỏ)
            </h2>
          </div>

          <button
            type="button"
            onClick={onToggleQuickPetForm}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF7F6B]/15 dark:text-[#FF7F6B] hover:bg-[#6B1F2E]/15 inline-flex items-center gap-1 cursor-pointer"
          >
            {showQuickPetForm ? (
              <>
                <X className="w-3.5 h-3.5" /> Đóng form
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Thêm bé nhanh
              </>
            )}
          </button>
        </div>

        {/* Form tạo nhanh thú cưng vãng lai */}
        {showQuickPetForm && (
          <div className="p-3.5 rounded-xl bg-[#FBF6F7] dark:bg-muted/50 border border-[#6B1F2E]/20 dark:border-border space-y-2.5 text-xs">
            <div className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
              Tạo hồ sơ thú cưng nhanh cho{" "}
              {selectedCustomer?.fullName || "khách hàng"} (Cân nặng &amp; dị
              ứng ghi nhận &quot;Do khách khai&quot;):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={quickPetName}
                onChange={(e) => onChangeQuickPetName(e.target.value)}
                placeholder="Tên thú cưng *"
                className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-border bg-white dark:bg-card"
              />
              <select
                value={quickPetSpecies}
                onChange={(e) =>
                  onChangeQuickPetSpecies(e.target.value as AllowedV14Species)
                }
                className="h-9 px-2.5 rounded-lg border border-zinc-200 dark:border-border bg-white dark:bg-card font-semibold"
              >
                {ALLOWED_V14_SPECIES.map((sp) => (
                  <option key={sp} value={sp}>
                    Loài: {sp}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={quickPetWeight}
                onChange={(e) => onChangeQuickPetWeight(e.target.value)}
                placeholder="Cân nặng (kg)"
                className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-border bg-white dark:bg-card"
              />
              <input
                type="text"
                value={quickPetAllergies}
                onChange={(e) => onChangeQuickPetAllergies(e.target.value)}
                placeholder="Dị ứng (nếu có)..."
                className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-border bg-white dark:bg-card"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onCreateQuickPet}
                className="px-3.5 py-1.5 rounded-lg bg-[#6B1F2E] text-white font-bold inline-flex items-center gap-1 cursor-pointer hover:bg-[#8C2B3E]"
              >
                <Plus className="w-3.5 h-3.5" /> Lưu &amp; Chọn bé này
              </button>
            </div>
          </div>
        )}

        {/* Lưới thẻ thú cưng của khách */}
        {customerPets.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-border text-center text-xs text-zinc-500">
            Khách hàng này chưa có hồ sơ thú cưng hoạt động. Hãy bấm{" "}
            <strong className="text-[#6B1F2E] dark:text-[#FF7F6B]">
              + Thêm bé nhanh
            </strong>{" "}
            ở góc trên để tạo ngay.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {customerPets.map((pet) => {
              const isSelected = pet.id === selectedPetId;
              return (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => onSelectPetId(pet.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    isSelected
                      ? "border-[#6B1F2E] bg-[#6B1F2E]/5 dark:border-[#FF7F6B] dark:bg-[#FF7F6B]/10 ring-1 ring-[#6B1F2E]/30 dark:ring-[#FF7F6B]/30"
                      : "border-zinc-200/80 dark:border-border bg-zinc-50/60 dark:bg-muted/30 hover:border-[#6B1F2E]/40"
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <PawPrint className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0" />
                      <span className="font-extrabold text-xs text-zinc-900 dark:text-foreground truncate">
                        {pet.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-300">
                      {pet.species} • <strong>{pet.weightKg}kg</strong>
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {pet.lockedByVet ? "BS đã khóa cân" : "Do khách khai"}
                      {pet.allergies ? ` • ${pet.allergies}` : ""}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

