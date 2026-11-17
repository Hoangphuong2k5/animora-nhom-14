"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  History,
  Pause,
  Play,
  Plus,
  Search,
  Ticket,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import {
  type ShopVoucher,
  type VoucherAuditLogEntry,
  VOUCHERS_SYNC_EVENT,
  appendVoucherAuditLog,
  getEffectiveVoucherStatus,
  getLocalDateIso,
  readVoucherAuditLogs,
  readVouchersFromStorage,
  validateVoucherFormInput,
  writeVouchersToStorage,
} from "@/utils/voucherSync";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoucherFormDialog, type VoucherFormState } from "./VoucherFormDialog";

export type { ShopVoucher as AdminVoucher };

export interface VouchersWorkspaceProps {
  mode?: "manager" | "readonly";
}

/** Shared Vouchers & Coupons workspace for Manager (interactive) and Admin (read-only). */
export function VouchersWorkspace({ mode = "manager" }: VouchersWorkspaceProps) {
  const isReadOnly = mode === "readonly";
  const [vouchers, setVouchers] = useState<ShopVoucher[]>([]);
  const [auditLogs, setAuditLogs] = useState<VoucherAuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<ShopVoucher | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [todayIso, setTodayIso] = useState("");
  const [form, setForm] = useState<VoucherFormState>({
    code: "",
    discountType: "percent",
    discountValue: 15,
    minOrderValue: 300000,
    maxDiscount: 100000,
    applicableTo: "Toàn bộ sản phẩm Shop Animora",
    startDate: "",
    endDate: "",
    maxUsage: 100,
  });

  useEffect(() => {
    let cancelled = false;
    const syncAll = () => {
      if (cancelled) return;
      setVouchers(readVouchersFromStorage());
      if (!isReadOnly) {
        setAuditLogs(readVoucherAuditLogs());
      }
    };

    queueMicrotask(() => {
      if (cancelled) return;
      const today = getLocalDateIso(0);
      setTodayIso(today);
      setForm((prev) => ({
        ...prev,
        startDate: today,
        endDate: getLocalDateIso(30),
      }));
      syncAll();
    });

    window.addEventListener(VOUCHERS_SYNC_EVENT, syncAll);
    window.addEventListener("storage", syncAll);
    return () => {
      cancelled = true;
      window.removeEventListener(VOUCHERS_SYNC_EVENT, syncAll);
      window.removeEventListener("storage", syncAll);
    };
  }, [isReadOnly]);

  const saveVouchers = (updated: ShopVoucher[]) => {
    if (isReadOnly) return;
    setVouchers(updated);
    writeVouchersToStorage(updated);
  };

  const handleToggleStatus = (voucherId: string) => {
    if (isReadOnly) return;
    const target = vouchers.find((v) => v.id === voucherId);
    if (!target) return;
    const effectiveStatus = getEffectiveVoucherStatus(target, todayIso);
    if (effectiveStatus === "exhausted") {
      toast.error("Voucher đã đạt giới hạn lượt sử dụng, không thể kích hoạt lại!");
      return;
    }
    if (effectiveStatus === "expired") {
      toast.error("Voucher đã hết hạn sử dụng, không thể kích hoạt lại!");
      return;
    }
    const nextStatus: "active" | "paused" =
      target.status === "active" ? "paused" : "active";
    const updated = vouchers.map((v) =>
      v.id === voucherId ? { ...v, status: nextStatus } : v
    );
    saveVouchers(updated);
    const logs = appendVoucherAuditLog({
      action: nextStatus === "paused" ? "PAUSE" : "ACTIVATE",
      voucherCode: target.code,
      detail:
        nextStatus === "paused"
          ? `Tạm dừng voucher ${target.code}`
          : `Kích hoạt lại voucher ${target.code}`,
      oldValues: { status: target.status },
      newValues: { status: nextStatus },
    });
    setAuditLogs(logs);
    toast.success("Đã thay đổi trạng thái kích hoạt của voucher!");
  };

  const handleDeleteVoucher = (voucherId: string) => {
    if (isReadOnly) return;
    const target = vouchers.find((v) => v.id === voucherId);
    if (!target) return;
    if (target.usedCount > 0) {
      toast.error(
        `Voucher ${target.code} đã có ${target.usedCount} lượt sử dụng, không thể xóa cứng. Vui lòng tạm dừng thay thế.`
      );
      return;
    }
    saveVouchers(vouchers.filter((v) => v.id !== voucherId));
    const logs = appendVoucherAuditLog({
      action: "DELETE",
      voucherCode: target.code,
      detail: `Xóa voucher chưa phát sinh lượt dùng ${target.code}`,
      oldValues: { code: target.code, usedCount: target.usedCount },
      newValues: null,
    });
    setAuditLogs(logs);
    toast.warning("Đã xóa voucher khỏi hệ thống!");
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const validation = validateVoucherFormInput(
      {
        code: form.code,
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrderValue: form.minOrderValue,
        maxDiscount: form.discountType === "percent" ? form.maxDiscount : undefined,
        applicableTo: form.applicableTo,
        startDate: form.startDate,
        endDate: form.endDate,
        maxUsage: form.maxUsage,
      },
      vouchers
    );

    if (!validation.valid) {
      toast.error(validation.errorMessage || "Dữ liệu voucher không hợp lệ!");
      return;
    }

    const created: ShopVoucher = {
      id: `vouch-${Date.now()}`,
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: form.discountValue,
      minOrderValue: form.minOrderValue,
      maxDiscount: form.discountType === "percent" ? form.maxDiscount : undefined,
      applicableTo: form.applicableTo.trim(),
      applicableScope: "shop",
      startDate: form.startDate,
      endDate: form.endDate,
      usedCount: 0,
      maxUsage: form.maxUsage,
      status: "active",
    };

    saveVouchers([created, ...vouchers]);
    const logs = appendVoucherAuditLog({
      action: "CREATE",
      voucherCode: created.code,
      detail: `Phát hành voucher Shop ${created.code}`,
      oldValues: null,
      newValues: {
        code: created.code,
        discountType: created.discountType,
        discountValue: created.discountValue,
        maxDiscount: created.maxDiscount ?? null,
        minOrderValue: created.minOrderValue,
        maxUsage: created.maxUsage,
      },
    });
    setAuditLogs(logs);
    setIsAddModalOpen(false);
    setForm((prev) => ({ ...prev, code: "" }));
    toast.success(`Đã phát hành mã ưu đãi ${created.code} thành công!`);
  };

  const filtered = vouchers.filter((v) => {
    const effectiveStatus = getEffectiveVoucherStatus(v, todayIso);
    const matchStatus = filterStatus === "all" ? true : effectiveStatus === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q || v.code.toLowerCase().includes(q) || v.applicableTo.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const filterTabs = [
    { id: "all", label: `Tất cả (${vouchers.length})` },
    {
      id: "active",
      label: `Đang chạy (${vouchers.filter((v) => getEffectiveVoucherStatus(v, todayIso) === "active").length})`,
    },
    {
      id: "paused",
      label: `Tạm dừng (${vouchers.filter((v) => getEffectiveVoucherStatus(v, todayIso) === "paused").length})`,
    },
    {
      id: "upcoming",
      label: `Sắp diễn ra (${vouchers.filter((v) => getEffectiveVoucherStatus(v, todayIso) === "upcoming").length})`,
    },
    {
      id: "exhausted",
      label: `Đã hết (${vouchers.filter((v) => getEffectiveVoucherStatus(v, todayIso) === "exhausted").length})`,
    },
    {
      id: "expired",
      label: `Hết hạn (${vouchers.filter((v) => getEffectiveVoucherStatus(v, todayIso) === "expired").length})`,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            {isReadOnly
              ? "Tra Cứu Mã Giảm Giá & Voucher"
              : "Quản Lý Mã Giảm Giá & Voucher"}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {isReadOnly
              ? "Tra cứu chương trình khuyến mãi, coupon tri ân khách hàng và giới hạn lượt sử dụng"
              : "Thiết lập khuyến mãi, coupon tri ân khách hàng và theo dõi giới hạn lượt sử dụng"}
          </p>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="self-start sm:self-center px-4 py-2.5 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo voucher mới</span>
          </button>
        )}
      </div>

      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã coupon, dịch vụ áp dụng..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
          />
        </div>

        <Tabs
          value={filterStatus}
          onValueChange={(val) => {
            if (val) setFilterStatus(val as string);
          }}
          className="self-start sm:self-auto"
        >
          <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
            {filterTabs.map((tab) => (
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

      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Mã Voucher
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Mức giảm
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Điều kiện áp dụng
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Thời hạn hiệu lực
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Đã dùng / Giới hạn
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Trạng thái
              </TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                {isReadOnly ? "Chế độ" : "Thao tác"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
            {filtered.map((v) => {
              const effectiveStatus = getEffectiveVoucherStatus(v, todayIso);
              const disableResume =
                effectiveStatus === "exhausted" || effectiveStatus === "expired";
              const cannotDeleteUsed = v.usedCount > 0;
              return (
                <TableRow
                  key={v.id}
                  className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors"
                >
                  <TableCell className="py-3.5 px-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#6B1F2E]/10 dark:bg-[#6B1F2E]/20 text-[#6B1F2E] dark:text-[#FF7F6B] font-mono font-extrabold text-sm border border-[#6B1F2E]/20">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{v.code}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-3">
                    <div className="font-extrabold text-zinc-900 dark:text-foreground text-sm">
                      {v.discountType === "percent"
                        ? `Giảm ${v.discountValue}%`
                        : `Giảm ${v.discountValue.toLocaleString("vi-VN")}₫`}
                    </div>
                    {v.maxDiscount && (
                      <div className="text-[11px] text-zinc-400">
                        Tối đa: {v.maxDiscount.toLocaleString("vi-VN")}₫
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-3.5 px-3 max-w-[220px] whitespace-normal">
                    <div className="font-semibold text-zinc-800 dark:text-foreground/90">
                      {v.applicableTo}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Đơn tối thiểu: {v.minOrderValue.toLocaleString("vi-VN")}₫
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-zinc-600 dark:text-muted-foreground font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#FF7F6B] shrink-0" />
                      <span className="font-mono">
                        {formatDateDdMmYyyy(v.startDate)} → {formatDateDdMmYyyy(v.endDate)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-center">
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      {v.usedCount} / {v.maxUsage}
                    </div>
                    <div className="w-24 h-1.5 bg-zinc-100 dark:bg-muted rounded-full mx-auto mt-1 overflow-hidden">
                      <div
                        className="h-full bg-[#FF7F6B] rounded-full"
                        style={{
                          width: `${Math.min(100, (v.usedCount / v.maxUsage) * 100)}%`,
                        }}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        effectiveStatus === "active"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : effectiveStatus === "paused"
                            ? "bg-amber-500/10 text-amber-600"
                            : effectiveStatus === "upcoming"
                              ? "bg-sky-500/10 text-sky-600"
                              : effectiveStatus === "exhausted"
                                ? "bg-rose-500/10 text-rose-500"
                                : "bg-zinc-100 dark:bg-muted text-zinc-400"
                      }`}
                    >
                      {effectiveStatus === "active"
                        ? "Đang chạy"
                        : effectiveStatus === "paused"
                          ? "Tạm dừng"
                          : effectiveStatus === "upcoming"
                            ? "Sắp diễn ra"
                            : effectiveStatus === "exhausted"
                              ? "Đã hết"
                              : "Hết hạn"}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-right">
                    {isReadOnly ? (
                      <span className="text-[11px] text-zinc-400 font-medium">Chỉ xem</span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={disableResume}
                          onClick={() => handleToggleStatus(v.id)}
                          className={`p-2 rounded-xl border transition-colors ${
                            disableResume
                              ? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400 opacity-40 cursor-not-allowed"
                              : effectiveStatus === "active"
                                ? "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                          }`}
                          title={
                            effectiveStatus === "exhausted"
                              ? "Đã đạt giới hạn lượt sử dụng"
                              : effectiveStatus === "expired"
                                ? "Voucher đã hết hạn sử dụng"
                                : effectiveStatus === "active"
                                  ? "Tạm dừng áp dụng"
                                  : "Tiếp tục chạy voucher"
                          }
                        >
                          {effectiveStatus === "active" ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (cannotDeleteUsed) {
                              toast.error(
                                `Voucher ${v.code} đã phát sinh ${v.usedCount} lượt sử dụng, không thể xóa cứng. Vui lòng tạm dừng thay thế.`
                              );
                              return;
                            }
                            setVoucherToDelete(v);
                            setIsDeleteModalOpen(true);
                          }}
                          className={`p-2 rounded-xl border transition-colors ${
                            cannotDeleteUsed
                              ? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400 opacity-50 cursor-not-allowed"
                              : "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                          }`}
                          title={
                            cannotDeleteUsed
                              ? "Không thể xóa voucher đã có lượt sử dụng (chỉ được tạm dừng)"
                              : "Xóa voucher"
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {!isReadOnly && auditLogs.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-foreground">
            <History className="w-4 h-4 text-[#FF7F6B]" />
            <span>Nhật ký thao tác Voucher gần đây</span>
          </div>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1 text-xs">
            {auditLogs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-muted/50 border border-zinc-200/60 dark:border-border/60"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1F2E]/10 text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {log.actorLabel}
                  </span>
                  <span className="font-mono font-bold">{log.voucherCode}</span>
                  <span className="text-zinc-600 dark:text-muted-foreground">{log.detail}</span>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isReadOnly && (
        <>
          <VoucherFormDialog
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            todayIso={todayIso}
            form={form}
            setForm={setForm}
            onSubmit={handleCreateVoucher}
          />

          <Dialog
            open={isDeleteModalOpen}
            onOpenChange={(open) => setIsDeleteModalOpen(open)}
          >
            <DialogContent
              showCloseButton={true}
              className="sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
            >
              <DialogHeader className="pr-8">
                <DialogTitle className="text-base font-bold text-rose-500 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa Mã Voucher Khuyến Mãi</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-1">
                  Bạn có chắc chắn muốn xóa mã voucher{" "}
                  <strong className="font-mono text-foreground">{voucherToDelete?.code}</strong>{" "}
                  khỏi hệ thống không? Thao tác này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 pt-3 text-xs">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (voucherToDelete) {
                      handleDeleteVoucher(voucherToDelete.id);
                    }
                    setIsDeleteModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                >
                  Xác nhận xóa
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
