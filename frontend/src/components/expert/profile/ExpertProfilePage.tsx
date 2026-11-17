"use client";

import React from "react";
import { Award, KeyRound, UserCheck } from "lucide-react";
import { useExpertProfileWorkspace } from "@/hooks/expert/useExpertProfileWorkspace";
import { CertificateModal } from "./CertificateModal";
import { ProfileSidebarCard } from "./ProfileSidebarCard";
import { ProfileInfoForm } from "./ProfileInfoForm";
import { ProfileCertificatesPanel } from "./ProfileCertificatesPanel";
import { PasswordSecurityForm } from "./PasswordSecurityForm";
import { UnsavedChangesBarAndModal } from "./UnsavedChangesBarAndModal";

/** Main specialist profile and practice license page component. */
export function ExpertProfilePage() {
  const vm = useExpertProfileWorkspace();
  const { lang, t, profile } = vm;

  return (
    <div
      className={`relative z-10 space-y-5 max-w-6xl ${
        vm.isDirty ? "pb-24 md:pb-0" : ""
      }`}
    >
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
          {lang === "en"
            ? "Specialist profile and practice license"
            : "Hồ sơ cá nhân và chứng chỉ hành nghề"}
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
          {lang === "en"
            ? "Manage public profile details shown to pet owners and verify professional credentials."
            : "Quản lý thông tin hiển thị với khách hàng, bằng cấp chuyên môn và bảo mật tài khoản."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4">
          <ProfileSidebarCard
            profile={profile}
            isVet={vm.isVet}
            lang={lang}
            roleLabel={vm.isVet ? t.vetRoleLabel : t.groomerRoleLabel}
            officialDisplayFullName={vm.officialDisplayFullName}
            savedYearsOfExperience={vm.savedYearsOfExperience}
            avgRating={vm.avgRating}
            completedCasesCount={vm.completedCasesCount}
            avatarPreview={vm.avatarPreview}
            onChangeAvatarPreview={vm.setAvatarPreview}
            onConfirmAvatar={vm.handleConfirmAvatar}
          />
        </div>

        <div className="lg:col-span-8 space-y-4">
          {/* Segmented 3-Tab Bar - Capsule shape matching standard Animora Tabs */}
          <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-1.5 p-1.5 rounded-2xl sm:rounded-full bg-[#f1f3f6] dark:bg-muted/80 border border-zinc-200/80 dark:border-border shadow-xs">
            <button
              type="button"
              onClick={() => vm.setActiveTab("info")}
              className={`flex items-center justify-between gap-2 px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
                vm.activeTab === "info"
                  ? "bg-[#6B1F2E] text-white shadow-sm dark:bg-[#7B2435] dark:text-white dark:border dark:border-[#FF7F6B]/40 dark:shadow-md dark:shadow-[#FF7F6B]/15"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-foreground hover:bg-white/70 dark:hover:bg-card/70"
              }`}
            >
              <span className="inline-flex items-center gap-2 truncate">
                <UserCheck className="w-4 h-4 shrink-0 text-[#FF7F6B]" />
                <span className="truncate">
                  {lang === "en" ? "Profile Info" : "Thông tin chuyên môn"}
                </span>
              </span>
              {vm.isDirty && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold shrink-0 ${
                    vm.activeTab === "info"
                      ? "bg-amber-400 text-zinc-950"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-700/50"
                  }`}
                >
                  {lang === "en" ? "Unsaved" : "Chưa lưu"}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => vm.setActiveTab("certificates")}
              className={`flex items-center justify-between gap-2 px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
                vm.activeTab === "certificates"
                  ? "bg-[#6B1F2E] text-white shadow-sm dark:bg-[#7B2435] dark:text-white dark:border dark:border-[#FF7F6B]/40 dark:shadow-md dark:shadow-[#FF7F6B]/15"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-foreground hover:bg-white/70 dark:hover:bg-card/70"
              }`}
            >
              <span className="inline-flex items-center gap-2 truncate">
                <Award className="w-4 h-4 shrink-0 text-[#FF7F6B]" />
                <span className="truncate">
                  {lang === "en"
                    ? `Certificates (${vm.displayCertificates.length})`
                    : `Bằng cấp (${vm.displayCertificates.length})`}
                </span>
              </span>

              {vm.rejectedCertsCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500 text-white shrink-0">
                  {vm.rejectedCertsCount} {lang === "en" ? "rejected" : "từ chối"}
                </span>
              ) : vm.pendingCertsCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-zinc-950 shrink-0 shadow-xs">
                  {vm.pendingCertsCount} {lang === "en" ? "pending" : "chờ duyệt"}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => vm.setActiveTab("security")}
              className={`flex items-center justify-between gap-2 px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all cursor-pointer ${
                vm.activeTab === "security"
                  ? "bg-[#6B1F2E] text-white shadow-sm dark:bg-[#7B2435] dark:text-white dark:border dark:border-[#FF7F6B]/40 dark:shadow-md dark:shadow-[#FF7F6B]/15"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-foreground hover:bg-white/70 dark:hover:bg-card/70"
              }`}
            >
              <span className="inline-flex items-center gap-2 truncate">
                <KeyRound className="w-4 h-4 shrink-0 text-[#FF7F6B]" />
                <span className="truncate">
                  {lang === "en" ? "Security & Password" : "Bảo mật & Mật khẩu"}
                </span>
              </span>
            </button>
          </div>

          {vm.activeTab === "info" && (
            <ProfileInfoForm
              formRef={vm.profileFormRef}
              lang={lang}
              email={profile.email}
              honorificPrefix={vm.honorificPrefix}
              previewCombinedName={vm.previewCombinedName}
              pureFullName={vm.pureFullName}
              phone={vm.phone}
              yearsOfExperienceInput={vm.yearsOfExperienceInput}
              bio={vm.bio}
              specialties={vm.specialties}
              isDirty={vm.isDirty}
              isSaving={vm.isSaving}
              formErrors={vm.formErrors}
              touchedFields={vm.touchedFields}
              hasAttemptedSave={vm.hasAttemptedSave}
              onChangePureFullName={vm.setPureFullName}
              onChangePhone={vm.setPhone}
              onChangeYearsOfExperience={vm.setYearsOfExperienceInput}
              onChangeBio={vm.setBio}
              onChangeSpecialties={vm.setSpecialties}
              onMarkFieldTouched={(field) =>
                vm.setTouchedFields((prev) =>
                  prev[field] ? prev : { ...prev, [field]: true }
                )
              }
              onResetUnsavedChanges={vm.handleResetUnsavedChanges}
              onSubmitProfile={vm.handleSaveProfile}
            />
          )}

          {vm.activeTab === "certificates" && (
            <ProfileCertificatesPanel
              lang={lang}
              displayCertificates={vm.displayCertificates}
              onOpenAddCertificate={() => {
                vm.setSelectedCert(null);
                vm.setCertModalMode("add");
                vm.setCertModalOpen(true);
              }}
              onOpenViewCertificate={(cert) => {
                vm.setSelectedCert(cert);
                vm.setCertModalMode("view");
                vm.setCertModalOpen(true);
              }}
              onOpenReRequestCertificate={(cert) => {
                vm.setSelectedCert(cert);
                vm.setCertModalMode("re_request");
                vm.setCertModalOpen(true);
              }}
            />
          )}

          {vm.activeTab === "security" && (
            <PasswordSecurityForm email={profile.email} lang={lang} />
          )}
        </div>
      </div>

      <UnsavedChangesBarAndModal
        isDirty={vm.isDirty}
        isSaving={vm.isSaving}
        lang={lang}
        pendingNavHref={vm.pendingNavHref}
        onDiscardChanges={vm.handleResetUnsavedChanges}
        onSaveClick={() => vm.handleSaveProfile()}
        onCancelLeave={() => vm.setPendingNavHref(null)}
        onConfirmLeaveWithoutSaving={vm.handleConfirmLeaveWithoutSaving}
      />

      <CertificateModal
        key={`${vm.certModalMode}-${vm.selectedCert?.id || "new"}-${
          vm.certModalOpen
        }`}
        isOpen={vm.certModalOpen}
        mode={vm.certModalMode}
        certificate={vm.selectedCert}
        lang={lang}
        onClose={() => vm.setCertModalOpen(false)}
        onSwitchToReRequest={() => vm.setCertModalMode("re_request")}
        onSubmitCertificate={vm.handleSubmitCertificate}
      />
    </div>
  );
}
