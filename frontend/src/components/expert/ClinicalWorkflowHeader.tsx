"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Pill,
  Scale,
  Search,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import {
  ExpertAppointment,
  ExpertPet,
  ExpertPetOwner,
  PetSpeciesCode,
} from "@/types/expert.type";
import { ROUTES } from "@/constants/config.constant";

const SPECIES_LABELS: Record<PetSpeciesCode, string> = {
  dog: "Chó",
  cat: "Mèo",
  rabbit: "Thỏ",
  hamster: "Hamster",
};

interface ClinicalWorkflowHeaderProps {
  activeStage: "exam" | "prescription";
  pets: ExpertPet[];
  owners: ExpertPetOwner[];
  appointments: ExpertAppointment[];
  selectedPetId: string;
  onSelectPet: (id: string) => void;
  selectedApptId: string;
  onSelectAppt: (id: string) => void;
}

export function ClinicalWorkflowHeader({
  activeStage,
  pets,
  owners,
  appointments,
  selectedPetId,
  onSelectPet,
  selectedApptId,
  onSelectAppt,
}: ClinicalWorkflowHeaderProps) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const selectedOwner = selectedPet
    ? owners.find((o) => o.id === selectedPet.ownerId)
    : undefined;

  const petAppointments = appointments.filter(
    (a) => !selectedPetId || a.petId === selectedPetId
  );

  const filteredPets = pets.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const owner = owners.find((o) => o.id === p.ownerId);
    return (
      p.name.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
      (owner?.fullName || "").toLowerCase().includes(q) ||
      (owner?.phone || "").toLowerCase().includes(q)
    );
  });

  // Build query string to preserve context when switching between Exam and Prescription
  const contextQuery = new URLSearchParams();
  if (selectedPetId) contextQuery.set("petId", selectedPetId);
  if (selectedApptId) contextQuery.set("appointmentId", selectedApptId);
  const queryString = contextQuery.toString();

  const examHref = queryString
    ? `${ROUTES.EXPERT_HEALTH_RECORDS_NEW}?${queryString}`
    : ROUTES.EXPERT_HEALTH_RECORDS_NEW;
  const rxHref = queryString
    ? `${ROUTES.EXPERT_PRESCRIPTIONS_NEW}?${queryString}`
    : ROUTES.EXPERT_PRESCRIPTIONS_NEW;

  const isExam = activeStage === "exam";

  return (
    <div className="space-y-3">
      {/* 1. 2-Stage Clinical Workflow Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 rounded-2xl bg-white/75 dark:bg-[#4D1B2A]/35 border border-[#EBCFC6]/80 dark:border-[#6E2E40]">
        {/* Stage 1: Clinical Exam (SOAP) - Soft Blush / Warm Coral Identity */}
        <Link
          href={examHref}
          className={`flex items-center justify-between p-3 rounded-xl transition-all ${
            isExam
              ? "bg-gradient-to-r from-[#FBE3E3] to-[#FDE8E4] dark:from-[#5A2031] dark:to-[#4D1B2A] text-[#6B1F2E] dark:text-[#FFF4E8] border border-[#FF7F6B]/60 dark:border-[#FF7F6B]/50 shadow-xs"
              : "bg-white/75 dark:bg-[#2A0C14]/70 text-zinc-600 dark:text-[#E5BFC4]/80 border border-transparent hover:bg-[#FFF4E8]/70 hover:border-[#EBCFC6] dark:hover:bg-[#4D1B2A]/50 dark:hover:border-[#6E2E40]"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs ${
                isExam
                  ? "bg-[#6B1F2E] text-[#FFF4E8] dark:bg-[#FF7F6B]/20 dark:text-[#FF7F6B]"
                  : "bg-[#FBE3E3]/85 dark:bg-[#FF7F6B]/15 text-[#6B1F2E] dark:text-[#FF7F6B]"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    isExam
                      ? "text-[#7A4A55] dark:text-[#F4B6C2]"
                      : "text-[#7A4A55] dark:text-[#FF7F6B]"
                  }`}
                >
                  Chặng 1 • Phiếu Khám Y Khoa
                </span>
                {isExam && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-[#2A0C14]">
                    ĐANG MỞ
                  </span>
                )}
              </div>
              <div className="font-heading font-extrabold text-xs sm:text-sm truncate">
                Khám Lâm Sàng &amp; Ghi Bệnh Án (SOAP)
              </div>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 shrink-0 ${
              isExam ? "text-[#6B1F2E] dark:text-[#FF7F6B]" : "text-zinc-400"
            }`}
          />
        </Link>

        {/* Stage 2: Electronic Prescription - Formal Wine/Coral Identity */}
        <Link
          href={rxHref}
          className={`flex items-center justify-between p-3 rounded-xl transition-all ${
            !isExam
              ? "bg-[#6B1F2E] text-white shadow-sm"
              : "bg-white/75 dark:bg-[#2A0C14]/70 text-zinc-600 dark:text-[#E5BFC4]/80 border border-transparent hover:bg-white hover:border-[#EBCFC6] dark:hover:bg-[#4D1B2A]/50 dark:hover:border-[#6E2E40]"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                !isExam
                  ? "bg-white/15 text-[#FF7F6B]"
                  : "bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/15 text-[#6B1F2E] dark:text-[#FF7F6B]"
              }`}
            >
              <Pill className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    !isExam
                      ? "text-[#FF7F6B]"
                      : "text-[#6B1F2E] dark:text-[#FF7F6B]"
                  }`}
                >
                  Chặng 2 • Quầy Dược Nội Bộ
                </span>
                {!isExam && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-white/20 text-white">
                    ĐANG MỞ
                  </span>
                )}
              </div>
              <div className="font-heading font-extrabold text-xs sm:text-sm truncate">
                Kê Đơn Thuốc Điện Tử
              </div>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 shrink-0 ${
              !isExam ? "text-[#FF7F6B]" : "text-zinc-400"
            }`}
          />
        </Link>
      </div>

      {/* 2. Compact 1-Row Patient Context Strip */}
      <div
        className={`rounded-2xl border transition-all ${
          isExam
            ? "border-[#EBCFC6] dark:border-[#6E2E40] bg-[#FFF4E8]/80 dark:bg-[#4D1B2A]/40"
            : "border-[#6B1F2E]/25 dark:border-[#FF7F6B]/30 bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/5"
        }`}
      >
        <div className="p-3 sm:px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left: Selected Pet Bio + Allergy Pill */}
          {selectedPet ? (
            <div className="flex items-center gap-3 flex-wrap min-w-0">
              <img
                src={selectedPet.photo}
                alt={selectedPet.name}
                className="w-11 h-11 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    Bệnh nhân đang chọn:
                  </span>
                  <span className="font-heading font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    {selectedPet.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                    {SPECIES_LABELS[selectedPet.species]} • {selectedPet.breed}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                    <Scale className="w-3 h-3" />
                    {selectedPet.weightKg} kg
                  </span>

                  {/* Prominent Allergy Badge right on the header bar */}
                  {selectedPet.allergies ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs">
                      <AlertTriangle className="w-3 h-3" />
                      Dị ứng: {selectedPet.allergies}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      Không tiền sử dị ứng
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>
                    Chủ nuôi:{" "}
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {selectedOwner?.fullName}
                    </strong>{" "}
                    ({selectedOwner?.phone})
                  </span>
                  {selectedPet.ownerNote && (
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      • Lưu ý: &ldquo;{selectedPet.ownerNote}&rdquo;
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs font-bold text-rose-600">
              Chưa chọn thú cưng. Vui lòng bấm &ldquo;Đổi bệnh nhân&rdquo; để chọn!
            </div>
          )}

          {/* Right: Compact Appointment Link + Toggle Pet Switcher Button */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#2A0C14]/85 border border-[#EBCFC6]/90 dark:border-[#6E2E40] rounded-xl px-2.5 py-1.5 text-xs">
              <CalendarCheck className="w-3.5 h-3.5 text-[#7A4A55] dark:text-[#FF7F6B] shrink-0" />
              <select
                value={selectedApptId}
                onChange={(e) => onSelectAppt(e.target.value)}
                className="bg-white dark:bg-[#2A0C14] font-semibold text-zinc-800 dark:text-[#FFF4E8] outline-none cursor-pointer text-[11px] max-w-[210px] truncate"
                title="Ca khám liên kết"
              >
                <option value="" className="bg-white dark:bg-[#2A0C14] text-zinc-900 dark:text-[#FFF4E8]">
                  Ca khám: Không gắn mã lịch
                </option>
                {petAppointments.map((a) => (
                  <option key={a.id} value={a.id} className="bg-white dark:bg-[#2A0C14] text-zinc-900 dark:text-[#FFF4E8]">
                    {a.code} ({a.startAt.replace("T", " ")})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsSwitcherOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                isSwitcherOpen
                  ? "bg-[#6B1F2E] text-white border-[#6B1F2E] dark:bg-[#FF7F6B] dark:text-[#2A0C14] dark:border-[#FF7F6B]"
                  : "bg-white dark:bg-[#2A0C14]/85 border-[#EBCFC6]/90 dark:border-[#6E2E40] text-zinc-700 dark:text-[#FFF4E8] hover:border-[#6B1F2E]/50 dark:hover:border-[#FF7F6B]/60"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isSwitcherOpen ? "Đóng danh sách" : "Đổi bệnh nhân"}</span>
              {isSwitcherOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Pet Switcher Drawer (Only visible when clicked!) */}
        {isSwitcherOpen && (
          <div className="p-3.5 border-t border-[#EBCFC6]/80 dark:border-[#6E2E40] bg-white/95 dark:bg-[#2A0C14]/95 rounded-b-2xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-600 dark:text-[#E5BFC4]">
                Chọn thú cưng khác ({filteredPets.length} hồ sơ):
              </span>
              <div className="relative w-60">
                <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-[#E5BFC4]/70 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên bé, giống, SĐT chủ..."
                  className="w-full pl-8 pr-2.5 py-1 rounded-lg border border-[#EBCFC6]/90 dark:border-[#6E2E40] bg-[#FAF6F0]/60 dark:bg-[#4D1B2A]/60 text-xs text-zinc-900 dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredPets.map((p) => {
                const owner = owners.find((o) => o.id === p.ownerId);
                const isSelected = p.id === selectedPetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectPet(p.id);
                      setIsSwitcherOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "border-[#6B1F2E] dark:border-[#FF7F6B] bg-[#FBE3E3]/55 dark:bg-[#5A2031]/65"
                        : "border-[#EBCFC6]/70 dark:border-[#6E2E40] hover:border-[#6B1F2E]/40 dark:hover:border-[#FF7F6B]/50 bg-[#FFF4E8]/40 dark:bg-[#4D1B2A]/45"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.photo}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {p.name} ({SPECIES_LABELS[p.species]} • {p.weightKg}kg)
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          Chủ: {owner?.fullName}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

