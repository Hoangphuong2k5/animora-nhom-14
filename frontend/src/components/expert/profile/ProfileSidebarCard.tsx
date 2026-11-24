/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef } from "react";
import {
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  Mail,
  Phone,
  Scissors,
  ShieldCheck,
  Star,
  Stethoscope,
  X,
} from "lucide-react";
import { VetOnly } from "@/components/expert/VetOnly";
import { ExpertProfile } from "@/types/expert.type";
import { formatVietnameseDate } from "./profileUtils";
import { toast } from "sonner";

interface ProfileSidebarCardProps {
  profile: ExpertProfile;
  isVet: boolean;
  lang: "vi" | "en";
  roleLabel: string;
  officialDisplayFullName: string;
  savedYearsOfExperience: number;
  avgRating: string;
  completedCasesCount: number;
  avatarPreview: string | null;
  onChangeAvatarPreview: (dataUrl: string | null) => void;
  onConfirmAvatar: () => void;
}

export function ProfileSidebarCard({
  profile,
  isVet,
  lang,
  roleLabel,
  officialDisplayFullName,
  savedYearsOfExperience,
  avgRating,
  completedCasesCount,
  avatarPreview,
  onChangeAvatarPreview,
  onConfirmAvatar,
}: ProfileSidebarCardProps) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(
        lang === "en"
          ? "Please select a valid image file (JPG, PNG, WEBP)."
          : "Vui lòng chọn tệp ảnh hợp lệ (JPG, PNG, WEBP)."
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChangeAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3.5 lg:sticky lg:top-20 self-start">
      <div className="relative z-10 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/95 dark:bg-card/90 backdrop-blur-md shadow-xs p-5 flex flex-col items-center text-center space-y-2.5">
        {/* Hidden file input for Avatar */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleSelectAvatarFile}
          className="hidden"
        />

        {/* Compact Avatar with camera action button */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#6B1F2E]/20 dark:border-[#FF7F6B]/30 shadow-md bg-[#FAF6F0] dark:bg-[#3A1420]">
            <img
              src={avatarPreview || profile.avatar}
              alt={officialDisplayFullName}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            title={
              lang === "en" ? "Change avatar" : "Chọn ảnh đại diện từ máy"
            }
            aria-label={
              lang === "en" ? "Change avatar" : "Chọn ảnh đại diện từ máy"
            }
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#6B1F2E] text-white hover:bg-[#521723] dark:bg-[#FF7F6B] dark:text-zinc-950 dark:hover:bg-[#ff9482] flex items-center justify-center shadow-md border-2 border-white dark:border-card transition-transform hover:scale-105 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-[#FF7F6B] dark:text-zinc-950" />
          </button>
        </div>

        {/* Link "Đổi ảnh" hoặc nút Xác nhận / Hủy khi có ảnh xem trước */}
        {avatarPreview ? (
          <div className="w-full p-2.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#3A1420]/80 border border-[#6B1F2E]/20 dark:border-border space-y-2">
            <p className="text-[11px] font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
              {lang === "en"
                ? "Previewing new avatar"
                : "Xem trước ảnh đại diện mới"}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onConfirmAvatar}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-[#FF7F6B]" />
                <span>{lang === "en" ? "Confirm" : "Xác nhận"}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeAvatarPreview(null)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border border-[#6B1F2E] text-[#6B1F2E] dark:border-border dark:text-muted-foreground hover:bg-[#6B1F2E]/5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "Cancel" : "Hủy"}</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="text-[11px] font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline cursor-pointer"
          >
            {lang === "en" ? "Change photo" : "Đổi ảnh"}
          </button>
        )}

        <div>
          <h2 className="text-base font-extrabold font-heading text-zinc-900 dark:text-foreground">
            {officialDisplayFullName}
          </h2>
          <div className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/15 text-[#6B1F2E] dark:text-[#FF7F6B] border border-[#6B1F2E]/15 dark:border-[#FF7F6B]/30 tracking-wide">
              {isVet ? (
                <>
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{roleLabel}</span>
                </>
              ) : (
                <>
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{roleLabel}</span>
                </>
              )}
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide border bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
              <Briefcase className="w-3 h-3" />
              <span>Full-time • T2-T7 (08:00-17:00)</span>
            </span>
          </div>
        </div>

        {/* Ba chỉ số gọn trong thẻ danh thiếp */}
        <div className="w-full grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-[#FAF6F0]/90 dark:bg-[#3A1420]/80 border border-zinc-200/70 dark:border-border">
          <div className="flex flex-col items-center justify-center px-1 py-0.5">
            <div className="inline-flex items-center gap-1 text-xs font-extrabold text-zinc-900 dark:text-foreground">
              <span>{avgRating}</span>
              <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
            </div>
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-muted-foreground leading-tight mt-0.5">
              {lang === "en" ? "Avg rating" : "Đánh giá"}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-1 py-0.5 border-x border-zinc-200/80 dark:border-border">
            <span className="text-xs font-extrabold text-zinc-900 dark:text-foreground">
              {completedCasesCount}
            </span>
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-muted-foreground leading-tight mt-0.5">
              {lang === "en" ? "Cases done" : "Ca thực hiện"}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-1 py-0.5">
            <span className="text-xs font-extrabold text-zinc-900 dark:text-foreground">
              {savedYearsOfExperience} {lang === "en" ? "yrs" : "năm"}
            </span>
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-muted-foreground leading-tight mt-0.5">
              {lang === "en" ? "Experience" : "Kinh nghiệm"}
            </span>
          </div>
        </div>

        {/* Thông tin liên hệ */}
        <div className="w-full pt-2.5 border-t border-zinc-200/80 dark:border-border space-y-1.5 text-xs text-zinc-700 dark:text-foreground/90 text-left">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-zinc-400 dark:text-muted-foreground shrink-0" />
            <span className="truncate font-medium">{profile.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-zinc-400 dark:text-muted-foreground shrink-0" />
            <span className="font-medium">{profile.phone}</span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-muted-foreground pt-0.5">
            {lang === "en" ? "Joined Animora: " : "Gia nhập Animora: "}
            <strong className="font-bold text-zinc-900 dark:text-foreground">
              {formatVietnameseDate(profile.joinedAt)}
            </strong>
          </div>
        </div>
      </div>

      {/* [Bác sĩ] Thẻ Chứng chỉ hành nghề thú y (Read-Only) */}
      <VetOnly>
        <div className="relative z-10 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 bg-[#F2FBF6] dark:bg-emerald-950/20 shadow-xs p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {lang === "en"
                  ? "Practice license"
                  : "Chứng chỉ hành nghề thú y"}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700/60">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === "en" ? "Verified" : "Đã xác thực"}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-zinc-600 dark:text-muted-foreground font-medium">
              {lang === "en" ? "License No:" : "Số CCHN:"}
            </span>
            <span className="font-mono font-extrabold text-zinc-900 dark:text-foreground">
              {profile.licenseNumber || "CCHN-TY-79-002488"}
            </span>
          </div>
        </div>
      </VetOnly>
    </div>
  );
}
