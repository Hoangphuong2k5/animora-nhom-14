"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileHeart,
  Scale,
  Stethoscope,
  User,
} from "lucide-react";
import {
  ExpertPet,
  ExpertPetOwner,
  MedicalRecord,
  PetSpeciesCode,
} from "@/types/expert.type";
import { ROUTES } from "@/constants/config.constant";

const SPECIES_LABELS: Record<PetSpeciesCode, string> = {
  dog: "Chó",
  cat: "Mèo",
  rabbit: "Thỏ",
  hamster: "Hamster",
};

interface PatientClinicalSummarySidebarProps {
  pet?: ExpertPet;
  owner?: ExpertPetOwner | null;
  latestMedicalRecord?: MedicalRecord;
}

export function PatientClinicalSummarySidebar({
  pet,
  owner,
  latestMedicalRecord,
}: PatientClinicalSummarySidebarProps) {
  if (!pet) {
    return (
      <div className="p-5 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 text-center text-xs text-zinc-400">
        Vui lòng chọn một thú cưng ở cột bên trái để xem hồ sơ lâm sàng và cảnh báo dị ứng.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#6B1F2E] dark:text-[#FF7F6B]">
          <FileHeart className="w-4 h-4" />
          <span>Hồ Sơ Sinh Học & Dị Ứng</span>
        </div>
        <Link
          href={`${ROUTES.EXPERT_HEALTH_RECORDS}?petId=${pet.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-[#6B1F2E] dark:hover:text-[#FF7F6B] transition-colors"
        >
          <span>Mở sổ sức khỏe</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Pet Bio Profile */}
      <div className="flex items-center gap-3.5">
        <img
          src={pet.photo}
          alt={pet.name}
          className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-heading font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              {pet.name}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]">
              {SPECIES_LABELS[pet.species]} • {pet.gender === "male" ? "Đực" : "Cái"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 truncate mt-0.5">{pet.breed}</p>
          <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] font-extrabold">
            <Scale className="w-3 h-3 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            <span>Cân nặng chuẩn: {pet.weightKg} kg</span>
          </div>
        </div>
      </div>

      {/* Allergy Alert Box (Always visible while prescribing) */}
      {pet.allergies ? (
        <div className="p-3.5 rounded-2xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>CẢNH BÁO TIỀN SỬ DỊ ỨNG</span>
          </div>
          <p className="text-xs font-bold text-rose-900 dark:text-rose-200 leading-relaxed">
            {pet.allergies}
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Chưa ghi nhận tiền sử dị ứng thuốc/thức ăn.</span>
        </div>
      )}

      {/* Owner Info & Note */}
      {owner && (
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800 space-y-1 text-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="inline-flex items-center gap-1 font-semibold">
              <User className="w-3.5 h-3.5" />
              Chủ nuôi:
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {owner.fullName} ({owner.phone})
            </span>
          </div>
          {pet.ownerNote && (
            <div className="pt-1.5 mt-1.5 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
              <strong>Lưu ý từ chủ nuôi:</strong> {pet.ownerNote}
            </div>
          )}
        </div>
      )}

      {/* Latest Clinical Exam Summary */}
      {latestMedicalRecord && (
        <div className="p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <Stethoscope className="w-3 h-3 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Bệnh án gần nhất ({latestMedicalRecord.date})
            </span>
            <span className="text-[10px] font-bold text-zinc-500">
              {latestMedicalRecord.weightKg}kg • {latestMedicalRecord.temperatureC}°C
            </span>
          </div>
          <div className="font-bold text-zinc-900 dark:text-zinc-100">
            {latestMedicalRecord.diagnosis}
          </div>
          <div className="text-[11px] text-zinc-500 line-clamp-2">
            Triệu chứng: {latestMedicalRecord.symptoms}
          </div>
        </div>
      )}
    </div>
  );
}

