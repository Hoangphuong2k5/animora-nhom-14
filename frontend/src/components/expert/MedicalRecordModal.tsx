"use client";

import React, { useState } from "react";
import { Stethoscope } from "lucide-react";
import { DiseaseSeverity, ExpertAppointment } from "@/types/expert.type";
import { useExpert } from "./ExpertProvider";
import { saveMedicalRecordAction } from "@/actions/expert.action";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SEVERITY_ITEMS: Record<DiseaseSeverity, string> = {
  mild: "Nhẹ (Cho phép mua lại 1-3 lần)",
  severe: "Nặng (Bắt buộc tái khám trực tiếp)",
};

interface MedicalRecordModalProps {
  appointment?: ExpertAppointment | null;
  petId?: string;
  initialWeight?: number;
  onClose: () => void;
  onPrescribeImmediately?: () => void;
}

export function MedicalRecordModal({
  appointment,
  petId,
  initialWeight,
  onClose,
  onPrescribeImmediately,
}: MedicalRecordModalProps) {
  const { allPets, addMedicalRecord, addWeightLog } = useExpert();
  const targetPetId = appointment?.petId || petId || "";
  const pet = allPets.find((p) => p.id === targetPetId);

  const [symptoms, setSymptoms] = useState(appointment?.customerNote || "");
  const [diagnosis, setDiagnosis] = useState("");
  const [severity, setSeverity] = useState<DiseaseSeverity>("mild");
  const [weightKg, setWeightKg] = useState<number>(initialWeight || pet?.weightKg || 5.0);
  const [temperatureC, setTemperatureC] = useState<number>(38.5);
  const [note, setNote] = useState("");
  const [nextVaccineDate, setNextVaccineDate] = useState("");
  const [nextDewormDate, setNextDewormDate] = useState("");
  const [revisitDate, setRevisitDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPetId) {
      toast.error("Không xác định được thú cưng!");
      return;
    }
    if (!diagnosis.trim()) {
      toast.error("Vui lòng nhập chẩn đoán bệnh án!");
      return;
    }

    setLoading(true);
    try {
      const res = await saveMedicalRecordAction({
        petId: targetPetId,
        appointmentId: appointment?.id || undefined,
        symptoms,
        diagnosis,
        severity,
        weightKg,
        temperatureC,
        note,
        nextVaccineDate: nextVaccineDate || undefined,
        nextDewormDate: nextDewormDate || undefined,
        revisitDate: revisitDate || undefined,
      });

      if (res.success && res.data) {
        addMedicalRecord(res.data);
        addWeightLog({
          petId: targetPetId,
          date: new Date().toISOString().slice(0, 10),
          weightKg,
        });
        toast.success("Bệnh án khám bệnh đã được lưu vào sổ sức khỏe điện tử!");
        onClose();
        if (onPrescribeImmediately) {
          onPrescribeImmediately();
        }
      } else {
        toast.error(res.message || "Không thể lưu bệnh án.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi lưu bệnh án.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground shadow-2xl text-xs"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-3 pr-12 border-b border-zinc-100 dark:border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
                Ghi Bệnh Án Khám Bệnh [Bác sĩ]
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Bệnh nhân:{" "}
                <strong className="text-zinc-800 dark:text-foreground/90">{pet?.name}</strong> (
                {pet?.breed})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-3.5">
            {/* Symptoms */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Triệu chứng lâm sàng ghi nhận *
              </label>
              <Textarea
                required
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="VD: Chảy dịch tai màu nâu sẫm, ngứa dữ dội, lắc đầu liên tục..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-800 dark:text-foreground/90 text-xs"
              />
            </div>

            {/* Diagnosis & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-foreground/80">
                  Chẩn đoán xác định *
                </label>
                <input
                  required
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="VD: Viêm tai ngoài do nấm"
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-800 dark:text-foreground/90 outline-none focus:ring-1 focus:ring-[#6B1F2E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-foreground/80">
                  Mức độ bệnh (Quy chuẩn đơn thuốc) *
                </label>
                <Select
                  value={severity}
                  onValueChange={(val) => {
                    if (val !== null) setSeverity(val as DiseaseSeverity);
                  }}
                  items={SEVERITY_ITEMS}
                >
                  <SelectTrigger className="w-full h-10! px-3 rounded-xl border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold text-zinc-800 dark:text-foreground/90 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Nhẹ (Cho phép mua lại 1-3 lần)</SelectItem>
                    <SelectItem value="severe">Nặng (Bắt buộc tái khám trực tiếp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Physical signs: Weight & Temp */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-foreground/80">
                  Cân nặng hôm nay (kg) *
                </label>
                <input
                  required
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-800 dark:text-foreground/90"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-foreground/80">
                  Thân nhiệt (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(parseFloat(e.target.value) || 38.5)}
                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-800 dark:text-foreground/90"
                />
              </div>
            </div>

            {/* Clinical note */}
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Chỉ định điều trị & Lời dặn
              </label>
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Rửa sạch tai bằng nước muối sinh lý trước khi nhỏ thuốc..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-800 dark:text-foreground/90 text-xs"
              />
            </div>

            {/* Reminders / Follow-up */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-zinc-100 dark:border-border">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">Hẹn tái khám</label>
                <input
                  type="date"
                  value={revisitDate}
                  onChange={(e) => setRevisitDate(e.target.value)}
                  className="w-full p-1.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">Lịch tiêm tiếp</label>
                <input
                  type="date"
                  value={nextVaccineDate}
                  onChange={(e) => setNextVaccineDate(e.target.value)}
                  className="w-full p-1.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">Lịch tẩy giun</label>
                <input
                  type="date"
                  value={nextDewormDate}
                  onChange={(e) => setNextDewormDate(e.target.value)}
                  className="w-full p-1.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-border shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-700 dark:hover:text-foreground font-bold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer disabled:opacity-50 shadow-sm shadow-[#6B1F2E]/20"
              >
                {loading ? "Đang lưu..." : "Lưu bệnh án khám"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
