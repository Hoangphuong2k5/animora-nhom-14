/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, FileHeart, History, Lock, Pencil, Plus } from "lucide-react";
import { ExpertAppointment, ExpertPet, ExpertPetOwner, ExpertServiceDef } from "@/types/expert.type";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClientPetDrawerProps {
  pet: ExpertPet | null;
  owner: ExpertPetOwner | null | undefined;
  appointments: ExpertAppointment[];
  services: ExpertServiceDef[];
  isVet?: boolean;
  onEdit?: (pet: ExpertPet) => void;
  onConfirmCustomerNote?: (
    petId: string,
    noteId: string,
    targetField: "allergies" | "behaviors"
  ) => void;
  onClose: () => void;
}

export function ClientPetDrawer({
  pet,
  owner,
  appointments,
  services,
  isVet = false,
  onEdit,
  onConfirmCustomerNote,
  onClose,
}: ClientPetDrawerProps) {
  return (
    <Sheet
      open={Boolean(pet)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-md p-0 gap-0 flex flex-col h-full bg-white dark:bg-background text-zinc-900 dark:text-foreground border-l border-zinc-200 dark:border-border shadow-2xl"
      >
        {pet && (
          <>
            <SheetHeader className="px-6 py-4 pr-12 border-b border-zinc-100 dark:border-border shrink-0">
              <SheetTitle className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
                Hồ Sơ Thú Cưng
              </SheetTitle>
              <SheetDescription className="sr-only">
                Thông tin chi tiết và lịch sử chăm sóc của {pet.name}
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
              <div className="p-6 space-y-5">
                {/* Pet Photo & Bio */}
                <div className="flex items-center gap-3">
                  <img
                    src={pet.photo}
                    alt={pet.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-border"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-lg font-extrabold font-heading text-zinc-900 dark:text-foreground">
                        {pet.name}
                      </h4>
                      {pet.medicalLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <Lock className="w-3 h-3" />
                          <span>BS đã khóa y tế</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                          Dữ liệu do KH khai ban đầu
                        </span>
                      )}
                      {!isVet && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-zinc-300">
                          Chỉ xem (NVCS)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {pet.breed} • {pet.weightKg} kg
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Ngày sinh: {pet.birthDate}
                      {pet.isNeutered !== undefined
                        ? ` • ${pet.isNeutered ? "Đã triệt sản" : "Chưa triệt sản"}`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Thông tin chuyên môn & hành vi (Chỉ xem cho NVCS theo v1.4 Mục 3.1) */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-card border border-zinc-200 dark:border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">
                      Thông tin sức khỏe &amp; Hành vi
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500">
                      {pet.isNeutered ? "Đã triệt sản" : "Chưa triệt sản"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-muted/40 border border-zinc-200/60 dark:border-border">
                      <span className="text-zinc-400 block text-[10px]">Cân nặng hiện tại</span>
                      <strong className="text-zinc-900 dark:text-foreground">{pet.weightKg} kg</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-muted/40 border border-zinc-200/60 dark:border-border">
                      <span className="text-zinc-400 block text-[10px]">Dị ứng ghi nhận</span>
                      <strong className="text-rose-600 dark:text-rose-400">
                        {pet.allergies || "Không có"}
                      </strong>
                    </div>
                  </div>
                  {(pet.behaviors || pet.ownerNote) && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                      <div className="font-bold">Hành vi / Lưu ý khi chăm sóc:</div>
                      <p>{pet.behaviors || pet.ownerNote}</p>
                    </div>
                  )}
                  {pet.customerNotes && pet.customerNotes.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">
                        Ghi chú bổ sung từ khách hàng (Chỉ thêm dòng)
                      </span>
                      {pet.customerNotes.map((cn) => (
                        <div
                          key={cn.id}
                          className="p-2.5 rounded-xl bg-white dark:bg-muted/40 border border-zinc-200/60 dark:border-border text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span>&ldquo;{cn.content}&rdquo;</span>
                            <span className="text-[9px] text-zinc-400 shrink-0">
                              {cn.createdAt}
                            </span>
                          </div>
                          {cn.confirmedByExpert ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>
                                Đã đưa vào{" "}
                                {cn.confirmedTarget === "behaviors"
                                  ? "Hành vi chính thức"
                                  : "Dị ứng chính thức"}
                                {cn.confirmedByName ? ` (${cn.confirmedByName})` : ""}
                              </span>
                            </div>
                          ) : (
                            isVet &&
                            onConfirmCustomerNote && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onConfirmCustomerNote(pet.id, cn.id, "allergies")
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Xác nhận vào Dị ứng chính thức</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onConfirmCustomerNote(pet.id, cn.id, "behaviors")
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Đưa vào Hành vi</span>
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nhật ký Audit Log Bác sĩ cập nhật dữ liệu y tế (v1.4 Mục 3 & Mục 9) */}
                {pet.medicalUpdateLogs && pet.medicalUpdateLogs.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-card border border-zinc-200 dark:border-border space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500">
                      <History className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                      <span>Audit Log Bác Sĩ Cập Nhật Dữ Liệu Y Tế ({pet.medicalUpdateLogs.length})</span>
                    </div>
                    <div className="space-y-2">
                      {pet.medicalUpdateLogs.slice(0, 5).map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-xl bg-white dark:bg-muted/40 border border-zinc-200/70 dark:border-border text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-zinc-500">
                            <strong className="text-zinc-800 dark:text-foreground">
                              {log.updatedByExpertName}
                            </strong>
                            <span>{log.updatedAt.replace("T", " ").slice(0, 16)}</span>
                          </div>
                          {log.changes.map((ch, idx) => (
                            <div key={idx} className="text-zinc-700 dark:text-zinc-300">
                              • <span className="font-semibold">{ch.label}:</span>{" "}
                              <span className="line-through text-zinc-400">{ch.oldValue}</span>{" "}
                              → <strong className="text-[#6B1F2E] dark:text-[#FF7F6B]">{ch.newValue}</strong>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Owner info */}
                {owner && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-card border border-zinc-200 dark:border-border space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">
                      Chủ sở hữu
                    </span>
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      {owner.fullName}
                    </div>
                    <div className="text-zinc-500">{owner.phone}</div>
                    <div className="text-zinc-400 text-[11px]">{owner.email}</div>
                  </div>
                )}

                {/* Past Sessions with this Expert */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-foreground/80">
                    Các lần bạn đã phục vụ bé ({appointments.length})
                  </span>
                  <div className="space-y-2">
                    {appointments.map((a) => {
                      const s = services.find((srv) => srv.id === a.serviceId);
                      return (
                        <div
                          key={a.id}
                          className="p-2.5 rounded-xl border border-zinc-200 dark:border-border text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                              {a.code}
                            </span>
                            <span className="text-zinc-400 text-[10px]">
                              {a.startAt.replace("T", " ")}
                            </span>
                          </div>
                          <div className="font-medium text-zinc-800 dark:text-foreground/90">
                            {s?.name.vi}
                          </div>
                          {a.completionNote && (
                            <p className="text-[11px] text-zinc-500 italic">
                              &ldquo;{a.completionNote}&rdquo;
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Drawer footer link */}
            <div className="px-6 py-4 border-t border-zinc-100 dark:border-border shrink-0 space-y-2">
              {isVet ? (
                <>
                  <Link
                    href={`/expert/health-records?petId=${pet.id}`}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors flex items-center justify-center gap-2"
                  >
                    <FileHeart className="w-4 h-4 text-[#FF7F6B]" />
                    <span>Mở sổ sức khỏe &amp; bệnh án của bé</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => onEdit?.(pet)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold border border-zinc-200 dark:border-border bg-white dark:bg-card hover:bg-zinc-100 dark:hover:bg-muted text-zinc-800 dark:text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                    <span>Cập nhật Cân nặng, Dị ứng, Hành vi, Triệt sản &amp; Khóa y tế</span>
                  </button>
                </>
              ) : (
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-muted/40 border border-zinc-200/70 dark:border-border text-[11px] text-zinc-500 text-center">
                  Nhân viên chăm sóc có quyền <strong>Chỉ xem</strong> thông tin hồ sơ thú cưng (không chỉnh sửa cân nặng, dị ứng, hành vi và không truy cập Sổ sức khỏe/Kê đơn).
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
