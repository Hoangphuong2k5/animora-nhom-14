import type { ExpertProfile } from "@/types/expert.type";

export interface SessionIdentityOverride {
  fullName?: string;
  email?: string;
  expertType?: ExpertProfile["expertType"];
}

export interface ResolvedExpertSession {
  expertId: string;
  identityOverride: SessionIdentityOverride | null;
}

export interface SessionLikeUser {
  id?: string | number | null;
  email?: string | null;
  fullName?: string | null;
  role?: string | null;
  expertType?: string | null;
}

const DEMO_EMAIL_TO_EXPERT_ID: Record<string, string> = {
  "care2@animora.vn": "exp-spa-02",
  "spa@animora.vn": "exp-spa-01",
  "vet.toan@animora.vn": "exp-vet-02",
  "vet.phuong@animora.vn": "exp-vet-03",
  "vet@animora.vn": "exp-vet-01",
};

const KNOWN_EXPERT_IDS = new Set([
  "exp-vet-01",
  "exp-vet-02",
  "exp-vet-03",
  "exp-spa-01",
  "exp-spa-02",
]);

/**
 * Hàm thuần ánh xạ thông tin phiên đăng nhập (từ Server Action hoặc localStorage)
 * sang `expertId` và `identityOverride` (nếu là tài khoản Backend ngoài danh sách demo).
 */
export function resolveExpertIdentityFromSession(
  user: SessionLikeUser | null | undefined
): ResolvedExpertSession | null {
  if (!user) return null;

  const emailLower = String(user.email || "").trim().toLowerCase();
  const idStr = user.id != null ? String(user.id) : "";

  if (KNOWN_EXPERT_IDS.has(idStr)) {
    return { expertId: idStr, identityOverride: null };
  }

  if (emailLower && DEMO_EMAIL_TO_EXPERT_ID[emailLower]) {
    return {
      expertId: DEMO_EMAIL_TO_EXPERT_ID[emailLower],
      identityOverride: null,
    };
  }

  const rawRole = String(user.role || "").toLowerCase();
  const rawExpertType = String(user.expertType || "").toLowerCase();

  if (
    rawExpertType === "groomer" ||
    rawExpertType === "trainer" ||
    rawRole === "care_staff" ||
    rawRole === "carestaff" ||
    rawRole === "spa"
  ) {
    return {
      expertId: "exp-spa-01",
      identityOverride: {
        fullName: user.fullName || undefined,
        email: user.email || undefined,
        expertType: rawExpertType === "trainer" ? "trainer" : "groomer",
      },
    };
  }

  if (rawExpertType === "vet" || rawRole === "doctor" || rawRole === "vet") {
    return {
      expertId: "exp-vet-01",
      identityOverride: {
        fullName: user.fullName || undefined,
        email: user.email || undefined,
        expertType: "vet",
      },
    };
  }

  return null;
}

