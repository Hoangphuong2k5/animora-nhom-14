"use client";

import React, { useState } from "react";
import { CheckCircle2, Lock, PawPrint, Plus } from "lucide-react";
import type {
  ExpertPet,
  ExpertPetOwner,
} from "@/types/expert.type";
import { PET_SPECIES_LABELS as SPECIES_LABEL_MAP } from "@/constants/expert.constant";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ClientPetFormModalProps {
  isOpen: boolean;
  editingPet: ExpertPet;
  owners: ExpertPetOwner[];
  onClose: () => void;
  onConfirmCustomerNote?: (
    petId: string,
    noteId: string,
    targetField: "allergies" | "behaviors"
  ) => void;
  onSave: (
    data: Pick<
      ExpertPet,
      "weightKg" | "allergies" | "behaviors" | "isNeutered" | "medicalLocked"
    >
  ) => void;
}

export function ClientPetFormModal({
  isOpen,
  editingPet,
  owners,
  onClose,
  onConfirmCustomerNote,
  onSave,
}: ClientPetFormModalProps) {
  const [weightKg, setWeightKg] = useState<number>(editingPet.weightKg ?? 4.5);
  const [isNeutered, setIsNeutered] = useState<boolean>(
    Boolean(editingPet.isNeutered)
  );
  const [allergies, setAllergies] = useState(editingPet.allergies ?? "");
  const [behaviors, setBehaviors] = useState(
    editingPet.behaviors ?? editingPet.ownerNote ?? ""
  );

  const owner = owners.find((o) => o.id === editingPet.ownerId);

  const handleMergeNoteIntoDraft = (
    noteId: string,
    noteContent: string,
    targetField: "allergies" | "behaviors"
  ) => {
    const clean = noteContent.trim();
    if (targetField === "allergies") {
      setAllergies((prev) => {
        const cur = prev.trim();
        if (!cur) return clean;
        if (cur.toLowerCase().includes(clean.toLowerCase())) return cur;
        return `${cur}; ${clean}`;
      });
    } else {
      setBehaviors((prev) => {
        const cur = prev.trim();
        if (!cur) return clean;
        if (cur.toLowerCase().includes(clean.toLowerCase())) return cur;
        return `${cur}; ${clean}`;
      });
    }
    onConfirmCustomerNote?.(editingPet.id, noteId, targetField);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      weightKg: Math.max(0.1, Number(weightKg) || editingPet.weightKg || 1),
      isNeutered,
      allergies: allergies.trim() || undefined,
      behaviors: behaviors.trim() || undefined,
      medicalLocked: true,
    });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground p-6 gap-4 shadow-2xl"
      >
        <DialogHeader className="pb-3 pr-8 border-b border-zinc-100 dark:border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] flex items-center justify-center shrink-0">
              <PawPrint className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
                Cập Nhật Dữ Liệu Y Tế &amp; Khóa Hồ Sơ: {editingPet.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Bác sĩ cập nhật Cân nặng thực tế, Dị ứng, Hành vi, Triệt sản và khóa với khách hàng (ghi Audit Log).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Thông tin định danh gốc của thú cưng (Chỉ đọc cho Bác sĩ theo v1.4 Mục 2 & 3) */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-card border border-zinc-200 dark:border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-zinc-400">
                Thông tin định danh gốc (Khách hàng / Lễ tân tạo — Chỉ đọc)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Lock className="w-2.5 h-2.5" />
                <span>{editingPet.medicalLocked ? "Đã khóa y tế với KH" : "Sẽ khóa sau khi lưu"}</span>
              </span>
            </div>
            <div className="font-bold text-zinc-900 dark:text-foreground">
              {editingPet.name} • {SPECIES_LABEL_MAP[editingPet.species]} ({editingPet.breed}) •{" "}
              {editingPet.gender === "male" ? "Đực" : "Cái"}
            </div>
            <div className="text-[11px] text-zinc-500">
              Chủ nuôi: <strong>{owner?.fullName || "Khách hàng"}</strong>
              {owner?.phone ? ` (${owner.phone})` : ""} • Sinh: {editingPet.birthDate}
            </div>
          </div>

          {/* Hàng 1: Cân nặng thực tế & Tình trạng triệt sản */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Cân nặng thực tế BS cân (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="120"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground font-extrabold"
              />
              <p className="text-[10px] text-zinc-400">
                Cân cũ trên hồ sơ: <strong>{editingPet.weightKg} kg</strong>
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Tình trạng triệt sản *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsNeutered(true)}
                  className={`h-10 px-3 rounded-xl font-bold border text-xs transition-colors cursor-pointer ${
                    isNeutered
                      ? "bg-[#6B1F2E] text-white border-[#6B1F2E]"
                      : "bg-white dark:bg-card border-zinc-200 dark:border-border text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Đã triệt sản
                </button>
                <button
                  type="button"
                  onClick={() => setIsNeutered(false)}
                  className={`h-10 px-3 rounded-xl font-bold border text-xs transition-colors cursor-pointer ${
                    !isNeutered
                      ? "bg-[#6B1F2E] text-white border-[#6B1F2E]"
                      : "bg-white dark:bg-card border-zinc-200 dark:border-border text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Chưa triệt sản
                </button>
              </div>
            </div>
          </div>

          {/* Trường 3: Dị ứng chính thức */}
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">
              Tiền sử dị ứng chính thức (Thuốc / Thức ăn / Hóa chất)
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="VD: Dị ứng đạm gà, nhạy cảm kháng sinh nhóm Penicillin..."
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground"
            />
          </div>

          {/* Trường 4: Hành vi đặc biệt & Lưu ý an toàn */}
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">
              Hành vi đặc biệt &amp; Lưu ý an toàn (Hiển thị cho cả NVCS)
            </label>
            <Textarea
              rows={2}
              value={behaviors}
              onChange={(e) => setBehaviors(e.target.value)}
              placeholder="VD: Sợ tiếng máy sấy công suất lớn, nhạy cảm khi chạm vùng tai..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs"
            />
          </div>

          {/* Ghi chú bổ sung chỉ thêm dòng từ khách hàng (BS xem và đưa vào trường chính thức khi xác nhận) */}
          {editingPet.customerNotes && editingPet.customerNotes.length > 0 && (
            <div className="p-3 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Ghi chú bổ sung từ khách hàng (Bấm để xác nhận đưa vào hồ sơ chính thức)
              </div>
              <div className="space-y-2">
                {editingPet.customerNotes.map((cn) => (
                  <div
                    key={cn.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-card border border-blue-100 dark:border-border space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2 text-[11px]">
                      <span className="font-medium text-zinc-800 dark:text-foreground">
                        &ldquo;{cn.content}&rdquo;
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0">
                        {cn.createdAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {cn.confirmedByExpert && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã xác nhận</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          handleMergeNoteIntoDraft(cn.id, cn.content, "allergies")
                        }
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Đưa vào Dị ứng chính thức</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleMergeNoteIntoDraft(cn.id, cn.content, "behaviors")
                        }
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Đưa vào Hành vi chính thức</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer shadow-xs"
            >
              Lưu &amp; Khóa dữ liệu y tế
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
