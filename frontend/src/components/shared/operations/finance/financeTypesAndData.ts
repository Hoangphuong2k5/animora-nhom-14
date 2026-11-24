export interface FinancialTransaction {
  id: string;
  code: string;
  type: "in_service" | "in_shop" | "out_stock" | "out_operations" | "out_refund";
  description: string;
  amount: number;
  paymentMethod: "Chuyển khoản" | "Thẻ POS" | "VNPAY QR" | "Tiền mặt / COD";
  date: string;
  status: "completed" | "processing";
}

export type FinancePeriod = "month" | "quarter" | "year";

export interface PeriodFinanceConfig {
  label: string;
  serviceRevenue: number;
  shopRevenue: number;
  serviceGrowth: string;
  shopGrowth: string;
  cogsExpense: number;
  cogsNote: string;
  operatingExpense: number;
  operatingNote: string;
  chartSubtitle: string;
  maxBar: number;
  bars: Array<{ label: string; svc: number; shop: number }>;
}

export const SAMPLE_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: "tx-1",
    code: "TX-202611-001",
    type: "in_service",
    description: "Thanh toán Spa Cắt Tỉa VIP - Khách Phan Thị Đinh Thùy",
    amount: 450000,
    paymentMethod: "VNPAY QR",
    date: "2026-11-03 14:10",
    status: "completed",
  },
  {
    id: "tx-2",
    code: "TX-202611-002",
    type: "in_shop",
    description: "Đơn hàng ORD-94821 hạt Royal Canin & Pate",
    amount: 480000,
    paymentMethod: "Tiền mặt / COD",
    date: "2026-11-03 11:20",
    status: "completed",
  },
  {
    id: "tx-3",
    code: "TX-202611-003",
    type: "out_operations",
    description: "Bảo trì định kỳ máy siêu âm & tiệt trùng dụng cụ y tế",
    amount: 5200000,
    paymentMethod: "Chuyển khoản",
    date: "2026-11-02 16:00",
    status: "completed",
  },
  {
    id: "tx-4",
    code: "TX-202611-004",
    type: "out_stock",
    description: "Thanh toán phiếu nhập PN-202611-01 Công ty Royal Canin",
    amount: 28500000,
    paymentMethod: "Chuyển khoản",
    date: "2026-11-01 10:30",
    status: "completed",
  },
  {
    id: "tx-5",
    code: "TX-202611-005",
    type: "out_refund",
    description: "Hoàn tiền cọc đơn hủy lịch có trừ phạt 50% BK-9710",
    amount: 175000,
    paymentMethod: "Chuyển khoản",
    date: "2026-10-31 15:45",
    status: "completed",
  },
  {
    id: "tx-6",
    code: "TX-202610-006",
    type: "in_service",
    description: "Gói Khám Tổng Quát & Siêu Âm - Khách Nguyễn Minh Anh",
    amount: 350000,
    paymentMethod: "Thẻ POS",
    date: "2026-10-30 09:20",
    status: "completed",
  },
  {
    id: "tx-7",
    code: "TX-202610-007",
    type: "in_shop",
    description: "Đơn hàng ORD-88412 Phụ kiện & Cát vệ sinh",
    amount: 1240000,
    paymentMethod: "VNPAY QR",
    date: "2026-10-18 14:35",
    status: "completed",
  },
  {
    id: "tx-8",
    code: "TX-202609-008",
    type: "in_service",
    description: "Gói Tiêm Phòng & Xét Nghiệm Máu Định Kỳ Q3",
    amount: 2150000,
    paymentMethod: "Chuyển khoản",
    date: "2026-09-22 10:15",
    status: "completed",
  },
  {
    id: "tx-9",
    code: "TX-202608-009",
    type: "out_stock",
    description: "Nhập lô Vắc-xin & Thuốc thú y Vemedim Quý 3",
    amount: 42000000,
    paymentMethod: "Chuyển khoản",
    date: "2026-08-14 09:40",
    status: "completed",
  },
  {
    id: "tx-10",
    code: "TX-202605-010",
    type: "out_operations",
    description: "Nâng cấp trang thiết bị & hệ thống khử khuẩn khu Spa",
    amount: 36000000,
    paymentMethod: "Chuyển khoản",
    date: "2026-05-11 16:20",
    status: "completed",
  },
];

export const PERIOD_FINANCE_DATA: Record<FinancePeriod, PeriodFinanceConfig> = {
  month: {
    label: "Tháng 11 / 2026",
    serviceRevenue: 345000000,
    shopRevenue: 142500000,
    serviceGrowth: "+21.4%",
    shopGrowth: "+14.2%",
    cogsExpense: 68200000,
    cogsNote: "Đối soát 3 nhà phân phối",
    operatingExpense: 45000000,
    operatingNote: "Bảo trì thiết bị & tiêu hao",
    chartSubtitle: "Cơ cấu đóng góp của hai mảng kinh doanh trụ cột theo 6 tháng gần nhất",
    maxBar: 350,
    bars: [
      { label: "T6", svc: 180, shop: 80 },
      { label: "T7", svc: 210, shop: 95 },
      { label: "T8", svc: 245, shop: 110 },
      { label: "T9", svc: 280, shop: 125 },
      { label: "T10", svc: 310, shop: 135 },
      { label: "T11", svc: 345, shop: 142.5 },
    ],
  },
  quarter: {
    label: "Quý 4 / 2026",
    serviceRevenue: 985000000,
    shopRevenue: 418500000,
    serviceGrowth: "+24.8%",
    shopGrowth: "+18.6%",
    cogsExpense: 196400000,
    cogsNote: "Tổng hợp 9 phiếu nhập Quý 4",
    operatingExpense: 132000000,
    operatingNote: "Nhân sự, mặt bằng & vật tư Q4",
    chartSubtitle: "So sánh doanh thu Dịch vụ & Cửa hàng qua 3 tháng trong Quý 4/2026",
    maxBar: 360,
    bars: [
      { label: "Tháng 10", svc: 310, shop: 135 },
      { label: "Tháng 11", svc: 345, shop: 142.5 },
      { label: "Tháng 12 (Dự kiến)", svc: 330, shop: 141 },
    ],
  },
  year: {
    label: "Cả năm 2026",
    serviceRevenue: 3420000000,
    shopRevenue: 1395000000,
    serviceGrowth: "+31.2%",
    shopGrowth: "+26.5%",
    cogsExpense: 664000000,
    cogsNote: "Tổng nhập kho cả năm 2026",
    operatingExpense: 492000000,
    operatingNote: "Vận hành, lương & khấu hao 2026",
    chartSubtitle: "Tổng hợp tăng trưởng doanh thu theo 4 Quý trong năm 2026",
    maxBar: 1050,
    bars: [
      { label: "Quý 1", svc: 680, shop: 265 },
      { label: "Quý 2", svc: 815, shop: 320 },
      { label: "Quý 3", svc: 940, shop: 391.5 },
      { label: "Quý 4", svc: 985, shop: 418.5 },
    ],
  },
};
