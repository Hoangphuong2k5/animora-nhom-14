"use client";

import React from "react";
import { Ban } from "lucide-react";
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
import type {
  MedicineBoxCategory,
  MedicineBoxItem,
  MedicineBoxRequestType,
} from "@/types/expert.type";

interface MedicineRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reqType: MedicineBoxRequestType;
  onSwitchReqType: (nextType: "add" | "discontinue") => void;
  isNewProposal: boolean;
  onChangeIsNewProposal: (val: boolean) => void;
  customItemType: MedicineBoxCategory;
  onChangeCustomItemType: (val: MedicineBoxCategory) => void;
  customName: string;
  onChangeCustomName: (val: string) => void;
  customIngredient: string;
  onChangeCustomIngredient: (val: string) => void;
  customUnit: string;
  onChangeCustomUnit: (val: string) => void;
  items: MedicineBoxItem[];
  selectedProductId: string;
  onChangeSelectedProductId: (val: string) => void;
  selectedItem?: MedicineBoxItem;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
  reason: string;
  onChangeReason: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function MedicineRequestModal({
  open,
  onOpenChange,
  reqType,
  onSwitchReqType,
  isNewProposal,
  onChangeIsNewProposal,
  customItemType,
  onChangeCustomItemType,
  customName,
  onChangeCustomName,
  customIngredient,
  onChangeCustomIngredient,
  customUnit,
  onChangeCustomUnit,
  items,
  selectedProductId,
  onChangeSelectedProductId,
  selectedItem,
  quantity,
  onChangeQuantity,
  reason,
  onChangeReason,
  onSubmit,
}: MedicineRequestModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground p-6 gap-4 shadow-2xl"
      >
        <DialogHeader className="pb-3 pr-8 border-b border-zinc-100 dark:border-border">
          <DialogTitle className="font-heading font-extrabold text-base">
            {reqType === "add"
              ? "Gửi Yêu Cầu Bổ Sung Kho / Đề Xuất Thuốc Mới"
              : "Đề Xuất Ngừng Kinh Doanh Thuốc Khỏi Danh Mục Shop"}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Quy định kho chung: Bác sĩ không tự xóa sản phẩm; gửi yêu
            cầu bổ sung hoặc đề xuất ngừng kinh doanh để Quản lý phê duyệt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSwitchReqType("add")}
              className={`py-2 px-3 rounded-xl font-bold border text-xs transition-colors cursor-pointer ${
                reqType === "add"
                  ? "bg-[#6B1F2E] text-white border-transparent"
                  : "border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300"
              }`}
            >
              Yêu cầu bổ sung / Thuốc mới
            </button>
            <button
              type="button"
              onClick={() => onSwitchReqType("discontinue")}
              className={`py-2 px-3 rounded-xl font-bold border text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                reqType === "discontinue"
                  ? "bg-amber-600 text-white border-transparent"
                  : "border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300"
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Đề xuất ngừng kinh doanh</span>
            </button>
          </div>

          {reqType === "add" && (
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewProposal}
                onChange={(e) => onChangeIsNewProposal(e.target.checked)}
                className="rounded border-zinc-300 accent-[#6B1F2E]"
              />
              <span>
                Đề xuất thuốc / vắc-xin mới chưa có trong danh mục kho
              </span>
            </label>
          )}

          {isNewProposal && reqType === "add" ? (
            <div className="space-y-3 p-3 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/40 dark:bg-sky-950/20">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onChangeCustomItemType("medicine");
                    onChangeCustomUnit("viên");
                  }}
                  className={`py-1.5 px-2.5 rounded-lg font-bold border text-[11px] cursor-pointer ${
                    customItemType === "medicine"
                      ? "bg-teal-700 text-white border-transparent"
                      : "border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-600"
                  }`}
                >
                  Loại: Thuốc
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeCustomItemType("vaccine");
                    onChangeCustomUnit("liều");
                  }}
                  className={`py-1.5 px-2.5 rounded-lg font-bold border text-[11px] cursor-pointer ${
                    customItemType === "vaccine"
                      ? "bg-indigo-600 text-white border-transparent"
                      : "border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-600"
                  }`}
                >
                  Loại: Vắc-xin
                </button>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-foreground/80">
                  Tên {customItemType === "vaccine" ? "vắc-xin" : "thuốc"} mới *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => onChangeCustomName(e.target.value)}
                  placeholder="VD: Thuốc nhỏ mắt Tobramycin Vet..."
                  className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-foreground/80">
                    Hoạt chất
                  </label>
                  <input
                    type="text"
                    value={customIngredient}
                    onChange={(e) => onChangeCustomIngredient(e.target.value)}
                    placeholder="VD: Tobramycin"
                    className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-foreground/80">
                    Đơn vị tính *
                  </label>
                  <input
                    type="text"
                    required
                    value={customUnit}
                    onChange={(e) => onChangeCustomUnit(e.target.value)}
                    placeholder="viên / lọ / tuýp"
                    className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Chọn thuốc trong kho chung *
              </label>
              <Select
                value={selectedProductId}
                onValueChange={(val) => {
                  if (val !== null) onChangeSelectedProductId(val);
                }}
                items={Object.fromEntries(
                  items.map((it) => [it.shopProductId, it.name])
                )}
              >
                <SelectTrigger className="w-full h-10! px-3 rounded-xl border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {items.map((it) => (
                    <SelectItem key={it.shopProductId} value={it.shopProductId}>
                      [{it.itemType === "vaccine" ? "Vắc-xin" : "Thuốc"}]{" "}
                      {it.name} (Tồn kho chung: {it.warehouseStock} {it.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedItem && (
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-muted/40 border border-zinc-200/60 dark:border-border text-[11px]">
                  <div>
                    <span className="text-zinc-500">
                      Tồn kho chung hiện tại:{" "}
                    </span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {selectedItem.warehouseStock} {selectedItem.unit}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Bạn đã xuất dùng: </span>
                    <strong className="text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {selectedItem.usedByDoctorCount ?? 0} {selectedItem.unit}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {reqType === "discontinue" && (
            <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-[11px] text-amber-800 dark:text-amber-200">
              Yêu cầu này đề nghị Quản lý{" "}
              <strong>ngừng kinh doanh thuốc khỏi danh mục Shop</strong>. Bác sĩ
              không tự xóa sản phẩm; Quản lý sẽ kiểm tra ràng buộc đơn thuốc và
              đơn hàng trước khi phê duyệt.
            </div>
          )}

          {reqType !== "discontinue" && (
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Số lượng đề nghị bổ sung (
                {isNewProposal ? customUnit : selectedItem?.unit || "đơn vị"}) *
              </label>
              <input
                type="number"
                min={1}
                step={1}
                required
                value={quantity}
                onChange={(e) =>
                  onChangeQuantity(
                    Math.max(1, Math.trunc(Number(e.target.value) || 1))
                  )
                }
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">
              Lý do gửi Quản lý *
            </label>
            <Textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => onChangeReason(e.target.value)}
              placeholder={
                reqType === "add"
                  ? "VD: Tồn kho chung sắp hết, đề nghị Quản lý nhập bổ sung để phục vụ điều trị..."
                  : "VD: Đã có phác đồ thuốc mới an toàn hơn, đề nghị ngừng kinh doanh sản phẩm này..."
              }
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-bold text-white cursor-pointer ${
                reqType === "add"
                  ? "bg-[#6B1F2E] hover:bg-[#521723]"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              Gửi Quản lý duyệt
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

