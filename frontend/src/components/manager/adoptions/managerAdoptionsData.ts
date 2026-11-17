import { AdoptionPet, AdoptionRequest } from "@/types";
import { initialAdoptionPets } from "@/data/mockData";

export interface ShelterPartner {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  activePetsCount: number;
}

export interface ExtendedAdoptionPet extends AdoptionPet {
  shelterName?: string;
}

export interface NewPetFormState {
  name: string;
  species: "Chó" | "Mèo";
  breed: string;
  age: string;
  gender: "Đực" | "Cái";
  personality: string;
  photo: string;
  shelterName: string;
}

export const INITIAL_SHELTERS: ShelterPartner[] = [
  {
    id: "she-1",
    name: "Trạm Cứu Hộ Động Vật Hanoi Pet Rescue",
    address: "Số 15 Ngõ 198 Xã Đàn, Đống Đa, Hà Nội",
    contactPerson: "Chị Trần Thanh Hà",
    phone: "0968.123.456",
    email: "rescue@hanoipet.org",
    activePetsCount: 6,
  },
  {
    id: "she-2",
    name: "Saigon Time Dog & Cat Shelter",
    address: "Đường số 9, KDC Trung Sơn, Bình Chánh, TP.HCM",
    contactPerson: "Anh Nguyễn Tuấn Kiệt",
    phone: "0908.776.543",
    email: "contact@saigontime.vn",
    activePetsCount: 4,
  },
  {
    id: "she-3",
    name: "Nhóm Cứu Trợ Yêu Động Vật (YDV Foundation)",
    address: "Phường An Khánh, TP. Thủ Đức, TP.HCM",
    contactPerson: "Nguyễn Hồng Phúc",
    phone: "0933.221.100",
    email: "yeudongvat.shelter@gmail.com",
    activePetsCount: 3,
  },
];

export const INITIAL_NEW_PET: NewPetFormState = {
  name: "",
  species: "Chó",
  breed: "",
  age: "6 tháng tuổi",
  gender: "Đực",
  personality: "Ngoan ngoãn, quấn chủ",
  photo: "/assets/aistudio/cute_dog_transparent.png",
  shelterName: INITIAL_SHELTERS[0].name,
};

export const SAMPLE_ADOPTION_REQUESTS: AdoptionRequest[] = [
  {
    id: "req-1",
    requestCode: "REQ-CORGI-01",
    petId: "adopt-1",
    petName: "Mochi",
    applicantName: "Trần Hoàng Nam",
    phone: "0912345678",
    email: "nam.tran@gmail.com",
    housingType: "house",
    hoursAtHome: "full_day",
    notes: "Nhà có sân vườn rào chắn kỹ càng, gia đình có 2 bé nhỏ đều rất yêu thương thú cưng.",
    status: "pending",
    createdAt: "2026-11-03 14:20",
  },
  {
    id: "req-2",
    requestCode: "REQ-CAT-02",
    petId: "adopt-2",
    petName: "Bông Gòn",
    applicantName: "Lê Ngọc Hân",
    phone: "0987654321",
    email: "han.le@gmail.com",
    housingType: "apartment",
    hoursAtHome: "evening_only",
    notes: "Chung cư có lưới an toàn ban công, mình đã chuẩn bị chu đáo khay cát và nhà cào móng.",
    status: "pending",
    createdAt: "2026-11-03 10:15",
  },
  {
    id: "req-3",
    requestCode: "REQ-PUPPY-03",
    petId: "adopt-3",
    petName: "Bắp",
    applicantName: "Phạm Đình Trọng",
    phone: "0933112244",
    email: "trong.pham@yahoo.com",
    housingType: "house",
    hoursAtHome: "flexible",
    notes: "Mình làm việc remote tại nhà nên có nhiều thời gian dắt bé đi dạo hàng ngày.",
    status: "approved",
    createdAt: "2026-11-01 09:00",
  },
];

const SHELTER_ALIASES: Record<string, string[]> = {
  "trạm cứu hộ động vật hanoi pet rescue": ["hanoi pet rescue"],
  "saigon time dog & cat shelter": ["saigon time shelter", "saigon time"],
  "nhóm cứu trợ yêu động vật (ydv foundation)": ["yêu động vật foundation", "ydv foundation"],
};

export function matchesShelterName(
  petShelterName: string | undefined,
  shelterName: string
): boolean {
  if (!petShelterName || !shelterName) return false;
  const a = petShelterName.trim().toLowerCase();
  const b = shelterName.trim().toLowerCase();
  if (a === b) return true;
  if (b.includes(a) || a.includes(b)) return true;
  const aliasesFromB = SHELTER_ALIASES[b] ?? [];
  if (aliasesFromB.some((alias) => a === alias || a.includes(alias))) return true;
  const aliasesFromA = SHELTER_ALIASES[a] ?? [];
  return aliasesFromA.some((alias) => b === alias || b.includes(alias));
}

export function seedInitialAdoptionPets(): ExtendedAdoptionPet[] {
  return initialAdoptionPets.map((p, i) => ({
    ...p,
    shelterName: INITIAL_SHELTERS[i % INITIAL_SHELTERS.length].name,
  }));
}

export function createAdoptionPetRecord(newPet: NewPetFormState): ExtendedAdoptionPet {
  return {
    id: `adopt-${Date.now()}`,
    slug: newPet.name.toLowerCase().replace(/\s+/g, "-"),
    name: newPet.name,
    species: newPet.species,
    breed: newPet.breed || "Lai F1",
    age: newPet.age,
    gender: newPet.gender,
    personality: newPet.personality,
    photo: newPet.photo,
    shelterName: newPet.shelterName,
    vaccinated: true,
    neutered: true,
    status: "available",
    tags: ["Thân thiện", "Đã tiêm phòng"],
    story: newPet.personality,
    createdAt: new Date().toISOString(),
  };
}

export function createShelterPartnerRecord(
  name: string,
  address: string,
  contactPerson: string,
  phone: string
): ShelterPartner {
  return {
    id: `she-${Date.now()}`,
    name,
    address,
    contactPerson,
    phone,
    email: "contact@shelter.vn",
    activePetsCount: 0,
  };
}

export function getRequestStatusBadgeClass(status?: AdoptionRequest["status"]): string {
  if (status === "completed") {
    return "bg-purple-500/10 text-purple-600 border border-purple-500/20";
  }
  if (status === "approved") {
    return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
  }
  if (status === "reviewing") {
    return "bg-sky-500/10 text-sky-600 border border-sky-500/20";
  }
  if (status === "rejected") {
    return "bg-rose-500/10 text-rose-600 border border-rose-500/20";
  }
  return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
}

export function getRequestStatusLabel(status?: AdoptionRequest["status"]): string {
  if (status === "completed") return "Đã bàn giao";
  if (status === "approved") return "Đạt phỏng vấn";
  if (status === "reviewing") return "Đang phỏng vấn";
  if (status === "rejected") return "Từ chối";
  return "Chờ duyệt";
}

export type AdoptionRequestStatus = NonNullable<AdoptionRequest["status"]>;

export const ADOPTION_ALLOWED_TRANSITIONS: Record<
  AdoptionRequestStatus,
  AdoptionRequestStatus[]
> = {
  pending: ["reviewing", "approved", "rejected"],
  reviewing: ["approved", "rejected"],
  approved: ["completed", "rejected"],
  completed: [],
  rejected: [],
};

export function canTransitionAdoptionRequest(
  from: AdoptionRequest["status"],
  to: AdoptionRequestStatus
): boolean {
  const current: AdoptionRequestStatus = from ?? "pending";
  return ADOPTION_ALLOWED_TRANSITIONS[current].includes(to);
}
