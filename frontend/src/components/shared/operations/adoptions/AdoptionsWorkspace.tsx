"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import { findConflictingApprovedAdoptionRequest } from "@/utils/adoptionFormLogic";
import {
  confirmAdoptionHandoverApi,
  fetchAllAdoptionApplicationsApi,
  reviewAdoptionApplicationApi,
} from "@/services/animora/adoptionApi";
import { ApiClientError, isBusinessConflictOrValidationError } from "@/services/animora/apiClient";
import { AdoptionPet, AdoptionRequest } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShelterPartner,
  ExtendedAdoptionPet,
  NewPetFormState,
  INITIAL_SHELTERS,
  INITIAL_NEW_PET,
  SAMPLE_ADOPTION_REQUESTS,
  seedInitialAdoptionPets,
  createAdoptionPetRecord,
  createShelterPartnerRecord,
  canTransitionAdoptionRequest,
} from "@/components/manager/adoptions/managerAdoptionsData";
import {
  ShelterPartnersTab,
  AdoptionPetsCatalogTab,
} from "@/components/manager/adoptions/AdoptionPetsCatalogTab";
import { AdoptionRequestsTab } from "@/components/manager/adoptions/AdoptionRequestsTab";
import {
  ADOPTION_SYNC_EVENT,
  loadRescueShelters,
  saveRescueShelters,
  syncAdoptedPetToCustomerProfiles,
} from "@/data/rescuePortalData";

export type { ShelterPartner, ExtendedAdoptionPet };

export interface AdoptionsWorkspaceProps {
  mode?: "manager" | "readonly";
}

function AdoptionsWorkspaceContent({ mode = "manager" }: AdoptionsWorkspaceProps) {
  const isReadOnly = mode === "readonly";
  const searchParams = useSearchParams();
  const defaultTab =
    (searchParams.get("tab") as "shelters" | "pets" | "requests") || "shelters";

  const [activeTab, setActiveTab] = useState<"shelters" | "pets" | "requests">(defaultTab);
  const [shelters, setShelters] = useState<ShelterPartner[]>(INITIAL_SHELTERS);
  const [pets, setPets] = useState<ExtendedAdoptionPet[]>([]);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Form States (active in manager mode)
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [isAddShelterModalOpen, setIsAddShelterModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<AdoptionRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [newPet, setNewPet] = useState<NewPetFormState>(INITIAL_NEW_PET);
  const [newShelterName, setNewShelterName] = useState("");
  const [newShelterAddress, setNewShelterAddress] = useState("");
  const [newShelterContact, setNewShelterContact] = useState("");
  const [newShelterPhone, setNewShelterPhone] = useState("");

  useEffect(() => {
    const syncAll = () => {
      setShelters(loadRescueShelters());
      const savedPets = safeGetStorage<ExtendedAdoptionPet[]>("animora_adoption_pets_v2", []);
      if (Array.isArray(savedPets) && savedPets.length > 0) {
        setPets(savedPets);
      } else {
        const seeded = seedInitialAdoptionPets();
        setPets(seeded);
        safeSetStorage("animora_adoption_pets_v2", seeded);
      }

      const savedRequests = safeGetStorage<AdoptionRequest[]>("animora_adoption_requests_v2", []);
      if (Array.isArray(savedRequests) && savedRequests.length > 0) {
        setRequests(savedRequests);
      } else {
        setRequests(SAMPLE_ADOPTION_REQUESTS);
        safeSetStorage("animora_adoption_requests_v2", SAMPLE_ADOPTION_REQUESTS);
      }

      fetchAllAdoptionApplicationsApi()
        .then((apiApps) => {
          if (Array.isArray(apiApps) && apiApps.length > 0) {
            const mapped: AdoptionRequest[] = apiApps.map((a) => ({
              id: String(a.id),
              requestCode: `ADP-${a.id}`,
              petId: String(a.listing_id),
              petName: a.pet_name || a.listing_title || "Thú cưng",
              applicantName: a.customer_name || "Khách hàng",
              phone: a.customer_phone || "",
              email: a.customer_email || "",
              notes: a.applicant_reason || a.review_note || "",
              status:
                a.status === "UnderReview"
                  ? "reviewing"
                  : a.status === "Approved"
                  ? "approved"
                  : a.status === "Completed"
                  ? "completed"
                  : a.status === "Rejected"
                  ? "rejected"
                  : "pending",
              createdAt: a.created_at || new Date().toISOString(),
            }));
            setRequests(mapped);
            safeSetStorage("animora_adoption_requests_v2", mapped);
          }
        })
        .catch(() => {
          // Keep localStorage requests when offline or unauthenticated
        });
    };
    syncAll();
    window.addEventListener(ADOPTION_SYNC_EVENT, syncAll);
    window.addEventListener("storage", syncAll);
    return () => {
      window.removeEventListener(ADOPTION_SYNC_EVENT, syncAll);
      window.removeEventListener("storage", syncAll);
    };
  }, []);

  const savePets = (updated: ExtendedAdoptionPet[]) => {
    if (isReadOnly) return;
    setPets(updated);
    safeSetStorage("animora_adoption_pets_v2", updated);
    window.dispatchEvent(new Event(ADOPTION_SYNC_EVENT));
  };

  const saveRequests = (updated: AdoptionRequest[]) => {
    if (isReadOnly) return;
    setRequests(updated);
    safeSetStorage("animora_adoption_requests_v2", updated);
    window.dispatchEvent(new Event(ADOPTION_SYNC_EVENT));
  };

  const handleTogglePetStatus = (petId: string) => {
    if (isReadOnly) return;
    const updated = pets.map((p) => {
      if (p.id === petId) {
        const nextStatus: AdoptionPet["status"] =
          p.status === "adopted" ? "available" : "adopted";
        return { ...p, status: nextStatus };
      }
      return p;
    });
    savePets(updated);
    toast.success("Đã cập nhật trạng thái nhận nuôi của bé!");
  };

  const handleProcessRequest = async (
    requestId: string,
    nextStatus: "pending" | "reviewing" | "approved" | "completed" | "rejected",
    extraNote?: string
  ) => {
    if (isReadOnly) return;
    const currentReq = requests.find((r) => r.id === requestId);
    if (!currentReq || !canTransitionAdoptionRequest(currentReq.status, nextStatus)) {
      toast.error("Trạng thái hồ sơ không hợp lệ cho thao tác này!");
      return;
    }

    if (nextStatus === "approved" || nextStatus === "completed") {
      const conflict = findConflictingApprovedAdoptionRequest(
        requests,
        currentReq.petId,
        currentReq.id
      );
      if (conflict) {
        toast.error(
          `Bé ${currentReq.petName} đã có hồ sơ khác được duyệt (${conflict.requestCode || conflict.id}). Không thể duyệt trùng!`
        );
        return;
      }
    }

    const numericAppId = Number(requestId);
    if (Number.isInteger(numericAppId) && numericAppId > 0) {
      try {
        if (nextStatus === "completed") {
          await confirmAdoptionHandoverApi(numericAppId, extraNote);
        } else if (nextStatus === "reviewing" || nextStatus === "approved" || nextStatus === "rejected") {
          const apiStatus =
            nextStatus === "reviewing"
              ? "UnderReview"
              : nextStatus === "approved"
              ? "Approved"
              : "Rejected";
          await reviewAdoptionApplicationApi(numericAppId, apiStatus, extraNote);
        }
      } catch (err) {
        if (isBusinessConflictOrValidationError(err)) {
          toast.error(err.message);
          return;
        }
        if (!(err instanceof ApiClientError && (err.statusCode === 401 || err.isNetworkError))) {
          toast.error("Không thể cập nhật hồ sơ nhận nuôi trên máy chủ.");
          return;
        }
      }
    }

    let petIdToAdopt: string | undefined;
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        if (nextStatus === "completed") petIdToAdopt = r.petId;
        return {
          ...r,
          status: nextStatus,
          notes: extraNote
            ? `${r.notes ? r.notes + "\n" : ""}[${formatDateDdMmYyyy(new Date())}]: ${extraNote}`
            : r.notes,
        };
      }
      return r;
    });
    saveRequests(updated);

    if (nextStatus === "completed" && petIdToAdopt) {
      const targetPet = pets.find((p) => p.id === petIdToAdopt);
      const targetReq = updated.find((r) => r.id === requestId);
      const updatedPets = pets.map((p) =>
        p.id === petIdToAdopt ? { ...p, status: "adopted" as const } : p
      );
      savePets(updatedPets);
      const syncResult = syncAdoptedPetToCustomerProfiles(
        targetPet,
        targetReq?.applicantName || "Khách hàng nhận nuôi"
      );
      toast.success(
        syncResult.action === "linked"
          ? "Đã hoàn tất bàn giao và liên kết hồ sơ thú cưng hiện có sang chủ mới!"
          : "Đã hoàn tất bàn giao bé cưng cho chủ mới và tạo hồ sơ thú cưng!"
      );
    } else if (nextStatus === "reviewing") {
      toast.info("Đã lên lịch hẹn phỏng vấn ứng viên nhận nuôi!");
    } else if (nextStatus === "approved") {
      toast.success("Đã duyệt hồ sơ đạt yêu cầu! Sẵn sàng bàn giao thú cưng.");
    } else if (nextStatus === "rejected") {
      toast.info("Đã từ chối hồ sơ xin nhận nuôi.");
    }
    setIsReviewModalOpen(false);
  };

  const handleResetRequestHistory = (requestId: string) => {
    if (isReadOnly) return;
    let nextSelected: AdoptionRequest | null = null;
    const updated = requests.map((r) => {
      if (r.id !== requestId) return r;
      const firstLogIdx = r.notes?.search(/\[(?:TCH\s*·\s*)?\d{2}-\d{2}-\d{4}\]:/) ?? -1;
      const cleanNotes =
        firstLogIdx >= 0 ? (r.notes ?? "").slice(0, firstLogIdx).trim() : r.notes;
      const resetReq: AdoptionRequest = {
        ...r,
        status: "pending",
        notes: cleanNotes,
      };
      nextSelected = resetReq;
      return resetReq;
    });
    saveRequests(updated);
    if (nextSelected) setSelectedReq(nextSelected);
    toast.success("Đã xóa lịch sử xử lý và đưa hồ sơ về trạng thái Chờ duyệt!");
  };

  const handleCreatePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!newPet.name.trim()) {
      toast.error("Vui lòng nhập tên bé thú cưng.");
      return;
    }
    savePets([createAdoptionPetRecord(newPet), ...pets]);
    setIsAddPetModalOpen(false);
    toast.success(`Đã thêm bé ${newPet.name} vào danh sách tìm mái ấm!`);
  };

  const handleDeletePet = (petId: string) => {
    if (isReadOnly) return;
    const target = pets.find((p) => p.id === petId);
    savePets(pets.filter((p) => p.id !== petId));
    toast.success(
      target ? `Đã xóa bé ${target.name} khỏi danh sách nhận nuôi.` : "Đã xóa bé cưng."
    );
  };

  const handleUpdatePet = (petId: string, form: NewPetFormState) => {
    if (isReadOnly) return;
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên bé thú cưng.");
      return;
    }
    const updatedPets = pets.map((p) =>
      p.id === petId
        ? {
            ...p,
            name: form.name.trim(),
            slug: form.name.trim().toLowerCase().replace(/\s+/g, "-"),
            species: form.species,
            breed: form.breed.trim() || p.breed,
            age: form.age.trim() || p.age,
            gender: form.gender,
            personality: form.personality.trim() || p.personality,
            story: form.personality.trim() || p.story,
            shelterName: form.shelterName || p.shelterName,
          }
        : p
    );
    savePets(updatedPets);
    toast.success(`Đã cập nhật thông tin bé ${form.name.trim()}!`);
  };

  const handleCreateShelter = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const created = createShelterPartnerRecord(
      newShelterName,
      newShelterAddress,
      newShelterContact,
      newShelterPhone
    );
    const nextShelters = [...shelters, created];
    setShelters(nextShelters);
    saveRescueShelters(nextShelters);
    setIsAddShelterModalOpen(false);
    toast.success(`Đã ký kết hợp tác với ${newShelterName}!`);
  };

  const pendingRequestsCount = requests.filter(
    (r) => r.status === "pending" || !r.status
  ).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) setActiveTab(val as "shelters" | "pets" | "requests");
        }}
        className="gap-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
              <HeartHandshake className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              {isReadOnly
                ? "Tra Cứu Nhận Nuôi & Trạm Cứu Hộ Thú Cưng"
                : "Nhận Nuôi & Trạm Cứu Hộ Thú Cưng"}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {isReadOnly
                ? "Tra cứu đối tác trạm cứu hộ, bé cưng tìm mái ấm và tiến độ hồ sơ xin nhận nuôi"
                : "Mạng lưới đối tác trạm cứu hộ, quản lý thú cưng tìm mái ấm và xét duyệt hồ sơ nhận nuôi"}
            </p>
          </div>

          <TabsList className="h-auto! flex-wrap gap-1.5 bg-white dark:bg-card border border-zinc-200/80 dark:border-border p-1.5 rounded-2xl shadow-sm w-fit self-start sm:self-auto">
            <TabsTrigger
              value="shelters"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-zinc-50/80 dark:bg-muted/40 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              <span>Trạm cứu hộ liên kết</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "shelters"
                    ? "bg-white/20 text-white dark:bg-black/15 dark:text-primary-foreground"
                    : "bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]"
                }`}
              >
                {shelters.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="pets"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-zinc-50/80 dark:bg-muted/40 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              <span>Bé cưng tìm chủ</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "pets"
                    ? "bg-white/20 text-white dark:bg-black/15 dark:text-primary-foreground"
                    : "bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]"
                }`}
              >
                {pets.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-zinc-50/80 dark:bg-muted/40 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              <span>Hồ sơ xin nhận nuôi</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                  {pendingRequestsCount} mới
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <ShelterPartnersTab
          readOnly={isReadOnly}
          shelters={shelters}
          pets={pets}
          requests={requests}
          onViewShelterPets={(shelterName) => {
            setSearchQuery(shelterName);
            setActiveTab("pets");
          }}
          isAddShelterModalOpen={isReadOnly ? false : isAddShelterModalOpen}
          setIsAddShelterModalOpen={setIsAddShelterModalOpen}
          newShelterName={newShelterName}
          setNewShelterName={setNewShelterName}
          newShelterAddress={newShelterAddress}
          setNewShelterAddress={setNewShelterAddress}
          newShelterContact={newShelterContact}
          setNewShelterContact={setNewShelterContact}
          newShelterPhone={newShelterPhone}
          setNewShelterPhone={setNewShelterPhone}
          handleCreateShelter={handleCreateShelter}
        />

        <AdoptionPetsCatalogTab
          readOnly={isReadOnly}
          pets={pets}
          shelters={shelters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isAddPetModalOpen={isReadOnly ? false : isAddPetModalOpen}
          setIsAddPetModalOpen={setIsAddPetModalOpen}
          newPet={newPet}
          setNewPet={setNewPet}
          handleTogglePetStatus={handleTogglePetStatus}
          handleCreatePet={handleCreatePet}
          handleDeletePet={isReadOnly ? undefined : handleDeletePet}
          handleUpdatePet={isReadOnly ? undefined : handleUpdatePet}
        />

        <AdoptionRequestsTab
          readOnly={isReadOnly}
          requests={requests}
          selectedReq={selectedReq}
          setSelectedReq={setSelectedReq}
          isReviewModalOpen={isReviewModalOpen}
          setIsReviewModalOpen={setIsReviewModalOpen}
          interviewDate={interviewDate}
          setInterviewDate={setInterviewDate}
          reviewNote={reviewNote}
          setReviewNote={setReviewNote}
          handleProcessRequest={handleProcessRequest}
          handleResetRequestHistory={isReadOnly ? undefined : handleResetRequestHistory}
        />
      </Tabs>
    </div>
  );
}

/** Shared adoption & shelter workspace for Manager (interactive) and Admin (read-only). */
export function AdoptionsWorkspace({ mode = "manager" }: AdoptionsWorkspaceProps) {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-xs text-zinc-400 font-semibold animate-pulse">
          Đang tải dữ liệu nhận nuôi &amp; trạm cứu hộ...
        </div>
      }
    >
      <AdoptionsWorkspaceContent mode={mode} />
    </React.Suspense>
  );
}
