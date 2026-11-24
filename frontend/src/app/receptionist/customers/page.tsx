"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Dog,
  KeyRound,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants/config.constant";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { formatDateTimeDdMmYyyy } from "@/utils/dateFormat";
import { formatBookingPhoneOnBlur } from "@/data/serviceBookingData";
import {
  type AllowedV14Species,
  appendReceptionistAuditLog,
  createWalkInPetProfile,
  dispatchReceptionistSync,
  findCustomerByPhone,
  findOrCreateWalkInCustomer,
  INITIAL_WALK_IN_CUSTOMERS,
  INITIAL_WALK_IN_PETS,
  loadWalkInCustomers,
  loadWalkInPets,
  normalizeVietnamPhone,
  saveWalkInCustomers,
  saveWalkInPets,
  syncWalkInPetToExpertRegistry,
  upgradeWalkInToWebAccount,
  type WalkInCustomerRecord,
  type WalkInPetRecord,
} from "@/data/receptionistOpsData";
import { useReceptionistActor } from "@/hooks/receptionist/useReceptionistActor";
import { CustomerActionModals } from "@/components/receptionist/modals/CustomerActionModals";
import type { UserAccount } from "@/types";

export default function ReceptionistCustomersPage() {
  const { actorId, actorName } = useReceptionistActor();
  const [customers, setCustomers] = useState<WalkInCustomerRecord[]>(
    INITIAL_WALK_IN_CUSTOMERS
  );
  const [pets, setPets] = useState<WalkInPetRecord[]>(INITIAL_WALK_IN_PETS);
  const [phoneInput, setPhoneInput] = useState("");
  const [fullNameInput, setFullNameInput] = useState("");

  // Modal: Tạo thú cưng (4 loài v1.4)
  const [petModalCustomer, setPetModalCustomer] =
    useState<WalkInCustomerRecord | null>(null);
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState<AllowedV14Species>("Chó");
  const [petBreed, setPetBreed] = useState("Poodle");
  const [petGender, setPetGender] = useState<"Đực" | "Cái">("Đực");
  const [petWeightKg, setPetWeightKg] = useState("4.2");
  const [petAllergies, setPetAllergies] = useState("");
  const [petBehavior, setPetBehavior] = useState("");

  // Modal: Kích hoạt tài khoản Web
  const [webAccountTarget, setWebAccountTarget] =
    useState<WalkInCustomerRecord | null>(null);
  const [webEmail, setWebEmail] = useState("");
  const [webAuthMethod, setWebAuthMethod] = useState<"otp" | "password">("otp");
  const [webOtpCode, setWebOtpCode] = useState("123456");
  const [webPassword, setWebPassword] = useState("");

  useEffect(() => {
    setCustomers(loadWalkInCustomers());
    setPets(loadWalkInPets());
  }, []);

  const normalizedPhone = useMemo(
    () => normalizeVietnamPhone(phoneInput),
    [phoneInput]
  );

  const duplicateCustomer = useMemo(
    () => findCustomerByPhone(normalizedPhone, customers),
    [normalizedPhone, customers]
  );

  const filteredCustomers = useMemo(() => {
    const q = phoneInput.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(normalizedPhone || q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, phoneInput, normalizedPhone]);

  const handleCreateWalkInCustomer = () => {
    try {
      const res = findOrCreateWalkInCustomer({
        fullName: fullNameInput,
        phone: phoneInput,
        existingCustomers: customers,
        actorId,
        actorName,
      });

      setCustomers(res.customers);
      saveWalkInCustomers(res.customers);
      if (res.auditLog) appendReceptionistAuditLog(res.auditLog);
      dispatchReceptionistSync();

      if (res.created) {
        setFullNameInput("");
        toast.success(
          `Đã tạo khách vãng lai: ${res.customer.fullName} (${res.customer.phone}) không cần mật khẩu!`
        );
      } else {
        toast.warning(
          `SĐT ${res.customer.phone} đã tồn tại (${res.customer.fullName}) — Không tạo trùng!`
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể tạo khách vãng lai."
      );
    }
  };

  const handleSaveNewPet = () => {
    if (!petModalCustomer) return;
    try {
      const res = createWalkInPetProfile({
        customerId: petModalCustomer.id,
        ownerName: petModalCustomer.fullName,
        ownerPhone: petModalCustomer.phone,
        name: petName,
        species: petSpecies,
        breed: petBreed,
        gender: petGender,
        age: "1 tuổi",
        weightKg: parseFloat(petWeightKg) || 4.0,
        allergies: petAllergies,
        behaviorNote: petBehavior,
        existingPets: pets,
        actorId,
        actorName,
      });

      setPets(res.pets);
      saveWalkInPets(res.pets);
      syncWalkInPetToExpertRegistry(res.pet);
      appendReceptionistAuditLog(res.auditLog);
      dispatchReceptionistSync();

      setPetModalCustomer(null);
      setPetName("");
      setPetAllergies("");
      setPetBehavior("");
      toast.success(
        `Đã thêm thú cưng ${res.pet.name} (${res.pet.species}) cho khách ${petModalCustomer.fullName}!`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể tạo hồ sơ thú cưng."
      );
    }
  };

  const handleActivateWebAccount = () => {
    if (!webAccountTarget) return;
    try {
      const existingUsers = safeGetStorage<UserAccount[]>("animora_users_v2", []);
      const res = upgradeWalkInToWebAccount({
        customerId: webAccountTarget.id,
        email: webEmail,
        authMethod: webAuthMethod,
        otpCode: webOtpCode,
        password: webPassword,
        existingCustomers: customers,
        existingUsers,
        actorId,
        actorName,
      });

      setCustomers(res.customers);
      saveWalkInCustomers(res.customers);
      safeSetStorage("animora_users_v2", res.users);
      appendReceptionistAuditLog(res.auditLog);
      dispatchReceptionistSync();

      setWebAccountTarget(null);
      setWebEmail("");
      setWebPassword("");
      toast.success(
        `Đã kích hoạt tài khoản Web (${res.updatedCustomer.email}) cho khách ${res.updatedCustomer.fullName}!`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể kích hoạt tài khoản Web."
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
          <Users className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
          <span>Khách Vãng Lai, Hồ Sơ Thú Cưng &amp; Tạo Tài Khoản Web</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Chuẩn hóa SĐT, tìm trước khi tạo để chống trùng; tạo bản ghi khách vãng lai chỉ cần Tên +
          SĐT; tạo hồ sơ thú cưng 4 loài (Chó, Mèo, Chuột, Thỏ) và hỗ trợ tạo tài khoản Web khi khách
          có nhu cầu.
        </p>
      </div>

      {/* Box Tra cứu SĐT chuẩn hóa & Tạo khách vãng lai */}
      <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label className="text-xs font-bold block mb-1">
              1. Gõ SĐT khách (Tự động chuẩn hóa 10 số &amp; kiểm tra trùng):
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Nhập SĐT (VD: 0915 888 999) hoặc tên khách..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-xs font-semibold"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="text-xs font-bold block mb-1">
              2. Họ và tên khách mới (Không cần mật khẩu):
            </label>
            <input
              type="text"
              value={fullNameInput}
              onChange={(e) => setFullNameInput(e.target.value)}
              placeholder="Nhập họ tên khách vãng lai..."
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-xs"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="button"
              disabled={Boolean(duplicateCustomer)}
              onClick={handleCreateWalkInCustomer}
              className="w-full h-10 px-4 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] disabled:opacity-45 disabled:cursor-not-allowed text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{duplicateCustomer ? "SĐT đã tồn tại" : "Tạo khách vãng lai"}</span>
            </button>
          </div>
        </div>

        {duplicateCustomer && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong>Đã tìm thấy SĐT chuẩn hóa ({duplicateCustomer.phone}):</strong>{" "}
              Khách hàng <strong>{duplicateCustomer.fullName}</strong> đã có trong hệ thống — Hệ
              thống chặn tạo trùng và hiển thị hồ sơ ngay bên dưới.
            </div>
            <Link
              href={`${ROUTES.RECEPTIONIST_BOOKING}?phone=${duplicateCustomer.phone}`}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Đặt lịch ngay cho khách này</span>
            </Link>
          </div>
        )}
      </div>

      {/* Danh sách khách hàng & thú cưng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCustomers.map((cus) => {
          const customerPets = pets.filter(
            (p) =>
              p.customerId === cus.id ||
              normalizeVietnamPhone(p.ownerPhone) === normalizeVietnamPhone(cus.phone)
          );

          return (
            <div
              key={cus.id}
              className="p-5 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
                        {cus.fullName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cus.hasWebAccount
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {cus.hasWebAccount
                          ? "Đã có tài khoản Web"
                          : "Khách vãng lai (Chưa tạo TK Web)"}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-3 mt-1">
                      <span className="inline-flex items-center gap-1 font-semibold text-zinc-800 dark:text-foreground">
                        <Phone className="w-3.5 h-3.5 text-[#FF7F6B]" />
                        {formatBookingPhoneOnBlur(cus.phone)}
                      </span>
                      {cus.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          {cus.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`${ROUTES.RECEPTIONIST_BOOKING}?phone=${cus.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs inline-flex items-center gap-1.5 shrink-0"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Đặt lịch giúp</span>
                  </Link>
                </div>

                {/* Danh sách thú cưng */}
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-700 dark:text-foreground flex items-center gap-1.5">
                      <Dog className="w-3.5 h-3.5 text-[#FF7F6B]" />
                      <span>Hồ sơ thú cưng ({customerPets.length}):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPetModalCustomer(cus);
                        setPetName("");
                        setPetSpecies("Chó");
                        setPetWeightKg("4.0");
                        setPetAllergies("");
                      }}
                      className="text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm thú cưng (4 loài)</span>
                    </button>
                  </div>

                  {customerPets.length === 0 ? (
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-muted/40 text-[11px] text-zinc-400 italic">
                      Chưa có hồ sơ thú cưng. Bấm &quot;Thêm thú cưng&quot; để tạo nhanh.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {customerPets.map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border text-xs flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-foreground">
                              {p.name} ({p.species} • {p.breed})
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              Cân nặng: <strong>{p.weightKg}kg</strong> • Dị ứng: {p.allergies}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 shrink-0">
                            {p.lockedByVet ? "BS đã khóa" : "Do khách khai"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-border flex items-center justify-between gap-2 text-[11px]">
                <span className="text-zinc-400">
                  Tạo bởi: {cus.createdBy} • {formatDateTimeDdMmYyyy(cus.createdAt)}
                </span>

                {!cus.hasWebAccount ? (
                  <button
                    type="button"
                    onClick={() => {
                      setWebAccountTarget(cus);
                      setWebEmail(`${cus.phone}@animora.vn`);
                      setWebAuthMethod("otp");
                      setWebOtpCode("123456");
                      setWebPassword("");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/25 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Tạo TK Web giúp khách (OTP / Mật khẩu)</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Đã liên kết Web ({cus.webAccountMethod?.toUpperCase()})</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CustomerActionModals
        petModalCustomer={petModalCustomer}
        petName={petName}
        petSpecies={petSpecies}
        petBreed={petBreed}
        petGender={petGender}
        petWeightKg={petWeightKg}
        petAllergies={petAllergies}
        petBehavior={petBehavior}
        onChangePetName={setPetName}
        onChangePetSpecies={setPetSpecies}
        onChangePetBreed={setPetBreed}
        onChangePetGender={setPetGender}
        onChangePetWeightKg={setPetWeightKg}
        onChangePetAllergies={setPetAllergies}
        onChangePetBehavior={setPetBehavior}
        onClosePetModal={() => setPetModalCustomer(null)}
        onSaveNewPet={handleSaveNewPet}
        webAccountTarget={webAccountTarget}
        webEmail={webEmail}
        webAuthMethod={webAuthMethod}
        webOtpCode={webOtpCode}
        webPassword={webPassword}
        onChangeWebEmail={setWebEmail}
        onChangeWebAuthMethod={setWebAuthMethod}
        onChangeWebOtpCode={setWebOtpCode}
        onChangeWebPassword={setWebPassword}
        onCloseWebModal={() => setWebAccountTarget(null)}
        onActivateWebAccount={handleActivateWebAccount}
      />
    </div>
  );
}
