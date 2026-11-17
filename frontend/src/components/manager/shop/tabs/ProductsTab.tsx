"use client";

import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Plus, Search, ShieldAlert, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { TablePagination } from "@/components/ui/table-pagination";
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
import { ExtendedProduct } from "@/components/manager/shop/shopTypesAndData";
import { LowStockAlertBanner } from "@/components/manager/shop/LowStockAlertBanner";
import { checkProductDeletionConstraints } from "@/utils/medicineBoxSync";

const CATEGORY_LABELS: Record<string, string> = {
  food: "Thức ăn & Dinh dưỡng",
  care: "Chăm sóc & Vệ sinh",
  toys: "Đồ chơi thú cưng",
  accessories: "Phụ kiện & Trang bị",
  medicine: "Thuốc & Vắc-xin",
};

function getCategoryLabel(category?: string): string {
  if (!category) return "Khác";
  return CATEGORY_LABELS[category] ?? category;
}

const PRESET_CATEGORIES = ["food", "care", "toys", "accessories", "medicine"];

interface ProductsTabProps {
  readOnly?: boolean;
  products: ExtendedProduct[];
  lowStockProducts: ExtendedProduct[];
  onCreateImportFromAlert: () => void;
  onCreatePOForProduct: (product: ExtendedProduct) => void;
  onToggleHide?: (productId: string) => void;
  onStockAdjust?: (productId: string, delta: number) => void;
  onUpdateProduct: (product: ExtendedProduct) => void;
  onDeleteProduct: (productId: string) => void;
}

export function ProductsTab({
  readOnly = false,
  products,
  lowStockProducts,
  onCreateImportFromAlert,
  onCreatePOForProduct,
  onUpdateProduct,
  onDeleteProduct,
}: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockSort, setStockSort] = useState<"asc" | "desc" | null>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ExtendedProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExtendedProduct | null>(null);

  // Product form state (shared between Add & Edit)
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState(250000);
  const [formCategory, setFormCategory] = useState("food");
  const [formStock, setFormStock] = useState(20);
  const [formRx, setFormRx] = useState(false);
  const [formHidden, setFormHidden] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const modalCategoryOptions = useMemo(() => {
    const set = new Set<string>(PRESET_CATEGORIES);
    categories.forEach((c) => set.add(c));
    if (formCategory) set.add(formCategory);
    return Array.from(set);
  }, [categories, formCategory]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat =
          p.category?.toLowerCase().includes(q) ||
          getCategoryLabel(p.category).toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchId) return false;
      }
      return true;
    });

    if (stockSort) {
      return [...list].sort((a, b) => {
        const diff = (a.stock ?? 0) - (b.stock ?? 0);
        return stockSort === "asc" ? diff : -diff;
      });
    }
    return list;
  }, [products, searchQuery, categoryFilter, stockSort]);

  const toggleStockSort = () => {
    setStockSort((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, safePage]);

  const openEditModal = (product: ExtendedProduct) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price || 0);
    setFormCategory(product.category || "food");
    setFormStock(product.stock || 0);
    setFormRx(Boolean(product.requiresPrescription));
    setFormHidden(Boolean(product.isHidden));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const cleanName = formName.trim();
    if (!cleanName) {
      toast.error("Vui lòng nhập tên sản phẩm!");
      return;
    }

    onUpdateProduct({
      ...editingProduct,
      name: cleanName,
      price: Math.max(0, formPrice),
      category: formCategory as ExtendedProduct["category"],
      stock: Math.max(0, formStock),
      requiresPrescription: formRx,
      isHidden: formHidden,
    });

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <>
      <TabsContent value="products" className="space-y-4">
        <LowStockAlertBanner
          readOnly={readOnly}
          lowStockCount={lowStockProducts.length}
          onCreateImportFromAlert={onCreateImportFromAlert}
        />

        <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm tên sản phẩm, mã, danh mục..."
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-muted-foreground/20 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-zinc-400 whitespace-nowrap">
                Danh mục:
              </span>
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  if (val) {
                    setCategoryFilter(val);
                    setCurrentPage(1);
                  }
                }}
                items={{
                  all: "Tất cả danh mục",
                  ...Object.fromEntries(categories.map((c) => [c, getCategoryLabel(c)])),
                }}
              >
                <SelectTrigger className="w-52 h-10! rounded-xl bg-zinc-50 dark:bg-muted border-zinc-200 dark:border-border text-xs font-semibold px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {getCategoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                  Sản phẩm
                </TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                  Danh mục
                </TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                  Giá bán
                </TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                  <button
                    type="button"
                    onClick={toggleStockSort}
                    className="inline-flex items-center justify-center gap-1 uppercase tracking-wider font-semibold hover:text-zinc-900 dark:hover:text-foreground cursor-pointer transition-colors"
                    title="Sắp xếp theo số lượng tồn kho"
                  >
                    <span>Tồn kho</span>
                    {stockSort === "asc" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-[#FF7F6B]" />
                    ) : stockSort === "desc" ? (
                      <ArrowDown className="w-3.5 h-3.5 text-[#FF7F6B]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                  Cờ đơn thuốc (Rx)
                </TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                  Trạng thái bán
                </TableHead>
                {!readOnly && (
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                    Thao tác
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={readOnly ? 6 : 7} className="py-10 text-center text-zinc-400">
                    Không có sản phẩm nào phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((p) => {
                  const dimCell = p.isHidden ? "opacity-50" : "";
                  return (
                  <TableRow
                    key={p.id}
                    className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors"
                  >
                    {/* Name & Photo */}
                    <TableCell className={`py-3.5 px-3 max-w-[260px] whitespace-normal ${dimCell}`}>
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || "/assets/aistudio/cute_dog_transparent.png"}
                          alt={p.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-zinc-200 dark:border-border shrink-0"
                        />
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-foreground">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">Mã: {p.id}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className={`py-3.5 px-3 text-center font-medium text-zinc-600 dark:text-muted-foreground ${dimCell}`}>
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-zinc-100/80 dark:bg-muted/70 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        {getCategoryLabel(p.category)}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell className={`py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B] ${dimCell}`}>
                      {(p.price || 0).toLocaleString("vi-VN")}₫
                    </TableCell>

                    {/* Stock */}
                    <TableCell className={`py-3.5 px-3 text-center ${dimCell}`}>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          (p.stock || 0) < 5
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : (p.stock || 0) < 10
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {p.stock || 0} món
                      </span>
                    </TableCell>

                    {/* Rx required flag */}
                    <TableCell className={`py-3.5 px-3 text-center ${dimCell}`}>
                      {p.requiresPrescription ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          Rx Kê Đơn
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">-</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className={`py-3.5 px-3 text-center ${dimCell}`}>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isHidden
                            ? "bg-zinc-100 dark:bg-muted text-zinc-400"
                            : (p.stock || 0) > 0
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {p.isHidden ? "Đang ẩn" : (p.stock || 0) > 0 ? "Đang bán" : "Tạm hết"}
                      </span>
                    </TableCell>

                    {/* Action */}
                    {!readOnly && (
                      <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onCreatePOForProduct(p)}
                            title="Tạo đơn PO nhập hàng"
                            aria-label="Tạo đơn PO nhập hàng"
                            className="w-8 h-8 rounded-xl inline-flex items-center justify-center border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white cursor-pointer transition-all duration-150 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            title="Cập nhật sản phẩm"
                            aria-label="Cập nhật sản phẩm"
                            className="w-8 h-8 rounded-xl inline-flex items-center justify-center border border-zinc-200/80 dark:border-border bg-zinc-100/80 dark:bg-muted/50 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-muted hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-all duration-150 active:scale-95"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            title="Xóa sản phẩm"
                            aria-label="Xóa sản phẩm"
                            className="w-8 h-8 rounded-xl inline-flex items-center justify-center border border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:border-rose-600 hover:text-white cursor-pointer transition-all duration-150 active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    )}
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
          />
        </div>
      </TabsContent>

      {/* Modal Cập Nhật Sản Phẩm */}
      <Dialog
        open={isProductModalOpen}
        onOpenChange={(open) => {
          setIsProductModalOpen(open);
          if (!open) setEditingProduct(null);
        }}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold">
              Cập Nhật Thông Tin Sản Phẩm
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Chỉnh sửa tên, giá bán, tồn kho, danh mục hoặc cờ kê đơn của sản phẩm.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">
                Tên sản phẩm:
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Hạt Royal Canin, Sữa tắm..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">
                  Giá niêm yết (VNĐ):
                </label>
                <input
                  type="number"
                  min={0}
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">
                  Số lượng tồn kho:
                </label>
                <input
                  type="number"
                  min={0}
                  value={formStock}
                  onChange={(e) => setFormStock(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">
                Danh mục:
              </label>
              <Select
                value={formCategory}
                onValueChange={(val) => {
                  if (val !== null) setFormCategory(val);
                }}
                items={Object.fromEntries(
                  modalCategoryOptions.map((c) => [c, getCategoryLabel(c)])
                )}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modalCategoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">
                Trạng thái bán:
              </label>
              <Select
                value={formHidden ? "hidden" : "active"}
                onValueChange={(val) => {
                  if (val !== null) setFormHidden(val === "hidden");
                }}
                items={{
                  active: "Đang bán (Hiển thị)",
                  hidden: "Đang ẩn (Ngừng hiển thị)",
                }}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang bán (Hiển thị)</SelectItem>
                  <SelectItem value="hidden">Đang ẩn (Ngừng hiển thị)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rx Checkbox */}
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5">
              <Checkbox
                id="rxCheckbox"
                checked={formRx}
                onCheckedChange={(checked) => setFormRx(Boolean(checked))}
                className="mt-0.5 data-checked:bg-rose-600 data-checked:border-rose-600"
              />
              <label
                htmlFor="rxCheckbox"
                className="cursor-pointer text-zinc-700 dark:text-foreground/80"
              >
                <span className="font-bold text-rose-600 dark:text-rose-400 block">
                  Cờ &quot;Chỉ bán theo đơn thuốc&quot; (Rx Required)
                </span>
                Khách mua sản phẩm này phải đính kèm đơn thuốc từ Bác sĩ thú y Animora.
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold cursor-pointer"
              >
                Lưu cập nhật
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Xác Nhận Xóa / Ngừng Kinh Doanh Sản Phẩm */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6">
          {deleteTarget &&
            (() => {
              const constraints = checkProductDeletionConstraints(deleteTarget.id);
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold">
                      {constraints.canHardDelete
                        ? "Xác nhận xóa sản phẩm"
                        : "Không thể xóa vật lý — Ràng buộc dữ liệu"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {constraints.canHardDelete ? (
                        <>
                          Bạn có chắc chắn muốn xóa sản phẩm{" "}
                          <strong className="text-foreground">{deleteTarget.name}</strong>{" "}
                          khỏi danh mục cửa hàng? Thao tác này không thể hoàn tác.
                        </>
                      ) : (
                        <>
                          Sản phẩm{" "}
                          <strong className="text-foreground">{deleteTarget.name}</strong>{" "}
                          đang có dữ liệu liên kết nên không thể xóa vật lý. Bạn nên chuyển sang{" "}
                          <strong>Ngừng kinh doanh (Ẩn khỏi Shop)</strong> để bảo toàn lịch sử.
                        </>
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  {!constraints.canHardDelete && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-300 space-y-1">
                      <div className="font-bold">Ràng buộc đang tồn tại:</div>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {constraints.reasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-border text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
                    >
                      Hủy
                    </button>
                    {constraints.canHardDelete ? (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteProduct(deleteTarget.id);
                          setDeleteTarget(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Xóa sản phẩm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateProduct({ ...deleteTarget, isHidden: true });
                          setDeleteTarget(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Ngừng kinh doanh (Ẩn)
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
