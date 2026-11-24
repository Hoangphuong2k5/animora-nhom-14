"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  FileWarning,
  ShieldCheck,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { ExpertCertificate } from "@/types/expert.type";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusPill } from "./useStaffOps";

export interface CertificateDetailTarget {
  expertId: string;
  expertName: string;
  expertAvatar?: string;
  expertTitle: string;
  role: "vet" | "care_staff";
  contract: "full_time";
  licenseNumber?: string;
  yearsOfExperience?: number;
  cert: ExpertCertificate;
}

interface CertificateDetailModalProps {
  target: CertificateDetailTarget | null;
  onClose: () => void;
  onApprove: (expertId: string, certId: string) => void;
  onReject: (expertId: string, certId: string) => void;
}

export function CertificateDetailModal({
  target,
  onClose,
  onApprove,
  onReject,
}: CertificateDetailModalProps) {
  const [zoomed, setZoomed] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setZoomed(false);
      onClose();
    }
  };

  const cert = target?.cert;
  const isPending = (cert?.status || "pending") === "pending";
  const initials = (target?.expertName || "")
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <Sheet open={Boolean(target)} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
      >
        {target && cert && (
          <>
            {/* Header */}
            <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono font-bold text-[#6B1F2E] dark:text-[#FF7F6B] uppercase tracking-wider">
                    {cert.id.toUpperCase()}
                  </div>
                  <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground mt-0.5">
                    Hồ Sơ Chi Tiết Chứng Chỉ
                  </SheetTitle>
                  <SheetDescription className="text-xs text-zinc-500 mt-0.5">
                    Thông tin chuyên viên, bản scan và trạng thái phê duyệt
                  </SheetDescription>
                </div>
                <StatusPill status={cert.status || "pending"} />
              </div>
            </SheetHeader>

            {/* Body */}
            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
              <div className="p-6 space-y-4 text-xs">
                {/* Specialist Card */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-muted/40 border border-zinc-200/70 dark:border-border space-y-3">
                  <div className="flex items-center gap-3">
                    {target.expertAvatar ? (
                      <img
                        src={target.expertAvatar}
                        alt={target.expertName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#FF7F6B] shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF7F6B]/15 dark:text-[#FF7F6B] font-extrabold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-zinc-900 dark:text-foreground truncate">
                        {target.expertName}
                      </div>
                      <div className="text-[11px] text-[#6B1F2E] dark:text-[#FF7F6B] font-semibold">
                        {target.expertTitle} • Full-time
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200/60 dark:border-border/60">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">
                        Số CCHN:
                      </span>
                      <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        {target.licenseNumber || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">
                        Kinh nghiệm:
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {target.yearsOfExperience
                          ? `${target.yearsOfExperience} năm`
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certificate Metadata */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-muted/40 border border-zinc-200/70 dark:border-border space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-zinc-400 shrink-0">Tên chứng chỉ:</span>
                    <span className="font-bold text-zinc-900 dark:text-foreground text-right">
                      {cert.name}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-zinc-400 shrink-0">Đơn vị cấp:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">
                      {cert.issuer}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400 shrink-0">Năm cấp:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-foreground">
                      {cert.year}
                    </span>
                  </div>
                  {cert.rejectReason && (
                    <div className="pt-2 border-t border-zinc-200/60 dark:border-border/60">
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px]">
                        <strong>Lý do từ chối:</strong> {cert.rejectReason}
                      </div>
                    </div>
                  )}
                </div>

                {/* Scan Image Preview */}
                <div className="rounded-2xl border border-zinc-200/80 dark:border-border bg-zinc-50 dark:bg-muted/30 overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-200/70 dark:border-border/60">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                      Bản scan đính kèm
                    </span>
                    {cert.scanUrl && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setZoomed((z) => !z)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-card border border-zinc-200 dark:border-border text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer transition-colors"
                        >
                          {zoomed ? (
                            <>
                              <ZoomOut className="w-3.5 h-3.5" />
                              <span>Thu nhỏ</span>
                            </>
                          ) : (
                            <>
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>Phóng to</span>
                            </>
                          )}
                        </button>
                        <a
                          href={cert.scanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-card border border-zinc-200 dark:border-border text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-muted transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ảnh gốc</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {cert.scanUrl ? (
                    <div className="p-3 flex items-center justify-center bg-zinc-950/5 dark:bg-black/30 overflow-auto max-h-[340px]">
                      <img
                        src={cert.scanUrl}
                        alt={cert.name}
                        onClick={() => setZoomed((z) => !z)}
                        className={`rounded-xl shadow-sm transition-transform duration-200 cursor-zoom-in ${
                          zoomed
                            ? "w-full max-h-none scale-110 origin-center cursor-zoom-out"
                            : "max-h-[300px] w-auto object-contain"
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="py-10 px-4 text-center space-y-2">
                      <FileWarning className="w-8 h-8 text-zinc-400 mx-auto" />
                      <p className="text-xs text-zinc-500">
                        Chuyên viên chưa đính kèm ảnh bản scan cho chứng chỉ này.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-zinc-50/60 dark:bg-muted/20 shrink-0">
              {isPending ? (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onReject(target.expertId, cert.id);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Từ chối</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onApprove(target.expertId, cert.id);
                      onClose();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Duyệt chứng chỉ</span>
                  </button>
                </div>
              ) : (
                <div className="w-full py-2.5 px-4 rounded-xl border border-border bg-background/60 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                  {cert.status === "approved" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Chứng chỉ đã được phê duyệt</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-rose-500" />
                      <span className="text-rose-500">Chứng chỉ đã bị từ chối</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
