"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit3, Package, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { TablePagination } from "@/components/ui/table-pagination";
import { ExtendedProduct } from "@/components/manager/shop/shopTypesAndData";
import { SUPPLIER_OPTIONS, formatVnd } from "@/data/managerOpsData";
import {
  SUPPLIER_SYNC_EVENT,
  SupplierCatalogMeta,
  SupplierOfferingItem,
  SupplierSupplyStatus,
  loadShopProductsForSupplier,
  loadSupplierCatalogMeta,
  loadSupplierOfferings,
  saveShopProductsFromSupplier,
  saveSupplierCatalogMeta,
  saveSupplierOfferings,
  useActiveSupplierFilter,
} from "@/data/supplierPortalData";
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
import { Checkbox } from "@/components/ui/checkbox";

const PAGE_SIZE = 5;

const STATUS_BADGE: Record<
  SupplierSupplyStatus,
  { label: string; cls: string }
> = {
  available: {
    label: "Sẵn hàng",
    cls: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  },
  low_stock: {
    label: "Sắp hết tại NCC",
    cls: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  },
  discontinued: {
    label: "Tạm ngưng cung cấp",
    cls: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
  },
};

type UnifiedCatalogRow = {
  id: string;
  name: string;
  requiresPrescription: boolean;
  supplierName: string;
  costPrice: number;
  supplierStock: number;
  supplyStatus: SupplierSupplyStatus;
  inAnimoraShop: boolean;
};

export default function SupplierCatalogPage() {
  const [activeSupplier] = useActiveSupplierFilter();
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [offerings, setOfferings] = useState<SupplierOfferingItem[]>([]);
  const [catalogMeta, setCatalogMeta] = useState<
    Record<string, SupplierCatalogMeta>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editTarget, setEditTarget] = useState<UnifiedCatalogRow | null>(null);
  const [editCostPrice, setEditCostPrice] = useState<number>(100000);
  const [editSupplierStock, setEditSupplierStock] = useState<number>(200);
  const [editStatus, setEditStatus] =
    useState<SupplierSupplyStatus>("available");

  // Add new supplier offering modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSupplier, setNewSupplier] = useState<string>(SUPPLIER_OPTIONS[0]);
  const [newCategory, setNewCategory] =
    useState<SupplierOfferingItem["category"]>("food");
  const [newCostPrice, setNewCostPrice] = useState(200000);
  const [newRetailPrice, setNewRetailPrice] = useState(300000);
  const [newStock, setNewStock] = useState(100);
  const [newRx, setNewRx] = useState(false);

  useEffect(() => {
    const sync = () => {
      const prods = loadShopProductsForSupplier();
      setProducts(prods);
      setCatalogMeta(loadSupplierCatalogMeta(prods));
      setOfferings(loadSupplierOfferings());
    };
    sync();
    window.addEventListener(SUPPLIER_SYNC_EVENT, sync);
    return () => window.removeEventListener(SUPPLIER_SYNC_EVENT, sync);
  }, []);

  const unifiedRows = useMemo<UnifiedCatalogRow[]>(() => {
    const shopIds = new Set(products.map((p) => p.id));
    const shopNames = new Set(products.map((p) => p.name.trim().toLowerCase()));

    const unstockedOfferings: UnifiedCatalogRow[] = offerings
      .filter(
        (o) =>
          !shopIds.has(o.id) &&
          !shopNames.has(o.name.trim().toLowerCase())
      )
      .map((o) => ({
        id: o.id,
        name: o.name,
        requiresPrescription: o.requiresPrescription,
        supplierName: o.supplierName,
        costPrice: o.costPrice,
        supplierStock: o.supplierStock,
        supplyStatus: o.supplyStatus,
        inAnimoraShop: false,
      }));

    const shopRows: UnifiedCatalogRow[] = products.map((p) => {
      const meta = catalogMeta[p.id];
      return {
        id: p.id,
        name: p.name,
        requiresPrescription: Boolean(p.requiresPrescription),
        supplierName:
          meta?.supplierName || "Công ty TNHH Royal Canin Việt Nam",
        costPrice: p.costPrice ?? 0,
        supplierStock: meta?.supplierStock ?? 250,
        supplyStatus: meta?.supplyStatus ?? "available",
        inAnimoraShop: true,
      };
    });

    return [...unstockedOfferings, ...shopRows];
  }, [products, offerings, catalogMeta]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return unifiedRows.filter((row) => {
      if (activeSupplier !== "all" && row.supplierName !== activeSupplier) {
        return false;
      }
      if (q) {
        return (
          row.name.toLowerCase().includes(q) ||
          row.id.toLowerCase().includes(q) ||
          row.supplierName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [unifiedRows, activeSupplier, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  const openEditModal = (row: UnifiedCatalogRow) => {
    setEditTarget(row);
    setEditCostPrice(row.costPrice);
    setEditSupplierStock(row.supplierStock);
    setEditStatus(row.supplyStatus);
  };

  const handleSaveCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    if (editTarget.inAnimoraShop) {
      const updatedProducts = products.map((p) =>
        p.id === editTarget.id
          ? { ...p, costPrice: Math.max(1000, editCostPrice) }
          : p
      );
      const updatedMeta: Record<string, SupplierCatalogMeta> = {
        ...catalogMeta,
        [editTarget.id]: {
          supplierName: editTarget.supplierName,
          supplierStock: Math.max(0, editSupplierStock),
          supplyStatus: editStatus,
        },
      };
      setProducts(updatedProducts);
      setCatalogMeta(updatedMeta);
      saveShopProductsFromSupplier(updatedProducts);
      saveSupplierCatalogMeta(updatedMeta);
    } else {
      const updatedOfferings = offerings.map((o) =>
        o.id === editTarget.id
          ? {
              ...o,
              costPrice: Math.max(1000, editCostPrice),
              supplierStock: Math.max(0, editSupplierStock),
              supplyStatus: editStatus,
            }
          : o
      );
      setOfferings(updatedOfferings);
      saveSupplierOfferings(updatedOfferings);
    }

    toast.success(
      `Đã cập nhật giá nhập (${formatVnd(editCostPrice)}) & tình trạng cung ứng cho ${editTarget.name}!`
    );
    setEditTarget(null);
  };

  const handleAddOffering = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newName.trim();
    if (!cleanName) {
      toast.error("Vui lòng nhập tên mặt hàng cung ứng!");
      return;
    }

    const created: SupplierOfferingItem = {
      id: `sup-offer-${Date.now()}`,
      name: cleanName,
      category: newCategory,
      costPrice: Math.max(1000, newCostPrice),
      suggestedRetailPrice: Math.max(1000, newRetailPrice),
      requiresPrescription: newRx,
      supplierName:
        activeSupplier !== "all" ? activeSupplier : newSupplier,
      supplierStock: Math.max(0, newStock),
      supplyStatus: "available",
    };

    const next = [created, ...offerings];
    setOfferings(next);
    saveSupplierOfferings(next);
    setIsAddModalOpen(false);
    setNewName("");
    setNewRx(false);
    setCurrentPage(1);
    toast.success(
      `Đã thêm "${cleanName}" vào danh mục NCC! Manager có thể chọn sản phẩm này khi tạo đơn PO mới.`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Package className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Danh Mục Hàng Hóa &amp; Giá Nhập Cung Ứng
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Quản lý giá nhập niêm yết, tồn kho tại NCC và đăng mặt hàng mới để Manager đặt đơn PO
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeSupplier !== "all") setNewSupplier(activeSupplier);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm mặt hàng cung ứng</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm tên sản phẩm, mã SKU, nhà cung cấp..."
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="text-xs font-semibold text-zinc-500">
          Tổng: {filteredRows.length} mặt hàng
        </div>
      </div>

      {/* Catalog Table */}
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Sản phẩm / Thuốc
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Đơn vị cung ứng
              </TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Đơn giá nhập (NCC)
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Tồn kho tại NCC
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Tình trạng
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
            {paginatedRows.map((row) => {
              const badge = STATUS_BADGE[row.supplyStatus];
              return (
                <TableRow
                  key={row.id}
                  className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors"
                >
                  <TableCell className="py-3.5 px-3 max-w-[270px] whitespace-normal">
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      {row.name}
                      {!row.inAnimoraShop && (
                        <span className="ml-1.5 inline-block px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-bold">
                          Chưa có trong kho Animora
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Mã: {row.id}
                      {row.requiresPrescription ? " · Thuốc kê đơn (Rx)" : ""}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 font-medium text-zinc-600 dark:text-muted-foreground">
                    {row.supplierName}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {formatVnd(row.costPrice)}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center font-bold">
                    {row.supplierStock} đơn vị
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => openEditModal(row)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600/10 hover:bg-teal-600/20 text-teal-700 dark:text-teal-300 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Cập nhật giá</span>
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          tone="supplier"
        />
      </div>

      {/* Modal cập nhật giá nhập & tình trạng cung ứng */}
      <Dialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Cập Nhật Giá &amp; Tình Trạng Cung Ứng
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editTarget?.name} — Giá nhập mới sẽ tự động đồng bộ sang form Tạo PO của Manager.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCatalog} className="space-y-3.5 text-xs pt-2">
            <div className="space-y-1">
              <label className="font-semibold text-foreground/80 block">
                Đơn giá nhập niêm yết (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                required
                value={editCostPrice}
                onChange={(e) => setEditCostPrice(Math.max(0, Number(e.target.value)))}
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground/80 block">
                  Tồn kho tại NCC
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={editSupplierStock}
                  onChange={(e) =>
                    setEditSupplierStock(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground/80 block">
                  Tình trạng cung ứng
                </label>
                <Select
                  value={editStatus}
                  onValueChange={(val) => {
                    if (val) setEditStatus(val as SupplierSupplyStatus);
                  }}
                  items={{
                    available: "Sẵn hàng",
                    low_stock: "Sắp hết tại NCC",
                    discontinued: "Tạm ngưng cung cấp",
                  }}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-muted/40 border-border text-xs font-medium px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Sẵn hàng</SelectItem>
                    <SelectItem value="low_stock">Sắp hết tại NCC</SelectItem>
                    <SelectItem value="discontinued">Tạm ngưng cung cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer"
              >
                Lưu cập nhật
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal thêm mặt hàng mới vào danh mục NCC */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => setIsAddModalOpen(open)}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Thêm Mặt Hàng Cung Ứng Mới
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Sản phẩm mới sẽ hiển thị ở danh mục NCC để Manager lựa chọn khi tạo đơn PO nhập hàng.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddOffering} className="space-y-3.5 text-xs pt-2">
            <div className="space-y-1">
              <label className="font-semibold block">Tên sản phẩm / thuốc</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="VD: Thuốc nhỏ gáy NexGard Combo cho mèo"
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold block">Đơn vị cung ứng</label>
                <Select
                  value={activeSupplier !== "all" ? activeSupplier : newSupplier}
                  onValueChange={(val) => {
                    if (val) setNewSupplier(val);
                  }}
                  items={Object.fromEntries(SUPPLIER_OPTIONS.map((s) => [s, s]))}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-muted/40 border-border text-xs px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPLIER_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">Danh mục</label>
                <Select
                  value={newCategory}
                  onValueChange={(val) => {
                    if (val) {
                      const cat = val as SupplierOfferingItem["category"];
                      setNewCategory(cat);
                      if (cat === "medicine") {
                        setNewRx(true);
                        if (activeSupplier === "all") {
                          setNewSupplier("Công ty CP Dược Thú Y Vemedim");
                        }
                      }
                    }
                  }}
                  items={{
                    food: "Thức ăn & Dinh dưỡng",
                    care: "Chăm sóc & Vệ sinh",
                    medicine: "Thuốc & Vắc-xin thú y",
                    toys: "Đồ chơi thú cưng",
                    accessories: "Phụ kiện & Trang bị",
                  }}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-muted/40 border-border text-xs px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Thức ăn &amp; Dinh dưỡng</SelectItem>
                    <SelectItem value="care">Chăm sóc &amp; Vệ sinh</SelectItem>
                    <SelectItem value="medicine">Thuốc &amp; Vắc-xin thú y</SelectItem>
                    <SelectItem value="toys">Đồ chơi thú cưng</SelectItem>
                    <SelectItem value="accessories">Phụ kiện &amp; Trang bị</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold block">Giá nhập NCC (VNĐ)</label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  required
                  value={newCostPrice}
                  onChange={(e) => setNewCostPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Giá gợi ý bán</label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  required
                  value={newRetailPrice}
                  onChange={(e) =>
                    setNewRetailPrice(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Tồn tại NCC</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Math.max(0, Number(e.target.value)))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40"
                />
              </div>
            </div>

            <label
              htmlFor="supNewOfferRx"
              className="flex items-center gap-2 cursor-pointer font-semibold"
            >
              <Checkbox
                id="supNewOfferRx"
                checked={newRx}
                onCheckedChange={(checked) => setNewRx(Boolean(checked))}
              />
              <span>Thuốc chỉ bán theo đơn (Rx Required)</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer"
              >
                Thêm vào danh mục NCC
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
