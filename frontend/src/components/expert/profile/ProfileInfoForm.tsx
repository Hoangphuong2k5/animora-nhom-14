"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { stripExpertPrefix } from "@/data/expertPortalData";
import {
  MAX_BIO_LENGTH,
  MAX_SPECIALTIES,
  ProfileFormErrors,
} from "./profileUtils";
import { toast } from "sonner";

interface ProfileInfoFormProps {
  formRef: React.RefObject<HTMLFormElement | null>;
  lang: "vi" | "en";
  email: string;
  honorificPrefix: string;
  previewCombinedName: string;
  pureFullName: string;
  phone: string;
  yearsOfExperienceInput: string;
  bio: string;
  specialties: string[];
  isDirty: boolean;
  isSaving: boolean;
  formErrors: ProfileFormErrors;
  touchedFields: Record<string, boolean>;
  hasAttemptedSave: boolean;
  onChangePureFullName: (val: string) => void;
  onChangePhone: (val: string) => void;
  onChangeYearsOfExperience: (val: string) => void;
  onChangeBio: (val: string) => void;
  onChangeSpecialties: React.Dispatch<React.SetStateAction<string[]>>;
  onMarkFieldTouched: (field: string) => void;
  onResetUnsavedChanges: () => void;
  onSubmitProfile: (e: React.FormEvent) => void;
}

export function ProfileInfoForm({
  formRef,
  lang,
  email,
  honorificPrefix,
  previewCombinedName,
  pureFullName,
  phone,
  yearsOfExperienceInput,
  bio,
  specialties,
  isDirty,
  isSaving,
  formErrors,
  touchedFields,
  hasAttemptedSave,
  onChangePureFullName,
  onChangePhone,
  onChangeYearsOfExperience,
  onChangeBio,
  onChangeSpecialties,
  onMarkFieldTouched,
  onResetUnsavedChanges,
  onSubmitProfile,
}: ProfileInfoFormProps) {
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);
  const [newSpecialtyInput, setNewSpecialtyInput] = useState("");
  const [specialtyWarning, setSpecialtyWarning] = useState<string | null>(null);

  const showNameError =
    (touchedFields.pureFullName || hasAttemptedSave) &&
    !!formErrors.pureFullName;
  const showPhoneError =
    (touchedFields.phone || hasAttemptedSave) && !!formErrors.phone;
  const showExpError =
    (touchedFields.yearsOfExperience || hasAttemptedSave) &&
    !!formErrors.yearsOfExperience;
  const showBioError =
    bio.length > MAX_BIO_LENGTH ||
    ((touchedFields.bio || hasAttemptedSave) && !!formErrors.bio);

  const handleRemoveSpecialty = (specToRemove: string) => {
    onChangeSpecialties((prev) => prev.filter((s) => s !== specToRemove));
    setSpecialtyWarning(null);
  };

  const handleOpenAddSpecialty = () => {
    if (specialties.length >= MAX_SPECIALTIES) {
      const msg =
        lang === "en"
          ? `Maximum of ${MAX_SPECIALTIES} specialties allowed.`
          : `Chỉ được thêm tối đa ${MAX_SPECIALTIES} chuyên môn nổi bật.`;
      setSpecialtyWarning(msg);
      toast.warning(msg);
      return;
    }
    setSpecialtyWarning(null);
    setIsAddingSpecialty(true);
  };

  const handleConfirmAddSpecialty = () => {
    const clean = newSpecialtyInput.trim();
    if (!clean) {
      setIsAddingSpecialty(false);
      return;
    }
    if (specialties.length >= MAX_SPECIALTIES) {
      const msg =
        lang === "en"
          ? `Maximum of ${MAX_SPECIALTIES} specialties reached.`
          : `Bạn đã đạt giới hạn tối đa ${MAX_SPECIALTIES} chuyên môn nổi bật.`;
      setSpecialtyWarning(msg);
      toast.warning(msg);
      return;
    }
    if (specialties.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      const msg =
        lang === "en"
          ? "This specialty already exists in your list."
          : "Chuyên môn này đã có trong danh sách.";
      setSpecialtyWarning(msg);
      return;
    }
    onChangeSpecialties((prev) => [...prev, clean]);
    setNewSpecialtyInput("");
    setSpecialtyWarning(null);
    setIsAddingSpecialty(false);
  };

  const handleSpecialtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirmAddSpecialty();
    } else if (e.key === "Escape") {
      setIsAddingSpecialty(false);
      setNewSpecialtyInput("");
      setSpecialtyWarning(null);
    }
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmitProfile}
      className="relative z-10 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/95 dark:bg-card/90 backdrop-blur-md shadow-xs p-5 sm:p-6 space-y-4 text-xs"
    >
      {/* Header + Quick Top Save Bar when dirty */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-100 dark:border-border">
        <div>
          <h3 className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-foreground">
            {lang === "en"
              ? "Professional introduction details"
              : "Thông tin giới thiệu chuyên môn"}
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-muted-foreground">
            {lang === "en"
              ? "Displayed publicly on your specialist profile when customers book services."
              : "Hiển thị công khai trên thẻ chuyên viên khi khách hàng tìm kiếm và đặt lịch."}
          </p>
        </div>

        {isDirty && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/70 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>
              {lang === "en" ? "Unsaved changes" : "Có thay đổi chưa lưu"}
            </span>
          </span>
        )}
      </div>

      {/* Hàng 1: Họ và tên thuần (kèm danh xưng tự suy) & Số điện thoại */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block font-bold text-zinc-700 dark:text-foreground/90">
            {lang === "en" ? "Full name *" : "Họ và tên *"}
          </label>
          <div
            className={`flex items-stretch rounded-xl border overflow-hidden bg-[#FAF6F0]/80 dark:bg-[#3A1420]/80 transition-colors focus-within:ring-2 ${
              showNameError
                ? "border-rose-500 focus-within:ring-rose-500/25 focus-within:border-rose-500"
                : "border-zinc-200/80 dark:border-border focus-within:ring-[#6B1F2E]/25 dark:focus-within:ring-[#FF7F6B]/30 focus-within:border-[#6B1F2E] dark:focus-within:border-[#FF7F6B]"
            }`}
          >
            <span
              title={
                lang === "en"
                  ? "Honorific title derived from specialist role"
                  : "Danh xưng tự động suy ra từ loại chuyên viên"
              }
              className="inline-flex items-center px-3 bg-[#6B1F2E]/10 dark:bg-[#5A2031] text-[#6B1F2E] dark:text-[#FF7F6B] font-extrabold text-xs border-r border-zinc-200/80 dark:border-border select-none shrink-0"
            >
              {honorificPrefix}
            </span>
            <input
              type="text"
              name="expert-full-name"
              autoComplete="name"
              value={pureFullName}
              onChange={(e) => {
                onChangePureFullName(e.target.value);
                onMarkFieldTouched("pureFullName");
              }}
              onBlur={() => {
                onMarkFieldTouched("pureFullName");
                const stripped = stripExpertPrefix(pureFullName);
                if (stripped !== pureFullName) {
                  onChangePureFullName(stripped);
                }
              }}
              placeholder={
                lang === "en"
                  ? "Enter pure full name (e.g. Lê Minh Khoa)"
                  : "Nhập họ tên thuần (VD: Lê Minh Khoa)"
              }
              className="w-full p-2.5 bg-transparent font-bold text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
          {showNameError ? (
            <p className="flex items-start gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{formErrors.pureFullName}</span>
            </p>
          ) : (
            <p className="text-[11px] text-zinc-500 dark:text-muted-foreground font-medium">
              {lang === "en"
                ? `Displayed as: ${previewCombinedName}`
                : `Hiển thị ghép danh xưng: ${previewCombinedName}`}
            </p>
          )}
        </div>

        {/* Số điện thoại */}
        <div className="space-y-1">
          <label className="block font-bold text-zinc-700 dark:text-foreground/90">
            {lang === "en" ? "Phone number *" : "Số điện thoại *"}
          </label>
          <input
            type="tel"
            name="expert-phone"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              onChangePhone(e.target.value);
              onMarkFieldTouched("phone");
            }}
            onBlur={() => onMarkFieldTouched("phone")}
            placeholder="0912 345 678"
            className={`w-full p-2.5 rounded-xl border bg-[#FAF6F0]/80 dark:bg-[#3A1420]/80 font-bold text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
              showPhoneError
                ? "border-rose-500 focus:ring-rose-500/25 focus:border-rose-500"
                : "border-zinc-200/80 dark:border-border focus:ring-[#6B1F2E]/25 dark:focus:ring-[#FF7F6B]/30 focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
            }`}
          />
          {showPhoneError ? (
            <p className="flex items-start gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{formErrors.phone}</span>
            </p>
          ) : (
            <p className="text-[11px] text-zinc-500 dark:text-muted-foreground font-medium">
              {lang === "en"
                ? "Standard 10-digit Vietnamese phone number"
                : "Định dạng 10 số Việt Nam (03, 05, 07, 08, 09 hoặc +84)"}
            </p>
          )}
        </div>
      </div>

      {/* Hàng 2: Email chỉ đọc & Số năm kinh nghiệm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block font-bold text-zinc-700 dark:text-foreground/90">
            {lang === "en" ? "Work email" : "Email tài khoản"}
          </label>
          <div className="relative">
            <input
              type="email"
              name="expert-email"
              autoComplete="email"
              readOnly
              value={email}
              className="w-full p-2.5 pr-9 rounded-xl border border-zinc-200/80 dark:border-border/70 bg-zinc-100 dark:bg-[#2A0C14]/70 font-semibold text-zinc-600 dark:text-muted-foreground cursor-not-allowed select-all"
            />
            <Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-muted-foreground font-medium">
            {lang === "en"
              ? "Contact Admin to change your email"
              : "Liên hệ Admin để đổi email"}
          </p>
        </div>

        <div className="space-y-1">
          <label className="block font-bold text-zinc-700 dark:text-foreground/90">
            {lang === "en"
              ? "Years of experience *"
              : "Số năm kinh nghiệm *"}
          </label>
          <div
            className={`flex items-stretch rounded-xl border overflow-hidden bg-[#FAF6F0]/80 dark:bg-[#3A1420]/80 transition-colors focus-within:ring-2 ${
              showExpError
                ? "border-rose-500 focus-within:ring-rose-500/25 focus-within:border-rose-500"
                : "border-zinc-200/80 dark:border-border focus-within:ring-[#6B1F2E]/25 dark:focus-within:ring-[#FF7F6B]/30 focus-within:border-[#6B1F2E] dark:focus-within:border-[#FF7F6B]"
            }`}
          >
            <input
              type="number"
              name="expert-years-of-experience"
              autoComplete="off"
              min={0}
              max={60}
              step={1}
              inputMode="numeric"
              value={yearsOfExperienceInput}
              onChange={(e) => {
                onChangeYearsOfExperience(e.target.value);
                onMarkFieldTouched("yearsOfExperience");
              }}
              onBlur={() => onMarkFieldTouched("yearsOfExperience")}
              placeholder="8"
              className="w-full p-2.5 bg-transparent font-bold text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <span className="inline-flex items-center px-3 bg-zinc-100 dark:bg-[#5A2031]/80 text-zinc-600 dark:text-foreground/80 font-semibold text-xs border-l border-zinc-200/80 dark:border-border select-none shrink-0">
              {lang === "en" ? "years" : "năm"}
            </span>
          </div>
          {showExpError ? (
            <p className="flex items-start gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{formErrors.yearsOfExperience}</span>
            </p>
          ) : (
            <p className="text-[11px] text-zinc-500 dark:text-muted-foreground font-medium">
              {lang === "en"
                ? "Shown on specialist cards when customers search"
                : "Dùng cho thẻ chuyên viên khi khách hàng tìm kiếm"}
            </p>
          )}
        </div>
      </div>

      {/* Chuyên môn nổi bật */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block font-bold text-zinc-700 dark:text-foreground/90">
            {lang === "en" ? "Key specialties" : "Chuyên môn nổi bật"}
          </label>
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-muted-foreground">
            {specialties.length}/{MAX_SPECIALTIES}{" "}
            {lang === "en" ? "tags" : "chuyên môn"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {specialties.map((spec) => (
            <span
              key={spec}
              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-semibold bg-[#6B1F2E]/10 text-[#6B1F2E] border border-[#6B1F2E]/20 dark:bg-[#FF7F6B]/15 dark:text-[#FF7F6B] dark:border-[#FF7F6B]/30"
            >
              <span>{spec}</span>
              <button
                type="button"
                onClick={() => handleRemoveSpecialty(spec)}
                title={
                  lang === "en" ? `Remove ${spec}` : `Xóa chuyên môn ${spec}`
                }
                aria-label={
                  lang === "en" ? `Remove ${spec}` : `Xóa chuyên môn ${spec}`
                }
                className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-[#6B1F2E]/20 dark:hover:bg-[#FF7F6B]/30 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {isAddingSpecialty ? (
            <div className="inline-flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                value={newSpecialtyInput}
                onChange={(e) => {
                  setNewSpecialtyInput(e.target.value);
                  setSpecialtyWarning(null);
                }}
                onKeyDown={handleSpecialtyKeyDown}
                placeholder={
                  lang === "en"
                    ? "Type & press Enter..."
                    : "Nhập chuyên môn, nhấn Enter..."
                }
                className="px-3 py-1 rounded-full border border-[#6B1F2E] dark:border-[#FF7F6B] bg-white dark:bg-[#3A1420] text-xs font-semibold text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#6B1F2E]/25 dark:focus:ring-[#FF7F6B]/30"
              />
              <button
                type="button"
                onClick={handleConfirmAddSpecialty}
                className="px-3 py-1 rounded-full text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] dark:bg-[#FF7F6B] dark:text-zinc-950 dark:hover:bg-[#ff9482] cursor-pointer"
              >
                {lang === "en" ? "Add" : "Thêm"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSpecialty(false);
                  setNewSpecialtyInput("");
                }}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-800 dark:hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddSpecialty}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border border-dashed border-[#6B1F2E]/40 dark:border-[#FF7F6B]/50 text-[#6B1F2E] dark:text-[#FF7F6B] hover:bg-[#6B1F2E]/5 dark:hover:bg-[#FF7F6B]/10 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {lang === "en" ? "Add specialty" : "Thêm chuyên môn"}
              </span>
            </button>
          )}
        </div>

        {specialtyWarning && (
          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 pt-0.5">
            {specialtyWarning}
          </p>
        )}
      </div>

      {/* Giới thiệu bản thân */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label className="block font-bold text-zinc-700 dark:text-foreground/90">
            {lang === "en"
              ? "Biography (Shown to customers when searching for specialists)"
              : "Giới thiệu bản thân (hiển thị cho khách khi tìm chuyên viên)"}
          </label>
          <span
            className={`text-[11px] font-bold shrink-0 ${
              bio.length > MAX_BIO_LENGTH
                ? "text-rose-600 dark:text-rose-400"
                : bio.length >= MAX_BIO_LENGTH * 0.9
                ? "text-amber-600 dark:text-amber-400"
                : "text-zinc-500 dark:text-muted-foreground"
            }`}
          >
            {bio.length}/{MAX_BIO_LENGTH} {lang === "en" ? "chars" : "ký tự"}
          </span>
        </div>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => {
            onChangeBio(e.target.value);
            onMarkFieldTouched("bio");
          }}
          onBlur={() => onMarkFieldTouched("bio")}
          placeholder={
            lang === "en"
              ? "Share your clinical expertise and pet care philosophy..."
              : "Chia sẻ thế mạnh chuyên môn và phong cách chăm sóc thú cưng..."
          }
          className={`w-full p-2.5 rounded-xl border bg-[#FAF6F0]/80 dark:bg-[#3A1420]/80 text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/60 leading-relaxed focus:outline-none focus:ring-2 ${
            showBioError
              ? "border-rose-500 focus:ring-rose-500/25 focus:border-rose-500"
              : "border-zinc-200/80 dark:border-border focus:ring-[#6B1F2E]/25 dark:focus:ring-[#FF7F6B]/30 focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
          }`}
        />
        {showBioError && formErrors.bio && (
          <p className="flex items-start gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{formErrors.bio}</span>
          </p>
        )}
      </div>

      {/* Nút Lưu nằm ngay dưới ô Giới thiệu bản thân — luôn thấy ngay trên màn hình! */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-border">
        {isDirty && !isSaving && (
          <button
            type="button"
            onClick={() => {
              setSpecialtyWarning(null);
              setIsAddingSpecialty(false);
              setNewSpecialtyInput("");
              onResetUnsavedChanges();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold border border-[#6B1F2E] text-[#6B1F2E] dark:border-border dark:text-foreground/80 hover:bg-[#6B1F2E]/5 dark:hover:bg-muted transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {lang === "en" ? "Discard changes" : "Hoàn tác thay đổi"}
            </span>
          </button>
        )}

        <button
          type="submit"
          disabled={!isDirty || isSaving}
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-sm ${
            !isDirty
              ? "bg-zinc-100 text-zinc-400 border border-zinc-200 dark:bg-[#3A1420] dark:text-[#E5BFC4]/40 dark:border-[#6E2E40]/60 cursor-not-allowed shadow-none"
              : isSaving
              ? "bg-[#6B1F2E] text-white opacity-80 cursor-wait dark:bg-[#7B2435]"
              : "bg-[#6B1F2E] text-white hover:bg-[#521723] dark:bg-[#FF7F6B] dark:text-zinc-950 dark:hover:bg-[#ff9482] shadow-[#6B1F2E]/20 dark:shadow-[#FF7F6B]/20"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 text-[#FF7F6B] dark:text-zinc-950 animate-spin" />
              <span>{lang === "en" ? "Saving..." : "Đang lưu..."}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#FF7F6B] dark:text-zinc-950" />
              <span>
                {lang === "en"
                  ? "Save profile changes"
                  : "Lưu thông tin hồ sơ"}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
