export interface TopService {
  name: string;
  category: string;
  bookingsCount: number;
  revenue: number;
}

export interface TopStaff {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  casesCount: number;
}

export const TOP_SERVICES_DATA: TopService[] = [
  {
    name: "Spa Cắt Tỉa & Tắm Thảo Dược",
    category: "Spa & Grooming",
    bookingsCount: 168,
    revenue: 58800000,
  },
  {
    name: "Khám Tổng Quát & Siêu Âm",
    category: "Khám bệnh",
    bookingsCount: 124,
    revenue: 37200000,
  },
  {
    name: "Tiêm Vaccine 7 Bệnh Định Kỳ",
    category: "Tiêm phòng",
    bookingsCount: 95,
    revenue: 28500000,
  },
  {
    name: "Lấy Cao Răng Không Gây Mê",
    category: "Nha khoa",
    bookingsCount: 62,
    revenue: 21700000,
  },
];

export const TOP_STAFFS_DATA: TopStaff[] = [
  {
    name: "BS. Lê Huy Hoàng",
    role: "Bác sĩ Ngoại khoa",
    avatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    rating: 4.95,
    reviewCount: 86,
    casesCount: 142,
  },
  {
    name: "Phan Thị Đình Thùy",
    role: "Master Groomer",
    avatar:
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&auto=format&fit=crop&q=80",
    rating: 4.92,
    reviewCount: 94,
    casesCount: 168,
  },
  {
    name: "Nguyễn Văn Tuấn Anh",
    role: "Chuyên viên Spa Cấp cao",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 4.88,
    reviewCount: 62,
    casesCount: 115,
  },
];
