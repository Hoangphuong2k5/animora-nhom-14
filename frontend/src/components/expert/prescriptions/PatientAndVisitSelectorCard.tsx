"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Dog,
  Search,
  Sparkles,
} from "lucide-react";
import {
  ExpertAppointment,
  ExpertPet,
  ExpertPetOwner,
  MedicalRecord,
  PetSpeciesCode,
} from "@/types/expert.type";

const SPECIES_LABELS: Record<PetSpeciesCode, string> = {
  dog: "Chó",
  cat: "Mèo",
  rabbit: "Thỏ",
  hamster: "Hamster",
};

interface PatientAndVisitSelectorCardProps {
  pets: ExpertPet[];
  owners: ExpertPetOwner[];
  appointments: ExpertAppointment[];
  selectedPetId: string;
  onSelectPet: (id: string) => void;
  selectedApptId: string;
  onSelectAppt: (id: string) => void;
  latestMedicalRecord?: MedicalRecord;
  onApplyLatestRecord?: () => void;
}

export function PatientAndVisitSelectorCard({
  pets,
  owners,
  appointments,
  selectedPetId,
  onSelectPet,
  selectedApptId,
  onSelectAppt,
  latestMedicalRecord,
  onApplyLatestRecord,
}: PatientAndVisitSelectorCardProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

  const petAppointments = appointments.filter(
    (a) => !selectedPetId || a.petId === selectedPetId
  );

  return (
    <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-[#6B1F2E] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
            1
          </span>
          <div>
            <h2 className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Bệnh Nhân Thú Cưng & Liên Kết Ca Khám
            </h2>
            <p className="text-[11px] text-zinc-500">
              Chọn thú cưng cần kê đơn và gắn với lịch hẹn khám (nếu có) để đồng bộ hồ sơ y khoa.
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên bé, giống, chủ nuôi..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
          />
        </div>
      </div>

      {/* Pet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
        {filteredPets.length === 0 ? (
          <div className="col-span-full py-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            Không tìm thấy thú cưng phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filteredPets.map((p) => {
            const owner = owners.find((o) => o.id === p.ownerId);
            const isSelected = selectedPetId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPet(p.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? "border-[#6B1F2E] dark:border-[#FF7F6B] bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/10 shadow-xs"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-950/40"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="w-11 h-11 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {p.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {SPECIES_LABELS[p.species]} • {p.weightKg}kg
                      </span>
                      {p.allergies && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                          title={`Dị ứng: ${p.allergies}`}
                        >
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Dị ứng
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {p.breed} • Chủ: {owner?.fullName}
                    </div>
                  </div>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0" />
                ) : (
                  <Dog className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Linked Appointment + Quick Fill from Latest Medical Record */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            <span>Liên kết ca khám / lịch hẹn (không bắt buộc)</span>
          </label>
          <select
            value={selectedApptId}
            onChange={(e) => onSelectAppt(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-[#6B1F2E] cursor-pointer"
          >
            <option value="">-- Kê đơn độc lập (Không gắn mã lịch hẹn) --</option>
            {petAppointments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} • {a.startAt.replace("T", " ")} ({a.status === "completed" ? "Đã hoàn tất" : a.status === "in_progress" ? "Đang khám" : "Sắp tới"})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Fill from Latest Medical Record */}
        <div className="flex flex-col justify-end">
          {latestMedicalRecord ? (
            <div className="p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Bệnh án gần nhất ({latestMedicalRecord.date})
                </div>
                <div className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 truncate">
                  {latestMedicalRecord.diagnosis}
                </div>
              </div>
              {onApplyLatestRecord && (
                <button
                  type="button"
                  onClick={onApplyLatestRecord}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Nạp chẩn đoán</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-center h-[52px]">
              Chưa có bệnh án lưu sẵn cho thú cưng này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

