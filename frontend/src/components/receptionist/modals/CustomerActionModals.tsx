"use client";

import React from "react";
import { CheckCircle2, KeyRound, PawPrint } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ALLOWED_V14_SPECIES,
  type AllowedV14Species,
  type WalkInCustomerRecord,
} from "@/data/receptionistOpsData";

export interface CustomerActionModalsProps {
  // Modal 1: Tạo nhanh thú cưng (4 loài v1.4)
  petModalCustomer: WalkInCustomerRecord | null;
  petName: string;
  petSpecies: AllowedV14Species;
  petBreed: string;
  petGender: "Đực" | "Cái";
  petWeightKg: string;
  petAllergies: string;
  petBehavior: string;
  onChangePetName: (v: string) => void;
  onChangePetSpecies: (v: AllowedV14Species) => void;
  onChangePetBreed: (v: string) => void;
  onChangePetGender: (v: "Đực" | "Cái") => void;
  onChangePetWeightKg: (v: string) => void;
  onChangePetAllergies: (v: string) => void;
  onChangePetBehavior: (v: string) => void;
  onClosePetModal: () => void;
  onSaveNewPet: () => void;

  // Modal 2: Kích hoạt tài khoản Web
  webAccountTarget: WalkInCustomerRecord | null;
  webEmail: string;
  webAuthMethod: "otp" | "password";
  webOtpCode: string;
  webPassword: string;
  onChangeWebEmail: (v: string) => void;
  onChangeWebAuthMethod: (v: "otp" | "password") => void;
  onChangeWebOtpCode: (v: string) => void;
  onChangeWebPassword: (v: string) => void;
  onCloseWebModal: () => void;
  onActivateWebAccount: () => void;
}

export function CustomerActionModals(props: CustomerActionModalsProps) {
  return (
    <>
      <Dialog
        open={Boolean(props.petModalCustomer)}
        onOpenChange={(open) => {
          if (!open) props.onClosePetModal();
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-[#FF7F6B]" />
              <span>Tạo Hồ Sơ Thú Cưng Khách Vãng Lai</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Chỉ nhận 4 loài (Chó, Mèo, Chuột, Thỏ). Cân nặng và dị ứng do Lễ tân nhập được ghi nhận
              là &quot;Do khách khai&quot;, Bác sĩ sẽ cập nhật và khóa sau khi khám.
            </DialogDescription>
          </DialogHeader>

          {props.petModalCustomer && (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-muted font-bold">
                Chủ nuôi: {props.petModalCustomer.fullName} ({props.petModalCustomer.phone})
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold block mb-1">Tên thú cưng *:</label>
                  <input
                    type="text"
                    value={props.petName}
                    onChange={(e) => props.onChangePetName(e.target.value)}
                    placeholder="VD: Bơ, Miu, Lu..."
                    className="w-full h-9 px-3 rounded-xl border bg-white dark:bg-muted"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Loài (4 loài v1.4 *):</label>
                  <select
                    value={props.petSpecies}
                    onChange={(e) =>
                      props.onChangePetSpecies(e.target.value as AllowedV14Species)
                    }
                    className="w-full h-9 px-3 rounded-xl border bg-white dark:bg-muted font-bold"
                  >
                    {ALLOWED_V14_SPECIES.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold block mb-1">Giống:</label>
                  <input
                    type="text"
                    value={props.petBreed}
                    onChange={(e) => props.onChangePetBreed(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border bg-white dark:bg-muted"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Giới tính:</label>
                  <select
                    value={props.petGender}
                    onChange={(e) =>
                      props.onChangePetGender(e.target.value as "Đực" | "Cái")
                    }
                    className="w-full h-9 px-3 rounded-xl border bg-white dark:bg-muted"
                  >
                    <option value="Đực">Đực</option>
                    <option value="Cái">Cái</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Cân nặng khai (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={props.petWeightKg}
                    onChange={(e) => props.onChangePetWeightKg(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border bg-white dark:bg-muted font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Dị ứng (Do khách khai):</label>
                <input
                  type="text"
                  value={props.petAllergies}
                  onChange={(e) => props.onChangePetAllergies(e.target.value)}
                  placeholder="Ví dụ: Dị ứng đạm bò, phấn hoa..."
                  className="w-full h-9 px-3 rounded-xl border bg-white dark:bg-muted"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">
                  Hành vi / Lưu ý (VD: sợ tiếng máy sấy):
                </label>
                <input
                  type="text"
                  value={props.petBehavior}
                  onChange={(e) => props.onChangePetBehavior(e.target.value)}
                  placeholder="Ví dụ: Sợ tiếng máy sấy lớn..."
                  className="w-full h-9 px-3 rounded-xl border bg-white dark:bg-muted"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={props.onClosePetModal}
              className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={props.onSaveNewPet}
              className="px-4 py-2 rounded-xl bg-[#6B1F2E] text-white text-xs font-bold cursor-pointer"
            >
              Tạo hồ sơ thú cưng
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(props.webAccountTarget)}
        onOpenChange={(open) => {
          if (!open) props.onCloseWebModal();
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-sky-600" />
              <span>Tạo Tài Khoản Web Giúp Khách</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Nếu khách vãng lai muốn dùng Web để xem sổ sức khỏe và đặt lịch online, Lễ tân tạo
              tài khoản giúp; khách xác thực bằng OTP hoặc tự đặt mật khẩu. Toàn bộ thú cưng và lịch
              hẹn cũ được giữ nguyên.
            </DialogDescription>
          </DialogHeader>

          {props.webAccountTarget && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-muted border border-zinc-200 dark:border-border">
                <div className="font-bold">Khách hàng: {props.webAccountTarget.fullName}</div>
                <div className="text-zinc-500">
                  SĐT định danh: {props.webAccountTarget.phone}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Địa chỉ Email đăng nhập Web *:</label>
                <input
                  type="email"
                  value={props.webEmail}
                  onChange={(e) => props.onChangeWebEmail(e.target.value)}
                  placeholder="khachhang@gmail.com"
                  className="w-full h-9 px-3 rounded-xl border bg-white dark:bg-muted"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Hình thức khách xác thực kích hoạt:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => props.onChangeWebAuthMethod("otp")}
                    className={`py-2 px-3 rounded-xl border font-bold cursor-pointer ${
                      props.webAuthMethod === "otp"
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-zinc-50 dark:bg-muted"
                    }`}
                  >
                    Xác thực bằng mã OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => props.onChangeWebAuthMethod("password")}
                    className={`py-2 px-3 rounded-xl border font-bold cursor-pointer ${
                      props.webAuthMethod === "password"
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-zinc-50 dark:bg-muted"
                    }`}
                  >
                    Khách tự đặt mật khẩu
                  </button>
                </div>
              </div>

              {props.webAuthMethod === "otp" ? (
                <div>
                  <label className="font-bold block mb-1">
                    Nhập mã OTP khách đọc (Mã demo: 123456):
                  </label>
                  <input
                    type="text"
                    value={props.webOtpCode}
                    onChange={(e) => props.onChangeWebOtpCode(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border bg-white dark:bg-muted font-mono font-bold"
                  />
                </div>
              ) : (
                <div>
                  <label className="font-bold block mb-1">
                    Khách tự nhập mật khẩu (tối thiểu 6 ký tự):
                  </label>
                  <input
                    type="password"
                    value={props.webPassword}
                    onChange={(e) => props.onChangeWebPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full h-9 px-3 rounded-xl border bg-white dark:bg-muted"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={props.onCloseWebModal}
              className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={props.onActivateWebAccount}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kích hoạt tài khoản Web</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
