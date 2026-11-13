/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Edit3,
  FileImage,
  Send,
  Upload,
  XCircle,
} from "lucide-react";
import { ExpertCertificate } from "@/types/expert.type";
import { StatusBadge } from "@/components/expert/StatusBadge";
import { toast } from "sonner";

export type CertificateModalMode = "add" | "view" | "re_request";

interface CertificateModalProps {
  isOpen: boolean;
  mode: CertificateModalMode;
  certificate?: ExpertCertificate | null;
  lang?: "vi" | "en";
  onClose: () => void;
  onSwitchToReRequest?: () => void;
  onSubmitCertificate: (
    certData: Omit<ExpertCertificate, "id" | "status" | "rejectReason">,
    existingId?: string
  ) => void;
}

const DEFAULT_SCAN_PLACEHOLDER =
  "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800&auto=format&fit=crop&q=80";

export function CertificateModal({
  isOpen,
  mode,
  certificate,
  lang = "vi",
  onClose,
  onSwitchToReRequest,
  onSubmitCertificate,
}: CertificateModalProps) {
  const currentYear = 2026;
  const [name, setName] = useState<string>(certificate?.name || "");
  const [issuer, setIssuer] = useState<string>(certificate?.issuer || "");
  const [year, setYear] = useState<string>(
    certificate?.year ? String(certificate.year) : String(currentYear - 1)
  );
  const [scanUrl, setScanUrl] = useState<string>(
    certificate?.scanUrl || ""
  );
  const [scanFileName, setScanFileName] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const isViewOnly = mode === "view";

  const handleSelectScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError(
        lang === "en"
          ? "Please select a valid image file (JPG, PNG, WEBP)."
          : "Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP)."
      );
      return;
    }
    setScanFileName(file.name);
    setFormError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setScanUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanIssuer = issuer.trim();
    const parsedYear = Number(year);

    if (!cleanName) {
      setFormError(
        lang === "en"
          ? "Please enter the degree or certificate name."
          : "Vui lòng nhập tên bằng cấp hoặc chứng chỉ."
      );
      return;
    }
    if (!cleanIssuer) {
      setFormError(
        lang === "en"
          ? "Please enter the issuing institution."
          : "Vui lòng nhập nơi cấp bằng cấp/chứng chỉ."
      );
      return;
    }
    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 1980 ||
      parsedYear > currentYear
    ) {
      setFormError(
        lang === "en"
          ? `Please enter a valid year between 1980 and ${currentYear}.`
          : `Vui lòng nhập năm cấp hợp lệ (từ 1980 đến ${currentYear}).`
      );
      return;
    }
    if (!scanUrl) {
      setFormError(
        lang === "en"
          ? "Please upload a scan photo of the certificate."
          : "Vui lòng tải lên ảnh bản scan của bằng cấp/chứng chỉ."
      );
      return;
    }

    onSubmitCertificate(
      {
        name: cleanName,
        issuer: cleanIssuer,
        year: parsedYear,
        scanUrl,
      },
      certificate?.id
    );

    toast.success(
      mode === "re_request"
        ? lang === "en"
          ? "Update request submitted! Waiting for Admin approval."
          : "Đã gửi yêu cầu cập nhật bằng cấp! Trạng thái chuyển sang Chờ Admin duyệt."
        : lang === "en"
        ? "Certificate submitted! Waiting for Admin approval."
        : "Đã thêm bằng cấp mới! Đang chờ Admin duyệt."
    );
    onClose();
  };

  const certStatus = certificate?.status || "approved";
  const badgeLabel =
    certStatus === "approved"
      ? lang === "en"
        ? "Valid"
        : "Hợp lệ"
      : certStatus === "pending"
      ? lang === "en"
        ? "Pending Admin approval"
        : "Chờ Admin duyệt"
      : lang === "en"
      ? "Rejected"
      : "Bị từ chối";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            <h3 className="font-heading font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              {isViewOnly
                ? lang === "en"
                  ? "Certificate details"
                  : "Chi tiết bằng cấp và chứng chỉ"
                : mode === "re_request"
                ? lang === "en"
                  ? "Request certificate update"
                  : "Gửi yêu cầu cập nhật bằng cấp"
                : lang === "en"
                ? "Add degree or certificate"
                : "Thêm bằng cấp hoặc chứng chỉ"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {isViewOnly && certificate ? (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
              <div>
                <div className="text-zinc-600 dark:text-zinc-300 text-[11px] font-medium">
                  {lang === "en" ? "Verification status" : "Trạng thái xác thực"}
                </div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {certificate.name}
                </div>
              </div>
              <StatusBadge status={certStatus} label={badgeLabel} size="sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="text-zinc-600 dark:text-zinc-300 text-[11px]">
                  {lang === "en" ? "Issued by" : "Nơi cấp"}
                </div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {certificate.issuer}
                </div>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="text-zinc-600 dark:text-zinc-300 text-[11px]">
                  {lang === "en" ? "Year issued" : "Năm cấp"}
                </div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {certificate.year}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-zinc-700 dark:text-zinc-200">
                {lang === "en" ? "Verified scan copy" : "Ảnh bản scan lưu trữ"}
              </div>
              <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 h-48 flex items-center justify-center">
                <img
                  src={certificate.scanUrl || DEFAULT_SCAN_PLACEHOLDER}
                  alt={certificate.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {certStatus === "approved" && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {lang === "en"
                    ? "Valid certificates are read-only. To modify details or replace the scan, submit a re-verification request to Admin."
                    : "Bằng cấp đã hợp lệ chỉ được xem. Nếu muốn chỉnh sửa thông tin hoặc cập nhật lại bản scan, vui lòng bấm \"Gửi yêu cầu sửa lại\" để Admin xét duyệt."}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                {lang === "en" ? "Close" : "Đóng"}
              </button>
              {onSwitchToReRequest && (
                <button
                  type="button"
                  onClick={onSwitchToReRequest}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold border border-[#6B1F2E] text-[#6B1F2E] dark:border-[#FF7F6B] dark:text-[#FF7F6B] hover:bg-[#6B1F2E]/5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    {lang === "en"
                      ? "Request edit"
                      : "Gửi yêu cầu sửa lại"}
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {certificate?.status === "rejected" && certificate.rejectReason && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-[11px]">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">
                    {lang === "en" ? "Rejection reason:" : "Lý do bị từ chối:"}
                  </div>
                  <p className="mt-0.5">{certificate.rejectReason}</p>
                </div>
              </div>
            )}

            {mode === "re_request" && certificate?.status === "approved" && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-[11px]">
                {lang === "en"
                  ? "Submitting changes will switch this certificate status to 'Pending Admin approval' until re-verified."
                  : "Lưu ý: Khi gửi yêu cầu chỉnh sửa, bằng cấp này sẽ chuyển sang trạng thái \"Chờ Admin duyệt\" cho tới khi được xác thực lại."}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-bold text-zinc-700 dark:text-zinc-200">
                {lang === "en"
                  ? "Degree / Certificate name *"
                  : "Tên bằng cấp / chứng chỉ *"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError(null);
                }}
                placeholder={
                  lang === "en"
                    ? "e.g., Veterinary Surgery Certificate"
                    : "Ví dụ: Chứng chỉ chẩn đoán hình ảnh thú nhỏ"
                }
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[#FAF6F0]/70 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6B1F2E]/25 focus:border-[#6B1F2E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block font-bold text-zinc-700 dark:text-zinc-200">
                  {lang === "en" ? "Issuing institution *" : "Nơi cấp *"}
                </label>
                <input
                  type="text"
                  required
                  value={issuer}
                  onChange={(e) => {
                    setIssuer(e.target.value);
                    setFormError(null);
                  }}
                  placeholder={
                    lang === "en"
                      ? "e.g., Nong Lam University HCMC"
                      : "Ví dụ: Đại học Nông Lâm TP.HCM"
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[#FAF6F0]/70 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6B1F2E]/25 focus:border-[#6B1F2E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-zinc-700 dark:text-zinc-200">
                  {lang === "en" ? "Year *" : "Năm cấp *"}
                </label>
                <input
                  type="number"
                  required
                  min={1980}
                  max={currentYear}
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[#FAF6F0]/70 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#6B1F2E]/25 focus:border-[#6B1F2E]"
                />
              </div>
            </div>

            {/* Ảnh bản scan */}
            <div className="space-y-2">
              <label className="block font-bold text-zinc-700 dark:text-zinc-200">
                {lang === "en"
                  ? "Certificate scan photo *"
                  : "Ảnh bản scan bằng cấp / chứng chỉ *"}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelectScanFile}
                className="hidden"
              />

              {scanUrl ? (
                <div className="space-y-2">
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 h-44">
                    <img
                      src={scanUrl}
                      alt="Scan preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white/95 dark:bg-zinc-900/95 text-[#6B1F2E] dark:text-[#FF7F6B] border border-[#6B1F2E]/30 shadow-md cursor-pointer hover:bg-white"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {lang === "en" ? "Change scan image" : "Đổi ảnh bản scan"}
                      </span>
                    </button>
                  </div>
                  {scanFileName && (
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate">
                      {lang === "en" ? "Selected file: " : "Đã chọn tệp: "}
                      <strong className="font-bold">{scanFileName}</strong>
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-[#FAF6F0]/50 dark:bg-zinc-800/50 p-5 text-center space-y-2">
                  <FileImage className="w-8 h-8 text-[#6B1F2E] dark:text-[#FF7F6B] mx-auto opacity-80" />
                  <p className="text-zinc-700 dark:text-zinc-200 font-semibold">
                    {lang === "en"
                      ? "Select a photo or scan of your certificate from your computer"
                      : "Chọn ảnh chụp hoặc bản scan bằng cấp từ máy tính"}
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    {lang === "en"
                      ? "Supports JPG, PNG, WEBP — clear stamp and serial number required"
                      : "Hỗ trợ JPG, PNG, WEBP — cần rõ dấu mộc và số hiệu chứng chỉ"}
                  </p>
                  <div className="pt-1 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold border border-[#6B1F2E] text-[#6B1F2E] dark:border-[#FF7F6B] dark:text-[#FF7F6B] hover:bg-[#6B1F2E]/5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {lang === "en" ? "Choose file" : "Chọn ảnh từ máy"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScanUrl(DEFAULT_SCAN_PLACEHOLDER);
                        setScanFileName("ban-scan-chung-chi-mau.jpg");
                        setFormError(null);
                      }}
                      className="px-3 py-2 rounded-xl font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      {lang === "en"
                        ? "Use sample scan"
                        : "Dùng bản scan mẫu"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-bold border border-[#6B1F2E]/40 text-[#6B1F2E] dark:border-zinc-700 dark:text-zinc-300 hover:bg-[#6B1F2E]/5 cursor-pointer"
              >
                {lang === "en" ? "Cancel" : "Hủy"}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] cursor-pointer shadow-sm shadow-[#6B1F2E]/20"
              >
                <Send className="w-3.5 h-3.5 text-[#FF7F6B]" />
                <span>
                  {mode === "re_request"
                    ? lang === "en"
                      ? "Submit edit request"
                      : "Gửi yêu cầu duyệt lại"
                    : lang === "en"
                    ? "Submit for approval"
                    : "Gửi Admin duyệt"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

