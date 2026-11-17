import React from "react";
import { Calendar, CheckCircle2, ShieldCheck, Star, XCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExpertCertificate, ExpertStoreState } from "@/types/expert.type";
import type { StaffItem } from "./staffData";

interface StaffDetailSheetProps {
  selectedStaff: StaffItem | null;
  expertStores: Record<string, ExpertStoreState>;
  certRejectReasons?: Record<string, string>;
  onChangeRejectReason?: (certId: string, val: string) => void;
  onReviewCert?: (
    expertId: string,
    certId: string,
    decision: "approved" | "rejected"
  ) => void;
  onClose: () => void;
}

/** Slide-over detail drawer for inspecting staff profile, certificates, schedule, and reviews. */
export function StaffDetailSheet({
  selectedStaff,
  expertStores,
  onClose,
}: StaffDetailSheetProps) {
  return (
    <Sheet
      open={Boolean(selectedStaff)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
      >
        {selectedStaff && (
          <>
            <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStaff.avatar}
                  alt={selectedStaff.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#FF7F6B] shrink-0"
                />
                <div className="min-w-0">
                  <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground">
                    {selectedStaff.name}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-[#6B1F2E] dark:text-[#FF7F6B] font-semibold mt-0.5">
                    {selectedStaff.roleType}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
              <div className="p-6 space-y-5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border">
                    <span className="text-[11px] text-zinc-400 block font-medium">
                      Điểm đánh giá TB
                    </span>
                    <div className="flex items-center gap-1.5 text-lg font-extrabold text-amber-500 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span>{selectedStaff.rating}/5.0</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border">
                    <span className="text-[11px] text-zinc-400 block font-medium">
                      Số ca chăm sóc
                    </span>
                    <span className="text-lg font-extrabold text-zinc-900 dark:text-foreground">
                      {selectedStaff.monthlyCases} ca/tháng
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Kiểm Tra &amp; Phê Duyệt Bằng Cấp / Chứng Chỉ
                  </h4>
                  {selectedStaff.linkedExpertId ? (
                    (() => {
                      const expertId = selectedStaff.linkedExpertId;
                      const certs: ExpertCertificate[] =
                        expertStores[expertId]?.profile?.certificates || [];
                      if (certs.length === 0) {
                        return (
                          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-muted/50 text-zinc-400">
                            Nhân sự chưa tải lên chứng chỉ nào.
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-2.5">
                          {certs.map((cert) => {
                            const status = cert.status || "approved";
                            return (
                              <div
                                key={cert.id}
                                className={`p-3 rounded-xl border space-y-2 ${
                                  status === "pending"
                                    ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                                    : status === "rejected"
                                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900"
                                    : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="font-bold text-zinc-900 dark:text-foreground">
                                      {cert.name}
                                    </div>
                                    <div className="text-[11px] text-zinc-500">
                                      {cert.issuer} ({cert.year})
                                    </div>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                                      status === "approved"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : status === "pending"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-rose-100 text-rose-700"
                                    }`}
                                  >
                                    {status === "approved"
                                      ? "Hợp lệ"
                                      : status === "pending"
                                      ? "Chờ duyệt"
                                      : "Từ chối"}
                                  </span>
                                </div>

                                {cert.scanUrl && (
                                  <a
                                    href={cert.scanUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block text-[11px] font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline"
                                  >
                                    Xem bản scan chứng chỉ →
                                  </a>
                                )}

                                {status === "rejected" && cert.rejectReason && (
                                  <div className="text-[11px] text-rose-700 dark:text-rose-300">
                                    Lý do: {cert.rejectReason}
                                  </div>
                                )}

                                {status === "pending" && (
                                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-zinc-500">
                                    <img src="/read-only.svg" alt="" className="w-3.5 h-3.5 shrink-0" />
                                    <span>Đang chờ Quản lý nghiệp vụ phê duyệt (Chế độ chỉ xem)</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="space-y-1.5">
                      {selectedStaff.certificates.map((cert, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#FF7F6B]" />
                    Khung Ca Làm Việc Trong Tuần
                  </h4>
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border space-y-1">
                    {selectedStaff.scheduleShifts.map((sh, idx) => (
                      <div
                        key={idx}
                        className="font-semibold text-zinc-800 dark:text-foreground/90"
                      >
                        • {sh}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Đánh Giá Từ Khách Hàng Gần Nhất
                  </h4>
                  <div className="space-y-2">
                    {selectedStaff.recentReviews.map((rev, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900 dark:text-foreground">
                            {rev.customerName}
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-zinc-600 dark:text-foreground/80 italic">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                        <div className="text-[10px] text-zinc-400">{rev.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
