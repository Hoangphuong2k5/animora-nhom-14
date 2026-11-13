"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  HeartHandshake,
  PawPrint,
  Check,
  X,
  Plus,
  Search,
  Phone,
  Mail,
  Home,
  Clock,
  Sparkles,
  RotateCcw,
  Building2,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { AdoptionPet, AdoptionRequest } from "@/types";
import { initialAdoptionPets } from "@/data/mockData";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface ShelterPartner {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  activePetsCount: number;
}

const INITIAL_SHELTERS: ShelterPartner[] = [
  {
    id: "she-1",
    name: "Trạm Cứu Hộ Động Vật Hanoi Pet Rescue",
    address: "Số 15 Ngõ 198 Xã Đàn, Đống Đa, Hà Nội",
    contactPerson: "Chị Trần Thanh Hà",
    phone: "0968.123.456",
    email: "rescue@hanoipet.org",
    activePetsCount: 6,
  },
  {
    id: "she-2",
    name: "Saigon Time Dog & Cat Shelter",
    address: "Đường số 9, KDC Trung Sơn, Bình Chánh, TP.HCM",
    contactPerson: "Anh Nguyễn Tuấn Kiệt",
    phone: "0908.776.543",
    email: "contact@saigontime.vn",
    activePetsCount: 4,
  },
  {
    id: "she-3",
    name: "Nhóm Cứu Trợ Yêu Động Vật (YDV Foundation)",
    address: "Phường An Khánh, TP. Thủ Đức, TP.HCM",
    contactPerson: "Nguyễn Hồng Phúc",
    phone: "0933.221.100",
    email: "yeudongvat.shelter@gmail.com",
    activePetsCount: 3,
  },
];

export interface ExtendedAdoptionPet extends AdoptionPet {
  shelterName?: string;
}

function AdminAdoptionsContent() {
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get("tab") as any) || "shelters";

  const [activeTab, setActiveTab] = useState<"shelters" | "pets" | "requests">(defaultTab);
  const [shelters, setShelters] = useState<ShelterPartner[]>(INITIAL_SHELTERS);
  const [pets, setPets] = useState<ExtendedAdoptionPet[]>([]);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [isAddShelterModalOpen, setIsAddShelterModalOpen] = useState(false);

  // New Pet Form
  const [newPet, setNewPet] = useState({
    name: "",
    species: "Chó" as "Chó" | "Mèo",
    breed: "",
    age: "6 tháng tuổi",
    gender: "Đực" as "Đực" | "Cái",
    personality: "Ngoan ngoãn, quấn chủ",
    photo: "/assets/aistudio/cute_dog_transparent.png",
    shelterName: INITIAL_SHELTERS[0].name,
  });

  // New Shelter Form
  const [newShelterName, setNewShelterName] = useState("");
  const [newShelterAddress, setNewShelterAddress] = useState("");
  const [newShelterContact, setNewShelterContact] = useState("");
  const [newShelterPhone, setNewShelterPhone] = useState("");

  useEffect(() => {
    const savedPets = safeGetStorage<ExtendedAdoptionPet[]>("animora_adoption_pets_v2", []);
    if (Array.isArray(savedPets) && savedPets.length > 0) {
      setPets(savedPets);
    } else {
      const seeded = initialAdoptionPets.map((p, i) => ({
        ...p,
        shelterName:
          i % 3 === 0
            ? "Hanoi Pet Rescue"
            : i % 3 === 1
            ? "Saigon Time Shelter"
            : "Yêu Động Vật Foundation",
      }));
      setPets(seeded);
      safeSetStorage("animora_adoption_pets_v2", seeded);
    }

    const savedRequests = safeGetStorage<AdoptionRequest[]>("animora_adoption_requests_v2", []);
    if (Array.isArray(savedRequests) && savedRequests.length > 0) {
      setRequests(savedRequests);
    } else {
      const sampleReqs: AdoptionRequest[] = [
        {
          id: "req-1",
          requestCode: "REQ-CORGI-01",
          petId: "adopt-1",
          petName: "Mochi",
          applicantName: "Trần Hoàng Nam",
          phone: "0912345678",
          email: "nam.tran@gmail.com",
          housingType: "house",
          hoursAtHome: "full_day",
          notes: "Nhà có sân vườn rào chắn kỹ càng, gia đình có 2 bé nhỏ đều rất yêu thương thú cưng.",
          status: "pending",
          createdAt: "2026-11-03 14:20",
        },
        {
          id: "req-2",
          requestCode: "REQ-CAT-02",
          petId: "adopt-2",
          petName: "Bông Gòn",
          applicantName: "Lê Ngọc Hân",
          phone: "0987654321",
          email: "han.le@gmail.com",
          housingType: "apartment",
          hoursAtHome: "evening_only",
          notes: "Chung cư có lưới an toàn ban công, mình đã chuẩn bị chu đáo khay cát và nhà cào móng.",
          status: "pending",
          createdAt: "2026-11-03 10:15",
        },
        {
          id: "req-3",
          requestCode: "REQ-PUPPY-03",
          petId: "adopt-3",
          petName: "Bắp",
          applicantName: "Phạm Đình Trọng",
          phone: "0933112244",
          email: "trong.pham@yahoo.com",
          housingType: "house",
          hoursAtHome: "flexible",
          notes: "Mình làm việc remote tại nhà nên có nhiều thời gian dắt bé đi dạo hàng ngày.",
          status: "approved",
          createdAt: "2026-11-01 09:00",
        },
      ];
      setRequests(sampleReqs);
      safeSetStorage("animora_adoption_requests_v2", sampleReqs);
    }
  }, []);

  const savePets = (updated: ExtendedAdoptionPet[]) => {
    setPets(updated);
    safeSetStorage("animora_adoption_pets_v2", updated);
  };

  const saveRequests = (updated: AdoptionRequest[]) => {
    setRequests(updated);
    safeSetStorage("animora_adoption_requests_v2", updated);
  };

  // Toggle Adopted Status
  const handleTogglePetStatus = (petId: string) => {
    const updated = pets.map((p) => {
      if (p.id === petId) {
        const nextStatus: AdoptionPet["status"] = p.status === "adopted" ? "available" : "adopted";
        return { ...p, status: nextStatus };
      }
      return p;
    });
    savePets(updated);
    toast.success("Đã cập nhật trạng thái nhận nuôi của bé!");
  };

  // Process Application (Duyệt / Từ chối)
  const handleProcessRequest = (requestId: string, nextStatus: "approved" | "rejected") => {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return { ...r, status: nextStatus };
      }
      return r;
    });
    saveRequests(updated);
    toast.success(
      nextStatus === "approved"
        ? "Đã chấp thuận hồ sơ nhận nuôi! Đã gửi thông báo hẹn phỏng vấn."
        : "Đã từ chối hồ sơ xin nhận nuôi."
    );
  };

  // Add Pet
  const handleCreatePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPet.name.trim()) {
      toast.error("Vui lòng nhập tên bé thú cưng.");
      return;
    }

    const created: ExtendedAdoptionPet = {
      id: `adopt-${Date.now()}`,
      slug: newPet.name.toLowerCase().replace(/\s+/g, "-"),
      name: newPet.name,
      species: newPet.species,
      breed: newPet.breed || "Lai F1",
      age: newPet.age,
      gender: newPet.gender,
      personality: newPet.personality,
      photo: newPet.photo,
      shelterName: newPet.shelterName,
      vaccinated: true,
      neutered: true,
      status: "available",
      tags: ["Thân thiện", "Đã tiêm phòng"],
      story: newPet.personality,
      createdAt: new Date().toISOString(),
    };

    const updated = [created, ...pets];
    savePets(updated);
    setIsAddPetModalOpen(false);
    toast.success(`Đã thêm bé ${newPet.name} vào danh sách tìm mái ấm!`);
  };

  // Add Shelter
  const handleCreateShelter = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ShelterPartner = {
      id: `she-${Date.now()}`,
      name: newShelterName,
      address: newShelterAddress,
      contactPerson: newShelterContact,
      phone: newShelterPhone,
      email: "contact@shelter.vn",
      activePetsCount: 0,
    };
    setShelters((prev) => [...prev, created]);
    setIsAddShelterModalOpen(false);
    toast.success(`Đã ký kết hợp tác với ${newShelterName}!`);
  };

  const pendingRequestsCount = requests.filter((r) => r.status === "pending" || !r.status).length;
  const shelterItems = {
    ...Object.fromEntries(shelters.map((s) => [s.name, s.name])),
    ...(newPet.shelterName ? { [newPet.shelterName]: newPet.shelterName } : {}),
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) setActiveTab(val as "shelters" | "pets" | "requests");
        }}
        className="gap-6"
      >
        {/* 1. Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
              <HeartHandshake className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Nhận Nuôi & Trạm Cứu Hộ Thú Cưng
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Mạng lưới đối tác trạm cứu hộ, quản lý thú cưng tìm mái ấm và xét duyệt hồ sơ nhận nuôi
            </p>
          </div>

          {/* 3 Tabs Switcher */}
          <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl self-start sm:self-auto">
            <TabsTrigger
              value="shelters"
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              <span>Trạm cứu hộ liên kết</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "shelters"
                    ? "bg-white/20 text-white"
                    : "bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]"
                }`}
              >
                {shelters.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="pets"
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              <span>Bé cưng tìm chủ</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "pets"
                    ? "bg-white/20 text-white"
                    : "bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]"
                }`}
              >
                {pets.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
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

        {/* TAB 1: TRẠM CỨU HỘ ĐỐI TÁC */}
        <TabsContent value="shelters" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">
              Đối tác cứu hộ liên kết nhận hỗ trợ y tế và kết nối tìm chủ cùng Animora
            </span>
            <button
              type="button"
              onClick={() => setIsAddShelterModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Liên kết trạm mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shelters.map((sh) => (
              <div
                key={sh.id}
                className="p-5 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col justify-between space-y-4 text-xs"
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
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-foreground">{sh.name}</h3>
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
                      {sh.activePetsCount} bé
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: THÚ CƯNG TÌM MÁI ẤM */}
        <TabsContent value="pets" className="space-y-4">
          <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên bé cưng, giống, trạm bảo trợ..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAddPetModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm bé cưng</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets
              .filter(
                (p) =>
                  !searchQuery ||
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (p.shelterName && p.shelterName.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((p) => (
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
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "available"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-zinc-100 dark:bg-muted text-zinc-400"
                          }`}
                        >
                          {p.status === "available" ? "Tìm chủ" : "Đã có chủ"}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {p.breed} · {p.age}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                        Trạm: {p.shelterName || "Hanoi Pet Rescue"}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-border/80">
                      <span className="text-[11px] text-zinc-500">{p.personality}</span>
                      <button
                        type="button"
                        onClick={() => handleTogglePetStatus(p.id)}
                        className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-border font-bold hover:bg-zinc-100 dark:hover:bg-muted text-[10px] cursor-pointer"
                      >
                        {p.status === "available" ? "Đã đón" : "Hủy đón"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        {/* TAB 3: HỒ SƠ XIN NHẬN NUÔI */}
        <TabsContent value="requests" className="space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
            <h3 className="text-base font-bold text-zinc-900 dark:text-foreground mb-4">
              Danh Sách Hồ Sơ Xin Nhận Nuôi Cần Phê Duyệt
            </h3>

            <Table className="w-full text-left text-xs">
              <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã hồ sơ</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Người nộp đơn</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Bé cưng muốn nhận</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Điều kiện & Cam kết</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Ngày gửi</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Phê duyệt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
                {requests.map((r) => (
                  <TableRow key={r.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                    <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                      {r.requestCode || `REQ-${r.id.slice(0, 5)}`}
                    </TableCell>
                    <TableCell className="py-3.5 px-3">
                      <div className="font-bold text-zinc-900 dark:text-foreground">{r.applicantName}</div>
                      <div className="text-[11px] text-zinc-400">{r.phone}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {r.petName}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 max-w-[260px] whitespace-normal text-zinc-600 dark:text-muted-foreground italic">
                      "{r.notes}"
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-zinc-500 font-medium">{r.createdAt}</TableCell>
                    <TableCell className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : r.status === "rejected"
                            ? "bg-rose-500/10 text-rose-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {r.status === "approved"
                          ? "Đã chấp thuận"
                          : r.status === "rejected"
                          ? "Từ chối"
                          : "Chờ duyệt"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right">
                      {r.status === "pending" || !r.status ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleProcessRequest(r.id, "approved")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleProcessRequest(r.id, "rejected")}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 hover:bg-rose-100 font-bold cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">Đã xử lý</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

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
    </div>
  );
}

export default function AdminAdoptionsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-xs text-zinc-400 font-semibold animate-pulse">
          Đang tải dữ liệu nhận nuôi & trạm cứu hộ...
        </div>
      }
    >
      <AdminAdoptionsContent />
    </React.Suspense>
  );
}
