"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import {
  ORDERS_SYNC_EVENT,
  processReturnRefundRequestInStorage,
  readOrdersFromStorage,
  readReturnsFromStorage,
  updateOrderStatusInStorage,
} from "@/utils/orderSync";
import { initialProducts } from "@/data/mockData";
import {
  PurchaseOrder,
  SEED_PURCHASE_ORDERS,
  useManagerStore,
  MANAGER_STORAGE_KEYS,
  todayIso,
} from "@/data/managerOpsData";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExtendedProduct,
  ShopOrder,
  SupplierItem,
  ImportSlip,
  ReturnRequestItem,
  ShopTabId,
  SAMPLE_SUPPLIERS,
  SAMPLE_IMPORT_SLIPS,
  SAMPLE_RETURNS,
} from "@/components/manager/shop/shopTypesAndData";
import { ProductsTab } from "@/components/manager/shop/tabs/ProductsTab";
import { OrdersTab } from "@/components/manager/shop/tabs/OrdersTab";
import { SuppliersTab } from "@/components/manager/shop/tabs/SuppliersTab";
import { ReturnsTab } from "@/components/manager/shop/tabs/ReturnsTab";
import { MedicineBoxRequestsTab } from "@/components/manager/shop/tabs/MedicineBoxRequestsTab";
import type {
  MedicineBoxItem,
  MedicineBoxLogEntry,
  MedicineBoxRequest,
} from "@/types/expert.type";
import {
  type DoctorShelfOverviewRow,
  MEDICINE_BOX_SYNC_EVENT,
  allocateMedicineImportToDoctors,
  checkProductDeletionConstraints,
  emitMedicineBoxSync,
  isMedicineOrVaccineProduct,
  readAllDoctorsShelfOverview,
  readMedicineBoxItems,
  readMedicineBoxLogs,
  readMedicineBoxRequests,
} from "@/utils/medicineBoxSync";
import {
  SUPPLIER_SYNC_EVENT,
  deductSupplierStockAfterImport,
  ensureSupplierCatalogMetaForProduct,
  loadSupplierProfiles,
} from "@/data/supplierPortalData";

export type {
  ExtendedProduct,
  ShopOrder,
  SupplierItem,
  ImportSlip,
  ReturnRequestItem,
};

export interface ShopWorkspaceProps {
  mode?: "manager" | "readonly";
}

function normalizeShopTab(raw: string | null): ShopTabId {
  if (!raw || raw === "inventory") return "products";
  if (
    raw === "products" ||
    raw === "suppliers" ||
    raw === "orders" ||
    raw === "returns" ||
    raw === "medicine-box"
  ) {
    return raw;
  }
  return "products";
}

function ShopWorkspaceContent({ mode = "manager" }: ShopWorkspaceProps) {
  const isReadOnly = mode === "readonly";
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ShopTabId>(() =>
    normalizeShopTab(searchParams.get("tab"))
  );

  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(SAMPLE_SUPPLIERS);
  const [importSlips, setImportSlips] = useState<ImportSlip[]>(SAMPLE_IMPORT_SLIPS);
  const [returns, setReturns] = useState<ReturnRequestItem[]>(SAMPLE_RETURNS);
  const [medBoxRequests, setMedBoxRequests] = useState<MedicineBoxRequest[]>([]);
  const [medBoxItems, setMedBoxItems] = useState<MedicineBoxItem[]>([]);
  const [medBoxOverview, setMedBoxOverview] = useState<DoctorShelfOverviewRow[]>([]);
  const [medBoxLogs, setMedBoxLogs] = useState<MedicineBoxLogEntry[]>([]);
  const [isAddImportModalOpen, setIsAddImportModalOpen] = useState(false);
  const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);
  const [poPreselectedProductId, setPoPreselectedProductId] = useState<string>("");

  const [purchaseOrders, setPurchaseOrders] = useManagerStore<PurchaseOrder[]>(
    MANAGER_STORAGE_KEYS.purchaseOrders,
    SEED_PURCHASE_ORDERS
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const shouldCreatePO = !isReadOnly && searchParams.get("createPO") === "1";
    const prodId = searchParams.get("productId") || "";
    if (!tabParam && !shouldCreatePO) return;

    queueMicrotask(() => {
      if (tabParam) {
        setActiveTab(normalizeShopTab(tabParam));
      }
      if (shouldCreatePO) {
        if (prodId) setPoPreselectedProductId(prodId);
        setActiveTab("suppliers");
        setIsCreatePOModalOpen(true);
      }
    });
  }, [searchParams, isReadOnly]);

  const syncMedicineBox = () => {
    setMedBoxRequests(readMedicineBoxRequests());
    setMedBoxItems(readMedicineBoxItems());
    setMedBoxOverview(readAllDoctorsShelfOverview());
    setMedBoxLogs(readMedicineBoxLogs());
    setSuppliers(loadSupplierProfiles());
    const latestProducts = safeGetStorage<ExtendedProduct[]>("animora_shop_products_v2", []);
    if (Array.isArray(latestProducts) && latestProducts.length > 0) {
      setProducts(latestProducts);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const syncOrdersAndReturns = () => {
      setOrders(readOrdersFromStorage() as unknown as ShopOrder[]);
      setReturns(readReturnsFromStorage() as unknown as ReturnRequestItem[]);
    };

    queueMicrotask(() => {
      if (cancelled) return;
      const savedProducts = safeGetStorage<ExtendedProduct[]>("animora_shop_products_v2", []);
      if (Array.isArray(savedProducts) && savedProducts.length > 0) {
        setProducts(savedProducts);
      } else {
        const extended: ExtendedProduct[] = initialProducts.map((p, i) => ({
          ...p,
          requiresPrescription: Boolean(p.requiresPrescription),
          isHidden: false,
          stock: p.stock || (i === 1 ? 3 : i === 4 ? 2 : 25),
          costPrice: Math.round((p.price || 200000) * 0.65),
        }));
        setProducts(extended);
        safeSetStorage("animora_shop_products_v2", extended);
      }

      syncOrdersAndReturns();
      setMedBoxRequests(readMedicineBoxRequests());
      setMedBoxItems(readMedicineBoxItems());
      setMedBoxOverview(readAllDoctorsShelfOverview());
      setMedBoxLogs(readMedicineBoxLogs());
      setSuppliers(loadSupplierProfiles());
    });

    window.addEventListener(ORDERS_SYNC_EVENT, syncOrdersAndReturns);
    window.addEventListener(MEDICINE_BOX_SYNC_EVENT, syncMedicineBox);
    window.addEventListener(SUPPLIER_SYNC_EVENT, syncMedicineBox);
    window.addEventListener("storage", syncOrdersAndReturns);
    window.addEventListener("storage", syncMedicineBox);
    return () => {
      cancelled = true;
      window.removeEventListener(ORDERS_SYNC_EVENT, syncOrdersAndReturns);
      window.removeEventListener(MEDICINE_BOX_SYNC_EVENT, syncMedicineBox);
      window.removeEventListener(SUPPLIER_SYNC_EVENT, syncMedicineBox);
      window.removeEventListener("storage", syncOrdersAndReturns);
      window.removeEventListener("storage", syncMedicineBox);
    };
  }, []);

  const saveProducts = (updated: ExtendedProduct[]) => {
    if (isReadOnly) return;
    setProducts(updated);
    safeSetStorage("animora_shop_products_v2", updated);
    emitMedicineBoxSync(true);
  };

  const handleToggleHide = (productId: string) => {
    if (isReadOnly) return;
    const updated = products.map((p) =>
      p.id === productId ? { ...p, isHidden: !p.isHidden } : p
    );
    saveProducts(updated);
    toast.info("Đã cập nhật trạng thái hiển thị sản phẩm!");
  };

  const handleStockAdjust = (productId: string, delta: number) => {
    if (isReadOnly) return;
    const updated = products.map((p) =>
      p.id === productId ? { ...p, stock: Math.max(0, (p.stock || 0) + delta) } : p
    );
    saveProducts(updated);
    toast.success("Đã cập nhật số lượng tồn kho!");
  };

  const handleUpdateProduct = (updatedProduct: ExtendedProduct) => {
    if (isReadOnly) return;
    const updated = products.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    saveProducts(updated);
    toast.success(`Đã cập nhật sản phẩm: ${updatedProduct.name}!`);
  };

  const handleDeleteProduct = (productId: string) => {
    if (isReadOnly) return;
    const constraints = checkProductDeletionConstraints(productId);
    if (!constraints.canHardDelete) {
      toast.error(
        `Không thể xóa vật lý do: ${constraints.reasons.join("; ")}. Vui lòng chuyển sang Ngừng kinh doanh (Ẩn).`
      );
      return;
    }
    const target = products.find((p) => p.id === productId);
    saveProducts(products.filter((p) => p.id !== productId));
    toast.success(`Đã xóa sản phẩm${target ? `: ${target.name}` : ""}!`);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: ShopOrder["status"]) => {
    if (isReadOnly) return;
    const updated = updateOrderStatusInStorage(orderId, nextStatus);
    setOrders(updated as unknown as ShopOrder[]);
    toast.success(`Đã cập nhật đơn hàng sang trạng thái: ${nextStatus}!`);
  };

  const handleProcessReturn = (returnId: string, nextStatus: "approved" | "rejected") => {
    if (isReadOnly) return;
    const { returns: updatedReturns, orders: updatedOrders } =
      processReturnRefundRequestInStorage(returnId, nextStatus);
    setReturns(updatedReturns as unknown as ReturnRequestItem[]);
    setOrders(updatedOrders as unknown as ShopOrder[]);
    toast.success(
      nextStatus === "approved"
        ? "Đã phê duyệt đổi trả / hoàn tiền cho khách hàng!"
        : "Đã từ chối yêu cầu đổi trả."
    );
  };

  const handleReceivePO = (
    po: PurchaseOrder,
    actualReceivedQty?: number,
    discrepancyNote?: string
  ) => {
    if (isReadOnly) return;
    if (po.status !== "delivering") {
      toast.error("Chỉ được nhập kho khi Nhà cung cấp đang giao hàng!");
      return;
    }

    const firstLine = po.lines[0];
    const expectedQty = firstLine ? firstLine.confirmedQuantity ?? firstLine.quantity : 0;
    const receivedQty = Math.max(0, actualReceivedQty ?? expectedQty);
    const isPartial = receivedQty < expectedQty;
    const missingQty = Math.max(0, expectedQty - receivedQty);

    setPurchaseOrders((prev) =>
      prev.map((item) =>
        item.id === po.id
          ? {
              ...item,
              status: isPartial ? "received_partial" : "received",
              receivedAt: todayIso(),
              discrepancyNote: isPartial
                ? discrepancyNote?.trim() || `Thiếu ${missingQty} sản phẩm khi kiểm đếm tại kho`
                : undefined,
              lines: item.lines.map((l, idx) =>
                idx === 0 ? { ...l, receivedQuantity: receivedQty } : l
              ),
            }
          : item
      )
    );

    const updatedProducts = [...products];
    const newlyCreatedProducts: ExtendedProduct[] = [];
    const pendingMedicineAllocations: {
      shopProductId: string;
      medicineName: string;
      unit: string;
      receivedQty: number;
    }[] = [];
    const supplierDeductions: { productId: string; quantity: number }[] = [];

    let restockedCount = 0;
    let allocatedToDoctorsCount = 0;
    let newProductsCreated = 0;

    if (receivedQty > 0) {
      po.lines.forEach((line, idx) => {
        const lineQty =
          idx === 0 && actualReceivedQty !== undefined
            ? Math.max(0, actualReceivedQty)
            : line.confirmedQuantity ?? line.quantity;
        if (lineQty <= 0) return;

        supplierDeductions.push({ productId: line.productId, quantity: lineQty });

        const existingIdx = updatedProducts.findIndex(
          (p) => p.id === line.productId || p.name === line.productName
        );

        if (existingIdx >= 0) {
          const existingProd = updatedProducts[existingIdx];
          if (isMedicineOrVaccineProduct(existingProd)) {
            updatedProducts[existingIdx] = {
              ...existingProd,
              costPrice: line.unitCost,
            };
            allocatedToDoctorsCount += lineQty;
            pendingMedicineAllocations.push({
              shopProductId: existingProd.id,
              medicineName: existingProd.name,
              unit: existingProd.spec || "đơn vị",
              receivedQty: lineQty,
            });
          } else {
            restockedCount += lineQty;
            updatedProducts[existingIdx] = {
              ...existingProd,
              stock: (existingProd.stock || 0) + lineQty,
              costPrice: line.unitCost,
            };
          }
          return;
        }

        if (line.newProductMeta) {
          const isMed = line.newProductMeta.category === "medicine";
          const medId = isMed ? `med-${Date.now().toString().slice(-4)}` : undefined;
          newProductsCreated += 1;

          newlyCreatedProducts.push({
            id: line.productId,
            medicineId: medId,
            name: line.newProductMeta.name,
            price: line.newProductMeta.retailPrice,
            costPrice: line.unitCost,
            category: line.newProductMeta.category,
            stock: isMed ? 0 : lineQty,
            requiresPrescription: isMed || line.newProductMeta.requiresPrescription,
            isHidden: false,
            image: "/assets/aistudio/cute_dog_transparent.png",
            images: ["/assets/aistudio/cute_dog_transparent.png"],
            description: "Sản phẩm chính hãng nhập từ nhà cung cấp tại hệ sinh thái Animora.",
            rating: 5.0,
            reviewCount: 0,
          });
          ensureSupplierCatalogMetaForProduct(
            line.productId,
            line.newProductMeta.category,
            po.supplierName
          );

          if (isMed) {
            allocatedToDoctorsCount += lineQty;
            pendingMedicineAllocations.push({
              shopProductId: line.productId,
              medicineName: line.newProductMeta.name,
              unit: "đơn vị",
              receivedQty: lineQty,
            });
          } else {
            restockedCount += lineQty;
          }
        }
      });

      saveProducts([...newlyCreatedProducts, ...updatedProducts]);

      for (const alloc of pendingMedicineAllocations) {
        allocateMedicineImportToDoctors({
          shopProductId: alloc.shopProductId,
          medicineName: alloc.medicineName,
          unit: alloc.unit,
          receivedQty: alloc.receivedQty,
          poCode: po.code,
          actorLabel: "Đã xử lý bởi Quản lý",
        });
      }

      deductSupplierStockAfterImport(supplierDeductions);
    }

    if (isPartial) {
      toast.warning(
        `Đã ghi nhận nhập thiếu đơn ${po.code} (Thực nhận ${receivedQty}/${expectedQty}, thiếu ${missingQty}).${
          allocatedToDoctorsCount > 0
            ? ` Đã tự động phân bổ ${allocatedToDoctorsCount} đơn vị lên kệ các Bác sĩ.`
            : ""
        } Đơn chuyển sang trạng thái Đối soát.`
      );
      return;
    }

    if (allocatedToDoctorsCount > 0) {
      toast.success(
        `Đã nhập kho đơn ${po.code}! Tự động phân bổ đều ${allocatedToDoctorsCount} đơn vị thuốc/vắc-xin vào Hộp thuốc của các Bác sĩ.`
      );
      return;
    }

    toast.success(
      newProductsCreated > 0
        ? `Đã nhập kho đơn ${po.code}! Thêm mới ${newProductsCreated} sản phẩm (${restockedCount} đơn vị) vào Quản lý kho.`
        : `Đã nhập kho đơn ${po.code}! Bổ sung tổng cộng ${restockedCount} sản phẩm vào tồn kho.`
    );
  };

  const handleSimulateSupplierConfirm = (poId: string) => {
    if (isReadOnly) return;
    setPurchaseOrders((prev) =>
      prev.map((item) =>
        item.id === poId ? { ...item, status: "supplier_confirmed" } : item
      )
    );
    toast.info("Mô phỏng: Nhà cung cấp đã xác nhận đơn hàng!");
  };

  const lowStockProducts = products.filter((p) => (p.stock || 0) < 5);

  const tabsList = [
    { id: "products", label: isReadOnly ? "Kho hàng" : "Quản lý kho", badge: products.length },
    { id: "suppliers", label: "Nhà cung cấp" },
    { id: "orders", label: "Đơn hàng", badge: orders.length },
    {
      id: "returns",
      label: "Hoàn trả / Hoàn tiền",
      badge: returns.filter((r) => r.status === "pending").length,
    },
    {
      id: "medicine-box",
      label: "Hộp thuốc Bác sĩ",
      badge: medBoxRequests.filter((r) => r.status === "pending").length,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) setActiveTab(val as ShopTabId);
        }}
        className="gap-6"
      >
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              {isReadOnly
                ? "Tra Cứu Cửa Hàng, Kho & Nhà Cung Cấp"
                : "Cửa Hàng, Kho & Nhà Cung Cấp"}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {isReadOnly
                ? "Tra cứu danh mục sản phẩm, cảnh báo tồn kho, vận đơn và yêu cầu đổi trả"
                : "Quản trị danh mục sản phẩm, cảnh báo kho dưới ngưỡng, vận đơn và hoàn tiền"}
            </p>
          </div>

          <TabsList className="h-auto! flex-wrap gap-1.5 bg-white dark:bg-card border border-zinc-200/80 dark:border-border p-1.5 rounded-2xl shadow-sm w-fit max-w-full">
            {tabsList.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-none inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer bg-zinc-50/80 dark:bg-muted/40 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white dark:bg-black/15 dark:text-primary-foreground"
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

        <ProductsTab
          readOnly={isReadOnly}
          products={products}
          lowStockProducts={lowStockProducts}
          onCreateImportFromAlert={() => {
            if (isReadOnly) return;
            setActiveTab("suppliers");
            setIsCreatePOModalOpen(true);
          }}
          onCreatePOForProduct={(product) => {
            if (isReadOnly) return;
            setPoPreselectedProductId(product.id);
            setActiveTab("suppliers");
            setIsCreatePOModalOpen(true);
          }}
          onToggleHide={handleToggleHide}
          onStockAdjust={handleStockAdjust}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />

        <OrdersTab
          readOnly={isReadOnly}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />

        <SuppliersTab
          readOnly={isReadOnly}
          products={products}
          suppliers={suppliers}
          importSlips={importSlips}
          onAddImportSlip={(createdSlip) => setImportSlips((prev) => [createdSlip, ...prev])}
          purchaseOrders={purchaseOrders}
          onAddPurchaseOrder={(newPO) => setPurchaseOrders((prev) => [newPO, ...prev])}
          onReceivePO={handleReceivePO}
          onSimulateSupplierConfirm={handleSimulateSupplierConfirm}
          isAddImportModalOpen={isReadOnly ? false : isAddImportModalOpen}
          setIsAddImportModalOpen={setIsAddImportModalOpen}
          isCreatePOModalOpen={isReadOnly ? false : isCreatePOModalOpen}
          setIsCreatePOModalOpen={setIsCreatePOModalOpen}
          preselectedProductId={poPreselectedProductId}
          onClearPreselectedProductId={() => setPoPreselectedProductId("")}
        />

        <ReturnsTab
          readOnly={isReadOnly}
          returns={returns}
          onProcessReturn={handleProcessReturn}
        />

        <MedicineBoxRequestsTab
          requests={medBoxRequests}
          items={medBoxItems}
          overviewRows={medBoxOverview}
          logs={medBoxLogs}
          onRefresh={syncMedicineBox}
          readOnly={isReadOnly}
          onCreatePOForMedicine={
            isReadOnly
              ? undefined
              : (shopProductId) => {
                  setPoPreselectedProductId(shopProductId);
                  setActiveTab("suppliers");
                  setIsCreatePOModalOpen(true);
                }
          }
        />
      </Tabs>
    </div>
  );
}

/** Shared Shop, Inventory & Suppliers workspace for Manager and Admin (read-only). */
export function ShopWorkspace({ mode = "manager" }: ShopWorkspaceProps) {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-xs text-zinc-400 font-semibold animate-pulse">
          Đang tải dữ liệu cửa hàng, kho &amp; nhà cung cấp...
        </div>
      }
    >
      <ShopWorkspaceContent mode={mode} />
    </React.Suspense>
  );
}
