"use client";

import React, { useState } from "react";
import { PawPrint } from "lucide-react";
import type {
  ExpertPet,
  ExpertPetOwner,
  PetSpeciesCode,
} from "@/types/expert.type";
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
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_PET_PHOTOS: Record<PetSpeciesCode, string> = {
  dog: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=80",
  cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80",
  rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&auto=format&fit=crop&q=80",
  hamster: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&auto=format&fit=crop&q=80",
};

const SPECIES_LABEL_MAP: Record<PetSpeciesCode, string> = {
  dog: "Chó",
  cat: "Mèo",
  rabbit: "Thỏ",
  hamster: "Chuột cảnh",
};

const GENDER_LABEL_MAP: Record<"male" | "female", string> = {
  male: "Đực",
  female: "Cái",
};

interface ClientPetFormModalProps {
  isOpen: boolean;
  editingPet: ExpertPet | null;
  owners: ExpertPetOwner[];
  onClose: () => void;
  onSave: (data: Omit<ExpertPet, "id" | "createdByExpertId">) => void;
}

export function ClientPetFormModal({
  isOpen,
  editingPet,
  owners,
  onClose,
  onSave,
}: ClientPetFormModalProps) {
  const [name, setName] = useState(editingPet?.name ?? "");
  const [species, setSpecies] = useState<PetSpeciesCode>(
    editingPet?.species ?? "dog"
  );
  const [breed, setBreed] = useState(editingPet?.breed ?? "");
  const [gender, setGender] = useState<"male" | "female">(
    editingPet?.gender ?? "male"
  );
  const [birthDate, setBirthDate] = useState(
    editingPet?.birthDate ?? "2024-01-01"
  );
  const [weightKg, setWeightKg] = useState<number>(
    editingPet?.weightKg ?? 4.5
  );
  const [ownerId, setOwnerId] = useState(
    editingPet?.ownerId ?? owners[0]?.id ?? "own-001"
  );
  const [allergies, setAllergies] = useState(editingPet?.allergies ?? "");
  const [ownerNote, setOwnerNote] = useState(editingPet?.ownerNote ?? "");

  const ownerItems = Object.fromEntries(
    owners.map((o) => [o.id, `${o.fullName} (${o.phone})`])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !breed.trim()) return;

    onSave({
      name: name.trim(),
      species,
      breed: breed.trim(),
      gender,
      birthDate,
      weightKg: Math.max(0.1, Number(weightKg) || 1),
      photo: editingPet?.photo || DEFAULT_PET_PHOTOS[species],
      ownerId,
      allergies: allergies.trim() || undefined,
      ownerNote: ownerNote.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground p-6 gap-4 shadow-2xl"
      >
        <DialogHeader className="pb-3 pr-8 border-b border-zinc-100 dark:border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] flex items-center justify-center shrink-0">
              <PawPrint className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
                {editingPet
                  ? `Cập Nhật Hồ Sơ: ${editingPet.name}`
                  : "Thêm Hồ Sơ Thú Cưng Mới"}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Thông tin cơ bản phục vụ theo dõi lâm sàng và đặt lịch dịch vụ.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Tên thú cưng *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Milo, Bơ, Miu..."
                className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Loài *
              </label>
              <Select
                value={species}
                onValueChange={(val) => {
                  if (val !== null) setSpecies(val as PetSpeciesCode);
                }}
                items={SPECIES_LABEL_MAP}
              >
                <SelectTrigger className="w-full h-9.5! px-3 rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-semibold cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Chó</SelectItem>
                  <SelectItem value="cat">Mèo</SelectItem>
                  <SelectItem value="rabbit">Thỏ</SelectItem>
                  <SelectItem value="hamster">Chuột cảnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Giống (Breed) *
              </label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="VD: Poodle Toy, Mèo Anh lông ngắn..."
                className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Giới tính *
              </label>
              <Select
                value={gender}
                onValueChange={(val) => {
                  if (val !== null) setGender(val as "male" | "female");
                }}
                items={GENDER_LABEL_MAP}
              >
                <SelectTrigger className="w-full h-9.5! px-3 rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-semibold cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Đực</SelectItem>
                  <SelectItem value="female">Cái</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Ngày sinh (ước tính)
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Cân nặng hiện tại (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">
              Chủ sở hữu *
            </label>
            <Select
              value={ownerId}
              onValueChange={(val) => {
                if (val !== null) setOwnerId(val);
              }}
              items={ownerItems}
            >
              <SelectTrigger className="w-full h-9.5! px-3 rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-semibold cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {owners.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.fullName} ({o.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">
              Tiền sử dị ứng thuốc / thức ăn (nếu có)
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="VD: Dị ứng hải sản, nhạy cảm Penicillin..."
              className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">
              Ghi chú tính cách / chăm sóc
            </label>
            <Textarea
              rows={2}
              value={ownerNote}
              onChange={(e) => setOwnerNote(e.target.value)}
              placeholder="Nhút nhát khi nghe tiếng máy sấy, cần rọ mõm khi tiêm..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer"
            >
              {editingPet ? "Lưu thay đổi" : "Thêm thú cưng"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
