"use client";

import React from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Plus,
} from "lucide-react";
import { StatusBadge } from "@/components/expert/StatusBadge";
import { ExpertCertificate } from "@/types/expert.type";
import { normalizeVietnameseSentenceTitle } from "./profileUtils";

interface ProfileCertificatesPanelProps {
  lang: "vi" | "en";
  displayCertificates: ExpertCertificate[];
  onOpenAddCertificate: () => void;
  onOpenViewCertificate: (cert: ExpertCertificate) => void;
  onOpenReRequestCertificate: (cert: ExpertCertificate) => void;
}

export function ProfileCertificatesPanel({
  lang,
  displayCertificates,
  onOpenAddCertificate,
  onOpenViewCertificate,
  onOpenReRequestCertificate,
}: ProfileCertificatesPanelProps) {
  const approvedCount = displayCertificates.filter(
    (c) => (c.status || "approved") === "approved"
  ).length;
  const pendingCount = displayCertificates.filter(
    (c) => c.status === "pending"
  ).length;
  const rejectedCount = displayCertificates.filter(
    (c) => c.status === "rejected"
  ).length;

  return (
    <div className="relative z-10 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/95 dark:bg-card/90 backdrop-blur-md shadow-xs p-5 sm:p-6 space-y-4 text-xs">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-border">
        <div>
          <h3 className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-foreground">
            {lang === "en"
              ? "Recognized degrees and certificates"
              : "Bằng cấp và chứng chỉ được công nhận"}
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-muted-foreground mt-0.5">
            {lang === "en"
              ? "Manage academic degrees and professional certificates verified by Animora Operations Manager."
              : "Quản lý văn bằng và chứng chỉ chuyên môn được Manager Animora kiểm tra và phê duyệt."}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddCertificate}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] dark:bg-[#FF7F6B] dark:text-zinc-950 dark:hover:bg-[#ff9482] transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#FF7F6B] dark:text-zinc-950" />
          <span>
            {lang === "en"
              ? "Add degree/certificate"
              : "Thêm bằng cấp/chứng chỉ"}
          </span>
        </button>
      </div>

      {/* Quick Status Summary Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <div className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200">
              {approvedCount}
            </div>
            <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              {lang === "en" ? "Valid" : "Hợp lệ"}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <div className="font-extrabold text-xs text-amber-900 dark:text-amber-200">
              {pendingCount}
            </div>
            <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              {lang === "en" ? "Pending" : "Chờ duyệt"}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/60 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <div className="font-extrabold text-xs text-rose-900 dark:text-rose-200">
              {rejectedCount}
            </div>
            <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-300">
              {lang === "en" ? "Rejected" : "Bị từ chối"}
            </div>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="space-y-2.5">
        {displayCertificates.map((cert) => {
          const status = cert.status || "approved";
          const badgeLabel =
            status === "approved"
              ? lang === "en"
                ? "Valid"
                : "Hợp lệ"
              : status === "pending"
              ? lang === "en"
                ? "Pending Admin approval"
                : "Chờ Manager duyệt"
              : lang === "en"
              ? "Rejected"
              : "Bị từ chối";

          return (
            <div
              key={cert.id}
              className={`p-3.5 rounded-2xl border space-y-2 transition-colors ${
                status === "rejected"
                  ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                  : "bg-[#FAF6F0]/60 dark:bg-muted/40 border-zinc-200/80 dark:border-border"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <Award className="w-4 h-4 text-[#FF7F6B] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      {normalizeVietnameseSentenceTitle(cert.name)}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-muted-foreground font-medium">
                      {lang === "en" ? "Issued by: " : "Cấp bởi: "}
                      {cert.issuer} ({cert.year})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <StatusBadge status={status} label={badgeLabel} size="sm" />

                  {status === "approved" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenViewCertificate(cert)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-zinc-700 dark:text-foreground/80 hover:bg-zinc-200/70 dark:hover:bg-muted cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{lang === "en" ? "View" : "Xem"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenReRequestCertificate(cert)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#6B1F2E]/40 text-[#6B1F2E] dark:border-[#FF7F6B]/40 dark:text-[#FF7F6B] hover:bg-[#6B1F2E]/5 dark:hover:bg-muted cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>
                          {lang === "en" ? "Request edit" : "Yêu cầu sửa lại"}
                        </span>
                      </button>
                    </>
                  )}

                  {status === "pending" && (
                    <button
                      type="button"
                      onClick={() => onOpenViewCertificate(cert)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-zinc-700 dark:text-foreground/80 hover:bg-zinc-200/70 dark:hover:bg-muted cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === "en" ? "View" : "Xem"}</span>
                    </button>
                  )}

                  {status === "rejected" && (
                    <button
                      type="button"
                      onClick={() => onOpenReRequestCertificate(cert)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{lang === "en" ? "Resubmit" : "Gửi lại ngay"}</span>
                    </button>
                  )}
                </div>
              </div>

              {status === "rejected" && cert.rejectReason && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {lang === "en" ? "Reason: " : "Lý do từ chối: "}
                    </strong>
                    {cert.rejectReason}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

