"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Award, KeyRound, UserCheck } from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { useExpertT } from "@/components/expert/expertI18n";
import {
  CertificateModal,
  CertificateModalMode,
} from "@/components/expert/profile/CertificateModal";
import { ProfileSidebarCard } from "@/components/expert/profile/ProfileSidebarCard";
import { ProfileInfoForm } from "@/components/expert/profile/ProfileInfoForm";
import { ProfileCertificatesPanel } from "@/components/expert/profile/ProfileCertificatesPanel";
import { PasswordSecurityForm } from "@/components/expert/profile/PasswordSecurityForm";
import { UnsavedChangesBarAndModal } from "@/components/expert/profile/UnsavedChangesBarAndModal";
import {
  normalizeVietnameseSentenceTitle,
  resolveYearsOfExperience,
  validateProfileForm,
} from "@/components/expert/profile/profileUtils";
import {
  SEED_EXPERTS,
  stripExpertPrefix,
  getExpertHonorificPrefix,
  formatExpertDisplayName,
} from "@/data/expertPortalData";
import { ExpertCertificate } from "@/types/expert.type";
import { toast } from "sonner";

type ProfileWorkspaceTab = "info" | "certificates" | "security";

export default function ExpertProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isVet, store, updateProfile } = useExpert();
  const { t, lang } = useExpertT();
  const profileFormRef = useRef<HTMLFormElement | null>(null);

  const [activeTab, setActiveTab] = useState<ProfileWorkspaceTab>("info");

  // Baseline saved values derived from profile
  const savedPureFullName = useMemo(
    () => stripExpertPrefix(profile.fullName),
    [profile.fullName]
  );
  const savedYearsOfExperience = useMemo(
    () => resolveYearsOfExperience(profile),
    [profile]
  );
  const savedSpecialties = useMemo(
    () => profile.specialties.map(normalizeVietnameseSentenceTitle),
    [profile.specialties]
  );

  const profileSnapshotKey = useMemo(
    () =>
      JSON.stringify({
        id: profile.id,
        fullName: savedPureFullName,
        phone: profile.phone,
        exp: savedYearsOfExperience,
        bio: profile.bio,
        specs: savedSpecialties,
      }),
    [
      profile.id,
      savedPureFullName,
      profile.phone,
      savedYearsOfExperience,
      profile.bio,
      savedSpecialties,
    ]
  );

  const [syncedSnapshotKey, setSyncedSnapshotKey] =
    useState(profileSnapshotKey);

  // Profile Form States
  const [pureFullName, setPureFullName] = useState(savedPureFullName);
  const [phone, setPhone] = useState(profile.phone);
  const [yearsOfExperienceInput, setYearsOfExperienceInput] = useState(
    String(savedYearsOfExperience)
  );
  const [bio, setBio] = useState(profile.bio);
  const [specialties, setSpecialties] = useState<string[]>(savedSpecialties);

  // Form validation & saving states
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Unsaved navigation guard & modals state
  const [pendingNavHref, setPendingNavHref] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certModalMode, setCertModalMode] =
    useState<CertificateModalMode>("add");
  const [selectedCert, setSelectedCert] = useState<ExpertCertificate | null>(
    null
  );

  // Sync form state when stored profile hydrates from localStorage or active expert switches
  if (syncedSnapshotKey !== profileSnapshotKey) {
    setSyncedSnapshotKey(profileSnapshotKey);
    setPureFullName(savedPureFullName);
    setPhone(profile.phone);
    setYearsOfExperienceInput(String(savedYearsOfExperience));
    setBio(profile.bio);
    setSpecialties(savedSpecialties);
    setTouchedFields({});
    setHasAttemptedSave(false);
  }

  const honorificPrefix = getExpertHonorificPrefix(profile.expertType, lang);
  const officialDisplayFullName = formatExpertDisplayName(
    profile.fullName,
    profile.expertType,
    lang
  );
  const previewCombinedName = formatExpertDisplayName(
    pureFullName || savedPureFullName,
    profile.expertType,
    lang
  );

  // Enrich certificates with seed status/rejectReason if localStorage had older schema
  const displayCertificates = useMemo<ExpertCertificate[]>(() => {
    const seedCerts = SEED_EXPERTS[profile.id]?.certificates || [];
    const currentIds = new Set(profile.certificates.map((c) => c.id));
    const enrichedExisting = profile.certificates.map((c) => {
      const matchedSeed = seedCerts.find((s) => s.id === c.id);
      return {
        ...matchedSeed,
        ...c,
        name: normalizeVietnameseSentenceTitle(c.name),
        status: c.status || matchedSeed?.status || "approved",
        scanUrl: c.scanUrl || matchedSeed?.scanUrl,
        rejectReason: c.rejectReason ?? matchedSeed?.rejectReason,
      };
    });
    const missingSeedCerts = seedCerts.filter((s) => !currentIds.has(s.id));
    return [...enrichedExisting, ...missingSeedCerts];
  }, [profile.id, profile.certificates]);

  const rejectedCertsCount = useMemo(
    () => displayCertificates.filter((c) => c.status === "rejected").length,
    [displayCertificates]
  );
  const pendingCertsCount = useMemo(
    () => displayCertificates.filter((c) => c.status === "pending").length,
    [displayCertificates]
  );

  // Check dirty state & form errors
  const isDirty = useMemo(() => {
    const cleanCurrentName = stripExpertPrefix(pureFullName).trim();
    const cleanSavedName = savedPureFullName.trim();
    const isSpecialtiesChanged =
      specialties.length !== savedSpecialties.length ||
      specialties.some((s, idx) => s !== savedSpecialties[idx]);

    return (
      cleanCurrentName !== cleanSavedName ||
      phone.trim() !== profile.phone.trim() ||
      yearsOfExperienceInput.trim() !== String(savedYearsOfExperience) ||
      bio !== profile.bio ||
      isSpecialtiesChanged
    );
  }, [
    pureFullName,
    savedPureFullName,
    phone,
    profile.phone,
    yearsOfExperienceInput,
    savedYearsOfExperience,
    bio,
    profile.bio,
    specialties,
    savedSpecialties,
  ]);

  const formErrors = useMemo(
    () =>
      validateProfileForm(
        pureFullName,
        phone,
        yearsOfExperienceInput,
        bio,
        lang
      ),
    [pureFullName, phone, yearsOfExperienceInput, bio, lang]
  );

  // Metrics for left sidebar card
  const avgRating = useMemo(() => {
    if (store.reviews.length === 0) return "4.9";
    const sum = store.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / store.reviews.length).toFixed(1);
  }, [store.reviews]);

  const completedCasesCount = useMemo(() => {
    const baseCases = isVet ? 142 : 196;
    const completedInStore = store.appointments.filter(
      (a) => a.status === "completed"
    ).length;
    return baseCases + completedInStore;
  }, [isVet, store.appointments]);

  // Warn when leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        anchor.target === "_blank"
      ) {
        return;
      }

      const targetUrl = new URL(href, window.location.origin);
      if (
        targetUrl.origin === window.location.origin &&
        targetUrl.pathname === pathname
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setPendingNavHref(href);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () =>
      document.removeEventListener("click", handleDocumentClick, true);
  }, [isDirty, pathname]);

  const handleResetUnsavedChanges = () => {
    setPureFullName(savedPureFullName);
    setPhone(profile.phone);
    setYearsOfExperienceInput(String(savedYearsOfExperience));
    setBio(profile.bio);
    setSpecialties(savedSpecialties);
    setTouchedFields({});
    setHasAttemptedSave(false);
  };

  const handleConfirmLeaveWithoutSaving = () => {
    const targetHref = pendingNavHref;
    setPendingNavHref(null);
    handleResetUnsavedChanges();
    if (targetHref) {
      router.push(targetHref);
    }
  };

  const handleConfirmAvatar = () => {
    if (!avatarPreview) return;
    updateProfile({ avatar: avatarPreview }, { silent: true });
    toast.success(
      lang === "en"
        ? "Avatar updated successfully"
        : "Đã cập nhật ảnh đại diện"
    );
    setAvatarPreview(null);
  };

  const handleSubmitCertificate = (
    certData: Omit<ExpertCertificate, "id" | "status" | "rejectReason">,
    existingId?: string
  ) => {
    if (existingId) {
      const updatedList = displayCertificates.map((c) =>
        c.id === existingId
          ? {
              ...c,
              ...certData,
              status: "pending" as const,
              rejectReason: undefined,
            }
          : c
      );
      updateProfile({ certificates: updatedList }, { silent: true });
    } else {
      const newCert: ExpertCertificate = {
        id: `cert-${Date.now()}`,
        ...certData,
        status: "pending",
      };
      updateProfile(
        { certificates: [...displayCertificates, newCert] },
        { silent: true }
      );
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasAttemptedSave(true);

    if (Object.keys(formErrors).length > 0) {
      setActiveTab("info");
      toast.error(
        lang === "en"
          ? "Could not save profile. Please fix the highlighted fields below."
          : "Không thể lưu hồ sơ. Vui lòng kiểm tra lại các trường báo lỗi bên dưới."
      );
      return;
    }

    if (!isDirty || isSaving) return;

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const cleanPureName = stripExpertPrefix(pureFullName).trim();
      const parsedExp = Number(yearsOfExperienceInput.trim());

      updateProfile(
        {
          fullName: formatExpertDisplayName(
            cleanPureName,
            profile.expertType,
            "vi"
          ),
          phone: phone.trim(),
          yearsOfExperience: parsedExp,
          bio: bio.trim(),
          specialties,
          certificates: displayCertificates,
        },
        { silent: true }
      );

      setPureFullName(cleanPureName);
      setPhone(phone.trim());
      setYearsOfExperienceInput(String(parsedExp));
      setBio(bio.trim());
      setTouchedFields({});
      setHasAttemptedSave(false);

      toast.success(lang === "en" ? "Profile saved" : "Đã lưu hồ sơ");
    } catch {
      toast.error(
        lang === "en"
          ? "An unexpected error occurred while saving your profile. Please try again."
          : "Đã xảy ra lỗi khi lưu hồ sơ. Vui lòng thử lại sau."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`relative z-10 space-y-5 max-w-6xl ${
        isDirty ? "pb-24 md:pb-0" : ""
      }`}
    >
      {/* Compact Header */}
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
        {/* Cột trái (4/12): Thẻ danh thiếp + 3 chỉ số + Thẻ Chứng chỉ hành nghề */}
        <div className="lg:col-span-4">
          <ProfileSidebarCard
            profile={profile}
            isVet={isVet}
            lang={lang}
            roleLabel={isVet ? t.vetRoleLabel : t.groomerRoleLabel}
            officialDisplayFullName={officialDisplayFullName}
            savedYearsOfExperience={savedYearsOfExperience}
            avgRating={avgRating}
            completedCasesCount={completedCasesCount}
            avatarPreview={avatarPreview}
            onChangeAvatarPreview={setAvatarPreview}
            onConfirmAvatar={handleConfirmAvatar}
          />
        </div>

        {/* Cột phải (8/12): Thanh Điều Hướng 3 Tab + Nội Dung Từng Tab (Không cần cuộn dài) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Segmented 3-Tab Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-200/70 dark:bg-muted border border-zinc-200/90 dark:border-border">
            {/* Tab 1: Thông tin chuyên môn */}
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "info"
                  ? "bg-[#6B1F2E] text-white shadow-sm"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-card"
              }`}
            >
              <span className="inline-flex items-center gap-2 truncate">
                <UserCheck className="w-4 h-4 shrink-0 text-[#FF7F6B]" />
                <span className="truncate">
                  {lang === "en" ? "Profile Info" : "Thông tin chuyên môn"}
                </span>
              </span>
              {isDirty && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold shrink-0 ${
                    activeTab === "info"
                      ? "bg-amber-400 text-zinc-950"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {lang === "en" ? "Unsaved" : "Chưa lưu"}
                </span>
              )}
            </button>

            {/* Tab 2: Bằng cấp & Chứng chỉ (kèm Smart Badge báo số chứng chỉ bị từ chối / chờ duyệt) */}
            <button
              type="button"
              onClick={() => setActiveTab("certificates")}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "certificates"
                  ? "bg-[#6B1F2E] text-white shadow-sm"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-card"
              }`}
            >
              <span className="inline-flex items-center gap-2 truncate">
                <Award className="w-4 h-4 shrink-0 text-[#FF7F6B]" />
                <span className="truncate">
                  {lang === "en"
                    ? `Certificates (${displayCertificates.length})`
                    : `Bằng cấp (${displayCertificates.length})`}
                </span>
              </span>

              {rejectedCertsCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500 text-white shrink-0">
                  {rejectedCertsCount} {lang === "en" ? "rejected" : "từ chối"}
                </span>
              ) : pendingCertsCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-white shrink-0">
                  {pendingCertsCount} {lang === "en" ? "pending" : "chờ duyệt"}
                </span>
              ) : null}
            </button>

            {/* Tab 3: Bảo mật & Mật khẩu */}
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-[#6B1F2E] text-white shadow-sm"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-card"
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

          {/* Active Tab Content */}
          {activeTab === "info" && (
            <ProfileInfoForm
              formRef={profileFormRef}
              lang={lang}
              email={profile.email}
              honorificPrefix={honorificPrefix}
              previewCombinedName={previewCombinedName}
              pureFullName={pureFullName}
              phone={phone}
              yearsOfExperienceInput={yearsOfExperienceInput}
              bio={bio}
              specialties={specialties}
              isDirty={isDirty}
              isSaving={isSaving}
              formErrors={formErrors}
              touchedFields={touchedFields}
              hasAttemptedSave={hasAttemptedSave}
              onChangePureFullName={setPureFullName}
              onChangePhone={setPhone}
              onChangeYearsOfExperience={setYearsOfExperienceInput}
              onChangeBio={setBio}
              onChangeSpecialties={setSpecialties}
              onMarkFieldTouched={(field) =>
                setTouchedFields((prev) =>
                  prev[field] ? prev : { ...prev, [field]: true }
                )
              }
              onResetUnsavedChanges={handleResetUnsavedChanges}
              onSubmitProfile={handleSaveProfile}
            />
          )}

          {activeTab === "certificates" && (
            <ProfileCertificatesPanel
              lang={lang}
              displayCertificates={displayCertificates}
              onOpenAddCertificate={() => {
                setSelectedCert(null);
                setCertModalMode("add");
                setCertModalOpen(true);
              }}
              onOpenViewCertificate={(cert) => {
                setSelectedCert(cert);
                setCertModalMode("view");
                setCertModalOpen(true);
              }}
              onOpenReRequestCertificate={(cert) => {
                setSelectedCert(cert);
                setCertModalMode("re_request");
                setCertModalOpen(true);
              }}
            />
          )}

          {activeTab === "security" && (
            <PasswordSecurityForm email={profile.email} lang={lang} />
          )}
        </div>
      </div>

      {/* Thanh lưu cố định ở đáy Mobile & Hộp thoại cảnh báo rời trang khi chưa lưu */}
      <UnsavedChangesBarAndModal
        isDirty={isDirty}
        isSaving={isSaving}
        lang={lang}
        pendingNavHref={pendingNavHref}
        onDiscardChanges={handleResetUnsavedChanges}
        onSaveClick={() => handleSaveProfile()}
        onCancelLeave={() => setPendingNavHref(null)}
        onConfirmLeaveWithoutSaving={handleConfirmLeaveWithoutSaving}
      />

      {/* Hộp thoại Thêm / Xem / Gửi yêu cầu sửa Bằng cấp & Chứng chỉ */}
      <CertificateModal
        key={`${certModalMode}-${selectedCert?.id || "new"}-${certModalOpen}`}
        isOpen={certModalOpen}
        mode={certModalMode}
        certificate={selectedCert}
        lang={lang}
        onClose={() => setCertModalOpen(false)}
        onSwitchToReRequest={() => setCertModalMode("re_request")}
        onSubmitCertificate={handleSubmitCertificate}
      />
    </div>
  );
}
