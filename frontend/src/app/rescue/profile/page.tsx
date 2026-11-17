"use client";

import React, { useEffect, useState } from "react";
import { Building2, Save } from "lucide-react";
import { toast } from "sonner";
import { ShelterPartner } from "@/components/manager/adoptions/managerAdoptionsData";
import {
  ADOPTION_SYNC_EVENT,
  loadRescueShelters,
  saveRescueShelters,
  useActiveRescueShelterFilter,
} from "@/data/rescuePortalData";

export default function RescueProfilePage() {
  const [activeShelter] = useActiveRescueShelterFilter();
  const [shelters, setShelters] = useState<ShelterPartner[]>([]);
  const [selectedId, setSelectedId] = useState<string>("she-1");

  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const sync = () => {
      const list = loadRescueShelters();
      setShelters(list);
      const matched =
        activeShelter !== "all"
          ? list.find((s) => s.name === activeShelter)
          : list.find((s) => s.id === selectedId) || list[0];
      if (matched) {
        setSelectedId(matched.id);
        setName(matched.name);
        setContactPerson(matched.contactPerson);
        setPhone(matched.phone);
        setEmail(matched.email);
        setAddress(matched.address);
      }
    };
    sync();
    window.addEventListener(ADOPTION_SYNC_EVENT, sync);
    return () => window.removeEventListener(ADOPTION_SYNC_EVENT, sync);
  }, [activeShelter, selectedId]);

  const currentShelter =
    shelters.find((s) => s.id === selectedId) || shelters[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShelter) return;
    const updated = shelters.map((s) =>
      s.id === currentShelter.id
        ? {
            ...s,
            name: name.trim() || s.name,
            contactPerson: contactPerson.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
          }
        : s
    );
    setShelters(updated);
    saveRescueShelters(updated);
    toast.success(
      `Đã cập nhật thông tin ${name.trim() || currentShelter.name} và đồng bộ sang Quản lý!`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-3xl">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          Hồ Sơ Trạm Cứu Hộ Liên Kết
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Quản lý thông tin Trạm cứu hộ liên kết với hệ thống Animora
        </p>
      </div>

      {activeShelter === "all" && shelters.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {shelters.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer border transition-colors ${
                s.id === selectedId
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white dark:bg-card border-zinc-200 dark:border-border text-zinc-600 dark:text-muted-foreground hover:bg-zinc-50 dark:hover:bg-muted"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4 text-xs"
      >
        <div className="pb-3 border-b border-border/60">
          <div className="text-base font-bold text-zinc-900 dark:text-foreground">
            {currentShelter?.name}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Mã trạm: {currentShelter?.id} · Đang chăm sóc {currentShelter?.activePetsCount ?? 0} bé
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground/80 block">
            Tên Trạm cứu hộ
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground/80 block">
              Người phụ trách
            </label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground/80 block">
              Hotline liên hệ
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground/80 block">
            Email liên hệ
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground/80 block">
            Địa chỉ Trạm cứu hộ
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Lưu &amp; Đồng bộ thông tin Trạm</span>
          </button>
        </div>
      </form>
    </div>
  );
}
