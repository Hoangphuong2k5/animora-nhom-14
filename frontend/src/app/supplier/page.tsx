"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  Package,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  MANAGER_STORAGE_KEYS,
  PO_STATUS_LABEL,
  PurchaseOrder,
  PurchaseOrderStatus,
  SEED_PURCHASE_ORDERS,
  formatVnd,
  poTotal,
  todayIso,
  useManagerStore,
} from "@/data/managerOpsData";
import { useActiveSupplierFilter } from "@/data/supplierPortalData";
import { pushManagerNotification } from "@/utils/clinicalSync";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
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
import { Textarea } from "@/components/ui/textarea";
import { TablePagination } from "@/components/ui/table-pagination";

const PAGE_SIZE = 5;

export default function SupplierOrdersPage() {
  const [activeSupplier] = useActiveSupplierFilter();
  const [purchaseOrders, setPurchaseOrders] = useManagerStore<PurchaseOrder[]>(
    MANAGER_STORAGE_KEYS.purchaseOrders,
    SEED_PURCHASE_ORDERS
  );

  const [statusFilter, setStatusFilter] = useState<"all" | PurchaseOrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Adjust quantity modal
  const [adjustTarget, setAdjustTarget] = useState<PurchaseOrder | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustDate, setAdjustDate] = useState<string>("");
  const [adjustNote, setAdjustNote] = useState<string>("");

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<PurchaseOrder | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");

  const scopedOrders = useMemo(() => {
    if (activeSupplier === "all") return purchaseOrders;
    return purchaseOrders.filter((po) => po.supplierName === activeSupplier);
  }, [purchaseOrders, activeSupplier]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedOrders.filter((po) => {
      if (statusFilter !== "all" && po.status !== statusFilter) return false;
      if (q) {
        const matchCode = po.code.toLowerCase().includes(q);
        const matchSup = po.supplierName.toLowerCase().includes(q);
        const matchLine = po.lines.some((l) =>
          l.productName.toLowerCase().includes(q)
        );
        if (!matchCode && !matchSup && !matchLine) return false;
      }
      return true;
    });
  }, [scopedOrders, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, safePage]);

  const pendingCount = scopedOrders.filter((po) => po.status === "sent").length;
  const deliveringCount = scopedOrders.filter(
    (po) => po.status === "delivering"
  ).length;
  const receivedCount = scopedOrders.filter(
    (po) => po.status === "received" || po.status === "received_partial"
  ).length;
  const totalValue = scopedOrders
    .filter((po) => po.status !== "supplier_rejected")
    .reduce((sum, po) => sum + poTotal(po), 0);

  const handleConfirmPO = (po: PurchaseOrder) => {
    if (po.status !== "sent") {
      toast.error("Chỉ có thể xác nhận đơn hàng đang ở trạng thái Đã gửi NCC!");
      return;
    }
    setPurchaseOrders((prev) =>
      prev.map((item) =>
        item.id === po.id ? { ...item, status: "supplier_confirmed" } : item
      )
    );
    pushManagerNotification({
      type: "stock",
      title: `NCC xác nhận đơn ${po.code}`,
      desc: `${po.supplierName} đã xác nhận đủ số lượng đơn ${po.code}.`,
      href: "/manager/shop?tab=suppliers",
    });
    toast.success(`Đã xác nhận đủ số lượng cho đơn ${po.code}!`);
  };

  const openAdjustModal = (po: PurchaseOrder) => {
    if (po.status !== "sent") return;
    const firstLine = po.lines[0];
    setAdjustTarget(po);
    setAdjustQty(firstLine?.confirmedQuantity ?? firstLine?.quantity ?? 1);
    setAdjustDate(po.expectedDate || todayIso());
    setAdjustNote(po.note || "");
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    if (adjustTarget.status !== "sent") {
      toast.error("Đơn hàng này không còn ở trạng thái cho phép điều chỉnh!");
      setAdjustTarget(null);
      return;
    }
    const cleanNote = adjustNote.trim();
    const safeQty = Math.max(1, Math.trunc(adjustQty));
    const orderedQty = adjustTarget.lines[0]?.quantity ?? safeQty;

    setPurchaseOrders((prev) =>
      prev.map((item) => {
        if (item.id !== adjustTarget.id) return item;
        return {
          ...item,
          status:
            safeQty === orderedQty ? "supplier_confirmed" : "supplier_adjusted",
          expectedDate: adjustDate || item.expectedDate,
          note:
            cleanNote ||
            (safeQty !== orderedQty
              ? `NCC điều chỉnh SL từ ${orderedQty} còn ${safeQty} theo tồn kho thực tế`
              : item.note),
          lines: item.lines.map((l, idx) =>
            idx === 0 ? { ...l, confirmedQuantity: safeQty } : l
          ),
        };
      })
    );

    pushManagerNotification({
      type: "stock",
      title: `NCC điều chỉnh đơn ${adjustTarget.code}`,
      desc: `${adjustTarget.supplierName} cập nhật SL chốt ${safeQty} (dự kiến giao ${formatDateDdMmYyyy(
        adjustDate || adjustTarget.expectedDate
      )}).`,
      href: "/manager/shop?tab=suppliers",
    });

    toast.success(
      `Đã cập nhật số lượng chốt (${safeQty}) cho đơn ${adjustTarget.code}. Bạn có thể tiến hành giao hàng ngay.`
    );
    setAdjustTarget(null);
  };

  const handleStartDelivery = (po: PurchaseOrder) => {
    if (po.status !== "supplier_confirmed" && po.status !== "supplier_adjusted") {
      toast.error("Đơn hàng phải được xác nhận hoặc điều chỉnh trước khi xuất giao!");
      return;
    }
    setPurchaseOrders((prev) =>
      prev.map((item) =>
        item.id === po.id ? { ...item, status: "delivering" } : item
      )
    );
    pushManagerNotification({
      type: "stock",
      title: `Đơn ${po.code} đang giao tới Animora`,
      desc: `${po.supplierName} đã xuất kho giao hàng cho Animora.`,
      href: "/manager/shop?tab=suppliers",
    });
    toast.success(`Đã chuyển đơn ${po.code} sang trạng thái Đang giao hàng!`);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    if (rejectTarget.status !== "sent") {
      toast.error("Chỉ có thể từ chối đơn đang chờ xác nhận!");
      setRejectTarget(null);
      return;
    }
    const reason = rejectReason.trim() || "Nhà cung cấp tạm hết nguồn hàng.";
    setPurchaseOrders((prev) =>
      prev.map((item) =>
        item.id === rejectTarget.id
          ? {
              ...item,
              status: "supplier_rejected",
              note: `NCC từ chối: ${reason}`,
            }
          : item
      )
    );
    pushManagerNotification({
      type: "stock",
      title: `NCC từ chối đơn ${rejectTarget.code}`,
      desc: `${rejectTarget.supplierName}: ${reason}`,
      href: "/manager/shop?tab=suppliers",
    });
    toast.error(`Đã từ chối đơn ${rejectTarget.code}.`);
    setRejectTarget(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
          <ClipboardCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Tiếp Nhận &amp; Xử Lý Đơn Nhập Hàng (PO)
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Xác nhận, điều chỉnh số lượng trực tiếp trên đơn và cập nhật trạng thái giao hàng cho Animora
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Chờ NCC xác nhận",
            value: pendingCount,
            tone: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Đang giao hàng",
            value: deliveringCount,
            tone: "text-sky-600 dark:text-sky-400",
          },
          {
            label: "Animora đã nhập kho",
            value: receivedCount,
            tone: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Tổng giá trị đơn hàng",
            value: formatVnd(totalValue),
            tone: "text-[#6B1F2E] dark:text-[#FF7F6B]",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm"
          >
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-muted-foreground">
              {kpi.label}
            </div>
            <div className={`text-xl font-extrabold mt-1 ${kpi.tone}`}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm mã PO, mặt hàng, nhà cung cấp..."
            className="w-full h-10 pl-9 pr-9 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              aria-label="Xóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "sent", label: "Chờ xác nhận" },
              { id: "supplier_confirmed", label: "Đã xác nhận" },
              { id: "supplier_adjusted", label: "Đã điều chỉnh SL" },
              { id: "delivering", label: "Đang giao" },
              { id: "received_partial", label: "Nhập thiếu" },
              { id: "received", label: "Đã nhập kho" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-muted/60 text-zinc-600 dark:text-muted-foreground hover:bg-zinc-200/70 dark:hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* PO Table */}
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Mã PO
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Nhà cung cấp
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Mặt hàng &amp; Số lượng
              </TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Tổng giá trị
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Lịch giao
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Trạng thái
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Thao tác NCC
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-zinc-400">
                  Không có đơn nhập hàng nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((po) => {
                const statusLabel = PO_STATUS_LABEL[po.status] || po.status;
                const canReview = po.status === "sent";
                const canDeliver =
                  po.status === "supplier_confirmed" ||
                  po.status === "supplier_adjusted";

                return (
                  <TableRow
                    key={po.id}
                    className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors"
                  >
                    <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground whitespace-nowrap">
                      {po.code}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 font-semibold text-zinc-800 dark:text-foreground/90 whitespace-normal">
                      {po.supplierName}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 max-w-[280px] whitespace-normal">
                      {po.lines.map((l, idx) => {
                        const expectedDelivery = l.confirmedQuantity ?? l.quantity;
                        const hasReceivedQty = l.receivedQuantity !== undefined;
                        const missingQty = hasReceivedQty
                          ? Math.max(0, expectedDelivery - (l.receivedQuantity ?? 0))
                          : 0;
                        return (
                          <div key={idx}>
                            <span className="font-semibold">{l.productName}</span>
                            {l.newProductMeta && (
                              <span className="ml-1.5 inline-block px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-bold">
                                SP mới
                              </span>
                            )}
                            <span className="text-zinc-400 text-[11px] ml-1">
                              (Đặt x{l.quantity}
                              {l.confirmedQuantity !== undefined &&
                              l.confirmedQuantity !== l.quantity
                                ? ` → Chốt x${l.confirmedQuantity}`
                                : ""}
                              {hasReceivedQty ? ` → Thực nhận x${l.receivedQuantity}` : ""}
                              )
                            </span>
                            {missingQty > 0 && (
                              <span className="ml-1.5 inline-block px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                Thiếu {missingQty}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {po.note && (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                          {po.note}
                        </div>
                      )}
                      {po.discrepancyNote && (
                        <div className="text-[11px] text-rose-500 dark:text-rose-400 italic mt-0.5">
                          Kho đối soát: {po.discrepancyNote}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {formatVnd(poTotal(po))}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center text-zinc-500 font-mono whitespace-nowrap">
                      <div>{formatDateDdMmYyyy(po.expectedDate)}</div>
                      <div className="text-[10px] font-sans text-zinc-400">
                        {po.status === "sent" ? "(Animora đề xuất)" : "(NCC chốt)"}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          po.status === "received"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : po.status === "received_partial"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : po.status === "supplier_adjusted"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : po.status === "delivering"
                            ? "bg-sky-500/10 text-sky-600 border border-sky-500/20"
                            : po.status === "supplier_rejected"
                            ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            : "bg-zinc-100 text-zinc-600 dark:bg-muted"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        {canReview && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConfirmPO(po)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Xác nhận đủ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openAdjustModal(po)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Điều chỉnh SL</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectTarget(po)}
                              className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              title="Từ chối đơn"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        {canDeliver && (
                          <button
                            type="button"
                            onClick={() => handleStartDelivery(po)}
                            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Giao hàng</span>
                          </button>
                        )}
                        {po.status === "delivering" && (
                          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                            Đang vận chuyển tới Animora
                          </span>
                        )}
                        {po.status === "received" && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              Đã nhận{" "}
                              {formatDateDdMmYyyy(po.receivedAt || po.expectedDate)}
                            </span>
                          </span>
                        )}
                        {po.status === "received_partial" && (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>
                              Nhận thiếu{" "}
                              {formatDateDdMmYyyy(po.receivedAt || po.expectedDate)}
                            </span>
                          </span>
                        )}
                        {po.status === "supplier_rejected" && (
                          <span className="text-[11px] text-rose-500 font-semibold">
                            Đã từ chối
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          tone="supplier"
        />
      </div>

      {/* Modal Điều Chỉnh Số Lượng & Lịch Giao (Quy tắc Mục 7) */}
      <Dialog
        open={Boolean(adjustTarget)}
        onOpenChange={(open) => {
          if (!open) setAdjustTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Điều Chỉnh Số Lượng &amp; Lịch Giao
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Số lượng điều chỉnh sẽ cập nhật trực tiếp vào đơn nhập {adjustTarget?.code} mà không cần QL xác nhận lại trước khi giao hàng.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAdjust} className="space-y-3.5 text-xs pt-2">
            <div className="p-3 rounded-xl bg-muted/50 border border-border/60">
              <div className="font-semibold text-foreground">
                {adjustTarget?.lines[0]?.productName}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Số lượng Animora đặt: <strong>{adjustTarget?.lines[0]?.quantity}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground/80 block">
                  Số lượng NCC chốt
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40 text-xs font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground/80 block">
                  Ngày giao NCC chốt
                </label>
                <div className="relative w-full h-10 px-3 rounded-xl border border-border bg-muted/40 text-xs font-medium flex items-center justify-between">
                  <span>{formatDateDdMmYyyy(adjustDate || todayIso())}</span>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    min={todayIso()}
                    value={adjustDate || todayIso()}
                    onChange={(e) => setAdjustDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground/80 block">
                Ghi chú điều chỉnh gửi Animora
              </label>
              <Textarea
                rows={2}
                placeholder="VD: Kho NCC chỉ còn đủ 40 hộp, giao đợt 1..."
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                className="rounded-xl text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustTarget(null)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer"
              >
                Lưu điều chỉnh
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Từ Chối Đơn */}
      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-500">
              Từ Chối Đơn Nhập Hàng {rejectTarget?.code}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Nhập lý do từ chối để bộ phận Quản lý Animora kịp thời điều phối nguồn hàng khác.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmReject} className="space-y-3 text-xs pt-2">
            <Textarea
              rows={3}
              required
              placeholder="VD: Mặt hàng tạm ngưng sản xuất / Hết hàng tại kho tổng..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="rounded-xl text-xs resize-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                Xác nhận từ chối
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
