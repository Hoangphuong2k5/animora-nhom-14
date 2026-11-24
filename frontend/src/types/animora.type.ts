export type Language = 'vi' | 'en';

export type PageId =
  | 'home'
  | 'about'
  | 'services'
  | 'booking'
  | 'my-bookings'
  | 'my-orders'
  | 'shop'
  | 'cart'
  | 'checkout'
  | 'pet-profiles'
  | 'login'
  | 'register'
  | 'account';

export type PetSpecies = 'Chó' | 'Mèo' | 'Thỏ' | 'Hamster' | 'Chim' | 'Bò sát' | 'Khác';
export type Gender = 'Đực' | 'Cái';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  gender: Gender;
  age: string;
  weight: string;
  allergies?: string;
  note?: string;
  photo: string;
  nextCheckupDate: string;
  owner: string;
}

export type VaccinationStatus = 'vaccinated' | 'due_soon' | 'not_yet';

export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  status: VaccinationStatus;
  date: string;
}

export type ProductCategory = 'food' | 'toys' | 'accessories' | 'care' | 'medicine';

export type ShopPetGroup = 'dog' | 'cat' | 'rabbit_rodent' | 'bird' | 'fish_reptile';

export type ProductBadgeType = 'sale' | 'new' | 'bestseller' | 'out_of_stock';

export interface ProductSpecOption {
  labelVi: string;
  labelEn: string;
  price: number;
  oldPrice?: number;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  nameEn?: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  category: ProductCategory;
  petTypes?: ShopPetGroup[];
  brand?: string;
  spec?: string;
  specEn?: string;
  specOptions?: ProductSpecOption[];
  image: string;
  images?: string[];
  badges?: ProductBadgeType[];
  stock?: number;
  description: string;
  descriptionEn?: string;
  ingredientsVi?: string;
  ingredientsEn?: string;
  usageVi?: string;
  usageEn?: string;
  rating: number;
  reviewCount?: number;
  createdAtOrder?: number;
  recommendedAges?: ('baby' | 'adult' | 'senior')[];
  /** Thuốc kê đơn thuộc danh mục Shop — chỉ mua được qua đơn thuốc hợp lệ của Bác sĩ */
  requiresPrescription?: boolean;
  medicineId?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  petInfoVi: string;
  petInfoEn: string;
  stars: number;
  textVi: string;
  textEn: string;
  date: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSpec?: string;
  unitPriceAtAdd?: number;
  /** Gắn mã đơn thuốc khi khách mua lại thuốc theo đơn của Bác sĩ */
  prescriptionId?: string;
  prescriptionCode?: string;
}

export type BookingPreferredContact = 'phone' | 'zalo' | 'email';

export type BookingWeightRangeId = 'under_5' | '5_to_10' | '10_to_20' | 'over_20';

export type BookingPetTypeId = 'Chó' | 'Mèo' | 'Thỏ & chuột' | 'Chim' | 'Khác';

export type BookingStatus =
  | 'Mới'
  | 'Đã xác nhận'
  | 'Đã đến'
  | 'Đang làm'
  | 'Hoàn thành'
  | 'Đã hủy'
  | 'Không đến';

export interface BookingRescheduleEntry {
  fromDate: string;
  fromTimeSlot?: string;
  toDate: string;
  toTimeSlot?: string;
  changedAt: string;
}

export interface BookingReview {
  rating: 1 | 2 | 3 | 4 | 5;
  serviceRating?: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  code?: string;
  userId?: string | null;
  serviceSlug?: string;
  service: string;
  doctorId?: string;
  doctorName?: string;
  petType: string;
  petName?: string;
  petBreed?: string;
  petAge?: string;
  petWeight?: string;
  petAllergies?: string;
  weightRange?: BookingWeightRangeId | string;
  date: string;
  timeSlot?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  fullName: string;
  phone: string;
  email?: string;
  preferredContact?: BookingPreferredContact;
  note?: string;
  vaccinatedConfirmed?: boolean;
  paymentTiming?: 'prepaid' | 'postpaid';
  paymentState?: 'paid' | 'unpaid' | 'refunded' | 'partial_fee';
  paymentMethod?: 'bank' | 'vnpay' | 'counter' | 'online';
  estimatedPrice?: number;
  cancellationFee?: number;
  refundAmount?: number;
  review?: BookingReview;
  status?: BookingStatus;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  rescheduledFrom?: BookingRescheduleEntry[];
  internalNote?: string;
  careStage?: 'checked_in' | 'performing' | 'finishing' | 'ready_handover';
  careProgressLog?: Array<{
    stage: 'checked_in' | 'performing' | 'finishing' | 'ready_handover';
    updatedAt: string;
    note?: string;
    updatedBy: string;
  }>;
  managerConfirmedAt?: string;
  managerConfirmedBy?: string;
  managerConfirmNote?: string;
  addedToPetRecordId?: string;
  /** Kênh đặt lịch (Mục 4 & 6 v1.4): online hoặc tại quầy (counter) */
  bookingChannel?: 'online' | 'counter';
  /** Hình thức đặt tại quầy: hẹn giờ (scheduled) hoặc làm ngay (walk_in_now) */
  bookingMode?: 'scheduled' | 'walk_in_now';
  /** Vai trò và tên người thao tác đặt lịch (KH hoặc LT) */
  createdByRole?: 'owner' | 'receptionist';
  createdByUserId?: string;
  createdByName?: string;
  /** Thông tin Check-in & Không đến tại quầy Lễ tân (Mục 5 & 6 v1.4) */
  checkedInAt?: string;
  checkedInBy?: string;
  noShowMarkedAt?: string;
  noShowUndoneAt?: string;
  noShowUndoReason?: string;
  noShowUndoneBy?: string;
  /** Cờ miễn phạt và miễn đếm violation (ví dụ: khách từ chối giá mới sau khi cân lại) */
  cancelWithoutPenalty?: boolean;
  /** Điều chỉnh giá theo cân nặng thực tế (Mục 6 v1.4) */
  declaredWeightKg?: number;
  actualWeightKg?: number;
  weightUpdatedBy?: string;
  weightSource?: 'customer_declared' | 'vet_measured' | 'counter_measured';
  originalEstimatedPrice?: number;
  adjustedPrice?: number;
  weightAdjustmentStatus?: 'none' | 'pending_confirm' | 'accepted' | 'declined_returned';
  differenceAmount?: number;
  differenceSettled?: boolean;
  /** Thông tin thu tiền & xuất hóa đơn tại quầy */
  invoiceCode?: string;
  invoiceIssuedAt?: string;
  collectedByName?: string;
  createdAt: string;
}

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'account';

export interface ShippingAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  isDefault: boolean;
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'owner' | 'vet' | 'admin' | 'manager' | 'care_staff' | 'supplier' | 'receptionist';
  createdAt: string;
  addresses: ShippingAddress[];
}

