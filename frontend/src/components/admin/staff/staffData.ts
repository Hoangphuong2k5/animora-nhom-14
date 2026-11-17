import type { EmploymentType } from "@/types/expert.type";

export interface StaffItem {
  id: string;
  linkedExpertId?: string;
  name: string;
  avatar: string;
  roleType:
    | "Bác sĩ thú y"
    | "NV Chăm sóc thú cưng"
    | "Chăm sóc nội trú"
    | "Điều dưỡng";
  employmentType: EmploymentType;
  specialty: string;
  experience: string;
  rating: number;
  reviewCount: number;
  monthlyCases: number;
  status: "active" | "busy" | "leave";
  phone: string;
  email: string;
  certificates: string[];
  scheduleShifts: string[];
  recentReviews: {
    customerName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export const INITIAL_STAFF: StaffItem[] = [
  {
    id: "exp-vet-01",
    linkedExpertId: "exp-vet-01",
    name: "BS. Lê Minh Khoa",
    avatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    roleType: "Bác sĩ thú y",
    employmentType: "full_time",
    specialty: "Khám lâm sàng nội khoa, Phẫu thuật mô mềm & Tiêm chủng",
    experience: "8 năm kinh nghiệm",
    rating: 4.95,
    reviewCount: 86,
    monthlyCases: 142,
    status: "active",
    phone: "0912 345 678",
    email: "vet@animora.vn",
    certificates: [
      "Bác sĩ thú y chính quy - ĐH Nông Lâm TP.HCM",
      "Chứng chỉ phẫu thuật ngoại khoa thú nhỏ",
    ],
    scheduleShifts: [
      "Thứ 2 - Thứ 6 (08:00 - 17:00)",
      "Nghỉ luân phiên 4 ngày/tháng",
    ],
    recentReviews: [
      {
        customerName: "Trần Anh Tuấn",
        rating: 5,
        comment:
          "Bác sĩ Khoa cực kỳ ân cần, giải thích kỹ nguyên nhân nấm tai của bé Corgi.",
        date: "2026-11-01",
      },
    ],
  },
  {
    id: "exp-spa-01",
    linkedExpertId: "exp-spa-01",
    name: "Nguyễn Thu Hà",
    avatar:
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&auto=format&fit=crop&q=80",
    roleType: "NV Chăm sóc thú cưng",
    employmentType: "full_time",
    specialty: "Cắt tỉa tạo kiểu Poodle, Spa dưỡng lông thảo mộc & Vệ sinh tai móng",
    experience: "6 năm kinh nghiệm",
    rating: 4.94,
    reviewCount: 94,
    monthlyCases: 168,
    status: "active",
    phone: "0938 765 432",
    email: "spa@animora.vn",
    certificates: [
      "Chứng chỉ cắt tỉa thú cưng chuyên nghiệp hạng A (ISCC)",
      "Chứng nhận chăm sóc da lông thảo dược Hàn Quốc",
    ],
    scheduleShifts: ["Ca sáng & Ca chiều (T2 - CN luân phiên)"],
    recentReviews: [
      {
        customerName: "Lê Hoàng Long",
        rating: 5,
        comment: "Chị Hà cắt mặt tròn Teddy cho bé Poodle nhà mình siêu xinh!",
        date: "2026-10-29",
      },
    ],
  },
  {
    id: "exp-spa-02",
    linkedExpertId: "exp-spa-02",
    name: "Nguyễn Văn Tuấn Anh",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    roleType: "NV Chăm sóc thú cưng",
    employmentType: "part_time",
    specialty: "Tắm thủy lực thư giãn, Chăm sóc & Trông giữ nội trú",
    experience: "4 năm kinh nghiệm",
    rating: 4.9,
    reviewCount: 62,
    monthlyCases: 95,
    status: "active",
    phone: "0934 556 778",
    email: "care.pt@animora.vn",
    certificates: ["Chứng chỉ thủy liệu pháp & chăm sóc da thú cưng"],
    scheduleShifts: ["Part-time theo ca phân công & Ca làm thêm"],
    recentReviews: [
      {
        customerName: "Phạm Hải Đăng",
        rating: 5,
        comment:
          "Anh Toàn chăm bé Golden lúc gửi ban ngày rất chu đáo, cập nhật tình trạng rõ ràng.",
        date: "2026-10-30",
      },
    ],
  },
  {
    id: "st-4",
    name: "BS. Hoàng Thị Mai",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    roleType: "Bác sĩ thú y",
    employmentType: "full_time",
    specialty: "Nội khoa Thú nhỏ & Tiêm chủng Vaccine",
    experience: "6 năm kinh nghiệm",
    rating: 4.91,
    reviewCount: 78,
    monthlyCases: 130,
    status: "leave",
    phone: "0977 889 900",
    email: "hoangmai.vet@animora.vn",
    certificates: [
      "Bác Sĩ Thú Y - Học Viện Nông Nghiệp Việt Nam",
      "Chứng chỉ Kiểm soát Dịch bệnh Thú cưng (CDC VET)",
    ],
    scheduleShifts: ["Nghỉ phép luân phiên"],
    recentReviews: [
      {
        customerName: "Trần Thùy Linh",
        rating: 5,
        comment: "Bác sĩ Mai tiêm nhẹ nhàng, mèo nhà mình không khóc tí nào.",
        date: "2026-10-18",
      },
    ],
  },
];
