export type ShopOrderStatus =
  | 'pending'
  | 'packing'
  | 'shipping'
  | 'delivered'
  | 'received'
  | 'returned';

export interface ShopOrderItemSummary {
  productId?: string;
  productName: string;
  selectedSpec?: string;
  quantity: number;
  price: number;
  image?: string;
  prescriptionCode?: string;
}

export interface CustomerOrder {
  id: string;
  orderCode: string;
  userId?: string | null;
  customerName: string;
  phone: string;
  email?: string;
  shippingAddress: string;
  items: ShopOrderItemSummary[];
  subtotal?: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: 'COD' | 'Banking';
  note?: string;
  status: ShopOrderStatus;
  createdAt: string;
}

export type ReturnRefundStatus = 'pending' | 'approved' | 'rejected';

export type ReturnRequestType = 'return_refund' | 'exchange' | 'cancel';

/** Phân loại xử lý tồn kho khi duyệt trả hàng (ver1.4.1 - 🔴6): hàng lỗi tuyệt đối không cộng lại tồn bán */
export type ReturnStockDisposition = 'restock_sellable' | 'defective_writeoff';

export interface ReturnRefundRequest {
  id: string;
  requestCode: string;
  orderCode: string;
  userId?: string | null;
  customerName: string;
  phone: string;
  productName: string;
  requestType?: ReturnRequestType;
  /** Mặc định 'defective_writeoff' với hàng lỗi; chỉ 'restock_sellable' với đơn hủy hoặc hàng nguyên seal */
  stockDisposition?: ReturnStockDisposition;
  reason: string;
  refundAmount: number;
  status: ReturnRefundStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}
