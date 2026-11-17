import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useExpert } from "@/components/expert/ExpertProvider";
import { useExpertT } from "@/components/expert/expertI18n";
import { CertificateModalMode } from "@/components/expert/profile/CertificateModal";
import {
  normalizeVietnameseSentenceTitle,
  resolveYearsOfExperience,
  validateProfileForm,
} from "@/components/expert/profile/profileUtils";
import {
  formatExpertDisplayName,
  getExpertHonorificPrefix,
  SEED_EXPERTS,
  stripExpertPrefix,
} from "@/data/expertPortalData";
import { ExpertCertificate } from "@/types/expert.type";
import { pushManagerNotification } from "@/utils/clinicalSync";

export type ProfileWorkspaceTab = "info" | "certificates" | "security";

/**
 * Manages the Specialist Profile workspace state: profile form fields,
 * dirty-state detection, unsaved navigation guard, avatar preview, and certificates.
 */
export function useExpertProfileWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isVet, store, updateProfile } = useExpert();
  const { t, lang } = useExpertT();
  const profileFormRef = useRef<HTMLFormElement | null>(null);

  const [activeTab, setActiveTab] = useState<ProfileWorkspaceTab>("info");

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

  // Form States
  const [pureFullName, setPureFullName] = useState(savedPureFullName);
  const [phone, setPhone] = useState(profile.phone);
  const [yearsOfExperienceInput, setYearsOfExperienceInput] = useState(
    String(savedYearsOfExperience)
  );
  const [bio, setBio] = useState(profile.bio);
  const [specialties, setSpecialties] = useState<string[]>(savedSpecialties);

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Navigation guard & modals
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

  const avgRating = useMemo(() => {
    if (store.reviews.length === 0) return "4.9";
    const sum = store.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / store.reviews.length).toFixed(1);
  }, [store.reviews]);

  const completedCasesCount = useMemo(() => {
    return store.appointments.filter((a) => a.status === "completed").length;
  }, [store.appointments]);

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
      pushManagerNotification({
        type: "certificate",
        title: "Yêu cầu duyệt lại chứng chỉ",
        desc: `${profile.fullName} đã cập nhật và gửi lại "${certData.name}" (${certData.issuer} • ${certData.year}).`,
        href: "/manager/staff?tab=directory",
      });
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
      pushManagerNotification({
        type: "certificate",
        title: "Bằng cấp / chứng chỉ mới chờ duyệt",
        desc: `${profile.fullName} đã gửi "${certData.name}" (${certData.issuer} • ${certData.year}).`,
        href: "/manager/staff?tab=directory",
      });
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

  return {
    profile,
    isVet,
    lang,
    t,
    profileFormRef,
    activeTab,
    setActiveTab,
    savedYearsOfExperience,
    officialDisplayFullName,
    honorificPrefix,
    previewCombinedName,
    pureFullName,
    setPureFullName,
    phone,
    setPhone,
    yearsOfExperienceInput,
    setYearsOfExperienceInput,
    bio,
    setBio,
    specialties,
    setSpecialties,
    touchedFields,
    setTouchedFields,
    hasAttemptedSave,
    isSaving,
    isDirty,
    formErrors,
    avgRating,
    completedCasesCount,
    displayCertificates,
    rejectedCertsCount,
    pendingCertsCount,
    pendingNavHref,
    setPendingNavHref,
    avatarPreview,
    setAvatarPreview,
    certModalOpen,
    setCertModalOpen,
    certModalMode,
    setCertModalMode,
    selectedCert,
    setSelectedCert,
    handleResetUnsavedChanges,
    handleConfirmLeaveWithoutSaving,
    handleConfirmAvatar,
    handleSubmitCertificate,
    handleSaveProfile,
  };
}
