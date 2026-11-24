"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { MAX_SPECIALTIES } from "./profileUtils";

interface ProfileSpecialtyTagsInputProps {
  lang: "vi" | "en";
  specialties: string[];
  onChangeSpecialties: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ProfileSpecialtyTagsInput({
  lang,
  specialties,
  onChangeSpecialties,
}: ProfileSpecialtyTagsInputProps) {
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);
  const [newSpecialtyInput, setNewSpecialtyInput] = useState("");
  const [specialtyWarning, setSpecialtyWarning] = useState<string | null>(null);

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
            <span>{lang === "en" ? "Add specialty" : "Thêm chuyên môn"}</span>
          </button>
        )}
      </div>

      {specialtyWarning && (
        <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 pt-0.5">
          {specialtyWarning}
        </p>
      )}
    </div>
  );
}

