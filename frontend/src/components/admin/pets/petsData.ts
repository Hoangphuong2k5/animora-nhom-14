export interface VaccineRecord {
  id: string;
  name: string;
  date: string;
  nextDate: string;
  doctor: string;
  status: "done" | "upcoming";
}

export interface DewormRecord {
  id: string;
  drug: string;
  date: string;
  nextDate: string;
}

export interface MedicalHistoryRecord {
  id: string;
  diagnosis: string;
  date: string;
  doctor: string;
  treatment: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  dueDate: string;
  type: "vaccine" | "deworm" | "spa" | "checkup";
}

export interface AdminPetItem {
  id: string;
  name: string;
  photo: string;
  species: string;
  breed: string;
  age: string;
  weight: number; // kg
  gender: "Đực" | "Cái";
  neutered: boolean;
  microchip: string;
  ownerName: string;
  ownerPhone: string;
  lastVisit: string;
  allergies?: string;
  vaccines: VaccineRecord[];
  deworms: DewormRecord[];
  medicalHistory: MedicalHistoryRecord[];
  prescriptions: string[];
  upcomingReminders: ReminderItem[];
}

export const INITIAL_PETS: AdminPetItem[] = [
  {
    id: "pet-1",
    name: "Mochi",
    photo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&auto=format&fit=crop&q=80",
    species: "Chó",
    breed: "Corgi Pembroke",
    age: "1.5 tuổi",
    weight: 11.2,
    gender: "Đực",
    neutered: true,
    microchip: "VN-982-104-992",
    ownerName: "Phan Thị Đinh Thùy",
    ownerPhone: "0337203332",
    lastVisit: "2026-11-01",
    allergies: "Dị ứng đạm bò, ngứa da khi tắm xà phòng có cồn",
    vaccines: [
      { id: "v1", name: "Vaccine Dại Rabisin", date: "2026-05-10", nextDate: "2027-05-10", doctor: "BS. Lê Huy Hoàng", status: "done" },
      { id: "v2", name: "Vaccine 7 Bệnh Nobivac", date: "2026-06-15", nextDate: "2027-06-15", doctor: "BS. Lê Huy Hoàng", status: "done" },
    ],
    deworms: [
      { id: "dw1", drug: "NexGard Spectra 7.5 - 15kg", date: "2026-10-05", nextDate: "2026-11-05" },
    ],
    medicalHistory: [
      { id: "m1", diagnosis: "Viêm da tiếp xúc nhẹ", date: "2026-08-20", doctor: "BS. Lê Huy Hoàng", treatment: "Bôi mỡ thảo dược & dùng sữa tắm dịu nhẹ" },
    ],
    prescriptions: [
      "NexGard Spectra 1 viên nhai vào ngày 05 hàng tháng",
      "Sữa tắm da nhạy cảm Virbac Epi-Soothe 2 lần/tuần",
    ],
    upcomingReminders: [
      { id: "rem-1", title: "Uống thuốc trị ve giun định kỳ", dueDate: "2026-11-05", type: "deworm" },
      { id: "rem-2", title: "Lịch hẹn Spa cắt tỉa lông", dueDate: "2026-11-20", type: "spa" },
    ],
  },
  {
    id: "pet-2",
    name: "Bông Gòn",
    photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80",
    species: "Mèo",
    breed: "British Shorthair (Mèo Anh Lông Ngắn)",
    age: "2 tuổi",
    weight: 4.8,
    gender: "Cái",
    neutered: true,
    microchip: "VN-884-291-773",
    ownerName: "Nguyễn Minh Anh",
    ownerPhone: "0901234567",
    lastVisit: "2026-10-28",
    allergies: "Không có",
    vaccines: [
      { id: "v3", name: "Vaccine 4 Bệnh Purevax", date: "2026-04-12", nextDate: "2027-04-12", doctor: "BS. Ngô Phước Toàn", status: "done" },
      { id: "v4", name: "Vaccine Dại Rabisin", date: "2026-04-12", nextDate: "2027-04-12", doctor: "BS. Ngô Phước Toàn", status: "done" },
    ],
    deworms: [
      { id: "dw2", drug: "Broadline nhỏ gáy mèo 2.5 - 7.5kg", date: "2026-09-18", nextDate: "2026-11-18" },
    ],
    medicalHistory: [
      { id: "m2", diagnosis: "Khám sức khỏe tổng quát định kỳ", date: "2026-10-28", doctor: "BS. Ngô Phước Toàn", treatment: "Chỉ số máu & siêu âm bụng bình thường" },
    ],
    prescriptions: [
      "Gel dinh dưỡng GimCat bồi bổ lông và tiêu búi lông",
    ],
    upcomingReminders: [
      { id: "rem-3", title: "Nhỏ gáy ngừa nội ngoại ký sinh trùng", dueDate: "2026-11-18", type: "deworm" },
      { id: "rem-4", title: "Tái khám kiểm tra men gan", dueDate: "2027-04-12", type: "checkup" },
    ],
  },
  {
    id: "pet-3",
    name: "Rex",
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80",
    species: "Chó",
    breed: "Golden Retriever",
    age: "3 tuổi",
    weight: 29.5,
    gender: "Đực",
    neutered: false,
    microchip: "VN-550-192-334",
    ownerName: "Hoàng Văn Tuấn",
    ownerPhone: "0988776655",
    lastVisit: "2026-10-20",
    allergies: "Không có",
    vaccines: [
      { id: "v5", name: "Vaccine 7 Bệnh Vanguard", date: "2026-03-01", nextDate: "2027-03-01", doctor: "BS. Lê Huy Hoàng", status: "done" },
    ],
    deworms: [
      { id: "dw3", drug: "Simparica Trio 20 - 40kg", date: "2026-10-10", nextDate: "2026-11-10" },
    ],
    medicalHistory: [
      { id: "m3", diagnosis: "Viêm khớp cổ chân trái nhẹ", date: "2026-07-15", doctor: "BS. Lê Huy Hoàng", treatment: "Bổ sung Glucosamine sinh học và hạn chế nhảy cao" },
    ],
    prescriptions: [
      "Viên bổ khớp Cosequin DS Maximum Strength 1 viên/ngày",
    ],
    upcomingReminders: [
      { id: "rem-5", title: "Viên nhai chống ve giun Simparica", dueDate: "2026-11-10", type: "deworm" },
    ],
  },
  {
    id: "pet-4",
    name: "Miu Miu",
    photo: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&auto=format&fit=crop&q=80",
    species: "Mèo",
    breed: "Mèo Ba Tư (Persian)",
    age: "1 tuổi",
    weight: 3.4,
    gender: "Cái",
    neutered: false,
    microchip: "VN-339-440-112",
    ownerName: "Nguyễn Minh Anh",
    ownerPhone: "0901234567",
    lastVisit: "2026-10-15",
    allergies: "Dị ứng phấn hoa",
    vaccines: [
      { id: "v6", name: "Vaccine 4 Bệnh Felocell", date: "2026-02-14", nextDate: "2027-02-14", doctor: "BS. Ngô Phước Toàn", status: "done" },
    ],
    deworms: [
      { id: "dw4", drug: "Advocate nhỏ gáy", date: "2026-09-20", nextDate: "2026-11-20" },
    ],
    medicalHistory: [
      { id: "m4", diagnosis: "Tuyến lệ tiết nhiều do mặt gãy", date: "2026-10-15", doctor: "BS. Ngô Phước Toàn", treatment: "Vệ sinh mắt bằng nước rửa chuyên dụng Optixcare" },
    ],
    prescriptions: [
      "Dung dịch nhỏ mắt Optixcare Eye Lube 2 lần/ngày",
    ],
    upcomingReminders: [
      { id: "rem-6", title: "Spa vệ sinh tuyến lệ & chải lông", dueDate: "2026-11-15", type: "spa" },
    ],
  },
  {
    id: "pet-5",
    name: "Kuro",
    photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&auto=format&fit=crop&q=80",
    species: "Chó",
    breed: "Shiba Inu",
    age: "2 tuổi",
    weight: 10.5,
    gender: "Đực",
    neutered: true,
    microchip: "VN-771-002-441",
    ownerName: "Đỗ Quốc Bảo",
    ownerPhone: "0933445566",
    lastVisit: "2026-10-30",
    allergies: "Không có",
    vaccines: [
      { id: "v7", name: "Vaccine 7 Bệnh Nobivac", date: "2026-05-18", nextDate: "2027-05-18", doctor: "BS. Lê Huy Hoàng", status: "done" },
    ],
    deworms: [
      { id: "dw5", drug: "Bravecto 10 - 20kg", date: "2026-08-10", nextDate: "2026-11-10" },
    ],
    medicalHistory: [],
    prescriptions: [
      "Dầu cá Omega 3 hồi phục màng lông",
    ],
    upcomingReminders: [
      { id: "rem-7", title: "Uống thuốc ngừa ve rận 3 tháng Bravecto", dueDate: "2026-11-10", type: "deworm" },
    ],
  },
];

