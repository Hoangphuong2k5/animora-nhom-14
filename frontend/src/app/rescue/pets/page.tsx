"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dog, Edit3, Plus, Search, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { TablePagination } from "@/components/ui/table-pagination";
import { INITIAL_SHELTERS, ShelterPartner } from "@/components/manager/adoptions/managerAdoptionsData";
import {
  ADOPTION_SYNC_EVENT,
  RescueAdoptionPet,
  loadRescuePets,
  loadRescueShelters,
  saveRescuePets,
  useActiveRescueShelterFilter,
} from "@/data/rescuePortalData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 6;

const PHOTO_PRESETS = [
  { label: "Chó Corgi / Chó nhỏ", url: "/assets/aistudio/cute_dog_transparent.png" },
  { label: "Mèo lông xù", url: "/assets/images/about_fluffy_cat_1793177483392.jpg" },
  { label: "Golden Retriever", url: "/assets/images/hero_golden_retriever_1793177482877.jpg" },
  { label: "French Bulldog", url: "/assets/adoption/dau-dau-1.jpg" },
  { label: "Mèo Ragdoll", url: "/assets/adoption/bup-be-1.jpg" },
];

export default function RescuePetsPage() {
  const [activeShelter] = useActiveRescueShelterFilter();
  const [shelters, setShelters] = useState<ShelterPartner[]>(INITIAL_SHELTERS);
  const [pets, setPets] = useState<RescueAdoptionPet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "adopted">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<RescueAdoptionPet | null>(null);

  const [formName, setFormName] = useState("");
  const [formSpecies, setFormSpecies] = useState<"Chó" | "Mèo">("Chó");
  const [formBreed, setFormBreed] = useState("");
  const [formAge, setFormAge] = useState("6 tháng tuổi");
  const [formGender, setFormGender] = useState<"Đực" | "Cái">("Đực");
  const [formPhoto, setFormPhoto] = useState(PHOTO_PRESETS[0].url);
  const [formShelter, setFormShelter] = useState(INITIAL_SHELTERS[0].name);
  const [formVaccinated, setFormVaccinated] = useState(true);
  const [formNeutered, setFormNeutered] = useState(true);
  const [formHealthSummary, setFormHealthSummary] = useState(
    "Khỏe mạnh, đã khám tổng quát và tẩy giun định kỳ"
  );
  const [formPersonality, setFormPersonality] = useState(
    "Ngoan ngoãn, thân thiện với người và trẻ nhỏ"
  );
  const [formConditions, setFormConditions] = useState(
    "Có không gian sinh hoạt an toàn, cam kết tiêm nhắc định kỳ và không bỏ rơi."
  );

  useEffect(() => {
    const syncAll = () => {
      setShelters(loadRescueShelters());
      setPets(loadRescuePets());
    };
    syncAll();
    window.addEventListener(ADOPTION_SYNC_EVENT, syncAll);
    window.addEventListener("storage", syncAll);
    return () => {
      window.removeEventListener(ADOPTION_SYNC_EVENT, syncAll);
      window.removeEventListener("storage", syncAll);
    };
  }, []);

  const filteredPets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return pets.filter((p) => {
      if (activeShelter !== "all" && p.shelterName) {
        const a = p.shelterName.toLowerCase();
        const b = activeShelter.toLowerCase();
        const match =
          a === b ||
          a.includes(b) ||
          b.includes(a) ||
          (a.includes("hanoi") && b.includes("hanoi")) ||
          (a.includes("saigon") && b.includes("saigon")) ||
          (a.includes("yêu động vật") && b.includes("yêu động vật"));
        if (!match) return false;
      }
      if (statusFilter === "waiting" && p.status === "adopted") return false;
      if (statusFilter === "adopted" && p.status !== "adopted") return false;
      if (q) {
        return (
          p.name.toLowerCase().includes(q) ||
          p.breed.toLowerCase().includes(q) ||
          (p.shelterName || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pets, activeShelter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPets.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPets = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredPets.slice(start, start + PAGE_SIZE);
  }, [filteredPets, safePage]);

  const openCreateModal = () => {
    setEditingPet(null);
    setFormName("");
    setFormSpecies("Chó");
    setFormBreed("");
    setFormAge("6 tháng tuổi");
    setFormGender("Đực");
    setFormPhoto(PHOTO_PRESETS[0].url);
    setFormShelter(
      activeShelter !== "all"
        ? activeShelter
        : shelters[0]?.name || INITIAL_SHELTERS[0].name
    );
    setFormVaccinated(true);
    setFormNeutered(true);
    setFormHealthSummary("Khỏe mạnh, đã khám tổng quát và tẩy giun định kỳ");
    setFormPersonality("Ngoan ngoãn, thân thiện với người và trẻ nhỏ");
    setFormConditions(
      "Có không gian sinh hoạt an toàn, cam kết tiêm nhắc định kỳ và không bỏ rơi."
    );
    setIsModalOpen(true);
  };

  const openEditModal = (pet: RescueAdoptionPet) => {
    setEditingPet(pet);
    setFormName(pet.name);
    setFormSpecies(pet.species === "Mèo" ? "Mèo" : "Chó");
    setFormBreed(pet.breed);
    setFormAge(pet.age);
    setFormGender(pet.gender === "Cái" ? "Cái" : "Đực");
    setFormPhoto(pet.photo || PHOTO_PRESETS[0].url);
    setFormShelter(pet.shelterName || shelters[0]?.name || INITIAL_SHELTERS[0].name);
    setFormVaccinated(Boolean(pet.vaccinated));
    setFormNeutered(Boolean(pet.neutered));
    setFormHealthSummary(
      pet.healthSummary ||
        (pet.vaccinated ? "Đã tiêm phòng, sức khỏe ổn định" : "Đang theo dõi sức khỏe")
    );
    setFormPersonality(pet.personality || "");
    setFormConditions(
      pet.adoptionConditions ||
        "Cam kết chăm sóc lâu dài, có lưới an toàn hoặc sân rào."
    );
    setIsModalOpen(true);
  };

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      toast.error("Vui lòng nhập tên thú cưng!");
      return;
    }

    const tags = [
      formVaccinated ? "Đã tiêm phòng" : "Chưa tiêm đủ",
      formNeutered ? "Đã triệt sản" : "Chưa triệt sản",
    ];

    if (editingPet) {
      const updated = pets.map((p) =>
        p.id === editingPet.id
          ? {
              ...p,
              name: cleanName,
              species: formSpecies,
              breed: formBreed.trim() || "Lai F1",
              age: formAge.trim() || "1 tuổi",
              gender: formGender,
              photo: formPhoto.trim() || PHOTO_PRESETS[0].url,
              shelterName: formShelter,
              vaccinated: formVaccinated,
              neutered: formNeutered,
              healthSummary: formHealthSummary.trim(),
              personality: formPersonality.trim(),
              adoptionConditions: formConditions.trim(),
              tags,
              story: `${formHealthSummary.trim()}\n\nĐiều kiện nhận nuôi: ${formConditions.trim()}`,
            }
          : p
      );
      setPets(updated);
      saveRescuePets(updated);
      toast.success(`Đã cập nhật thông tin bé ${cleanName}!`);
    } else {
      const created: RescueAdoptionPet = {
        id: `adopt-${Date.now()}`,
        slug: cleanName.toLowerCase().replace(/\s+/g, "-"),
        name: cleanName,
        species: formSpecies,
        breed: formBreed.trim() || "Lai F1",
        age: formAge.trim() || "6 tháng tuổi",
        gender: formGender,
        personality: formPersonality.trim(),
        photo: formPhoto.trim() || PHOTO_PRESETS[0].url,
        photos: [formPhoto.trim() || PHOTO_PRESETS[0].url],
        shelterName: formShelter,
        vaccinated: formVaccinated,
        neutered: formNeutered,
        healthSummary: formHealthSummary.trim(),
        adoptionConditions: formConditions.trim(),
        status: "available",
        tags,
        story: `${formHealthSummary.trim()}\n\nĐiều kiện nhận nuôi: ${formConditions.trim()}`,
      };
      const updated = [created, ...pets];
      setPets(updated);
      saveRescuePets(updated);
      toast.success(
        `Đã đăng bé ${cleanName} lên danh sách tìm mái ấm (đồng bộ sang /nhan-nuoi)!`
      );
    }

    setIsModalOpen(false);
    setEditingPet(null);
  };

  const handleToggleAdopted = (pet: RescueAdoptionPet) => {
    const nextStatus = pet.status === "adopted" ? "available" : "adopted";
    const updated = pets.map((p) =>
      p.id === pet.id ? { ...p, status: nextStatus as RescueAdoptionPet["status"] } : p
    );
    setPets(updated);
    saveRescuePets(updated);
    toast.success(
      nextStatus === "adopted"
        ? `Đã chuyển ${pet.name} sang trạng thái Đã nhận nuôi.`
        : `Đã mở lại trạng thái Sẵn sàng nhận nuôi cho ${pet.name}.`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Dog className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            Đăng &amp; Quản Lý Thú Cưng Cần Nhận Nuôi
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Đăng thông tin hình ảnh, tình trạng sức khỏe, đặc điểm và điều kiện nhận nuôi (đồng bộ ngay với Khách hàng &amp; Manager)
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Đăng bé cần nhận nuôi</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm tên bé, giống, trạm cứu hộ..."
            className="w-full h-10 pl-9 pr-9 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "waiting", label: "Đang tìm chủ" },
              { id: "adopted", label: "Đã có chủ" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-muted/60 text-zinc-600 dark:text-muted-foreground hover:bg-zinc-200/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedPets.map((pet) => {
          const isAdopted = pet.status === "adopted";
          return (
            <div
              key={pet.id}
              className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col justify-between gap-3"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={pet.photo || PHOTO_PRESETS[0].url}
                    alt={pet.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-foreground truncate">
                        {pet.name}
                      </h3>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAdopted
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {isAdopted ? "Đã nhận nuôi" : "Còn chờ mái ấm"}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {pet.species} · {pet.breed} · {pet.age} · {pet.gender}
                    </div>
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5 truncate">
                      {pet.shelterName || "Trạm cứu hộ Animora"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span
                    className={`px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                      pet.vaccinated
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-zinc-500/10 text-zinc-500"
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {pet.vaccinated ? "Đã tiêm phòng" : "Chưa tiêm đủ"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md ${
                      pet.neutered
                        ? "bg-sky-500/10 text-sky-600"
                        : "bg-zinc-500/10 text-zinc-500"
                    }`}
                  >
                    {pet.neutered ? "Đã triệt sản" : "Chưa triệt sản"}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-muted-foreground line-clamp-2">
                  {pet.personality}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleAdopted(pet)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-muted hover:bg-zinc-200 dark:hover:bg-muted/80 font-semibold text-zinc-700 dark:text-foreground cursor-pointer"
                >
                  {isAdopted ? "Mở lại tìm chủ" : "Đánh dấu đã nhận nuôi"}
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(pet)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Cập nhật</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <TablePagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        tone="rescue"
        className="mt-0 pt-2 border-t-0"
      />

      {/* Modal Đăng / Cập nhật thú cưng */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingPet(null);
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingPet
                ? `Cập Nhật Bé ${editingPet.name}`
                : "Đăng Thú Cưng Mới Cần Nhận Nuôi"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Điền đầy đủ hình ảnh, tình trạng sức khỏe, đặc điểm và điều kiện nhận nuôi để hiển thị công khai trên Animora.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePet} className="space-y-3.5 text-xs pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold block">Tên bé cưng</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: Mì Tôm"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Trạm cứu hộ</label>
                <Select
                  value={formShelter}
                  onValueChange={(val) => {
                    if (val) setFormShelter(val);
                  }}
                  items={Object.fromEntries(shelters.map((s) => [s.name, s.name]))}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-muted/40 border-border text-xs px-3">
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
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-semibold block">Loài</label>
                <Select
                  value={formSpecies}
                  onValueChange={(val) => {
                    if (val) setFormSpecies(val as "Chó" | "Mèo");
                  }}
                  items={{ Chó: "Chó", Mèo: "Mèo" }}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-muted/40 border-border text-xs px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chó">Chó</SelectItem>
                    <SelectItem value="Mèo">Mèo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Giới tính</label>
                <Select
                  value={formGender}
                  onValueChange={(val) => {
                    if (val) setFormGender(val as "Đực" | "Cái");
                  }}
                  items={{ Đực: "Đực", Cái: "Cái" }}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-muted/40 border-border text-xs px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đực">Đực</SelectItem>
                    <SelectItem value="Cái">Cái</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Giống</label>
                <input
                  type="text"
                  value={formBreed}
                  onChange={(e) => setFormBreed(e.target.value)}
                  placeholder="Corgi, Ta..."
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Tuổi</label>
                <input
                  type="text"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  placeholder="6 tháng tuổi"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold block">Hình ảnh bé (chọn mẫu hoặc dán URL)</label>
              <div className="flex flex-wrap gap-1.5 pb-1">
                {PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setFormPhoto(preset.url)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                      formPhoto === preset.url
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-muted/40 border-border text-muted-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formPhoto}
                onChange={(e) => setFormPhoto(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-border bg-muted/40"
              />
            </div>

            <div className="flex flex-wrap gap-5 py-1">
              <label
                htmlFor="rescueVaccinated"
                className="flex items-center gap-2 cursor-pointer font-semibold"
              >
                <Checkbox
                  id="rescueVaccinated"
                  checked={formVaccinated}
                  onCheckedChange={(checked) => setFormVaccinated(Boolean(checked))}
                />
                <span>Đã tiêm phòng cơ bản</span>
              </label>
              <label
                htmlFor="rescueNeutered"
                className="flex items-center gap-2 cursor-pointer font-semibold"
              >
                <Checkbox
                  id="rescueNeutered"
                  checked={formNeutered}
                  onCheckedChange={(checked) => setFormNeutered(Boolean(checked))}
                />
                <span>Đã triệt sản</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="font-semibold block">Tình trạng sức khỏe</label>
              <input
                type="text"
                required
                value={formHealthSummary}
                onChange={(e) => setFormHealthSummary(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold block">Đặc điểm &amp; tính cách</label>
              <Textarea
                rows={2}
                required
                value={formPersonality}
                onChange={(e) => setFormPersonality(e.target.value)}
                className="rounded-xl text-xs resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold block">Điều kiện nhận nuôi</label>
              <Textarea
                rows={2}
                required
                value={formConditions}
                onChange={(e) => setFormConditions(e.target.value)}
                className="rounded-xl text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                {editingPet ? "Lưu cập nhật" : "Đăng tìm mái ấm"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
