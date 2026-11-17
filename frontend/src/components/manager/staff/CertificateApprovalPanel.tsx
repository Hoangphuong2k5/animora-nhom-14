"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Award,
  Eye,
  ShieldCheck,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import {
  EXPERT_SYNC_EVENT,
  readAllExpertProfiles,
  reviewExpertCertificate,
} from "@/utils/clinicalSync";
import type { ExpertCertificate, ExpertProfile } from "@/types/expert.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  StatusPill,
  panelCard,
  thClass,
} from "./useStaffOps";
import { RejectReasonDialog } from "./RejectReasonDialog";
import {
  CertificateDetailModal,
  type CertificateDetailTarget,
} from "./CertificateDetailModal";

interface AggregatedCertRow {
  expertId: string;
  expertName: string;
  expertAvatar?: string;
  expertTitle: string;
  role: "vet" | "care_staff";
  contract: "full_time" | "part_time";
  licenseNumber?: string;
  yearsOfExperience?: number;
  cert: ExpertCertificate;
}

/** Mục 5 – Duyệt hồ sơ nhân viên: kiểm tra & phê duyệt bằng cấp/chứng chỉ của Bác sĩ & NV Chăm sóc. */
export function CertificateApprovalPanel() {
  const [profiles, setProfiles] = useState<ExpertProfile[]>(() =>
    typeof window !== "undefined" ? readAllExpertProfiles() : []
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [roleFilter, setRoleFilter] = useState<"all" | "vet" | "care_staff">("all");
  const [expertFilter, setExpertFilter] = useState<string>("all");
  const [yearSort, setYearSort] = useState<"none" | "asc" | "desc">("none");

  const [rejectTarget, setRejectTarget] = useState<{
    expertId: string;
    certId: string;
  } | null>(null);
  const [detailTarget, setDetailTarget] =
    useState<CertificateDetailTarget | null>(null);

  const refreshProfiles = useCallback(() => {
    setProfiles(readAllExpertProfiles());
  }, []);

  useEffect(() => {
    window.addEventListener(EXPERT_SYNC_EVENT, refreshProfiles);
    return () => window.removeEventListener(EXPERT_SYNC_EVENT, refreshProfiles);
  }, [refreshProfiles]);

  const allRows: AggregatedCertRow[] = useMemo(() => {
    return profiles.flatMap((p) => {
      const isVet = p.expertType === "vet";
      return (p.certificates || []).map((cert) => ({
        expertId: p.id,
        expertName: p.fullName,
        expertAvatar: p.avatar,
        expertTitle: isVet ? "Bác sĩ thú y" : "NV chăm sóc",
        role: isVet ? "vet" : "care_staff",
        contract: p.employmentType === "part_time" ? "part_time" : "full_time",
        licenseNumber: p.licenseNumber,
        yearsOfExperience: p.yearsOfExperience,
        cert,
      }));
    });
  }, [profiles]);

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    allRows.forEach((row) => {
      const st = row.cert.status || "pending";
      if (st === "pending") pending += 1;
      else if (st === "approved") approved += 1;
      else if (st === "rejected") rejected += 1;
    });
    return { pending, approved, rejected, all: allRows.length };
  }, [allRows]);

  const expertSelectItems = useMemo(() => {
    const map: Record<string, string> = { all: "Tất cả chuyên viên" };
    profiles.forEach((p) => {
      map[p.id] = p.fullName;
    });
    return map;
  }, [profiles]);

  const filteredRows = useMemo(() => {
    const list = allRows.filter((row) => {
      const st = row.cert.status || "pending";
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (roleFilter !== "all" && row.role !== roleFilter) return false;
      if (expertFilter !== "all" && row.expertId !== expertFilter) return false;
      return true;
    });

    if (yearSort === "asc") {
      return [...list].sort((a, b) => a.cert.year - b.cert.year);
    }
    if (yearSort === "desc") {
      return [...list].sort((a, b) => b.cert.year - a.cert.year);
    }
    return list;
  }, [allRows, statusFilter, roleFilter, expertFilter, yearSort]);

  const handleReviewCert = (
    expertId: string,
    certId: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    const res = reviewExpertCertificate(expertId, certId, status, reason);
    if (!res) {
      toast.error("Không tìm thấy chứng chỉ chuyên môn cần duyệt.");
      return;
    }
    refreshProfiles();
    toast.success(
      status === "approved"
        ? "Đã phê duyệt chứng chỉ và gửi thông báo xác nhận về chuyên viên!"
        : "Đã từ chối chứng chỉ kèm lý do phản hồi cho chuyên viên."
    );
  };

  const toggleYearSort = () => {
    setYearSort((prev) =>
      prev === "none" ? "desc" : prev === "desc" ? "asc" : "none"
    );
  };

  return (
    <div className={`${panelCard} space-y-3`}>
      {/* 1. Header + Inline Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
          Duyệt Hồ Sơ &amp; Bằng Cấp/Chứng Chỉ Chuyên Môn
        </h3>

        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100/80 dark:bg-muted/50 p-1 border border-zinc-200/70 dark:border-border/60 text-xs w-fit">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              data-testid={`cert-filter-${f}`}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                statusFilter === f
                  ? "bg-[#6B1F2E] text-white shadow-xs"
                  : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
              }`}
            >
              {{
                pending: `Chờ duyệt (${counts.pending})`,
                approved: `Đã duyệt (${counts.approved})`,
                rejected: `Từ chối (${counts.rejected})`,
                all: `Tất cả (${counts.all})`,
              }[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Role & Specialist Inline Dropdowns */}
      <div className="flex flex-wrap items-center justify-end gap-3 text-xs pt-2 border-t border-zinc-100 dark:border-border/60">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-semibold">Vai trò:</span>
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              if (val) setRoleFilter(val as "all" | "vet" | "care_staff");
            }}
            items={{
              all: "Tất cả vai trò",
              vet: "Bác sĩ thú y",
              care_staff: "NV Chăm sóc",
            }}
          >
            <SelectTrigger className="w-36 h-8! rounded-xl bg-zinc-100/80 dark:bg-muted/50 border-zinc-200/70 dark:border-border/60 text-xs font-semibold px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="vet">Bác sĩ thú y</SelectItem>
              <SelectItem value="care_staff">NV Chăm sóc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-semibold">Chuyên viên:</span>
          <Select
            value={expertFilter}
            onValueChange={(val) => {
              if (val) setExpertFilter(val);
            }}
            items={expertSelectItems}
          >
            <SelectTrigger className="w-48 h-8! rounded-xl bg-zinc-100/80 dark:bg-muted/50 border-zinc-200/70 dark:border-border/60 text-xs font-semibold px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chuyên viên</SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Data Table */}
      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200/80 dark:border-border/60">
              <TableHead className={`${thClass} px-2.5`}>Bản scan</TableHead>
              <TableHead className={`${thClass} px-2.5`}>Chuyên viên</TableHead>
              <TableHead className={`${thClass} px-2.5`}>
                Bằng cấp / Chứng chỉ
              </TableHead>
              <TableHead className={`${thClass} px-2.5`}>Đơn vị cấp</TableHead>
              <TableHead
                onClick={toggleYearSort}
                className={`${thClass} px-2.5 text-center cursor-pointer select-none hover:text-zinc-900 dark:hover:text-foreground`}
              >
                <span className="inline-flex items-center gap-1">
                  Năm cấp
                  <ArrowUpDown className="w-3 h-3" />
                </span>
              </TableHead>
              <TableHead className={`${thClass} px-2.5 text-center`}>
                Trạng thái
              </TableHead>
              <TableHead className={`${thClass} px-2.5 text-center`}>
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-zinc-400"
                >
                  Không có bằng cấp / chứng chỉ nào phù hợp bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => {
                const { cert } = row;
                const initials = row.expertName
                  .split(" ")
                  .filter(Boolean)
                  .slice(-2)
                  .map((w) => w[0]?.toUpperCase() || "")
                  .join("");

                const openDetail = () => setDetailTarget(row);

                return (
                  <TableRow
                    key={`${row.expertId}-${cert.id}`}
                    onClick={openDetail}
                    className="border-zinc-200/70 dark:border-border/60 hover:bg-zinc-50/70 dark:hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    {/* Thumbnail bản scan */}
                    <TableCell className="py-3 px-2.5">
                      <button
                        type="button"
                        onClick={openDetail}
                        title="Xem ảnh bản scan chi tiết"
                        className="group relative w-14 h-10 rounded-lg overflow-hidden border border-zinc-200 dark:border-border bg-zinc-100 dark:bg-muted cursor-pointer flex items-center justify-center shrink-0"
                      >
                        {cert.scanUrl ? (
                          <>
                            <img
                              src={cert.scanUrl}
                              alt={cert.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-3.5 h-3.5 text-white" />
                            </span>
                          </>
                        ) : (
                          <Award className="w-4 h-4 text-[#FF7F6B]" />
                        )}
                      </button>
                    </TableCell>

                    {/* Chuyên viên */}
                    <TableCell className="py-3 px-2.5">
                      <div className="flex items-center gap-2.5 min-w-[160px]">
                        {row.expertAvatar ? (
                          <img
                            src={row.expertAvatar}
                            alt={row.expertName}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-border shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF7F6B]/15 dark:text-[#FF7F6B] font-extrabold text-[10px] flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-zinc-900 dark:text-foreground truncate">
                            {row.expertName}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {row.expertTitle} •{" "}
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {row.contract === "full_time"
                                ? "Full-time"
                                : "Part-time"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Bằng cấp / Chứng chỉ */}
                    <TableCell className="py-3 px-2.5 max-w-[260px] whitespace-normal">
                      <button
                        type="button"
                        onClick={openDetail}
                        className="text-left font-bold text-zinc-900 dark:text-foreground hover:text-[#6B1F2E] dark:hover:text-[#FF7F6B] transition-colors cursor-pointer"
                      >
                        {cert.name}
                      </button>
                      {row.licenseNumber && (
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          CCHN: {row.licenseNumber}
                        </div>
                      )}
                      {cert.rejectReason && (
                        <div className="text-[10px] text-rose-500 mt-0.5">
                          Lý do từ chối: {cert.rejectReason}
                        </div>
                      )}
                    </TableCell>

                    {/* Đơn vị cấp */}
                    <TableCell className="py-3 px-2.5 text-zinc-700 dark:text-zinc-300">
                      {cert.issuer}
                    </TableCell>

                    {/* Năm cấp */}
                    <TableCell className="py-3 px-2.5 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {cert.year}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="py-3 px-2.5 text-center whitespace-nowrap">
                      <StatusPill status={cert.status || "pending"} />
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell
                      className="py-3 px-2.5 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={openDetail}
                        title="Xem chi tiết"
                        aria-label="Xem chi tiết"
                        className="w-8 h-8 rounded-xl inline-flex items-center justify-center border border-zinc-200/80 dark:border-border bg-zinc-100/80 dark:bg-muted/50 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-muted hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-all duration-150 active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CertificateDetailModal
        target={detailTarget}
        onClose={() => setDetailTarget(null)}
        onApprove={(expertId, certId) =>
          handleReviewCert(expertId, certId, "approved")
        }
        onReject={(expertId, certId) => setRejectTarget({ expertId, certId })}
      />

      <RejectReasonDialog
        open={Boolean(rejectTarget)}
        title="Từ chối chứng chỉ chuyên môn"
        description="Lý do từ chối sẽ được thông báo ngay tới bác sĩ / nhân viên chăm sóc để nộp bổ sung hồ sơ."
        defaultReason="Bản scan mờ hoặc chưa có dấu chứng thực chuyên ngành."
        presetReasons={[
          "Bản scan mờ hoặc chưa có dấu chứng thực chuyên ngành.",
          "Thông tin trên chứng chỉ không khớp với hồ sơ cá nhân.",
          "Chứng chỉ đã hết hiệu lực hoặc thiếu trang xác nhận.",
          "Chứng chỉ chưa thuộc danh mục chuyên môn được công nhận.",
        ]}
        onCancel={() => setRejectTarget(null)}
        onConfirm={(reason) => {
          if (rejectTarget) {
            handleReviewCert(
              rejectTarget.expertId,
              rejectTarget.certId,
              "rejected",
              reason
            );
          }
          setRejectTarget(null);
        }}
      />
    </div>
  );
}
