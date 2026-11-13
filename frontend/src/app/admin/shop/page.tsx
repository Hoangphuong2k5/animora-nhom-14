"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Package,
  Plus,
  Search,
  CheckCircle2,
  Truck,
  Clock,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Building2,
  DollarSign,
  AlertCircle,
  Eye,
  FileText,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { Product } from "@/types";
import { initialProducts } from "@/data/mockData";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface ExtendedProduct extends Product {
  requiresPrescription?: boolean;
  isHidden?: boolean;
  costPrice?: number;
}

export interface ShopOrder {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  shippingAddress: string;
  items: { productName: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentMethod: "COD" | "Banking";
  status: "pending" | "packing" | "shipping" | "delivered" | "returned";
  createdAt: string;
}

export interface SupplierItem {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  importSlipsCount: number;
  totalImportValue: number;
}

export interface ImportSlip {
  id: string;
  slipCode: string;
  supplierName: string;
  itemsSummary: string;
  totalAmount: number;
  date: string;
  status: "received" | "in_transit";
}

export interface ReturnRequestItem {
  id: string;
  requestCode: string;
  orderCode: string;
  customerName: string;
  phone: string;
  productName: string;
  reason: string;
  refundAmount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const SAMPLE_ORDERS: ShopOrder[] = [
  {
    id: "ord-1",
    orderCode: "ORD-94821",
    customerName: "Phan Thị Đinh Thùy",
    phone: "0337203332",
    shippingAddress: "Toà S2.05 Vinhome Grand Park, TP. Thủ Đức",
    items: [
      { productName: "Hạt Royal Canin Mini Adult (2kg)", quantity: 1, price: 340000 },
      { productName: "Pate Monge Cá Hồi & Lê (100g)", quantity: 4, price: 35000 },
    ],
    totalAmount: 480000,
    paymentMethod: "COD",
    status: "shipping",
    createdAt: "2026-11-03 10:24",
  },
  {
    id: "ord-2",
    orderCode: "ORD-94822",
    customerName: "Nguyễn Minh Anh",
    phone: "0901234567",
    shippingAddress: "45 Lê Lợi, Phường Bến Nghé, Quận 1",
    items: [
      { productName: "Cát vệ sinh Cature Đậu Nành Gỗ Nén (6L)", quantity: 2, price: 210000 },
      { productName: "Lược Chải Lông Tự Động Bấm Nhả", quantity: 1, price: 150000 },
      { productName: "Dầu tắm trị nấm Virbac Sebazole", quantity: 1, price: 320000 },
    ],
    totalAmount: 890000,
    paymentMethod: "Banking",
    status: "pending",
    createdAt: "2026-11-03 11:40",
  },
  {
    id: "ord-3",
    orderCode: "ORD-94819",
    customerName: "Hoàng Văn Tuấn",
    phone: "0988776655",
    shippingAddress: "128 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    items: [
      { productName: "Xương Gặm Sạch Răng Orgo Vị Bò (90g)", quantity: 2, price: 85000 },
      { productName: "Sữa Tắm Thảo Mộc TropiClean (355ml)", quantity: 1, price: 230000 },
    ],
    totalAmount: 400000,
    paymentMethod: "COD",
    status: "delivered",
    createdAt: "2026-11-02 15:10",
  },
];

const SAMPLE_SUPPLIERS: SupplierItem[] = [
  {
    id: "sup-1",
    name: "Royal Canin Việt Nam (Cityzoo Distribution)",
    contactPerson: "Lê Minh Tuấn",
    phone: "028.3822.4455",
    email: "contact@cityzoo.vn",
    address: "KCN Tân Bình, Tân Phú, TP.HCM",
    importSlipsCount: 14,
    totalImportValue: 142000000,
  },
  {
    id: "sup-2",
    name: "Virbac Animal Health VN",
    contactPerson: "Nguyễn Thị Phương Mai",
    phone: "028.3910.1122",
    email: "order@virbac.vn",
    address: "Tòa nhà Mê Linh Point, Quận 1, TP.HCM",
    importSlipsCount: 9,
    totalImportValue: 98000000,
  },
  {
    id: "sup-3",
    name: "Purina Pro Plan (Nestlé Purina PetCare)",
    contactPerson: "Trần Anh Khoa",
    phone: "024.3772.8899",
    email: "purina.vietnam@nestle.com",
    address: "Keangnam Landmark 72, Cầu Giấy, Hà Nội",
    importSlipsCount: 6,
    totalImportValue: 65000000,
  },
];

const SAMPLE_IMPORT_SLIPS: ImportSlip[] = [
  {
    id: "slip-1",
    slipCode: "PN-202611-01",
    supplierName: "Royal Canin Việt Nam",
    itemsSummary: "50 bao Royal Canin Mini Adult (2kg), 30 bao Corgi Adult (3kg)",
    totalAmount: 28500000,
    date: "2026-11-01",
    status: "received",
  },
  {
    id: "slip-2",
    slipCode: "PN-202611-02",
    supplierName: "Virbac Animal Health VN",
    itemsSummary: "40 chai Sữa tắm Sebazole, 100 hộp thuốc tẩy giun Nexgard Spectra",
    totalAmount: 34200000,
    date: "2026-11-03",
    status: "in_transit",
  },
];

const SAMPLE_RETURNS: ReturnRequestItem[] = [
  {
    id: "ret-1",
    requestCode: "RET-2026-001",
    orderCode: "ORD-94815",
    customerName: "Vũ Hải Đăng",
    phone: "0944112233",
    productName: "Bao Hạt Purina Pro Plan Vị Cá Hồi 2.5kg",
    reason: "Bao bì bị rách góc trong quá trình đơn vị vận chuyển giao tới, hạt bị đổ ra ngoài.",
    refundAmount: 420000,
    status: "pending",
    createdAt: "2026-11-03 09:15",
  },
  {
    id: "ret-2",
    requestCode: "RET-2026-002",
    orderCode: "ORD-94808",
    customerName: "Đinh Thúy Hà",
    phone: "0918889900",
    productName: "Áo Len Mùa Đông Thú Cưng Size L",
    reason: "Nhầm size bé cưng (bé nặng 8kg mặc chật), muốn đổi sang size XL hoặc hoàn tiền.",
    refundAmount: 180000,
    status: "pending",
    createdAt: "2026-11-02 16:30",
  },
];

function AdminShopContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "products";

  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "inventory" | "suppliers" | "returns"
  >(initialTab);

  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(SAMPLE_SUPPLIERS);
  const [importSlips, setImportSlips] = useState<ImportSlip[]>(SAMPLE_IMPORT_SLIPS);
  const [returns, setReturns] = useState<ReturnRequestItem[]>(SAMPLE_RETURNS);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Drawers
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddImportModalOpen, setIsAddImportModalOpen] = useState(false);

  // New product form
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState(250000);
  const [newProdCategory, setNewProdCategory] = useState("Thức ăn thú cưng");
  const [newProdStock, setNewProdStock] = useState(20);
  const [newProdRx, setNewProdRx] = useState(false);

  // New import slip form
  const [newImportSupplier, setNewImportSupplier] = useState(SAMPLE_SUPPLIERS[0].name);
  const [newImportItems, setNewImportItems] = useState("");
  const [newImportAmount, setNewImportAmount] = useState(15000000);
  const [newImportStatus, setNewImportStatus] = useState<"received" | "in_transit">("received");

  useEffect(() => {
    const savedProducts = safeGetStorage<ExtendedProduct[]>("animora_shop_products_v2", []);
    if (Array.isArray(savedProducts) && savedProducts.length > 0) {
      setProducts(savedProducts);
    } else {
      const extended: ExtendedProduct[] = initialProducts.map((p, i) => ({
        ...p,
        requiresPrescription: i === 2 || i === 5, // Mark vaccines/antibiotics as Rx required
        isHidden: false,
        stock: p.stock || (i === 1 ? 3 : i === 4 ? 2 : 25), // low stock for card demo
        costPrice: Math.round((p.price || 200000) * 0.65),
      }));
      setProducts(extended);
      safeSetStorage("animora_shop_products_v2", extended);
    }

    const savedOrders = safeGetStorage<ShopOrder[]>("animora_shop_orders_v2", []);
    if (Array.isArray(savedOrders) && savedOrders.length > 0) {
      setOrders(savedOrders);
    } else {
      setOrders(SAMPLE_ORDERS);
      safeSetStorage("animora_shop_orders_v2", SAMPLE_ORDERS);
    }
  }, []);

  const saveProducts = (updated: ExtendedProduct[]) => {
    setProducts(updated);
    safeSetStorage("animora_shop_products_v2", updated);
  };

  const saveOrders = (updated: ShopOrder[]) => {
    setOrders(updated);
    safeSetStorage("animora_shop_orders_v2", updated);
  };

  // Toggle Hide Product
  const handleToggleHide = (productId: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, isHidden: !p.isHidden };
      }
      return p;
    });
    saveProducts(updated);
    toast.info("Đã cập nhật trạng thái hiển thị sản phẩm!");
  };

  // Adjust stock
  const handleStockAdjust = (productId: string, delta: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const next = Math.max(0, (p.stock || 0) + delta);
        return { ...p, stock: next };
      }
      return p;
    });
    saveProducts(updated);
    toast.success("Đã cập nhật số lượng tồn kho!");
  };

  // Update order status
  const handleUpdateOrderStatus = (orderId: string, nextStatus: ShopOrder["status"]) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus };
      }
      return o;
    });
    saveOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updated.find((o) => o.id === orderId) || null);
    }
    toast.success(`Đã cập nhật đơn hàng sang trạng thái: ${nextStatus}!`);
  };

  // Handle return request approve/reject
  const handleProcessReturn = (returnId: string, nextStatus: "approved" | "rejected") => {
    setReturns((prev) =>
      prev.map((r) => (r.id === returnId ? { ...r, status: nextStatus } : r))
    );
    toast.success(
      nextStatus === "approved"
        ? "Đã phê duyệt hoàn tiền vào ví khách hàng!"
        : "Đã từ chối yêu cầu đổi trả."
    );
  };

  // Add new product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ExtendedProduct = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      price: newProdPrice,
      originalPrice: newProdPrice * 1.2,
      category: newProdCategory,
      stock: newProdStock,
      requiresPrescription: newProdRx,
      isHidden: false,
      images: ["/assets/aistudio/cute_dog_transparent.png"],
      description: "Sản phẩm chính hãng phân phối tại hệ sinh thái Animora.",
      rating: 5.0,
      reviewsCount: 1,
    } as any;

    const next = [created, ...products];
    saveProducts(next);
    setIsAddProductModalOpen(false);
    toast.success(`Đã thêm sản phẩm mới: ${newProdName}!`);
  };

  // Add new import slip
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
    setImportSlips((prev) => [createdSlip, ...prev]);
    setIsAddImportModalOpen(false);
    setNewImportItems("");
    toast.success(`Đã lập phiếu nhập kho ${createdSlip.slipCode}!`);
  };

  // Low stock products count
  const lowStockProducts = products.filter((p) => (p.stock || 0) < 5);
  const supplierItems = {
    ...Object.fromEntries(suppliers.map((sup) => [sup.name, sup.name])),
    ...(newImportSupplier ? { [newImportSupplier]: newImportSupplier } : {}),
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) {
            setActiveTab(
              val as "products" | "orders" | "inventory" | "suppliers" | "returns"
            );
          }
        }}
        className="gap-6"
      >
        {/* 1. Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Cửa Hàng, Kho & Nhà Cung Cấp
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Quản trị danh mục sản phẩm, cảnh báo kho dưới ngưỡng, vận đơn và hoàn tiền
            </p>
          </div>

          {/* 5 Tab Switchers */}
          <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl max-w-full">
            {[
              { id: "products", label: "Sản phẩm", badge: products.length },
              { id: "orders", label: "Đơn hàng", badge: orders.length },
              { id: "inventory", label: "Quản lý Kho", badge: lowStockProducts.length > 0 ? `${lowStockProducts.length} báo động` : null },
              { id: "suppliers", label: "Nhà cung cấp" },
              { id: "returns", label: "Hoàn trả / Hoàn tiền", badge: returns.filter((r) => r.status === "pending").length },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* TAB 1: SẢN PHẨM */}
        <TabsContent value="products" className="space-y-4">
          <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên sản phẩm, danh mục, phân loại..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>

          <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
            <Table className="w-full text-left text-xs">
              <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Sản phẩm</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Danh mục</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Giá bán</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Tồn kho</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Cờ đơn thuốc (Rx)</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái bán</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
                {products
                  .filter(
                    (p) =>
                      !searchQuery ||
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((p) => (
                    <TableRow
                      key={p.id}
                      className={`hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors ${
                        p.isHidden ? "opacity-50" : ""
                      }`}
                    >
                      {/* Name & Photo */}
                      <TableCell className="py-3.5 px-3 max-w-[260px] whitespace-normal">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || "/assets/aistudio/cute_dog_transparent.png"}
                            alt={p.name}
                            className="w-11 h-11 rounded-2xl object-cover border border-zinc-200 dark:border-border shrink-0"
                          />
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-foreground">{p.name}</div>
                            <div className="text-[11px] text-zinc-400">Mã: {p.id}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="py-3.5 px-3 font-medium text-zinc-600 dark:text-muted-foreground">
                        {p.category}
                      </TableCell>

                      {/* Price */}
                      <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {(p.price || 0).toLocaleString("vi-VN")}₫
                      </TableCell>

                      {/* Stock */}
                      <TableCell className="py-3.5 px-3 text-center">
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
                      <TableCell className="py-3.5 px-3 text-center">
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
                      <TableCell className="py-3.5 px-3 text-center">
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
                      <TableCell className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleHide(p.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer"
                          >
                            {p.isHidden ? "Hiện" : "Ẩn"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p.id, 5)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                            title="Nhập thêm 5 món vào kho"
                          >
                            +5 kho
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 2: ĐƠN HÀNG */}
        <TabsContent value="orders" className="space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
            <Table className="w-full text-left text-xs">
              <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã đơn</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Khách hàng</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Món hàng</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Tổng tiền</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thanh toán</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái giao</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
                {orders.map((o) => (
                  <TableRow key={o.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                    <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                      {o.orderCode}
                    </TableCell>
                    <TableCell className="py-3.5 px-3">
                      <div className="font-bold text-zinc-900 dark:text-foreground">{o.customerName}</div>
                      <div className="text-[11px] text-zinc-400">{o.phone}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 max-w-[240px] whitespace-normal text-zinc-600 dark:text-muted-foreground">
                      {o.items.map((it) => `${it.productName} (x${it.quantity})`).join(", ")}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {o.totalAmount.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center">
                      <span className="font-semibold text-zinc-600 dark:text-muted-foreground">
                        {o.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === "delivered"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : o.status === "shipping"
                            ? "bg-sky-500/10 text-sky-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {o.status === "delivered"
                          ? "Đã giao"
                          : o.status === "shipping"
                          ? "Đang giao"
                          : "Chờ xử lý"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted font-bold text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                      >
                        Chi tiết đơn
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 3: QUẢN LÝ KHO (INVENTORY) */}
        <TabsContent value="inventory" className="space-y-5">
          {/* Low Stock Alert Banner */}
          {lowStockProducts.length > 0 && (
            <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold text-rose-900 dark:text-rose-200 block">
                    Cảnh Báo Tồn Kho Dưới Ngưỡng An Toàn!
                  </span>
                  <p className="text-rose-700 dark:text-rose-300 mt-0.5">
                    Có {lowStockProducts.length} sản phẩm tồn kho &lt; 5 đơn vị. Cần tạo phiếu nhập từ nhà cung cấp ngay để tránh đứt gãy đơn hàng.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("suppliers");
                  setIsAddImportModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs whitespace-nowrap cursor-pointer"
              >
                Tạo phiếu nhập kho
              </button>
            </div>
          )}

          {/* Inventory Table */}
          <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
            <h3 className="text-base font-bold text-zinc-900 dark:text-foreground mb-4">
              Bảng Theo Dõi Mức Tồn Kho Sản Phẩm
            </h3>
            <Table className="w-full text-left text-xs">
              <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Sản phẩm</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Tồn kho hiện tại</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Ngưỡng tối thiểu</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mức độ an toàn</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Nhập / Xuất nhanh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
                {products.map((p) => {
                  const stock = p.stock || 0;
                  const isDanger = stock < 5;
                  const isWarning = stock >= 5 && stock < 10;

                  return (
                    <TableRow key={p.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                      <TableCell className="py-3.5 px-3 font-bold text-zinc-900 dark:text-foreground whitespace-normal">
                        {p.name}
                      </TableCell>
                      <TableCell className="py-3.5 px-3 text-center font-extrabold text-sm">
                        <span
                          className={
                            isDanger ? "text-rose-600" : isWarning ? "text-amber-600" : "text-emerald-600"
                          }
                        >
                          {stock}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-3 text-center text-zinc-400 font-semibold">10 món</TableCell>
                      <TableCell className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isDanger
                              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              : isWarning
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          }`}
                        >
                          {isDanger ? "Báo động đỏ (<5)" : isWarning ? "Cảnh báo vàng (<10)" : "An toàn"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p.id, -1)}
                            className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-border font-bold hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
                            title="Xuất 1 món"
                          >
                            -1 Xuất
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p.id, 10)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                            title="Nhập 10 món"
                          >
                            +10 Nhập
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 4: NHÀ CUNG CẤP & PHIẾU NHẬP HÀNG */}
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

          {/* Lịch sử phiếu nhập */}
          <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF7F6B]" />
                Lịch Sử Phiếu Nhập Hàng Gần Đây
              </h3>
              <button
                type="button"
                onClick={() => setIsAddImportModalOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-[#6B1F2E] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Lập phiếu nhập</span>
              </button>
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

        {/* TAB 5: HOÀN TRẢ / HOÀN TIỀN */}
        <TabsContent value="returns" className="space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
            <h3 className="text-base font-bold text-zinc-900 dark:text-foreground mb-4 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              Yêu Cầu Đổi Trả & Hoàn Tiền Khách Hàng
            </h3>

            <Table className="w-full text-left text-xs">
              <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã yêu cầu</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Đơn hàng & Khách</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Sản phẩm</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Lý do hoàn trả</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Số tiền hoàn</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Xử lý</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
                {returns.map((ret) => (
                  <TableRow key={ret.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                    <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                      {ret.requestCode}
                    </TableCell>
                    <TableCell className="py-3.5 px-3">
                      <div className="font-bold text-zinc-900 dark:text-foreground">{ret.customerName}</div>
                      <div className="text-[11px] text-zinc-400">
                        Đơn {ret.orderCode} · {ret.phone}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 max-w-[200px] whitespace-normal font-medium text-zinc-800 dark:text-foreground/90">
                      {ret.productName}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 max-w-[240px] whitespace-normal text-zinc-600 dark:text-muted-foreground italic">
                      "{ret.reason}"
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {ret.refundAmount.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ret.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : ret.status === "rejected"
                            ? "bg-rose-500/10 text-rose-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {ret.status === "approved"
                          ? "Đã hoàn tiền"
                          : ret.status === "rejected"
                          ? "Từ chối"
                          : "Chờ duyệt"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right">
                      {ret.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleProcessReturn(ret.id, "approved")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
                          >
                            Duyệt hoàn
                          </button>
                          <button
                            type="button"
                            onClick={() => handleProcessReturn(ret.id, "rejected")}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-bold cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">Đã xử lý</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Slide-over Drawer Chi Tiết Đơn Hàng */}
      <Sheet
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={true}
          className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
        >
          {selectedOrder && (
            <>
              <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
                <span className="text-xs font-mono font-bold text-[#FF7F6B]">
                  {selectedOrder.orderCode}
                </span>
                <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground">
                  Chi Tiết Đơn Hàng Cửa Hàng
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Thông tin giao nhận và danh sách sản phẩm trong đơn
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                <div className="p-6 space-y-5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border space-y-1">
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      Người nhận: {selectedOrder.customerName}
                    </div>
                    <div className="text-zinc-500">SĐT: {selectedOrder.phone}</div>
                    <div className="text-zinc-500">Địa chỉ giao: {selectedOrder.shippingAddress}</div>
                  </div>

                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2">
                      Danh Sách Món Đã Đặt:
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-foreground">{it.productName}</div>
                            <div className="text-[11px] text-zinc-400">Số lượng: x{it.quantity}</div>
                          </div>
                          <div className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                            {(it.price * it.quantity).toLocaleString("vi-VN")}₫
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border flex items-center justify-between font-bold">
                    <span>Tổng giá trị đơn hàng:</span>
                    <span className="text-lg text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {selectedOrder.totalAmount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              </ScrollArea>

              <div className="px-6 py-4 border-t border-border shrink-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, "shipping")}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer"
                >
                  Giao Hàng (Shipping)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, "delivered")}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  Đã Giao Xong
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal Thêm Sản Phẩm Mới */}
      <Dialog
        open={isAddProductModalOpen}
        onOpenChange={(open) => setIsAddProductModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold">
              Thêm Sản Phẩm Mới Vào Cửa Hàng
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Điền thông tin niêm yết, số lượng kho ban đầu và cờ kê đơn (nếu có).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Tên sản phẩm:</label>
              <input
                type="text"
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="Hạt Royal Canin, Sữa tắm..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Giá niêm yết (VNĐ):</label>
                <input
                  type="number"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Số lượng nhập ban đầu:</label>
                <input
                  type="number"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Danh mục:</label>
              <Select
                value={newProdCategory}
                onValueChange={(val) => {
                  if (val !== null) setNewProdCategory(val);
                }}
                items={{
                  "Thức ăn thú cưng": "Thức ăn thú cưng",
                  "Thuốc & Dược thú y": "Thuốc & Dược thú y",
                  "Chăm sóc da lông": "Chăm sóc da lông",
                  "Phụ kiện & Đồ chơi": "Phụ kiện & Đồ chơi",
                }}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Thức ăn thú cưng">Thức ăn thú cưng</SelectItem>
                  <SelectItem value="Thuốc & Dược thú y">Thuốc & Dược thú y</SelectItem>
                  <SelectItem value="Chăm sóc da lông">Chăm sóc da lông</SelectItem>
                  <SelectItem value="Phụ kiện & Đồ chơi">Phụ kiện & Đồ chơi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rx Checkbox */}
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5">
              <Checkbox
                id="rxCheckbox"
                checked={newProdRx}
                onCheckedChange={(checked) => setNewProdRx(Boolean(checked))}
                className="mt-0.5 data-checked:bg-rose-600 data-checked:border-rose-600"
              />
              <label htmlFor="rxCheckbox" className="cursor-pointer text-zinc-700 dark:text-foreground/80">
                <span className="font-bold text-rose-600 dark:text-rose-400 block">
                  Cờ "Chỉ bán theo đơn thuốc" (Rx Required)
                </span>
                Khách mua sản phẩm này phải đính kèm đơn thuốc từ Bác sĩ thú y Animora.
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold cursor-pointer"
              >
                Tạo sản phẩm
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}

export default function AdminShopPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-xs text-zinc-400 font-semibold animate-pulse">
          Đang tải dữ liệu cửa hàng, kho & nhà cung cấp...
        </div>
      }
    >
      <AdminShopContent />
    </React.Suspense>
  );
}
