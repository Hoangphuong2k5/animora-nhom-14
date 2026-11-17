"use client";

import React from "react";
import Link from "next/link";
import { FileHeart, Pencil, Trash2 } from "lucide-react";
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
  hasLinkedRecords?: boolean;
  onEdit?: (pet: ExpertPet) => void;
  onDelete?: (pet: ExpertPet) => void;
  onClose: () => void;
}

export function ClientPetDrawer({
  pet,
  owner,
  appointments,
  services,
  isVet = false,
  hasLinkedRecords = false,
  onEdit,
  onDelete,
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
                    <h4 className="text-lg font-extrabold font-heading text-zinc-900 dark:text-foreground">
                      {pet.name}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      {pet.breed} • {pet.weightKg} kg
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Ngày sinh: {pet.birthDate}
                    </p>
                  </div>
                </div>

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
              <Link
                href={`/expert/health-records?petId=${pet.id}`}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors flex items-center justify-center gap-2"
              >
                <FileHeart className="w-4 h-4 text-[#FF7F6B]" />
                <span>Mở sổ sức khỏe của bé</span>
              </Link>
              {isVet && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit?.(pet)}
                    className="py-2 px-3 rounded-xl text-xs font-bold border border-zinc-200 dark:border-border bg-white dark:bg-card hover:bg-zinc-100 dark:hover:bg-muted text-zinc-800 dark:text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Sửa thông tin</span>
                  </button>
                  <button
                    type="button"
                    disabled={hasLinkedRecords}
                    onClick={() => onDelete?.(pet)}
                    title={
                      hasLinkedRecords
                        ? "Không thể xóa thú cưng đang có lịch hẹn hoặc bệnh án"
                        : "Xóa hồ sơ thú cưng"
                    }
                    className="py-2 px-3 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{hasLinkedRecords ? "Đã có hồ sơ" : "Xóa hồ sơ"}</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
