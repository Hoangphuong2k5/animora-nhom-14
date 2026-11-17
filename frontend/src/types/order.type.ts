export type ShopOrderStatus =
  | 'pending'
  | 'packing'
  | 'shipping'
  | 'delivered'
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

export interface ReturnRefundRequest {
  id: string;
  requestCode: string;
  orderCode: string;
  userId?: string | null;
  customerName: string;
  phone: string;
  productName: string;
  requestType?: ReturnRequestType;
  reason: string;
  refundAmount: number;
  status: ReturnRefundStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}
