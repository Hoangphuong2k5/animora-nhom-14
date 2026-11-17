import React from "react";
import {
  Dog,
  ShieldCheck,
  Syringe,
  Pill,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminPetItem } from "./petsData";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";

interface PetDetailSheetProps {
  selectedPet: AdminPetItem | null;
  onClose: () => void;
}

export function PetDetailSheet({ selectedPet, onClose }: PetDetailSheetProps) {
  return (
    <Sheet
      open={Boolean(selectedPet)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
      >
        {selectedPet && (
          <>
            {/* Header */}
            <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPet.photo}
                  alt={selectedPet.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      selectedPet.species === "Mèo"
                        ? "/assets/images/about_fluffy_cat_1793177483392.jpg"
                        : selectedPet.species === "Chó"
                        ? "/assets/images/hero_golden_retriever_1793177482877.jpg"
                        : "/assets/aistudio/cute_dog_transparent.png";
                  }}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FF7F6B] shrink-0"
                />
                <div className="min-w-0">
                  <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
                    <span>{selectedPet.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6B1F2E]/10 text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {selectedPet.species}
                    </span>
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    <span>
                      {selectedPet.breed} · {selectedPet.weight}kg · {selectedPet.age}
                    </span>
                    <span className="block text-[11px] font-mono mt-0.5">
                      Chip: {selectedPet.microchip}
                    </span>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
              <div className="p-6 space-y-6 text-xs">
                {/* Owner info strip */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 block font-medium">
                      Chủ nuôi:
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-foreground">
                      {selectedPet.ownerName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-400 block font-medium">
                      Số điện thoại:
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                      {selectedPet.ownerPhone}
                    </span>
                  </div>
                </div>

                {/* Dị ứng cảnh báo */}
                {selectedPet.allergies && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300">
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Lưu ý Dị ứng &amp; Nhạy cảm:</span>
                    </div>
                    <p className="text-[11px]">{selectedPet.allergies}</p>
                  </div>
                )}

                {/* 1. Lịch sử Tiêm phòng */}
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                    <Syringe className="w-4 h-4 text-[#FF7F6B]" />
                    Lịch Sử Tiêm Phòng Vaccine
                  </h4>
                  <div className="space-y-2">
                    {selectedPet.vaccines.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-foreground">
                            {v.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            Bác sĩ: {v.doctor} · Tiêm: {formatDateDdMmYyyy(v.date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                            Đã tiêm
                          </span>
                          <div className="text-[10px] text-zinc-400 mt-1">
                            Hạn mũi: {formatDateDdMmYyyy(v.nextDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Lịch Tẩy giun & Ký sinh trùng */}
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Sổ Tẩy Giun &amp; Ve Rận
                  </h4>
                  <div className="space-y-2">
                    {selectedPet.deworms.map((dw) => (
                      <div
                        key={dw.id}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-foreground">
                            {dw.drug}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            Ngày dùng: {formatDateDdMmYyyy(dw.date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-semibold text-zinc-500">
                            Mũi tiếp: {formatDateDdMmYyyy(dw.nextDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Bệnh sử khám chữa */}
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-600" />
                    Bệnh Sử &amp; Chẩn Đoán Lâm Sàng
                  </h4>
                  {selectedPet.medicalHistory.length === 0 ? (
                    <p className="text-zinc-400 italic">
                      Bé cưng hoàn toàn khỏe mạnh, chưa ghi nhận bệnh sử.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedPet.medicalHistory.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-900 dark:text-foreground">
                              {m.diagnosis}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {formatDateDdMmYyyy(m.date)}
                            </span>
                          </div>
                          <p className="text-zinc-600 dark:text-foreground/80 text-[11px]">
                            Hướng điều trị: {m.treatment}
                          </p>
                          <div className="text-[10px] text-zinc-400">
                            Phụ trách: {m.doctor}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Đơn thuốc đã kê */}
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-amber-600" />
                    Đơn Thuốc &amp; Thực Phẩm Chức Năng Đã Kê
                  </h4>
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
                    {selectedPet.prescriptions.map((rx, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-zinc-800 dark:text-foreground/90"
                      >
                        <span className="font-bold text-[#FF7F6B]">•</span>
                        <span>{rx}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Lịch nhắc sắp tới */}
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#FF7F6B]" />
                    Lịch Nhắc Chăm Sóc Sắp Tới
                  </h4>
                  <div className="space-y-2">
                    {selectedPet.upcomingReminders.map((rem) => (
                      <div
                        key={rem.id}
                        className="p-3 rounded-2xl bg-[#6B1F2E]/5 dark:bg-[#6B1F2E]/15 border border-[#6B1F2E]/15 flex items-center justify-between"
                      >
                        <div className="font-bold text-zinc-900 dark:text-foreground">
                          {rem.title}
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-[#6B1F2E] dark:text-[#FF7F6B]">
                            Hạn: {rem.dueDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  toast.success(
                    `Đã in/xuất sổ sức khỏe điện tử bé ${selectedPet.name}!`
                  )
                }
                className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Xuất Sổ Sức Khỏe (PDF)
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

