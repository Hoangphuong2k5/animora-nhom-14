"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  Dog,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AdoptionRequest } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import {
  ShelterPartner,
  ExtendedAdoptionPet,
  INITIAL_NEW_PET,
  NewPetFormState,
  getRequestStatusBadgeClass,
  getRequestStatusLabel,
  matchesShelterName,
} from "./managerAdoptionsData";

interface ShelterPartnersTabProps {
  readOnly?: boolean;
  shelters: ShelterPartner[];
  pets: ExtendedAdoptionPet[];
  requests: AdoptionRequest[];
  onViewShelterPets?: (shelterName: string) => void;
  isAddShelterModalOpen: boolean;
  setIsAddShelterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newShelterName: string;
  setNewShelterName: React.Dispatch<React.SetStateAction<string>>;
  newShelterAddress: string;
  setNewShelterAddress: React.Dispatch<React.SetStateAction<string>>;
  newShelterContact: string;
  setNewShelterContact: React.Dispatch<React.SetStateAction<string>>;
  newShelterPhone: string;
  setNewShelterPhone: React.Dispatch<React.SetStateAction<string>>;
  handleCreateShelter: (e: React.FormEvent) => void;
}

export function ShelterPartnersTab({
  readOnly = false,
  shelters,
  pets,
  requests,
  onViewShelterPets,
  isAddShelterModalOpen,
  setIsAddShelterModalOpen,
  newShelterName,
  setNewShelterName,
  newShelterAddress,
  setNewShelterAddress,
  newShelterContact,
  setNewShelterContact,
  newShelterPhone,
  setNewShelterPhone,
  handleCreateShelter,
}: ShelterPartnersTabProps) {
  const [selectedShelter, setSelectedShelter] = useState<ShelterPartner | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const openShelterDetail = (shelter: ShelterPartner) => {
    setSelectedShelter(shelter);
    setIsDetailOpen(true);
  };

  const selectedShelterPets = useMemo(() => {
    if (!selectedShelter) return [];
    return pets.filter((p) => matchesShelterName(p.shelterName, selectedShelter.name));
  }, [selectedShelter, pets]);

  const selectedShelterRequests = useMemo(() => {
    if (!selectedShelter) return [];
    const petIds = new Set(selectedShelterPets.map((p) => p.id));
    return requests.filter((r) => petIds.has(r.petId));
  }, [selectedShelter, selectedShelterPets, requests]);

  return (
    <>
      {/* TAB 1: TRẠM CỨU HỘ ĐỐI TÁC */}
      <TabsContent value="shelters" className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500">
            Đối tác cứu hộ liên kết nhận hỗ trợ y tế và kết nối tìm chủ cùng Animora
          </span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setIsAddShelterModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Liên kết trạm mới</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shelters.map((sh) => {
            const matchedPetsCount = pets.filter((p) =>
              matchesShelterName(p.shelterName, sh.name)
            ).length;
            const displayPetsCount = matchedPetsCount > 0 ? matchedPetsCount : sh.activePetsCount;
            return (
              <div
                key={sh.id}
                role="button"
                tabIndex={0}
                onClick={() => openShelterDetail(sh)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openShelterDetail(sh);
                  }
                }}
                className="p-5 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm hover:border-[#FF7F6B]/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 text-xs group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                      <Building2 className="w-5 h-5" />
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      Đối tác chính thức
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-foreground group-hover:text-[#6B1F2E] dark:group-hover:text-[#FF7F6B] transition-colors">
                    {sh.name}
                  </h3>
                  <div className="text-zinc-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>{sh.address}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-border space-y-1.5 text-zinc-600 dark:text-muted-foreground">
                  <div>
                    Người đại diện: <strong>{sh.contactPerson}</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#FF7F6B]" />
                    <span>{sh.phone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 font-bold">
                    <span className="text-zinc-500">Bé cưng đang bảo trợ:</span>
                    <span className="text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {displayPetsCount} bé
                    </span>
                  </div>
                  <div className="pt-1 flex items-center justify-end text-[11px] font-bold text-[#6B1F2E] dark:text-[#FF7F6B] opacity-80 group-hover:opacity-100">
                    <span>Xem chi tiết trạm</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </TabsContent>

      {/* Modal Xem Chi Tiết Trạm Cứu Hộ */}
      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => setIsDetailOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          {selectedShelter && (
            <>
              <DialogHeader className="pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Đối tác chính thức
                  </span>
                </div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {selectedShelter.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground flex items-start gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#FF7F6B]" />
                  <span>{selectedShelter.address}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs pt-2">
                {/* Thông tin liên hệ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#FF7F6B] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground">Người đại diện</div>
                      <div className="font-bold text-foreground truncate">
                        {selectedShelter.contactPerson}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#FF7F6B] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground">Hotline</div>
                      <div className="font-bold text-foreground truncate">
                        {selectedShelter.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#FF7F6B] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground">Email liên hệ</div>
                      <div className="font-bold text-foreground truncate">
                        {selectedShelter.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI tóm tắt */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                    <div className="text-[11px] text-muted-foreground">Đang tìm chủ</div>
                    <div className="text-lg font-extrabold text-emerald-500 mt-0.5">
                      {selectedShelterPets.filter((p) => p.status === "waiting").length} bé
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                    <div className="text-[11px] text-muted-foreground">Đã nhận nuôi / Chờ</div>
                    <div className="text-lg font-extrabold text-sky-500 mt-0.5">
                      {selectedShelterPets.filter((p) => p.status !== "waiting").length} bé
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                    <div className="text-[11px] text-muted-foreground">Hồ sơ xin nhận nuôi</div>
                    <div className="text-lg font-extrabold text-[#FF7F6B] mt-0.5">
                      {selectedShelterRequests.length} hồ sơ
                    </div>
                  </div>
                </div>

                {/* Danh sách bé cưng thuộc trạm */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground flex items-center gap-1.5">
                      <Dog className="w-4 h-4 text-[#FF7F6B]" />
                      <span>Danh sách bé cưng của trạm ({selectedShelterPets.length})</span>
                    </h4>
                    {onViewShelterPets && selectedShelterPets.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const name = selectedShelter.name;
                          setIsDetailOpen(false);
                          onViewShelterPets(name);
                        }}
                        className="text-[11px] font-bold text-[#FF7F6B] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Xem ở tab Bé cưng</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {selectedShelterPets.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
                      Chưa có bé cưng nào được ghi nhận từ trạm này trong hệ thống.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {selectedShelterPets.map((pet) => (
                        <div
                          key={pet.id}
                          className="p-2.5 rounded-2xl border border-border/70 bg-muted/25 flex items-center gap-2.5"
                        >
                          <img
                            src={pet.photo}
                            alt={pet.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                pet.species === "Mèo"
                                  ? "/assets/images/about_fluffy_cat_1793177483392.jpg"
                                  : "/assets/images/hero_golden_retriever_1793177482877.jpg";
                            }}
                            className="w-11 h-11 rounded-xl object-cover border border-border shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-foreground truncate">{pet.name}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                                  pet.status === "waiting"
                                    ? "bg-emerald-500/15 text-emerald-500"
                                    : pet.status === "pending"
                                    ? "bg-amber-500/15 text-amber-500"
                                    : "bg-zinc-500/15 text-muted-foreground"
                                }`}
                              >
                                {pet.status === "waiting"
                                  ? "Tìm chủ"
                                  : pet.status === "pending"
                                  ? "Chờ duyệt"
                                  : "Đã có chủ"}
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {pet.breed} · {pet.age} · {pet.gender}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hồ sơ nhận nuôi liên quan */}
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-[#FF7F6B]" />
                    <span>Hồ sơ xin nhận nuôi gần đây ({selectedShelterRequests.length})</span>
                  </h4>

                  {selectedShelterRequests.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
                      Chưa có hồ sơ xin nhận nuôi nào cho các bé thuộc trạm này.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {selectedShelterRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-2.5 rounded-xl border border-border/70 bg-muted/25 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-foreground truncate">
                              {req.requestCode} · Bé {req.petName}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              Người đăng ký: {req.applicantName} ({req.phone})
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getRequestStatusBadgeClass(
                              req.status
                            )}`}
                          >
                            {getRequestStatusLabel(req.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDetailOpen(false)}
                    className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Thêm Trạm Cứu Hộ */}
      <Dialog
        open={isAddShelterModalOpen}
        onOpenChange={(open) => setIsAddShelterModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold">
              Liên Kết Trạm Cứu Hộ Đối Tác
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Thêm đối tác trạm cứu hộ động vật mới vào mạng lưới bảo trợ Animora.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateShelter} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Tên trạm cứu hộ:</label>
              <input
                type="text"
                required
                value={newShelterName}
                onChange={(e) => setNewShelterName(e.target.value)}
                placeholder="Trạm Cứu Hộ..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Địa chỉ trạm:</label>
              <input
                type="text"
                required
                value={newShelterAddress}
                onChange={(e) => setNewShelterAddress(e.target.value)}
                placeholder="Quận/Huyện, Tỉnh/TP..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Người đại diện:</label>
                <input
                  type="text"
                  required
                  value={newShelterContact}
                  onChange={(e) => setNewShelterContact(e.target.value)}
                  placeholder="Họ tên..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Hotline:</label>
                <input
                  type="text"
                  required
                  value={newShelterPhone}
                  onChange={(e) => setNewShelterPhone(e.target.value)}
                  placeholder="090..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddShelterModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold cursor-pointer"
              >
                Ký kết đối tác
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AdoptionPetsCatalogTabProps {
  readOnly?: boolean;
  pets: ExtendedAdoptionPet[];
  shelters: ShelterPartner[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isAddPetModalOpen: boolean;
  setIsAddPetModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newPet: NewPetFormState;
  setNewPet: React.Dispatch<React.SetStateAction<NewPetFormState>>;
  handleTogglePetStatus: (petId: string) => void;
  handleCreatePet: (e: React.FormEvent) => void;
  handleDeletePet?: (petId: string) => void;
  handleUpdatePet?: (petId: string, form: NewPetFormState) => void;
}

export function AdoptionPetsCatalogTab({
  readOnly = false,
  pets,
  shelters,
  searchQuery,
  setSearchQuery,
  isAddPetModalOpen,
  setIsAddPetModalOpen,
  newPet,
  setNewPet,
  handleTogglePetStatus,
  handleCreatePet,
  handleDeletePet,
  handleUpdatePet,
}: AdoptionPetsCatalogTabProps) {
  const [petToDelete, setPetToDelete] = useState<ExtendedAdoptionPet | null>(null);
  const [isDeletePetModalOpen, setIsDeletePetModalOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [isEditPetModalOpen, setIsEditPetModalOpen] = useState(false);
  const [editPetForm, setEditPetForm] = useState<NewPetFormState>(INITIAL_NEW_PET);
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "adopted">("all");
  const [speciesFilter, setSpeciesFilter] = useState<"all" | "Chó" | "Mèo" | "other">("all");
  const [shelterFilter, setShelterFilter] = useState<string>("all");

  const openEditPetModal = (pet: ExtendedAdoptionPet) => {
    const matchedShelter =
      shelters.find((s) => matchesShelterName(pet.shelterName, s.name))?.name ||
      pet.shelterName ||
      shelters[0]?.name ||
      "";
    setEditingPetId(pet.id);
    setEditPetForm({
      name: pet.name,
      species: pet.species === "Mèo" ? "Mèo" : "Chó",
      breed: pet.breed || "",
      age: pet.age || "",
      gender: pet.gender === "Cái" ? "Cái" : "Đực",
      personality: pet.personality || "",
      photo: pet.photo,
      shelterName: matchedShelter,
    });
    setIsEditPetModalOpen(true);
  };

  const shelterItems = {
    ...Object.fromEntries(shelters.map((s) => [s.name, s.name])),
    ...(newPet.shelterName ? { [newPet.shelterName]: newPet.shelterName } : {}),
  };

  const isPetAvailable = (status: string) => status === "waiting" || status === "available";

  const filteredPets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return pets.filter((p) => {
      if (statusFilter === "waiting" && !isPetAvailable(p.status)) return false;
      if (statusFilter === "adopted" && isPetAvailable(p.status)) return false;
      if (speciesFilter === "Chó" && p.species !== "Chó") return false;
      if (speciesFilter === "Mèo" && p.species !== "Mèo") return false;
      if (speciesFilter === "other" && (p.species === "Chó" || p.species === "Mèo")) return false;
      if (shelterFilter !== "all" && !matchesShelterName(p.shelterName, shelterFilter)) {
        return false;
      }
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchBreed = p.breed.toLowerCase().includes(q);
        const matchShelter =
          (p.shelterName && p.shelterName.toLowerCase().includes(q)) ||
          matchesShelterName(p.shelterName, searchQuery);
        if (!matchName && !matchBreed && !matchShelter) return false;
      }
      return true;
    });
  }, [pets, searchQuery, statusFilter, speciesFilter, shelterFilter]);

  const waitingPetsCount = useMemo(
    () => pets.filter((p) => isPetAvailable(p.status)).length,
    [pets]
  );
  const adoptedPetsCount = pets.length - waitingPetsCount;

  const hasActiveFilter =
    Boolean(searchQuery.trim()) ||
    statusFilter !== "all" ||
    speciesFilter !== "all" ||
    shelterFilter !== "all";

  return (
    <>
      {/* TAB 2: THÚ CƯNG TÌM MÁI ẤM */}
      <TabsContent value="pets" className="space-y-4">
        <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên bé cưng, giống, trạm bảo trợ..."
                  className="w-full h-10 pl-9 pr-9 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Xóa tìm kiếm"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-foreground cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <Select
                value={speciesFilter}
                onValueChange={(val) => {
                  if (val !== null) {
                    setSpeciesFilter(val as "all" | "Chó" | "Mèo" | "other");
                  }
                }}
                items={{
                  all: "Tất cả loài",
                  Chó: "Chó",
                  Mèo: "Mèo",
                  other: "Thú cưng khác",
                }}
              >
                <SelectTrigger className="w-full sm:w-40 h-10! rounded-xl bg-zinc-50 dark:bg-muted border-zinc-200 dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loài</SelectItem>
                  <SelectItem value="Chó">Chó</SelectItem>
                  <SelectItem value="Mèo">Mèo</SelectItem>
                  <SelectItem value="other">Thú cưng khác</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={shelterFilter}
                onValueChange={(val) => {
                  if (val !== null) setShelterFilter(val);
                }}
                items={{
                  all: "Tất cả trạm cứu hộ",
                  ...Object.fromEntries(shelters.map((s) => [s.name, s.name])),
                }}
              >
                <SelectTrigger className="w-full sm:w-64 lg:w-72 h-10! rounded-xl bg-zinc-50 dark:bg-muted border-zinc-200 dark:border-border text-xs font-medium px-3">
                  <SelectValue className="truncate" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="w-auto! min-w-(--anchor-width) max-w-[90vw]"
                >
                  <SelectItem value="all" className="pr-9">
                    Tất cả trạm cứu hộ
                  </SelectItem>
                  {shelters.map((s) => (
                    <SelectItem key={s.id} value={s.name} className="pr-9">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() => setIsAddPetModalOpen(true)}
                className="self-start lg:self-auto px-4 py-2.5 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm bé cưng</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "all", label: `Tất cả (${pets.length})` },
                  { id: "waiting", label: `Tìm chủ (${waitingPetsCount})` },
                  { id: "adopted", label: `Đã có chủ (${adoptedPetsCount})` },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === pill.id
                      ? "bg-[#6B1F2E] text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-muted/60 text-zinc-600 dark:text-muted-foreground hover:bg-zinc-200/70 dark:hover:bg-muted"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSpeciesFilter("all");
                  setShelterFilter("all");
                }}
                className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {filteredPets.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-zinc-200 dark:border-border bg-white/50 dark:bg-card/50 text-center space-y-2 text-xs">
            <div className="font-bold text-zinc-700 dark:text-foreground">
              Không tìm thấy bé cưng nào phù hợp với bộ lọc hiện tại
            </div>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSpeciesFilter("all");
                  setShelterFilter("all");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#6B1F2E] text-white font-bold cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPets.map((p) => {
              const available = isPetAvailable(p.status);
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex gap-3.5 text-xs group"
                >
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="w-20 h-24 rounded-2xl object-cover shrink-0 border border-zinc-200 dark:border-border"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-zinc-900 dark:text-foreground text-sm truncate">
                          {p.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            available
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-zinc-100 dark:bg-muted text-zinc-400"
                          }`}
                        >
                          {available ? "Tìm chủ" : "Đã có chủ"}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {p.breed} · {p.age}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                        Trạm: {p.shelterName || "Hanoi Pet Rescue"}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-border/80">
                      <span className="text-[11px] text-zinc-500 truncate">{p.personality}</span>
                      {!readOnly && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePetStatus(p.id)}
                            className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-border font-bold hover:bg-zinc-100 dark:hover:bg-muted text-[10px] cursor-pointer whitespace-nowrap"
                          >
                            {available ? "Đã đón" : "Hủy đón"}
                          </button>
                          {handleUpdatePet && (
                            <button
                              type="button"
                              title={`Chỉnh sửa bé ${p.name}`}
                              onClick={() => openEditPetModal(p)}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted/60 text-zinc-600 dark:text-foreground/80 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {handleDeletePet && (
                            <button
                              type="button"
                              title={`Xóa bé ${p.name}`}
                              onClick={() => {
                                setPetToDelete(p);
                                setIsDeletePetModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* Modal Chỉnh Sửa Bé Cưng */}
      <Dialog
        open={isEditPetModalOpen}
        onOpenChange={(open) => setIsEditPetModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[#FF7F6B]" />
              <span>Chỉnh Sửa Thông Tin Bé Cưng</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cập nhật thông tin hồ sơ bé cưng trên hệ thống nhận nuôi Animora.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingPetId && handleUpdatePet) {
                handleUpdatePet(editingPetId, editPetForm);
              }
              setIsEditPetModalOpen(false);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Tên bé cưng:</label>
              <input
                type="text"
                required
                value={editPetForm.name}
                onChange={(e) => setEditPetForm({ ...editPetForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Loài:</label>
                <Select
                  value={editPetForm.species}
                  onValueChange={(val) => {
                    if (val !== null) {
                      setEditPetForm({ ...editPetForm, species: val as "Chó" | "Mèo" });
                    }
                  }}
                  items={{ "Chó": "Chó", "Mèo": "Mèo" }}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chó">Chó</SelectItem>
                    <SelectItem value="Mèo">Mèo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Giống:</label>
                <input
                  type="text"
                  value={editPetForm.breed}
                  onChange={(e) => setEditPetForm({ ...editPetForm, breed: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Độ tuổi:</label>
                <input
                  type="text"
                  value={editPetForm.age}
                  onChange={(e) => setEditPetForm({ ...editPetForm, age: e.target.value })}
                  placeholder="6 tháng tuổi..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Giới tính:</label>
                <Select
                  value={editPetForm.gender}
                  onValueChange={(val) => {
                    if (val !== null) {
                      setEditPetForm({ ...editPetForm, gender: val as "Đực" | "Cái" });
                    }
                  }}
                  items={{ "Đực": "Đực", "Cái": "Cái" }}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đực">Đực</SelectItem>
                    <SelectItem value="Cái">Cái</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Trạm bảo trợ quản lý:</label>
              <Select
                value={editPetForm.shelterName}
                onValueChange={(val) => {
                  if (val !== null) setEditPetForm({ ...editPetForm, shelterName: val });
                }}
                items={{
                  ...shelterItems,
                  ...(editPetForm.shelterName
                    ? { [editPetForm.shelterName]: editPetForm.shelterName }
                    : {}),
                }}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shelters.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">
                Tính cách &amp; Hoàn cảnh cứu hộ:
              </label>
              <Textarea
                value={editPetForm.personality}
                onChange={(e) =>
                  setEditPetForm({ ...editPetForm, personality: e.target.value })
                }
                rows={2}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditPetModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Xác Nhận Xóa Bé Cưng */}
      <Dialog
        open={isDeletePetModalOpen}
        onOpenChange={(open) => setIsDeletePetModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base font-bold text-rose-500 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Xóa Bé Cưng Khỏi Danh Sách</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Bạn có chắc chắn muốn xóa bé{" "}
              <strong className="text-foreground">{petToDelete?.name}</strong> khỏi hệ thống
              nhận nuôi không? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-3 text-xs">
            <button
              type="button"
              onClick={() => setIsDeletePetModalOpen(false)}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                if (petToDelete && handleDeletePet) {
                  handleDeletePet(petToDelete.id);
                }
                setIsDeletePetModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
            >
              Xác nhận xóa
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Thêm Thú Cưng Nhận Nuôi */}
      <Dialog
        open={isAddPetModalOpen}
        onOpenChange={(open) => setIsAddPetModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold">
              Đăng Bé Cưng Tìm Mái Ấm
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cập nhật hồ sơ thú cưng từ trạm cứu hộ liên kết lên hệ thống nhận nuôi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePet} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Tên bé cưng:</label>
              <input
                type="text"
                required
                value={newPet.name}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                placeholder="Mochi, LuLu..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Loài:</label>
                <Select
                  value={newPet.species}
                  onValueChange={(val) => {
                    if (val !== null) setNewPet({ ...newPet, species: val as "Chó" | "Mèo" });
                  }}
                  items={{
                    "Chó": "Chó",
                    "Mèo": "Mèo",
                  }}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chó">Chó</SelectItem>
                    <SelectItem value="Mèo">Mèo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Giống:</label>
                <input
                  type="text"
                  value={newPet.breed}
                  onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                  placeholder="Corgi, Mèo Mướp..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Trạm bảo trợ quản lý:</label>
              <Select
                value={newPet.shelterName}
                onValueChange={(val) => {
                  if (val !== null) setNewPet({ ...newPet, shelterName: val });
                }}
                items={shelterItems}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shelters.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Tính cách & Hoàn cảnh cứu hộ:</label>
              <Textarea
                value={newPet.personality}
                onChange={(e) => setNewPet({ ...newPet, personality: e.target.value })}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddPetModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold cursor-pointer"
              >
                Đăng tin nhận nuôi
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
