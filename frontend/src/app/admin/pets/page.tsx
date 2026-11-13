"use client";

import React, { useState, useEffect } from "react";
import {
  Dog,
  Cat,
  Search,
  Filter,
  Eye,
  Calendar,
  ShieldCheck,
  Syringe,
  Pill,
  Clock,
  Sparkles,
  Phone,
  User,
  Heart,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface VaccineRecord {
  id: string;
  name: string;
  date: string;
  nextDate: string;
  doctor: string;
  status: "done" | "upcoming";
}

export interface DewormRecord {
  id: string;
  drug: string;
  date: string;
  nextDate: string;
}

export interface MedicalHistoryRecord {
  id: string;
  diagnosis: string;
  date: string;
  doctor: string;
  treatment: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  dueDate: string;
  type: "vaccine" | "deworm" | "spa" | "checkup";
}

export interface AdminPetItem {
  id: string;
  name: string;
  photo: string;
  species: "Chó" | "Mèo" | "Thỏ" | "Khác";
  breed: string;
  age: string;
  weight: number; // kg
  gender: "Đực" | "Cái";
  neutered: boolean;
  microchip: string;
  ownerName: string;
  ownerPhone: string;
  lastVisit: string;
  allergies?: string;
  vaccines: VaccineRecord[];
  deworms: DewormRecord[];
  medicalHistory: MedicalHistoryRecord[];
  prescriptions: string[];
  upcomingReminders: ReminderItem[];
}

const INITIAL_PETS: AdminPetItem[] = [
  {
    id: "pet-1",
    name: "Mochi",
    photo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&auto=format&fit=crop&q=80",
    species: "Chó",
    breed: "Corgi Pembroke",
    age: "1.5 tuổi",
    weight: 11.2,
    gender: "Đực",
    neutered: true,
    microchip: "VN-982-104-992",
    ownerName: "Phan Thị Đinh Thùy",
    ownerPhone: "0337203332",
    lastVisit: "2026-11-01",
    allergies: "Dị ứng đạm bò, ngứa da khi tắm xà phòng có cồn",
    vaccines: [
      { id: "v1", name: "Vaccine Dại Rabisin", date: "2026-05-10", nextDate: "2027-05-10", doctor: "BS. CKI Quốc Hùng", status: "done" },
      { id: "v2", name: "Vaccine 7 Bệnh Nobivac", date: "2026-06-15", nextDate: "2027-06-15", doctor: "BS. CKI Quốc Hùng", status: "done" },
    ],
    deworms: [
      { id: "dw1", drug: "NexGard Spectra 7.5 - 15kg", date: "2026-10-05", nextDate: "2026-11-05" },
    ],
    medicalHistory: [
      { id: "m1", diagnosis: "Viêm da tiếp xúc nhẹ", date: "2026-08-20", doctor: "BS. CKI Quốc Hùng", treatment: "Bôi mỡ thảo dược & dùng sữa tắm dịu nhẹ" },
    ],
    prescriptions: [
      "NexGard Spectra 1 viên nhai vào ngày 05 hàng tháng",
      "Sữa tắm da nhạy cảm Virbac Epi-Soothe 2 lần/tuần",
    ],
    upcomingReminders: [
      { id: "rem-1", title: "Uống thuốc trị ve giun định kỳ", dueDate: "2026-11-05", type: "deworm" },
      { id: "rem-2", title: "Lịch hẹn Spa cắt tỉa lông", dueDate: "2026-11-20", type: "spa" },
    ],
  },
  {
    id: "pet-2",
    name: "Bông Gòn",
    photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80",
    species: "Mèo",
    breed: "British Shorthair (Mèo Anh Lông Ngắn)",
    age: "2 tuổi",
    weight: 4.8,
    gender: "Cái",
    neutered: true,
    microchip: "VN-884-291-773",
    ownerName: "Nguyễn Minh Anh",
    ownerPhone: "0901234567",
    lastVisit: "2026-10-28",
    allergies: "Không có",
    vaccines: [
      { id: "v3", name: "Vaccine 4 Bệnh Purevax", date: "2026-04-12", nextDate: "2027-04-12", doctor: "BS. Hoàng Mai", status: "done" },
      { id: "v4", name: "Vaccine Dại Rabisin", date: "2026-04-12", nextDate: "2027-04-12", doctor: "BS. Hoàng Mai", status: "done" },
    ],
    deworms: [
      { id: "dw2", drug: "Broadline nhỏ gáy mèo 2.5 - 7.5kg", date: "2026-09-18", nextDate: "2026-11-18" },
    ],
    medicalHistory: [
      { id: "m2", diagnosis: "Khám sức khỏe tổng quát định kỳ", date: "2026-10-28", doctor: "BS. Hoàng Mai", treatment: "Chỉ số máu & siêu âm bụng bình thường" },
    ],
    prescriptions: [
      "Gel dinh dưỡng GimCat bồi bổ lông và tiêu búi lông",
    ],
    upcomingReminders: [
      { id: "rem-3", title: "Nhỏ gáy ngừa nội ngoại ký sinh trùng", dueDate: "2026-11-18", type: "deworm" },
      { id: "rem-4", title: "Tái khám kiểm tra men gan", dueDate: "2027-04-12", type: "checkup" },
    ],
  },
  {
    id: "pet-3",
    name: "Rex",
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80",
    species: "Chó",
    breed: "Golden Retriever",
    age: "3 tuổi",
    weight: 29.5,
    gender: "Đực",
    neutered: false,
    microchip: "VN-550-192-334",
    ownerName: "Hoàng Văn Tuấn",
    ownerPhone: "0988776655",
    lastVisit: "2026-10-20",
    allergies: "Không có",
    vaccines: [
      { id: "v5", name: "Vaccine 7 Bệnh Vanguard", date: "2026-03-01", nextDate: "2027-03-01", doctor: "BS. CKI Quốc Hùng", status: "done" },
    ],
    deworms: [
      { id: "dw3", drug: "Simparica Trio 20 - 40kg", date: "2026-10-10", nextDate: "2026-11-10" },
    ],
    medicalHistory: [
      { id: "m3", diagnosis: "Viêm khớp cổ chân trái nhẹ", date: "2026-07-15", doctor: "BS. CKI Quốc Hùng", treatment: "Bổ sung Glucosamine sinh học và hạn chế nhảy cao" },
    ],
    prescriptions: [
      "Viên bổ khớp Cosequin DS Maximum Strength 1 viên/ngày",
    ],
    upcomingReminders: [
      { id: "rem-5", title: "Viên nhai chống ve giun Simparica", dueDate: "2026-11-10", type: "deworm" },
    ],
  },
  {
    id: "pet-4",
    name: "Miu Miu",
    photo: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&auto=format&fit=crop&q=80",
    species: "Mèo",
    breed: "Mèo Ba Tư (Persian)",
    age: "1 tuổi",
    weight: 3.4,
    gender: "Cái",
    neutered: false,
    microchip: "VN-339-440-112",
    ownerName: "Nguyễn Minh Anh",
    ownerPhone: "0901234567",
    lastVisit: "2026-10-15",
    allergies: "Dị ứng phấn hoa",
    vaccines: [
      { id: "v6", name: "Vaccine 4 Bệnh Felocell", date: "2026-02-14", nextDate: "2027-02-14", doctor: "BS. Hoàng Mai", status: "done" },
    ],
    deworms: [
      { id: "dw4", drug: "Advocate nhỏ gáy", date: "2026-09-20", nextDate: "2026-11-20" },
    ],
    medicalHistory: [
      { id: "m4", diagnosis: "Tuyến lệ tiết nhiều do mặt gãy", date: "2026-10-15", doctor: "BS. Hoàng Mai", treatment: "Vệ sinh mắt bằng nước rửa chuyên dụng Optixcare" },
    ],
    prescriptions: [
      "Dung dịch nhỏ mắt Optixcare Eye Lube 2 lần/ngày",
    ],
    upcomingReminders: [
      { id: "rem-6", title: "Spa vệ sinh tuyến lệ & chải lông", dueDate: "2026-11-15", type: "spa" },
    ],
  },
  {
    id: "pet-5",
    name: "Kuro",
    photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&auto=format&fit=crop&q=80",
    species: "Chó",
    breed: "Shiba Inu",
    age: "2 tuổi",
    weight: 10.5,
    gender: "Đực",
    neutered: true,
    microchip: "VN-771-002-441",
    ownerName: "Đỗ Quốc Bảo",
    ownerPhone: "0933445566",
    lastVisit: "2026-10-30",
    allergies: "Không có",
    vaccines: [
      { id: "v7", name: "Vaccine 7 Bệnh Nobivac", date: "2026-05-18", nextDate: "2027-05-18", doctor: "BS. CKI Quốc Hùng", status: "done" },
    ],
    deworms: [
      { id: "dw5", drug: "Bravecto 10 - 20kg", date: "2026-08-10", nextDate: "2026-11-10" },
    ],
    medicalHistory: [],
    prescriptions: [
      "Dầu cá Omega 3 hồi phục màng lông",
    ],
    upcomingReminders: [
      { id: "rem-7", title: "Uống thuốc ngừa ve rận 3 tháng Bravecto", dueDate: "2026-11-10", type: "deworm" },
    ],
  },
];

export default function AdminPetsPage() {
  const [pets, setPets] = useState<AdminPetItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecies, setFilterSpecies] = useState<string>("all");
  const [selectedPet, setSelectedPet] = useState<AdminPetItem | null>(null);

  useEffect(() => {
    const saved = safeGetStorage<AdminPetItem[]>("animora_admin_pets_v2", []);
    if (Array.isArray(saved) && saved.length > 0) {
      setPets(saved);
    } else {
      setPets(INITIAL_PETS);
      safeSetStorage("animora_admin_pets_v2", INITIAL_PETS);
    }
  }, []);

  const filtered = pets.filter((p) => {
    const matchSpecies = filterSpecies === "all" ? true : p.species === filterSpecies;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.ownerPhone.includes(q) ||
      p.microchip.toLowerCase().includes(q);

    return matchSpecies && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Dog className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Quản Lý Thú Cưng & Sổ Sức Khỏe
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Hồ sơ vi-chip, sổ tiêm chủng điện tử, lịch tẩy giun và đơn thuốc lâm sàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-muted text-xs font-semibold text-zinc-600 dark:text-muted-foreground">
            Tổng: <strong className="text-[#6B1F2E] dark:text-[#FF7F6B]">{pets.length}</strong> bé cưng
          </span>
        </div>
      </div>

      {/* 2. Filter & Search */}
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bé, giống, chủ nuôi, vi-chip..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
          />
        </div>

        <Tabs
          value={filterSpecies}
          onValueChange={(val) => {
            if (val) setFilterSpecies(val as string);
          }}
          className="self-start sm:self-auto"
        >
          <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
            {(
              [
                { id: "all", label: `Tất cả (${pets.length})` },
                { id: "Chó", label: `Chó (${pets.filter((p) => p.species === "Chó").length})` },
                { id: "Mèo", label: `Mèo (${pets.filter((p) => p.species === "Mèo").length})` },
              ] as const
            ).map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 3. Pets Table */}
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-muted flex items-center justify-center mx-auto text-zinc-400">
              <Dog className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-600 dark:text-muted-foreground">
              Không tìm thấy hồ sơ thú cưng nào phù hợp
            </p>
          </div>
        ) : (
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thú cưng</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Loài & Giống</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Tuổi & Cân nặng</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Chủ sở hữu</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã Vi-chip</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Lần khám gần nhất</TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Chi tiết sổ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {filtered.map((p) => (
                <TableRow
                  key={p.id}
                  className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors group"
                >
                  {/* Photo & Name */}
                  <TableCell className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.photo}
                        alt={p.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-zinc-200 dark:border-border shrink-0"
                      />
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-foreground text-sm">{p.name}</div>
                        <div className="text-[11px] text-zinc-400">
                          {p.gender} · {p.neutered ? "Đã triệt sản" : "Chưa triệt sản"}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Species & Breed */}
                  <TableCell className="py-3.5 px-3 max-w-[200px] whitespace-normal">
                    <div className="font-semibold text-zinc-800 dark:text-foreground/90">{p.breed}</div>
                    <div className="text-[11px] text-zinc-400">{p.species}</div>
                  </TableCell>

                  {/* Age & Weight */}
                  <TableCell className="py-3.5 px-3">
                    <div className="font-bold text-zinc-800 dark:text-foreground/90">{p.weight} kg</div>
                    <div className="text-[11px] text-zinc-400">{p.age}</div>
                  </TableCell>

                  {/* Owner */}
                  <TableCell className="py-3.5 px-3">
                    <div className="font-bold text-zinc-900 dark:text-foreground">{p.ownerName}</div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#FF7F6B]" />
                      {p.ownerPhone}
                    </div>
                  </TableCell>

                  {/* Microchip */}
                  <TableCell className="py-3.5 px-3 font-mono font-semibold text-zinc-600 dark:text-muted-foreground text-[11px]">
                    {p.microchip}
                  </TableCell>

                  {/* Last visit */}
                  <TableCell className="py-3.5 px-3 text-zinc-600 dark:text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#FF7F6B]" />
                      <span>{p.lastVisit}</span>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPet(p)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted font-bold text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                    >
                      Mở sổ sức khỏe
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 4. Slide-over Sổ Sức Khỏe Drawer */}
      <Sheet
        open={Boolean(selectedPet)}
        onOpenChange={(open) => {
          if (!open) setSelectedPet(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={true}
          className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
        >
          {selectedPet && (
            <>
              {/* Header */}
              <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPet.photo}
                    alt={selectedPet.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FF7F6B] shrink-0"
                  />
                  <div className="min-w-0">
                    <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
                      <span>{selectedPet.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6B1F2E]/10 text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {selectedPet.species}
                      </span>
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                      <span>{selectedPet.breed} · {selectedPet.weight}kg · {selectedPet.age}</span>
                      <span className="block text-[11px] font-mono mt-0.5">
                        Chip: {selectedPet.microchip}
                      </span>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Scrollable Content */}
              <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                <div className="p-6 space-y-6 text-xs">
                  {/* Owner info strip */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-medium">Chủ nuôi:</span>
                      <span className="font-bold text-zinc-900 dark:text-foreground">{selectedPet.ownerName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-400 block font-medium">Số điện thoại:</span>
                      <span className="font-semibold text-zinc-800 dark:text-foreground/90">{selectedPet.ownerPhone}</span>
                    </div>
                  </div>

                  {/* Dị ứng cảnh báo */}
                  {selectedPet.allergies && (
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300">
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Lưu ý Dị ứng & Nhạy cảm:</span>
                      </div>
                      <p className="text-[11px]">{selectedPet.allergies}</p>
                    </div>
                  )}

                  {/* 1. Lịch sử Tiêm phòng */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                      <Syringe className="w-4 h-4 text-[#FF7F6B]" />
                      Lịch Sử Tiêm Phòng Vaccine
                    </h4>
                    <div className="space-y-2">
                      {selectedPet.vaccines.map((v) => (
                        <div
                          key={v.id}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-foreground">{v.name}</div>
                            <div className="text-[11px] text-zinc-400">
                              Bác sĩ: {v.doctor} · Tiêm: {v.date}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                              Đã tiêm
                            </span>
                            <div className="text-[10px] text-zinc-400 mt-1">Hạn mũi: {v.nextDate}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Lịch Tẩy giun & Ký sinh trùng */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Sổ Tẩy Giun & Ve Rận
                    </h4>
                    <div className="space-y-2">
                      {selectedPet.deworms.map((dw) => (
                        <div
                          key={dw.id}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-foreground">{dw.drug}</div>
                            <div className="text-[11px] text-zinc-400">Ngày dùng: {dw.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] font-semibold text-zinc-500">Mũi tiếp: {dw.nextDate}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Bệnh sử khám chữa */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-sky-600" />
                      Bệnh Sử & Chẩn Đoán Lâm Sàng
                    </h4>
                    {selectedPet.medicalHistory.length === 0 ? (
                      <p className="text-zinc-400 italic">Bé cưng hoàn toàn khỏe mạnh, chưa ghi nhận bệnh sử.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedPet.medicalHistory.map((m) => (
                          <div
                            key={m.id}
                            className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-zinc-900 dark:text-foreground">{m.diagnosis}</span>
                              <span className="text-[10px] text-zinc-400">{m.date}</span>
                            </div>
                            <p className="text-zinc-600 dark:text-foreground/80 text-[11px]">
                              Hướng điều trị: {m.treatment}
                            </p>
                            <div className="text-[10px] text-zinc-400">Phụ trách: {m.doctor}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Đơn thuốc đã kê */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-amber-600" />
                      Đơn Thuốc & Thực Phẩm Chức Năng Đã Kê
                    </h4>
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
                      {selectedPet.prescriptions.map((rx, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-zinc-800 dark:text-foreground/90">
                          <span className="font-bold text-[#FF7F6B]">•</span>
                          <span>{rx}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Lịch nhắc sắp tới */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#FF7F6B]" />
                      Lịch Nhắc Chăm Sóc Sắp Tới
                    </h4>
                    <div className="space-y-2">
                      {selectedPet.upcomingReminders.map((rem) => (
                        <div
                          key={rem.id}
                          className="p-3 rounded-2xl bg-[#6B1F2E]/5 dark:bg-[#6B1F2E]/15 border border-[#6B1F2E]/15 flex items-center justify-between"
                        >
                          <div className="font-bold text-zinc-900 dark:text-foreground">{rem.title}</div>
                          <div className="text-right">
                            <span className="font-semibold text-[#6B1F2E] dark:text-[#FF7F6B]">
                              Hạn: {rem.dueDate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border shrink-0 flex justify-end">
                <button
                  type="button"
                  onClick={() => toast.success(`Đã in/xuất sổ sức khỏe điện tử bé ${selectedPet.name}!`)}
                  className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Xuất Sổ Sức Khỏe (PDF)
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

