export interface CustomerPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
}

export interface CustomerBookingHistory {
  id: string;
  code: string;
  service: string;
  date: string;
  total: number;
  status: string;
}

export interface CustomerOrderHistory {
  id: string;
  code: string;
  items: string;
  date: string;
  total: number;
  status: string;
}

export interface CustomerReview {
  id: string;
  serviceOrProduct: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  avatar: string;
  email: string;
  phone: string;
  registeredDate: string;
  petCount: number;
  bookingsCount: number;
  totalSpent: number;
  status: "active" | "locked";
  pets: CustomerPet[];
  bookingHistory: CustomerBookingHistory[];
  orderHistory: CustomerOrderHistory[];
  reviews: CustomerReview[];
}

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: "cus-1",
    fullName: "Phan Thị Đinh Thùy",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    email: "phanthidinhthuy6@gmail.com",
    phone: "0337203332",
    registeredDate: "2026-01-15",
    petCount: 2,
    bookingsCount: 8,
    totalSpent: 4850000,
    status: "active",
    pets: [
      { id: "p1", name: "Bơ", species: "Chó", breed: "Corgi Pembroke", age: "1.5 tuổi" },
      { id: "p2", name: "Sữa", species: "Mèo", breed: "British Shorthair", age: "2 tuổi" },
    ],
    bookingHistory: [
      { id: "b1", code: "BK-9821", service: "Spa Cắt Tỉa & Tắm Thảo Dược", date: "2026-11-01", total: 450000, status: "Hoàn thành" },
      { id: "b2", code: "BK-9750", service: "Tiêm Vaccine 7 Bệnh Định Kỳ", date: "2026-10-15", total: 300000, status: "Hoàn thành" },
    ],
    orderHistory: [
      { id: "o1", code: "ORD-94821", items: "Hạt Royal Canin Mini (2kg), Pate Monge (x4)", date: "2026-11-03", total: 480000, status: "Đang giao" },
    ],
    reviews: [
      { id: "r1", serviceOrProduct: "Spa Cắt Tỉa & Tắm Thảo Dược", rating: 5, comment: "Bác sĩ và bé nhân viên chăm Bơ rất chu đáo, tắm về thơm nức nở!", date: "2026-11-01" },
    ],
  },
  {
    id: "cus-2",
    fullName: "Nguyễn Minh Anh",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "minhanh.ng@gmail.com",
    phone: "0901234567",
    registeredDate: "2026-02-04",
    petCount: 1,
    bookingsCount: 5,
    totalSpent: 3200000,
    status: "active",
    pets: [
      { id: "p3", name: "Miu Miu", species: "Mèo", breed: "Mèo Ba Tư", age: "1 tuổi" },
    ],
    bookingHistory: [
      { id: "b3", code: "BK-9804", service: "Khám Tổng Quát & Siêu Âm", date: "2026-10-28", total: 350000, status: "Hoàn thành" },
    ],
    orderHistory: [
      { id: "o2", code: "ORD-94822", items: "Cát vệ sinh Cature gỗ nén (x2), Lược chải lông", date: "2026-11-03", total: 1250000, status: "Chờ xác nhận" },
    ],
    reviews: [
      { id: "r2", serviceOrProduct: "Khám Tổng Quát & Siêu Âm", rating: 5, comment: "Phòng khám hiện đại, BS tư vấn tận tình dễ thương.", date: "2026-10-28" },
    ],
  },
  {
    id: "cus-3",
    fullName: "Hoàng Văn Tuấn",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    email: "tuan.hoangvan@yahoo.com",
    phone: "0988776655",
    registeredDate: "2026-03-12",
    petCount: 3,
    bookingsCount: 12,
    totalSpent: 8900000,
    status: "active",
    pets: [
      { id: "p4", name: "Rex", species: "Chó", breed: "Golden Retriever", age: "3 tuổi" },
      { id: "p5", name: "Max", species: "Chó", breed: "Poodle", age: "8 tháng" },
      { id: "p6", name: "Lulu", species: "Mèo", breed: "Mèo Mướp", age: "2 tuổi" },
    ],
    bookingHistory: [
      { id: "b4", code: "BK-9790", service: "Spa Combo VIP Chăm Sóc Toàn Diện", date: "2026-10-20", total: 750000, status: "Hoàn thành" },
    ],
    orderHistory: [
      { id: "o3", code: "ORD-94819", items: "Xương gặm Orgo sạch răng, Sữa tắm Tropiclean", date: "2026-11-02", total: 320000, status: "Đã giao" },
    ],
    reviews: [
      { id: "r3", serviceOrProduct: "Spa Combo VIP", rating: 4, comment: "Làm lông sạch sẽ, sẽ tiếp tục ủng hộ Animora dài lâu.", date: "2026-10-20" },
    ],
  },
  {
    id: "cus-4",
    fullName: "Lê Thị Thảo Linh",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    email: "linhle.thaothao@gmail.com",
    phone: "0912348899",
    registeredDate: "2026-04-18",
    petCount: 1,
    bookingsCount: 2,
    totalSpent: 920000,
    status: "locked",
    pets: [
      { id: "p7", name: "Mít", species: "Chó", breed: "Pug", age: "1 tuổi" },
    ],
    bookingHistory: [
      { id: "b5", code: "BK-9640", service: "Khám Da Liễu & Điều Trị Nấm", date: "2026-09-12", total: 420000, status: "Đã hủy" },
    ],
    orderHistory: [],
    reviews: [
      { id: "r4", serviceOrProduct: "Khám Da Liễu", rating: 2, comment: "Chờ hơi lâu vào ngày cuối tuần.", date: "2026-09-12" },
    ],
  },
  {
    id: "cus-5",
    fullName: "Đỗ Quốc Bảo",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    email: "quocbao.do@outlook.com",
    phone: "0933445566",
    registeredDate: "2026-05-22",
    petCount: 2,
    bookingsCount: 4,
    totalSpent: 2600000,
    status: "active",
    pets: [
      { id: "p8", name: "Kuro", species: "Chó", breed: "Shiba Inu", age: "2 tuổi" },
      { id: "p9", name: "Shiro", species: "Chó", breed: "Samoyed", age: "1.2 tuổi" },
    ],
    bookingHistory: [
      { id: "b6", code: "BK-9815", service: "Spa Cắt Tỉa & Tắm Thảo Dược", date: "2026-10-30", total: 600000, status: "Hoàn thành" },
    ],
    orderHistory: [
      { id: "o4", code: "ORD-94812", items: "Vòng cổ chống ve rận Seresto", date: "2026-10-25", total: 850000, status: "Đã giao" },
    ],
    reviews: [
      { id: "r5", serviceOrProduct: "Spa Cắt Tỉa", rating: 5, comment: "Dịch vụ 5 sao, Kuro cắt lông tròn xoe như gấu bông!", date: "2026-10-30" },
    ],
  },
];

/** Filters customers by account status and search query (name, email, phone). */
export function filterCustomers(
  customers: CustomerProfile[],
  filterStatus: "all" | "active" | "locked",
  searchQuery: string
): CustomerProfile[] {
  const q = searchQuery.toLowerCase().trim();
  return customers.filter((c) => {
    const matchStatus = filterStatus === "all" ? true : c.status === filterStatus;
    const matchSearch =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q);
    return matchStatus && matchSearch;
  });
}
