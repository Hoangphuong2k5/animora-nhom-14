"use client";

import React, { useEffect, useState } from "react";
import { Building2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  SUPPLIER_SYNC_EVENT,
  SupplierProfile,
  loadSupplierProfiles,
  saveSupplierProfiles,
  useActiveSupplierFilter,
} from "@/data/supplierPortalData";

export default function SupplierProfilePage() {
  const [activeSupplier] = useActiveSupplierFilter();
  const [profiles, setProfiles] = useState<SupplierProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string>("sup-1");

  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [specialty, setSpecialty] = useState("");

  useEffect(() => {
    const sync = () => {
      const list = loadSupplierProfiles();
      setProfiles(list);
      const matched =
        activeSupplier !== "all"
          ? list.find((p) => p.name === activeSupplier)
          : list.find((p) => p.id === selectedId) || list[0];
      if (matched) {
        setSelectedId(matched.id);
        setContactPerson(matched.contactPerson);
        setPhone(matched.phone);
        setEmail(matched.email);
        setAddress(matched.address);
        setTaxCode(matched.taxCode);
        setBankAccount(matched.bankAccount);
        setLeadTimeDays(matched.leadTimeDays);
        setSpecialty(matched.specialty);
      }
    };
    sync();
    window.addEventListener(SUPPLIER_SYNC_EVENT, sync);
    return () => window.removeEventListener(SUPPLIER_SYNC_EVENT, sync);
  }, [activeSupplier, selectedId]);

  const currentProfile =
    profiles.find((p) => p.id === selectedId) || profiles[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile) return;
    const updated = profiles.map((p) =>
      p.id === currentProfile.id
        ? {
            ...p,
            contactPerson: contactPerson.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
            taxCode: taxCode.trim(),
            bankAccount: bankAccount.trim(),
            leadTimeDays: Math.max(1, leadTimeDays),
            specialty: specialty.trim(),
          }
        : p
    );
    setProfiles(updated);
    saveSupplierProfiles(updated);
    toast.success(
      `Đã cập nhật hồ sơ ${currentProfile.name} và đồng bộ sang Quản lý Shop!`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-3xl">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Hồ Sơ Nhà Cung Cấp
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Cập nhật thông tin liên hệ, địa chỉ kho và thông tin thanh toán đối soát với Animora (tài khoản do Admin cấp)
        </p>
      </div>

      {activeSupplier === "all" && profiles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer border transition-colors ${
                p.id === selectedId
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-white dark:bg-card border-zinc-200 dark:border-border text-zinc-600 dark:text-muted-foreground hover:bg-zinc-50 dark:hover:bg-muted"
              }`}
            >
              {p.name}
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
            {currentProfile?.name}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Mã đối tác: {currentProfile?.id} · {currentProfile?.importSlipsCount ?? 0} phiếu nhập đã thực hiện
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground/80 block">
              Người đại diện / Liên hệ
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
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground/80 block">
              Email nhận đơn PO
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
              Mã số thuế
            </label>
            <input
              type="text"
              required
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground/80 block">
              Nhóm hàng cung ứng chính
            </label>
            <input
              type="text"
              required
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground/80 block">
              Thời gian giao chuẩn (ngày)
            </label>
            <input
              type="number"
              min={1}
              required
              value={leadTimeDays}
              onChange={(e) =>
                setLeadTimeDays(Math.max(1, Number(e.target.value)))
              }
              className="w-full h-10 px-3 rounded-xl border border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground/80 block">
            Địa chỉ kho xuất hàng
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-foreground/80 block">
            Tài khoản ngân hàng đối soát
          </label>
          <input
            type="text"
            required
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Lưu &amp; Đồng bộ hồ sơ</span>
          </button>
        </div>
      </form>
    </div>
  );
}
