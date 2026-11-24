import { Product } from "@/types";

export type ShopTabId = "products" | "orders" | "inventory" | "suppliers" | "returns" | "medicine-box";

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
  status: "pending" | "packing" | "shipping" | "delivered" | "received" | "returned";
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

export const SAMPLE_ORDERS: ShopOrder[] = [
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

export const SAMPLE_SUPPLIERS: SupplierItem[] = [
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

export const SAMPLE_IMPORT_SLIPS: ImportSlip[] = [
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

export const SAMPLE_RETURNS: ReturnRequestItem[] = [
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
