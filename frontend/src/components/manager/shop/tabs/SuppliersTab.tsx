"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, Calendar, Package, Plus, Check, CheckCircle2, FileText, Search, X } from "lucide-react";
import { toast } from "sonner";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import { Textarea } from "@/components/ui/textarea";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  PurchaseOrder,
  PO_STATUS_LABEL,
  poTotal,
  SUPPLIER_OPTIONS,
  formatVnd,
  todayIso,
} from "@/data/managerOpsData";
import {
  SUPPLIER_SYNC_EVENT,
  SupplierCatalogMeta,
  SupplierOfferingItem,
  defaultSupplierForCategory,
  getAvailableNewProductsForShop,
  loadSupplierCatalogMeta,
} from "@/data/supplierPortalData";
import { MEDICINE_BOX_SYNC_EVENT } from "@/utils/medicineBoxSync";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import {
  ExtendedProduct,
  SupplierItem,
  ImportSlip,
  SAMPLE_SUPPLIERS,
} from "@/components/manager/shop/shopTypesAndData";

interface SuppliersTabProps {
  readOnly?: boolean;
  products: ExtendedProduct[];
  suppliers: SupplierItem[];
  importSlips: ImportSlip[];
  onAddImportSlip: (slip: ImportSlip) => void;
  purchaseOrders: PurchaseOrder[];
  onAddPurchaseOrder: (po: PurchaseOrder) => void;
  onReceivePO: (po: PurchaseOrder, actualReceivedQty?: number, discrepancyNote?: string) => void;
  onSimulateSupplierConfirm: (poId: string) => void;
  isAddImportModalOpen: boolean;
  setIsAddImportModalOpen: (open: boolean) => void;
  isCreatePOModalOpen: boolean;
  setIsCreatePOModalOpen: (open: boolean) => void;
  preselectedProductId?: string;
  onClearPreselectedProductId?: () => void;
}

export function SuppliersTab({
  readOnly = false,
  products,
  suppliers,
  importSlips,
  onAddImportSlip,
  purchaseOrders,
  onAddPurchaseOrder,
  onReceivePO,
  onSimulateSupplierConfirm,
  isAddImportModalOpen,
  setIsAddImportModalOpen,
  isCreatePOModalOpen,
  setIsCreatePOModalOpen,
  preselectedProductId,
  onClearPreselectedProductId,
}: SuppliersTabProps) {
  // New import slip form
  const [newImportSupplier, setNewImportSupplier] = useState(SAMPLE_SUPPLIERS[0].name);
  const [newImportItems, setNewImportItems] = useState("");
  const [newImportAmount, setNewImportAmount] = useState(15000000);
  const [newImportStatus, setNewImportStatus] = useState<"received" | "in_transit">("received");

  // Create Purchase Order modal state
  const [poSupplier, setPoSupplier] = useState<string>(SUPPLIER_OPTIONS[0]);
  const [poProductMode, setPoProductMode] = useState<"existing" | "new">("existing");
  const [poProductId, setPoProductId] = useState<string>("");
  const [catalogMeta, setCatalogMeta] = useState<Record<string, SupplierCatalogMeta>>({});
  const [supplierOfferings, setSupplierOfferings] = useState<SupplierOfferingItem[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>("");
  const [newProdRetailPrice, setNewProdRetailPrice] = useState<number>(250000);
  const [poQuantity, setPoQuantity] = useState<number>(30);
  const [poUnitCost, setPoUnitCost] = useState<number>(150000);
  const [poExpectedDate, setPoExpectedDate] = useState<string>("");
  const [poNote, setPoNote] = useState<string>("");
  const [poPage, setPoPage] = useState<number>(1);
  const [poSearchQuery, setPoSearchQuery] = useState<string>("");
  const [poStatusFilter, setPoStatusFilter] = useState<string>("all");
  const [poSupplierFilter, setPoSupplierFilter] = useState<string>("all");
  const PO_PAGE_SIZE = 5;
  const [receiveTarget, setReceiveTarget] = useState<PurchaseOrder | null>(null);
  const [actualReceiveQty, setActualReceiveQty] = useState<number>(0);
  const [receiveDiscrepancyNote, setReceiveDiscrepancyNote] = useState<string>("");

  const supplierItems = {
    ...Object.fromEntries(suppliers.map((sup) => [sup.name, sup.name])),
    ...(newImportSupplier ? { [newImportSupplier]: newImportSupplier } : {}),
  };

  const handleAddImportSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const createdSlip: ImportSlip = {
      id: `slip-${Date.now()}`,
      slipCode: `PN-202611-0${importSlips.length + 1}`,
      supplierName: newImportSupplier,
      itemsSummary: newImportItems || "Lô hàng bổ sung tồn kho định kỳ",
      totalAmount: newImportAmount,
      date: new Date().toISOString().slice(0, 10),
      status: newImportStatus,
    };
    onAddImportSlip(createdSlip);
    setIsAddImportModalOpen(false);
    setNewImportItems("");
    toast.success(`Đã lập phiếu nhập kho ${createdSlip.slipCode}!`);
  };

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)),
    [products]
  );

  const filteredPurchaseOrders = useMemo(() => {
    const q = poSearchQuery.trim().toLowerCase();
    return purchaseOrders.filter((po) => {
      if (poSupplierFilter !== "all" && po.supplierName !== poSupplierFilter) {
        return false;
      }
      if (poStatusFilter !== "all" && po.status !== poStatusFilter) {
        return false;
      }
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
  }, [purchaseOrders, poSearchQuery, poStatusFilter, poSupplierFilter]);

  const poTotalPages = Math.max(1, Math.ceil(filteredPurchaseOrders.length / PO_PAGE_SIZE));
  const safePoPage = Math.min(poPage, poTotalPages);
  const paginatedPurchaseOrders = useMemo(() => {
    const start = (safePoPage - 1) * PO_PAGE_SIZE;
    return filteredPurchaseOrders.slice(start, start + PO_PAGE_SIZE);
  }, [filteredPurchaseOrders, safePoPage]);

  const defaultDesiredDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (!isCreatePOModalOpen || !preselectedProductId) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setPoProductMode("existing");
      setPoProductId(preselectedProductId);
      const prod = products.find((p) => p.id === preselectedProductId);
      const assignedSupplier =
        catalogMeta[preselectedProductId]?.supplierName ||
        defaultSupplierForCategory(prod?.category);
      if (assignedSupplier) {
        setPoSupplier(assignedSupplier);
      }
      if (prod?.costPrice) {
        setPoUnitCost(prod.costPrice);
      }
      onClearPreselectedProductId?.();
    });
    return () => {
      cancelled = true;
    };
  }, [
    isCreatePOModalOpen,
    preselectedProductId,
    products,
    catalogMeta,
    onClearPreselectedProductId,
  ]);

  useEffect(() => {
    const syncOfferings = () => {
      setSupplierOfferings(getAvailableNewProductsForShop(products, poSupplier));
      if (products.length > 0) {
        setCatalogMeta(loadSupplierCatalogMeta(products));
      }
    };
    syncOfferings();
    window.addEventListener(SUPPLIER_SYNC_EVENT, syncOfferings);
    window.addEventListener(MEDICINE_BOX_SYNC_EVENT, syncOfferings);
    return () => {
      window.removeEventListener(SUPPLIER_SYNC_EVENT, syncOfferings);
      window.removeEventListener(MEDICINE_BOX_SYNC_EVENT, syncOfferings);
    };
  }, [products, poSupplier]);

  const activeOffering = useMemo(() => {
    return (
      supplierOfferings.find((o) => o.id === selectedOfferingId) ||
      supplierOfferings[0] ||
      null
    );
  }, [supplierOfferings, selectedOfferingId]);

  useEffect(() => {
    if (!isCreatePOModalOpen) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (poProductMode === "existing") {
        const activeId = poProductId || (sortedProducts[0]?.id ?? "");
        const activeProd = sortedProducts.find((p) => p.id === activeId);
        if (activeProd?.costPrice) {
          setPoUnitCost(activeProd.costPrice);
        }
        return;
      }
      if (activeOffering) {
        setSelectedOfferingId(activeOffering.id);
        setPoUnitCost(activeOffering.costPrice);
        setNewProdRetailPrice(activeOffering.suggestedRetailPrice);
      } else {
        setPoUnitCost(0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isCreatePOModalOpen, poProductMode, poProductId, sortedProducts, activeOffering]);

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isInteger(poQuantity) || poQuantity <= 0) {
      toast.error("Số lượng đặt hàng PO phải là số nguyên lớn hơn 0.");
      return;
    }

    const isNewMode = poProductMode === "new";
    if (isNewMode && !activeOffering) {
      toast.error("Nhà cung cấp này hiện không có sản phẩm mới nào chưa có trong kho!");
      return;
    }

    if (isNewMode && activeOffering && poQuantity > activeOffering.supplierStock) {
      toast.error(
        `Số lượng đặt (${poQuantity}) vượt quá tồn kho tại NCC (${activeOffering.supplierStock}).`
      );
      return;
    }

    const targetProduct =
      sortedProducts.find((p) => p.id === poProductId) || sortedProducts[0];

    if (!isNewMode && targetProduct) {
      const meta = catalogMeta[targetProduct.id];
      if (meta?.supplyStatus === "discontinued") {
        toast.error(
          `Mặt hàng "${targetProduct.name}" đang được NCC đánh dấu Tạm ngưng cung cấp!`
        );
        return;
      }
      if (meta && poQuantity > meta.supplierStock) {
        toast.error(
          `Số lượng đặt (${poQuantity}) vượt quá tồn kho hiện có tại NCC (${meta.supplierStock}).`
        );
        return;
      }
    }

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      code: `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
        purchaseOrders.length + 1
      ).padStart(3, "0")}`,
      supplierName: poSupplier || SUPPLIER_OPTIONS[0],
      lines: [
        isNewMode && activeOffering
          ? {
              productId: activeOffering.id,
              productName: activeOffering.name,
              quantity: poQuantity,
              unitCost: activeOffering.costPrice,
              newProductMeta: {
                name: activeOffering.name,
                category: activeOffering.category,
                retailPrice: Math.max(1000, newProdRetailPrice),
                requiresPrescription: activeOffering.requiresPrescription,
              },
            }
          : {
              productId: targetProduct ? targetProduct.id : "prod-custom",
              productName: targetProduct ? targetProduct.name : "Sản phẩm đặt thêm",
              quantity: poQuantity,
              unitCost: targetProduct?.costPrice ?? poUnitCost,
            },
      ],
      status: "sent",
      createdAt: todayIso(),
      expectedDate: poExpectedDate || defaultDesiredDeliveryDate(),
      note: poNote,
    };

    onAddPurchaseOrder(newPO);
    setPoPage(1);
    setIsCreatePOModalOpen(false);
    setPoNote("");
    if (isNewMode) {
      setPoProductMode("existing");
      setSelectedOfferingId("");
      setNewProdRetailPrice(250000);
    }
    toast.success(`Đã tạo và gửi đơn PO ${newPO.code} cho ${newPO.supplierName}!`);
  };

  return (
    <>
      <TabsContent value="suppliers" className="space-y-6">
        <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#FF7F6B]" />
            Danh Sách Đối Tác & Nhà Cung Cấp
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-2 text-xs"
              >
                <div className="font-bold text-zinc-900 dark:text-foreground text-sm">{sup.name}</div>
                <div className="text-zinc-500">Người liên hệ: {sup.contactPerson}</div>
                <div className="text-zinc-500">Hotline: {sup.phone}</div>
                <div className="text-[11px] text-zinc-400">{sup.address}</div>
                <div className="pt-2 border-t border-zinc-200/60 dark:border-border/60 flex items-center justify-between font-bold">
                  <span>{sup.importSlipsCount} phiếu nhập</span>
                  <span className="text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {(sup.totalImportValue / 1000000).toFixed(0)}M VNĐ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Đơn Đặt Hàng Nhà Cung Cấp (Purchase Orders - Phân Tích Nghiệp Vụ Mục 5, 7) */}
        <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                Đơn Đặt Hàng Nhà Cung Cấp (Purchase Orders)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Quản lý tạo PO gửi NCC khi kho thiếu hụt, nhận điều chỉnh và xác nhận nhập kho tự động cộng tồn kho
              </p>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  if (sortedProducts.length > 0 && !poProductId) {
                    setPoProductId(sortedProducts[0].id);
                  }
                  setIsCreatePOModalOpen(true);
                }}
                className="self-start sm:self-center px-3.5 py-2 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo đơn PO gửi NCC</span>
              </button>
            )}
          </div>

          {/* Bộ lọc PO */}
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={poSearchQuery}
                  onChange={(e) => {
                    setPoSearchQuery(e.target.value);
                    setPoPage(1);
                  }}
                  placeholder="Tìm mã PO, mặt hàng, nhà cung cấp..."
                  className="w-full h-10 pl-9 pr-9 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
                />
                {poSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setPoSearchQuery("");
                      setPoPage(1);
                    }}
                    aria-label="Xóa tìm kiếm PO"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-foreground cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <Select
                value={poSupplierFilter}
                onValueChange={(val) => {
                  if (val !== null) {
                    setPoSupplierFilter(val);
                    setPoPage(1);
                  }
                }}
                items={{
                  all: "Tất cả nhà cung cấp",
                  ...Object.fromEntries(SUPPLIER_OPTIONS.map((s) => [s, s])),
                }}
              >
                <SelectTrigger className="w-full sm:w-64 h-10! rounded-xl bg-zinc-50 dark:bg-muted border-zinc-200 dark:border-border text-xs font-medium px-3">
                  <SelectValue className="truncate" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="w-auto! min-w-(--anchor-width) max-w-[90vw]"
                >
                  <SelectItem value="all" className="pr-9">
                    Tất cả nhà cung cấp
                  </SelectItem>
                  {SUPPLIER_OPTIONS.map((sup) => (
                    <SelectItem key={sup} value={sup} className="pr-9">
                      {sup}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: `Tất cả (${purchaseOrders.length})` },
                  {
                    id: "sent",
                    label: `Đã gửi NCC (${purchaseOrders.filter((p) => p.status === "sent").length})`,
                  },
                  {
                    id: "supplier_adjusted",
                    label: `Điều chỉnh SL (${purchaseOrders.filter((p) => p.status === "supplier_adjusted").length})`,
                  },
                  {
                    id: "delivering",
                    label: `Đang giao (${purchaseOrders.filter((p) => p.status === "delivering").length})`,
                  },
                  {
                    id: "received_partial",
                    label: `Nhập thiếu (${purchaseOrders.filter((p) => p.status === "received_partial").length})`,
                  },
                  {
                    id: "received",
                    label: `Đã nhập kho (${purchaseOrders.filter((p) => p.status === "received").length})`,
                  },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      setPoStatusFilter(pill.id);
                      setPoPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      poStatusFilter === pill.id
                        ? "bg-[#6B1F2E] text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-muted/60 text-zinc-600 dark:text-muted-foreground hover:bg-zinc-200/70 dark:hover:bg-muted"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {(poSearchQuery.trim() || poStatusFilter !== "all" || poSupplierFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setPoSearchQuery("");
                    setPoStatusFilter("all");
                    setPoSupplierFilter("all");
                    setPoPage(1);
                  }}
                  className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã PO</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Nhà cung cấp</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mặt hàng & Số lượng</TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Tổng giá trị</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Dự kiến</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {paginatedPurchaseOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-zinc-400">
                    Không có đơn đặt hàng PO nào phù hợp với bộ lọc hiện tại.
                  </TableCell>
                </TableRow>
              ) : (
              paginatedPurchaseOrders.map((po) => {
                const statusLabel = PO_STATUS_LABEL[po.status] || po.status;
                const isReceived = po.status === "received";
                const isReceivedPartial = po.status === "received_partial";
                const canReceive = po.status === "delivering";
                return (
                  <TableRow key={po.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                    <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground whitespace-nowrap">
                      {po.code}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 font-semibold text-zinc-800 dark:text-foreground/90 whitespace-normal">
                      {po.supplierName}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 max-w-[280px] whitespace-normal">
                      {po.lines.map((l, i) => {
                        const expectedDelivery = l.confirmedQuantity ?? l.quantity;
                        const hasReceivedQty = l.receivedQuantity !== undefined;
                        const missingQty = hasReceivedQty
                          ? Math.max(0, expectedDelivery - (l.receivedQuantity ?? 0))
                          : 0;
                        return (
                          <div key={i} className="text-zinc-700 dark:text-foreground/85">
                            <span className="font-semibold">{l.productName}</span>
                            {l.newProductMeta && (
                              <span className="ml-1.5 inline-block px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-bold">
                                SP mới
                              </span>
                            )}
                            <span className="text-zinc-400 text-[11px] ml-1">
                              (Đặt x{l.quantity}
                              {l.confirmedQuantity !== undefined && l.confirmedQuantity !== l.quantity
                                ? ` -> NCC giao x${l.confirmedQuantity}`
                                : ""}
                              {hasReceivedQty ? ` -> Thực nhận x${l.receivedQuantity}` : ""}
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
                      {po.note && <div className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5">{po.note}</div>}
                      {po.discrepancyNote && (
                        <div className="text-[11px] text-rose-500 dark:text-rose-400 italic mt-0.5">
                          Đối soát: {po.discrepancyNote}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {formatVnd(poTotal(po))}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center text-zinc-500 font-medium font-mono whitespace-nowrap">
                      <div>{formatDateDdMmYyyy(po.expectedDate)}</div>
                      <div className="text-[10px] font-sans text-zinc-400">
                        {po.status === "sent" ? "(Mong muốn)" : "(NCC chốt)"}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isReceived
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : isReceivedPartial
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : po.status === "supplier_adjusted"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : po.status === "delivering"
                            ? "bg-sky-500/10 text-sky-600 border border-sky-500/20"
                            : "bg-zinc-100 text-zinc-600 dark:bg-muted"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        {po.status === "sent" && (
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Chờ NCC xác nhận
                          </span>
                        )}
                        {(po.status === "supplier_confirmed" ||
                          po.status === "supplier_adjusted") && (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            Chờ NCC giao hàng
                          </span>
                        )}
                        {po.status === "supplier_rejected" && (
                          <span className="text-[11px] text-rose-500 font-medium">
                            NCC đã từ chối
                          </span>
                        )}
                        {canReceive && (
                          readOnly ? (
                            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                              Đang giao (Chờ kho)
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const firstLine = po.lines[0];
                                setReceiveTarget(po);
                                setActualReceiveQty(
                                  firstLine?.confirmedQuantity ?? firstLine?.quantity ?? 1
                                );
                                setReceiveDiscrepancyNote("");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-sm whitespace-nowrap"
                            >
                              <Check className="w-3 h-3 shrink-0" />
                              <span>Nhập kho</span>
                            </button>
                          )
                        )}
                        {isReceived && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{formatDateDdMmYyyy(po.receivedAt || po.expectedDate)}</span>
                          </span>
                        )}
                        {isReceivedPartial && (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{formatDateDdMmYyyy(po.receivedAt || po.expectedDate)}</span>
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
            currentPage={safePoPage}
            totalPages={poTotalPages}
            onPageChange={setPoPage}
          />
        </div>

        {/* Lịch sử phiếu nhập */}
        <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF7F6B]" />
              Lịch Sử Phiếu Nhập Hàng Gần Đây
            </h3>
            {!readOnly && (
              <button
                type="button"
                onClick={() => setIsAddImportModalOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-[#6B1F2E] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Lập phiếu nhập</span>
              </button>
            )}
          </div>

          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã phiếu</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Nhà cung cấp</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Chi tiết món nhập</TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Tổng tiền</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {importSlips.map((slip) => (
                <TableRow key={slip.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                  <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                    {slip.slipCode}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 font-semibold text-zinc-800 dark:text-foreground/90 whitespace-normal">
                    {slip.supplierName}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 max-w-[280px] whitespace-normal text-zinc-600 dark:text-muted-foreground">
                    {slip.itemsSummary}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {slip.totalAmount.toLocaleString("vi-VN")}₫
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        slip.status === "received"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-sky-500/10 text-sky-600"
                      }`}
                    >
                      {slip.status === "received" ? "Đã nhập kho" : "Đang giao hàng"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Modal Lập Phiếu Nhập Kho */}
      <Dialog
        open={isAddImportModalOpen}
        onOpenChange={(open) => setIsAddImportModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold">
              Lập Phiếu Nhập Kho Mới
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tạo phiếu nhập hàng bổ sung từ nhà cung cấp đối tác vào kho Animora.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddImportSlip} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Nhà cung cấp:</label>
              <Select
                value={newImportSupplier}
                onValueChange={(val) => {
                  if (val !== null) setNewImportSupplier(val);
                }}
                items={supplierItems}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={sup.name}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Chi tiết lô hàng nhập:</label>
              <Textarea
                required
                rows={2}
                value={newImportItems}
                onChange={(e) => setNewImportItems(e.target.value)}
                placeholder="VD: 30 bao hạt Royal Canin 2kg, 20 chai sữa tắm Virbac..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Tổng giá trị phiếu (VNĐ):</label>
                <input
                  type="number"
                  required
                  value={newImportAmount}
                  onChange={(e) => setNewImportAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Trạng thái vận chuyển:</label>
                <Select
                  value={newImportStatus}
                  onValueChange={(val) => {
                    if (val !== null) setNewImportStatus(val as "received" | "in_transit");
                  }}
                  items={{
                    received: "Đã nhập kho",
                    in_transit: "Đang giao hàng",
                  }}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Đã nhập kho</SelectItem>
                    <SelectItem value="in_transit">Đang giao hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddImportModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold cursor-pointer"
              >
                Xác nhận lập phiếu
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Tạo Đơn Hàng PO Gửi Nhà Cung Cấp (Mục 5, 7) */}
      <Dialog
        open={isCreatePOModalOpen}
        onOpenChange={(open) => setIsCreatePOModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8 pb-2 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Tạo Đơn Hàng PO Gửi Nhà Cung Cấp
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Đặt hàng bổ sung tồn kho từ nhà cung cấp khi số lượng hàng trong kho báo động
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const activeProductId = poProductId || (sortedProducts[0]?.id ?? "");
            const activeProduct = sortedProducts.find((p) => p.id === activeProductId);
            const activeStock = activeProduct?.stock ?? 0;
            const getStockTone = (stock: number, defaultClass: string) =>
              stock < 5
                ? "bg-rose-500/15 text-rose-500"
                : stock < 10
                ? "bg-amber-500/15 text-amber-500"
                : defaultClass;

            return (
              <form onSubmit={handleCreatePO} noValidate className="space-y-4 pt-2 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground/80 block">
                    Nhà cung cấp
                  </label>
                  <Select
                    value={poSupplier}
                    onValueChange={(val) => {
                      if (val !== null) setPoSupplier(val);
                    }}
                    items={Object.fromEntries(SUPPLIER_OPTIONS.map((s) => [s, s]))}
                  >
                    <SelectTrigger className="w-full h-10! rounded-xl bg-zinc-50 dark:bg-muted/60 border-zinc-200 dark:border-border text-xs font-medium px-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {SUPPLIER_OPTIONS.map((sup) => (
                        <SelectItem key={sup} value={sup} className="text-xs">
                          <span className="truncate">{sup}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-semibold text-foreground/80">
                      Mặt hàng cần nhập
                    </label>
                    <div className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-muted p-0.5 border border-border/60">
                      <button
                        type="button"
                        onClick={() => setPoProductMode("existing")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                          poProductMode === "existing"
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        SP có sẵn
                      </button>
                      <button
                        type="button"
                        onClick={() => setPoProductMode("new")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                          poProductMode === "new"
                            ? "bg-[#6B1F2E] text-white shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        + Sản phẩm mới
                      </button>
                    </div>
                  </div>

                  {poProductMode === "existing" ? (
                    <>
                      {activeProduct && (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {(() => {
                            const meta = catalogMeta[activeProduct.id];
                            const assignedSup =
                              meta?.supplierName ||
                              defaultSupplierForCategory(activeProduct.category);
                            return (
                              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                                <span className="text-muted-foreground">
                                  NCC phụ trách:{" "}
                                  <strong className="text-foreground">
                                    {assignedSup}
                                  </strong>
                                </span>
                                {meta && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      meta.supplyStatus === "discontinued"
                                        ? "bg-rose-500/15 text-rose-500"
                                        : meta.supplyStatus === "low_stock"
                                        ? "bg-amber-500/15 text-amber-500"
                                        : "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                                    }`}
                                  >
                                    {meta.supplyStatus === "discontinued"
                                      ? "Ngưng cung cấp"
                                      : `Kho NCC: ${meta.supplierStock}`}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStockTone(
                              activeStock,
                              "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            )}`}
                          >
                            Tồn hiện tại: {activeStock} món
                          </span>
                        </div>
                      )}
                      <Select
                        value={activeProductId}
                        onValueChange={(val) => {
                          if (val !== null) {
                            setPoProductId(val);
                            const prod = products.find((p) => p.id === val);
                            if (prod && prod.costPrice) {
                              setPoUnitCost(prod.costPrice);
                            }
                          }
                        }}
                        items={Object.fromEntries(sortedProducts.map((p) => [p.id, p.name]))}
                      >
                        <SelectTrigger className="w-full h-10! rounded-xl bg-zinc-50 dark:bg-muted/60 border-zinc-200 dark:border-border text-xs font-medium px-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {sortedProducts.map((p) => {
                            const stock = p.stock ?? 0;
                            return (
                              <SelectItem key={p.id} value={p.id} className="text-xs">
                                <div className="flex items-center justify-between gap-3 w-full min-w-0">
                                  <span className="truncate">{p.name}</span>
                                  <span
                                    className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${getStockTone(
                                      stock,
                                      "bg-zinc-500/15 text-muted-foreground"
                                    )}`}
                                  >
                                    Tồn: {stock}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <div className="p-3.5 rounded-xl border border-dashed border-border bg-zinc-50/70 dark:bg-muted/30 space-y-3">
                      {supplierOfferings.length === 0 ? (
                        <div className="text-xs text-amber-600 dark:text-amber-400 py-2">
                          Nhà cung cấp <strong>{poSupplier}</strong> hiện chưa có sản phẩm mới nào chưa có trong kho (có thể thêm tại Cổng Nhà cung cấp → Danh mục &amp; Giá cung ứng).
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <label className="font-semibold text-foreground/80 block text-[11px]">
                                Chọn sản phẩm từ danh mục NCC (chưa có trong kho)
                              </label>
                              {activeOffering && (
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  Kho NCC: {activeOffering.supplierStock}
                                </span>
                              )}
                            </div>
                            <Select
                              value={activeOffering?.id || ""}
                              onValueChange={(val) => {
                                if (val !== null) {
                                  setSelectedOfferingId(val);
                                  const found = supplierOfferings.find((o) => o.id === val);
                                  if (found) {
                                    setPoUnitCost(found.costPrice);
                                    setNewProdRetailPrice(found.suggestedRetailPrice);
                                  }
                                }
                              }}
                              items={Object.fromEntries(
                                supplierOfferings.map((o) => [o.id, o.name])
                              )}
                            >
                              <SelectTrigger className="w-full h-9! rounded-xl bg-background border-zinc-200 dark:border-border text-xs font-medium px-3">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {supplierOfferings.map((o) => (
                                  <SelectItem key={o.id} value={o.id} className="text-xs">
                                    <div className="flex items-center justify-between gap-3 w-full min-w-0">
                                      <span className="truncate">{o.name}</span>
                                      <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                                        {formatVnd(o.costPrice)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {activeOffering && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                                  <div className="space-y-1">
                                    <label className="font-semibold text-foreground/80 block text-[11px]">
                                      Thông tin danh mục từ NCC
                                    </label>
                                    <div className="h-9 px-3 rounded-xl border border-border bg-muted/40 flex items-center justify-between text-[11px]">
                                      <span className="font-medium text-foreground/80">
                                        {activeOffering.category === "food"
                                          ? "Thức ăn & Dinh dưỡng"
                                          : activeOffering.category === "care"
                                          ? "Chăm sóc & Vệ sinh"
                                          : activeOffering.category === "medicine"
                                          ? "Thuốc & Vắc-xin thú y"
                                          : activeOffering.category === "toys"
                                          ? "Đồ chơi thú cưng"
                                          : "Phụ kiện & Trang bị"}
                                      </span>
                                      {activeOffering.requiresPrescription && (
                                        <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500 font-bold text-[10px]">
                                          Rx
                                        </span>
                                      )}
                                    </div>
                                  </div>

                              <div className="space-y-1">
                                <label className="font-semibold text-foreground/80 block text-[11px]">
                                  Giá bán niêm yết tại Shop (VNĐ)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="50000"
                                  required
                                  value={newProdRetailPrice}
                                  onChange={(e) =>
                                    setNewProdRetailPrice(Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-border bg-background text-xs font-medium outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/80 block">
                      Số lượng đặt
                    </label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      required
                      value={poQuantity}
                      onChange={(e) => setPoQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/80 block whitespace-nowrap">
                      Đơn giá nhập (VNĐ)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        required
                        readOnly
                        value={poUnitCost}
                        title="Đơn giá nhập theo bảng giá niêm yết của Nhà cung cấp"
                        className="w-full h-10 px-3 pr-16 rounded-xl border border-zinc-200 dark:border-border text-xs font-medium outline-none bg-zinc-100/80 dark:bg-muted/30 text-muted-foreground cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground pointer-events-none">
                        Giá NCC
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/80 block whitespace-nowrap">
                      Ngày mong muốn nhận
                    </label>
                    <div className="relative w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted/60 text-xs font-medium flex items-center justify-between focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
                      <span>
                        {formatDateDdMmYyyy(
                          poExpectedDate || defaultDesiredDeliveryDate()
                        )}
                      </span>
                      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                      <input
                        type="date"
                        required
                        min={todayIso()}
                        value={poExpectedDate || defaultDesiredDeliveryDate()}
                        onChange={(e) => setPoExpectedDate(e.target.value)}
                        onClick={(e) => {
                          try {
                            e.currentTarget.showPicker?.();
                          } catch {
                            // Ignore browsers that block programmatic showPicker
                          }
                        }}
                        aria-label="Ngày mong muốn nhận"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Ước tính tổng giá trị PO ({poQuantity} × {formatVnd(poUnitCost)}):
                  </span>
                  <span className="text-[#6B1F2E] dark:text-[#FF7F6B] text-base font-bold">
                    {formatVnd(poQuantity * poUnitCost)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground/80 block">
                    Ghi chú gửi Nhà cung cấp
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Yêu cầu hạn sử dụng trên 12 tháng, đóng gói thùng carton kín..."
                    value={poNote}
                    onChange={(e) => setPoNote(e.target.value)}
                    className="rounded-xl border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted/60 text-xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setIsCreatePOModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-zinc-100 dark:hover:bg-muted font-semibold cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold cursor-pointer shadow-sm transition-colors"
                  >
                    Gửi Đơn PO Cho NCC
                  </button>
                </div>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Modal Xác Nhận Số Lượng Thực Nhận Khi Nhập Kho */}
      <Dialog
        open={Boolean(receiveTarget)}
        onOpenChange={(open) => {
          if (!open) setReceiveTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Kiểm Tra &amp; Xác Nhận Nhập Kho ({receiveTarget?.code})
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Kiểm đếm số lượng thực tế nhận được từ {receiveTarget?.supplierName} trước khi cộng vào tồn kho.
            </DialogDescription>
          </DialogHeader>
          {receiveTarget &&
            (() => {
              const firstLine = receiveTarget.lines[0];
              const expectedDeliveryQty =
                firstLine?.confirmedQuantity ?? firstLine?.quantity ?? 0;
              const missingQty = Math.max(0, expectedDeliveryQty - actualReceiveQty);
              const isShortage = actualReceiveQty < expectedDeliveryQty;
              const diffAmount = missingQty * (firstLine?.unitCost ?? 0);

              return (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isShortage && !receiveDiscrepancyNote.trim()) {
                      toast.error("Vui lòng nhập lý do chênh lệch khi số lượng thực nhận ít hơn!");
                      return;
                    }
                    onReceivePO(
                      receiveTarget,
                      Math.max(0, actualReceiveQty),
                      isShortage ? receiveDiscrepancyNote.trim() : undefined
                    );
                    setReceiveTarget(null);
                  }}
                  className="space-y-3.5 text-xs pt-2"
                >
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/60">
                    <div className="font-semibold text-foreground">
                      {firstLine?.productName}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Đặt: <strong>{firstLine?.quantity}</strong> · NCC giao:{" "}
                      <strong>{expectedDeliveryQty}</strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground/80 block">
                      Số lượng thực nhận tại kho
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={actualReceiveQty}
                      onChange={(e) =>
                        setActualReceiveQty(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40 text-xs font-medium"
                    />
                  </div>

                  {isShortage && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>
                            Phát hiện thiếu {missingQty} sản phẩm so với số NCC giao (
                            {expectedDeliveryQty})
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-90">
                          {actualReceiveQty === 0
                            ? "Số lượng thực nhận bằng 0 — không cộng vào tồn kho. "
                            : `Chỉ cộng ${actualReceiveQty} sản phẩm vào tồn kho. `}
                          Đơn PO chuyển sang trạng thái{" "}
                          <strong>Nhập thiếu (Đối soát)</strong> và giảm công nợ{" "}
                          <strong>{formatVnd(diffAmount)}</strong>.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-foreground/80 block">
                          Lý do chênh lệch / Ghi chú đối soát *
                        </label>
                        <Textarea
                          required
                          rows={2}
                          value={receiveDiscrepancyNote}
                          onChange={(e) => setReceiveDiscrepancyNote(e.target.value)}
                          placeholder="VD: Thùng hàng bị rách, kiểm đếm thực tế thiếu 3 sản phẩm..."
                          className="rounded-xl text-xs bg-muted/40 border-border"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReceiveTarget(null)}
                      className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-xl text-white font-bold cursor-pointer ${
                        isShortage
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {isShortage ? "Xác nhận nhập thiếu & Đối soát" : "Xác nhận nhập kho"}
                    </button>
                  </div>
                </form>
              );
            })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
