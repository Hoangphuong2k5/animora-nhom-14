import React from "react";
import { Briefcase, Building2, Plus, UserCheck } from "lucide-react";
import type { EmploymentType } from "@/types/expert.type";

interface StaffAccountCreateFormProps {
  newAccType: "staff" | "supplier";
  setNewAccType: (val: "staff" | "supplier") => void;
  newAccName: string;
  setNewAccName: (val: string) => void;
  newAccEmail: string;
  setNewAccEmail: (val: string) => void;
  newAccPhone: string;
  setNewAccPhone: (val: string) => void;
  newAccEmployment: EmploymentType;
  setNewAccEmployment: (val: EmploymentType) => void;
  newAccSpecialty: string;
  setNewAccSpecialty: (val: string) => void;
  newSupplierCompany: string;
  setNewSupplierCompany: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** Tab 3 form for provisioning internal specialist or supplier accounts. */
export function StaffAccountCreateForm({
  newAccType,
  setNewAccType,
  newAccName,
  setNewAccName,
  newAccEmail,
  setNewAccEmail,
  newAccPhone,
  setNewAccPhone,
  newAccEmployment,
  setNewAccEmployment,
  newAccSpecialty,
  setNewAccSpecialty,
  newSupplierCompany,
  setNewSupplierCompany,
  onSubmit,
}: StaffAccountCreateFormProps) {
  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-5">
      <div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#FF7F6B]" />
          Cấp Quyền &amp; Tạo Tài Khoản Mới
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Do tính bảo mật, Nhà cung cấp (Supplier) và Chuyên viên nội bộ không tự
          đăng ký tài khoản mà phải được Quản trị viên khởi tạo trực tiếp.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-semibold text-zinc-500 block mb-1.5">
            Loại tài khoản:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setNewAccType("staff")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                newAccType === "staff"
                  ? "border-[#6B1F2E] bg-[#6B1F2E]/5 text-[#6B1F2E] dark:text-[#FF7F6B] font-bold"
                  : "border-zinc-200 dark:border-border text-zinc-600 dark:text-muted-foreground"
              }`}
            >
              <UserCheck className="w-4 h-4 mb-1" />
              <div>Chuyên viên &amp; Nhân sự</div>
              <div className="text-[10px] font-normal text-zinc-400">
                Bác sĩ, Groomer, Kỹ thuật viên
              </div>
            </button>

            <button
              type="button"
              onClick={() => setNewAccType("supplier")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                newAccType === "supplier"
                  ? "border-[#6B1F2E] bg-[#6B1F2E]/5 text-[#6B1F2E] dark:text-[#FF7F6B] font-bold"
                  : "border-zinc-200 dark:border-border text-zinc-600 dark:text-muted-foreground"
              }`}
            >
              <Building2 className="w-4 h-4 mb-1" />
              <div>Nhà cung cấp (Supplier)</div>
              <div className="text-[10px] font-normal text-zinc-400">
                Đơn vị phân phối thuốc, thức ăn, phụ kiện
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-zinc-500 block mb-1">
              {newAccType === "staff"
                ? "Họ và tên nhân sự:"
                : "Người đại diện liên hệ:"}
            </label>
            <input
              type="text"
              required
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              placeholder="Nguyễn Văn A..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-500 block mb-1">
              Email đăng nhập:
            </label>
            <input
              type="email"
              required
              value={newAccEmail}
              onChange={(e) => setNewAccEmail(e.target.value)}
              placeholder="nhansu@animora.vn..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-zinc-500 block mb-1">
              Số điện thoại liên hệ:
            </label>
            <input
              type="text"
              value={newAccPhone}
              onChange={(e) => setNewAccPhone(e.target.value)}
              placeholder="0901234567..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
            />
          </div>

          {newAccType === "staff" ? (
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">
                Chuyên môn chính:
              </label>
              <input
                type="text"
                value={newAccSpecialty}
                onChange={(e) => setNewAccSpecialty(e.target.value)}
                placeholder="Bác sĩ thú y / Spa & Trông giữ..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
              />
            </div>
          ) : (
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">
                Tên công ty / Đơn vị cung cấp:
              </label>
              <input
                type="text"
                value={newSupplierCompany}
                onChange={(e) => setNewSupplierCompany(e.target.value)}
                placeholder="Royal Canin VN, Purina, Virbac..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
              />
            </div>
          )}
        </div>

        {newAccType === "staff" && (
          <div>
            <label className="font-semibold text-zinc-500 block mb-1.5">
              Hình thức làm việc (Cố định theo nghiệp vụ v1.4):
            </label>
            <div className="p-2.5 rounded-xl border border-[#6B1F2E] bg-[#6B1F2E]/5 text-[#6B1F2E] dark:text-[#FF7F6B] font-bold">
              <div>Full-time (Thứ 2 – Thứ 7 • 08:00 – 17:00)</div>
              <div className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400">
                Làm việc giờ hành chính cố định (nghỉ trưa 12:00–13:00) &amp; quỹ nghỉ phép tối đa 4 ngày/tháng
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Khởi tạo tài khoản &amp; Cấp mã truy cập</span>
          </button>
        </div>
      </form>
    </div>
  );
}
