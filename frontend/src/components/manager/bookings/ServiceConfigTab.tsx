"use client";

import React, { useEffect, useState } from "react";
import { Clock, CreditCard, DollarSign, Edit3, Plus, ShieldCheck, Sparkles, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  MANAGER_STORAGE_KEYS,
  PAYMENT_POLICY_LABEL,
  SEED_SERVICE_CONFIG,
  formatVnd,
  useManagerStore,
  type PaymentPolicy,
  type ServiceConfigItem,
} from "@/data/managerOpsData";
import { SERVICE_PAYMENT_SETTINGS_KEY } from "@/data/servicesData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const CATEGORY_SELECT_LABELS: Record<"vet" | "spa" | "boarding" | "training", string> = {
  vet: "Thú Y & Y Tế",
  spa: "Spa & Cắt Tỉa",
  boarding: "Khách Sạn Lưu Trú",
  training: "Huấn Luyện",
};

const PAYMENT_SELECT_LABELS: Record<PaymentPolicy, string> = {
  postpaid: "Trả sau khi hoàn thành (tại quầy)",
  prepaid: "Bắt buộc trả trước khi đặt lịch (online 100%)",
  flexible: "Linh hoạt (cho phép đặt cọc hoặc trả sau)",
};

export function ServiceConfigTab({ addSignal = 0 }: { addSignal?: number }) {
  const [services, setServices] = useManagerStore<ServiceConfigItem[]>(
    MANAGER_STORAGE_KEYS.serviceConfig,
    SEED_SERVICE_CONFIG
  );

  const [editingItem, setEditingItem] = useState<ServiceConfigItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ServiceConfigItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"vet" | "spa" | "boarding" | "training">("vet");
  const [priceStr, setPriceStr] = useState("300000");
  const [durationStr, setDurationStr] = useState("45");
  const [paymentPolicy, setPaymentPolicy] = useState<PaymentPolicy>("postpaid");
  const [depositPercent, setDepositPercent] = useState(0);
  const [active, setActive] = useState(true);

  const handleOpenAdd = () => {
    setName("");
    setCategory("vet");
    setPriceStr("300000");
    setDurationStr("45");
    setPaymentPolicy("postpaid");
    setDepositPercent(0);
    setActive(true);
    setIsAddOpen(true);
  };

  useEffect(() => {
    if (addSignal > 0) {
      handleOpenAdd();
    }
  }, [addSignal]);

  const handleOpenEdit = (item: ServiceConfigItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPriceStr(String(item.price));
    setDurationStr(String(item.durationMinutes));
    setPaymentPolicy(item.paymentPolicy);
    setDepositPercent(item.depositPercent);
    setActive(item.active);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDuration = parseInt(durationStr, 10) || 0;
    const parsedPrice = parseInt(priceStr, 10) || 0;

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên dịch vụ.");
      return;
    }
    if (parsedDuration < 1) {
      toast.error("Thời lượng phải lớn hơn 0 phút.");
      return;
    }
    if (parsedPrice <= 0) {
      toast.error("Vui lòng nhập giá niêm yết lớn hơn 0.");
      return;
    }

    if (editingItem) {
      const next = services.map((s) =>
        s.id === editingItem.id
          ? {
              ...s,
              name: name.trim(),
              category,
              price: parsedPrice,
              durationMinutes: parsedDuration,
              paymentPolicy,
              depositPercent: paymentPolicy === "prepaid" ? 100 : paymentPolicy === "postpaid" ? 0 : depositPercent,
              active,
            }
          : s
      );
      setServices(next);
      if (typeof window !== "undefined" && (paymentPolicy === "prepaid" || paymentPolicy === "postpaid")) {
        try {
          const raw = window.localStorage.getItem(SERVICE_PAYMENT_SETTINGS_KEY);
          const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
          map[editingItem.id] = paymentPolicy;
          window.localStorage.setItem(SERVICE_PAYMENT_SETTINGS_KEY, JSON.stringify(map));
        } catch {
          // ignore storage errors
        }
      }
      setEditingItem(null);
      toast.success("Đã cập nhật dịch vụ & hình thức thanh toán!");
    } else {
      const newItem: ServiceConfigItem = {
        id: `svc-${Date.now()}`,
        name: name.trim(),
        category,
        price: parsedPrice,
        durationMinutes: parsedDuration,
        paymentPolicy,
        depositPercent: paymentPolicy === "prepaid" ? 100 : paymentPolicy === "postpaid" ? 0 : depositPercent,
        active,
      };
      setServices([...services, newItem]);
      setIsAddOpen(false);
      toast.success(`Đã thêm dịch vụ mới: ${newItem.name}`);
    }
  };

  const handleToggleActive = (id: string) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
    toast.info("Đã cập nhật trạng thái hoạt động của dịch vụ.");
  };

  return (
    <div className="space-y-4">
      {/* Bảng dịch vụ */}
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 px-3 uppercase text-[11px] font-semibold text-zinc-500">Tên dịch vụ</TableHead>
                <TableHead className="py-3 px-3 uppercase text-[11px] font-semibold text-zinc-500">Nhóm dịch vụ</TableHead>
                <TableHead className="py-3 px-3 uppercase text-[11px] font-semibold text-zinc-500 text-right">Giá niêm yết</TableHead>
                <TableHead className="py-3 px-3 uppercase text-[11px] font-semibold text-zinc-500 text-center">Thời lượng</TableHead>
                <TableHead className="py-3 px-3 uppercase text-[11px] font-semibold text-zinc-500">Quy định thanh toán</TableHead>
                <TableHead className="py-3 px-3 uppercase text-[11px] font-semibold text-zinc-500 text-center">Trạng thái</TableHead>
                <TableHead className="py-3 px-3 uppercase text-[11px] font-semibold text-zinc-500 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((svc) => (
                <TableRow
                  key={svc.id}
                  className={`hover:bg-zinc-50/60 dark:hover:bg-muted/40 transition-colors ${
                    !svc.active ? "opacity-75" : ""
                  }`}
                >
                  <TableCell className="py-3.5 px-3">
                    <div className="font-bold text-zinc-900 dark:text-foreground">{svc.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{svc.id}</div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                        {
                          vet: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
                          spa: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
                          boarding: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
                          training: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                        }[svc.category]
                      }`}
                    >
                      {{ vet: "Thú Y", spa: "Spa & Grooming", boarding: "Lưu trú", training: "Huấn luyện" }[svc.category]}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-extrabold tabular-nums text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {formatVnd(svc.price)}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
                    {svc.durationMinutes >= 60 ? `${svc.durationMinutes / 60} giờ` : `${svc.durationMinutes} phút`}
                  </TableCell>
                  <TableCell className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                        svc.paymentPolicy === "prepaid"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          : svc.paymentPolicy === "postpaid"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                      }`}
                    >
                      {PAYMENT_POLICY_LABEL[svc.paymentPolicy]}
                      {svc.paymentPolicy === "flexible" && ` (Cọc ${svc.depositPercent}%)`}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(svc.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                        svc.active
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 hover:bg-amber-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          svc.active ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      <span>{svc.active ? "Đang mở" : "Tạm ngưng"}</span>
                    </button>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(svc)}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItem(svc)}
                        className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        title="Xóa dịch vụ"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Thêm / Sửa dịch vụ */}
      <Dialog
        open={isAddOpen || Boolean(editingItem)}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              {editingItem ? "Sửa Dịch Vụ & Quy Định Thanh Toán" : "Thêm Dịch Vụ Mới"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Quy định áp dụng trực tiếp khi khách hàng đặt lịch trên ứng dụng Animora.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-zinc-700 dark:text-foreground block mb-1">Tên dịch vụ:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Khám định kỳ, Tắm sấy..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-zinc-700 dark:text-foreground block mb-1">Nhóm dịch vụ:</label>
                <Select
                  value={category}
                  onValueChange={(val) => {
                    if (val) setCategory(val as any);
                  }}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue>{CATEGORY_SELECT_LABELS[category]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vet">Thú Y & Y Tế</SelectItem>
                    <SelectItem value="spa">Spa & Cắt Tỉa</SelectItem>
                    <SelectItem value="boarding">Khách Sạn Lưu Trú</SelectItem>
                    <SelectItem value="training">Huấn Luyện</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-foreground block mb-1">Thời lượng (phút):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={durationStr}
                  onChange={(e) => setDurationStr(e.target.value.replace(/\D/g, ""))}
                  placeholder="20"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-zinc-700 dark:text-foreground block mb-1">Giá niêm yết (VND):</label>
              <input
                type="text"
                inputMode="numeric"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value.replace(/\D/g, ""))}
                placeholder="300000"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 dark:text-foreground block mb-1">
                Hình thức thanh toán áp dụng:
              </label>
              <Select
                value={paymentPolicy}
                onValueChange={(val) => {
                  if (val) setPaymentPolicy(val as PaymentPolicy);
                }}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue>{PAYMENT_SELECT_LABELS[paymentPolicy]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postpaid">Trả sau khi hoàn thành (tại quầy)</SelectItem>
                  <SelectItem value="prepaid">Bắt buộc trả trước khi đặt lịch (online 100%)</SelectItem>
                  <SelectItem value="flexible">Linh hoạt (cho phép đặt cọc hoặc trả sau)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentPolicy === "flexible" && (
              <div>
                <label className="font-bold text-zinc-700 dark:text-foreground block mb-1">
                  Tỷ lệ đặt cọc trước (%):
                </label>
                <input
                  type="number"
                  min={10}
                  max={90}
                  step={10}
                  value={depositPercent}
                  onChange={(e) => setDepositPercent(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground font-mono"
                />
              </div>
            )}

            <div>
              <label className="font-bold text-zinc-700 dark:text-foreground block mb-1">
                Trạng thái:
              </label>
              <Select
                value={active ? "active" : "paused"}
                onValueChange={(val) => {
                  if (val) setActive(val === "active");
                }}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue>{active ? "Đang mở" : "Tạm ngưng"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang mở</SelectItem>
                  <SelectItem value="paused">Tạm ngưng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingItem(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-border text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Lưu dịch vụ
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal xác nhận xóa dịch vụ */}
      <Dialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
      >
        <DialogContent className="sm:max-w-sm rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Xác nhận xóa dịch vụ
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-muted-foreground pt-1">
              Bạn có chắc chắn muốn xóa dịch vụ{" "}
              <span className="font-bold text-zinc-900 dark:text-foreground">
                {deletingItem?.name}
              </span>{" "}
              khỏi danh mục cấu hình?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setDeletingItem(null)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-border text-xs font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                if (!deletingItem) return;
                setServices(services.filter((s) => s.id !== deletingItem.id));
                toast.success(`Đã xóa dịch vụ: ${deletingItem.name}`);
                setDeletingItem(null);
              }}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Xóa dịch vụ
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

