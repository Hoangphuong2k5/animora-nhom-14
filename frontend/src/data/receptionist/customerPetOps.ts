import type { Pet, UserAccount } from "@/types";
import {
  cleanBookingPhoneDigits,
  formatBookingPhoneOnBlur,
} from "@/data/serviceBookingData";
import {
  ALLOWED_V14_SPECIES,
  type AllowedV14Species,
  createAuditLogEntry,
  type ReceptionistAuditLogEntry,
  type WalkInCustomerRecord,
  type WalkInPetRecord,
} from "./types";

// ============================================================================
// 1. CHUẨN HÓA SĐT & QUẢN LÝ KHÁCH VÃNG LAI / TÀI KHOẢN WEB (MỤC 6.1 & 6.5)
// ============================================================================

export function normalizeVietnamPhone(raw: string): string {
  return cleanBookingPhoneDigits(raw || "");
}

export function isValidVietnamPhone(raw: string): boolean {
  const digits = normalizeVietnamPhone(raw);
  return /^(03|05|07|08|09)\d{8}$/.test(digits);
}

export function findCustomerByPhone(
  rawPhone: string,
  customers: WalkInCustomerRecord[]
): WalkInCustomerRecord | undefined {
  const norm = normalizeVietnamPhone(rawPhone);
  if (!norm) return undefined;
  return customers.find((c) => normalizeVietnamPhone(c.phone) === norm);
}

export function findOrCreateWalkInCustomer(params: {
  fullName: string;
  phone: string;
  email?: string;
  existingCustomers: WalkInCustomerRecord[];
  actorId?: string;
  actorName: string;
  now?: Date;
}): {
  created: boolean;
  customer: WalkInCustomerRecord;
  customers: WalkInCustomerRecord[];
  auditLog?: ReceptionistAuditLogEntry;
} {
  const now = params.now || new Date();
  const normalizedPhone = normalizeVietnamPhone(params.phone);
  if (!isValidVietnamPhone(normalizedPhone)) {
    throw new Error("Số điện thoại không hợp lệ (cần 10 chữ số chuẩn Việt Nam).");
  }

  const existing = findCustomerByPhone(normalizedPhone, params.existingCustomers);
  if (existing) {
    return {
      created: false,
      customer: existing,
      customers: params.existingCustomers,
    };
  }

  const trimmedName = (params.fullName || "").trim();
  if (trimmedName.length < 2) {
    throw new Error("Vui lòng nhập họ và tên khách hàng (tối thiểu 2 ký tự).");
  }

  const newCustomer: WalkInCustomerRecord = {
    id: `walkin-cus-${now.getTime()}`,
    fullName: trimmedName,
    phone: normalizedPhone,
    email: params.email?.trim() || undefined,
    isWalkInGuest: true,
    hasWebAccount: false,
    createdBy: params.actorName,
    createdAt: now.toISOString(),
  };

  const auditLog = createAuditLogEntry({
    action: "customer_create",
    actionLabel: "Tạo hồ sơ khách vãng lai",
    actorId: params.actorId,
    actorName: params.actorName,
    targetCode: newCustomer.id,
    customerName: newCustomer.fullName,
    customerPhone: newCustomer.phone,
    beforeState: "Chưa có hồ sơ khách",
    afterState: `Khách vãng lai: ${newCustomer.fullName} (${formatBookingPhoneOnBlur(
      newCustomer.phone
    )}) • Không mật khẩu`,
    now,
  });

  return {
    created: true,
    customer: newCustomer,
    customers: [newCustomer, ...params.existingCustomers],
    auditLog,
  };
}

/**
 * Mục 6.5: Nếu khách muốn dùng web, LT tạo tài khoản giúp theo yêu cầu của khách;
 * khách tự đặt mật khẩu hoặc xác thực bằng OTP.
 * Nâng cấp trực tiếp trên cùng bản ghi khách để giữ nguyên lịch sử thú cưng và lịch hẹn.
 */
export function upgradeWalkInToWebAccount(params: {
  customerId: string;
  email: string;
  authMethod: "otp" | "password";
  password?: string;
  otpCode?: string;
  existingCustomers: WalkInCustomerRecord[];
  existingUsers?: UserAccount[];
  actorId?: string;
  actorName: string;
  now?: Date;
}): {
  updatedCustomer: WalkInCustomerRecord;
  customers: WalkInCustomerRecord[];
  webUserAccount: UserAccount;
  users: UserAccount[];
  auditLog: ReceptionistAuditLogEntry;
} {
  const now = params.now || new Date();
  const target = params.existingCustomers.find((c) => c.id === params.customerId);
  if (!target) {
    throw new Error("Không tìm thấy hồ sơ khách hàng cần tạo tài khoản Web.");
  }

  const cleanEmail = (params.email || "").trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("Vui lòng nhập địa chỉ Email hợp lệ để tạo tài khoản Web.");
  }

  if (params.authMethod === "otp") {
    if ((params.otpCode || "").trim() !== "123456") {
      throw new Error("Mã OTP xác thực không chính xác (Mã demo: 123456).");
    }
  } else if (!params.password || params.password.length < 6) {
    throw new Error("Mật khẩu khách tự đặt phải có tối thiểu 6 ký tự.");
  }

  const updatedCustomer: WalkInCustomerRecord = {
    ...target,
    email: cleanEmail,
    hasWebAccount: true,
    webAccountMethod: params.authMethod,
    webAccountActivatedAt: now.toISOString(),
  };

  const customers = params.existingCustomers.map((c) =>
    c.id === target.id ? updatedCustomer : c
  );

  const existingUsers = params.existingUsers || [];
  const matchedUser = existingUsers.find(
    (u) =>
      normalizeVietnamPhone(u.phone) === normalizeVietnamPhone(target.phone) ||
      u.email.trim().toLowerCase() === cleanEmail
  );

  const otpFallbackMarker =
    process.env.NEXT_PUBLIC_DEMO_OTP_MARKER || `otp-verified-${now.getTime()}`;

  const webUserAccount: UserAccount = matchedUser
    ? {
        ...matchedUser,
        fullName: target.fullName,
        email: cleanEmail,
        phone: target.phone,
        passwordHash:
          params.authMethod === "password" && params.password
            ? params.password
            : matchedUser.passwordHash || otpFallbackMarker,
      }
    : {
        id: target.id,
        fullName: target.fullName,
        email: cleanEmail,
        phone: target.phone,
        passwordHash:
          params.authMethod === "password" && params.password
            ? params.password
            : otpFallbackMarker,
        role: "owner",
        createdAt: now.toISOString().slice(0, 10),
        addresses: [],
      };

  const users = matchedUser
    ? existingUsers.map((u) => (u.id === matchedUser.id ? webUserAccount : u))
    : [...existingUsers, webUserAccount];

  const auditLog = createAuditLogEntry({
    action: "web_account_activate",
    actionLabel: "Tạo tài khoản Web giúp khách",
    actorId: params.actorId,
    actorName: params.actorName,
    targetCode: target.id,
    customerName: target.fullName,
    customerPhone: target.phone,
    beforeState: "Khách vãng lai (Chưa có tài khoản Web)",
    afterState: `Tài khoản Web: ${cleanEmail} (${
      params.authMethod === "otp" ? "Xác thực OTP" : "Khách tự đặt mật khẩu"
    })`,
    reason: "Tạo theo yêu cầu của khách tại quầy",
    now,
  });

  return {
    updatedCustomer,
    customers,
    webUserAccount,
    users,
    auditLog,
  };
}

// ============================================================================
// 2. HỒ SƠ THÚ CƯNG KHÁCH VÃNG LAI & GIỚI HẠN 4 LOÀI (MỤC 1, 3 & 6.2)
// ============================================================================

export function isAllowedV14Species(species: string): species is AllowedV14Species {
  return (ALLOWED_V14_SPECIES as readonly string[]).includes((species || "").trim());
}

/**
 * Mục 3: Dùng chung một hàm lấy danh sách thú cưng đang hoạt động ở mọi màn hình chọn thú cưng,
 * để thú cưng đã ẩn không hiện ra khi đặt lịch.
 */
export function getActivePetsForBooking<
  T extends { isHidden?: boolean; status?: string; species?: string }
>(pets: T[]): T[] {
  return pets.filter((p) => !p.isHidden && p.status !== "deleted");
}

/** Helper dùng chung chuyển WalkInPetRecord sang kiểu Pet của UI Đặt lịch KH */
export function mapWalkInPetToUiPet(pet: WalkInPetRecord): Pet {
  const speciesForUi = pet.species === "Chuột" ? "Hamster" : pet.species;
  return {
    id: pet.id,
    name: pet.name,
    species: speciesForUi,
    breed: pet.breed,
    gender: pet.gender,
    age: pet.age,
    weight: `${pet.weightKg} kg`,
    allergies: pet.allergies,
    note: pet.behaviorNote,
    photo:
      pet.species === "Mèo"
        ? "/assets/images/about_fluffy_cat_1793177483392.jpg"
        : pet.species === "Thỏ"
        ? "/assets/adoption/tuyet-nhung-1.jpg"
        : pet.species === "Chuột"
        ? "/assets/adoption/banh-quy-1.jpg"
        : "/assets/images/hero_golden_retriever_1793177482877.jpg",
    nextCheckupDate: "",
    owner: pet.ownerName,
  };
}

export function createWalkInPetProfile(params: {
  customerId: string;
  ownerName: string;
  ownerPhone: string;
  name: string;
  species: string;
  breed?: string;
  gender?: "Đực" | "Cái";
  age?: string;
  weightKg?: number;
  allergies?: string;
  behaviorNote?: string;
  neutered?: boolean;
  existingPets: WalkInPetRecord[];
  actorId?: string;
  actorName: string;
  now?: Date;
}): {
  pet: WalkInPetRecord;
  uiPet: Pet;
  pets: WalkInPetRecord[];
  auditLog: ReceptionistAuditLogEntry;
} {
  const now = params.now || new Date();
  const trimmedName = (params.name || "").trim();
  if (!trimmedName) {
    throw new Error("Vui lòng nhập tên thú cưng.");
  }

  const trimmedSpecies = (params.species || "").trim();
  if (!isAllowedV14Species(trimmedSpecies)) {
    throw new Error(
      `Loài "${trimmedSpecies}" nằm ngoài phạm vi phục vụ v1.4. Hệ thống chỉ nhận 4 loài: Chó, Mèo, Chuột, Thỏ.`
    );
  }

  const safeWeight =
    typeof params.weightKg === "number" && params.weightKg > 0
      ? Number(params.weightKg.toFixed(2))
      : 3.5;

  const pet: WalkInPetRecord = {
    id: `walkin-pet-${now.getTime()}`,
    customerId: params.customerId,
    ownerName: params.ownerName.trim(),
    ownerPhone: normalizeVietnamPhone(params.ownerPhone),
    name: trimmedName,
    species: trimmedSpecies,
    breed: (params.breed || "Lai").trim(),
    gender: params.gender || "Đực",
    age: (params.age || "1 tuổi").trim(),
    weightKg: safeWeight,
    allergies: (params.allergies || "Chưa ghi nhận (Do khách khai)").trim(),
    behaviorNote: params.behaviorNote?.trim() || undefined,
    neutered: Boolean(params.neutered),
    declarationSource: "customer_declared",
    lockedByVet: false,
    isHidden: false,
    createdBy: params.actorName,
    createdAt: now.toISOString(),
  };

  const uiPet = mapWalkInPetToUiPet(pet);

  const auditLog = createAuditLogEntry({
    action: "pet_create",
    actionLabel: "Tạo hồ sơ thú cưng nhanh (Khách vãng lai)",
    actorId: params.actorId,
    actorName: params.actorName,
    targetCode: pet.id,
    customerName: pet.ownerName,
    customerPhone: pet.ownerPhone,
    beforeState: "Chưa có hồ sơ thú cưng",
    afterState: `Bé ${pet.name} (${pet.species} • ${pet.weightKg}kg [Do khách khai])`,
    now,
  });

  return {
    pet,
    uiPet,
    pets: [pet, ...params.existingPets],
    auditLog,
  };
}
