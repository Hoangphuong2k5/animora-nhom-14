import { SEED_EXPERTS, stripExpertPrefix } from "@/data/expertPortalData";
import { ExpertProfile } from "@/types/expert.type";

export const MAX_SPECIALTIES = 6;
export const MAX_BIO_LENGTH = 500;
export const MIN_PASSWORD_LENGTH = 8;

export interface ProfileFormErrors {
  pureFullName?: string;
  phone?: string;
  yearsOfExperience?: string;
  bio?: string;
}

export interface PasswordStrengthResult {
  level: "empty" | "weak" | "medium" | "strong";
  bars: 0 | 1 | 2 | 3;
  label: string;
  textColorClass: string;
  barColorClass: string;
  hint: string;
}

/**
 * Định dạng ngày sang kiểu Việt Nam (DD/MM/YYYY), ví dụ "2023-03-15" -> "15/03/2023"
 */
export function formatVietnameseDate(dateStr?: string): string {
  if (!dateStr) return "15/03/2023";
  const trimmed = dateStr.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const dd = String(parsed.getDate()).padStart(2, "0");
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const yyyy = parsed.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return trimmed;
}

/**
 * Chuẩn hóa tên bằng cấp/chứng chỉ và chuyên môn sang viết hoa chữ đầu câu theo tiếng Việt
 */
export function normalizeVietnameseSentenceTitle(raw: string): string {
  const map: Record<string, string> = {
    "Bác Sĩ Thú Y Chính Quy": "Bác sĩ thú y chính quy",
    "Chứng chỉ Phẫu thuật Ngoại khoa Thú nhỏ":
      "Chứng chỉ phẫu thuật ngoại khoa thú nhỏ",
    "Master Groomer Level A":
      "Chứng chỉ cắt tỉa thú cưng chuyên nghiệp hạng A",
    "Tiêm chủng & Da liễu": "Tiêm chủng và da liễu",
  };
  return map[raw] || raw;
}

/**
 * Lấy số năm kinh nghiệm từ profile hoặc fallback từ seed data
 */
export function resolveYearsOfExperience(profile: ExpertProfile): number {
  if (
    typeof profile.yearsOfExperience === "number" &&
    !Number.isNaN(profile.yearsOfExperience)
  ) {
    return profile.yearsOfExperience;
  }
  const seedExp = SEED_EXPERTS[profile.id]?.yearsOfExperience;
  if (typeof seedExp === "number") {
    return seedExp;
  }
  const bioMatch = profile.bio?.match(/(\d+)\s*năm/i);
  if (bioMatch) {
    return Number(bioMatch[1]);
  }
  return profile.expertType === "vet" ? 8 : 6;
}

/**
 * Kiểm tra định dạng số điện thoại Việt Nam (hỗ trợ khoảng trắng, dấu chấm/gạch ngang, đầu 03/05/07/08/09/+84/02)
 */
export function isValidVietnamesePhone(rawPhone: string): boolean {
  const compact = rawPhone.trim().replace(/[\s.-]/g, "");
  return (
    /^(?:0|\+84|84)(?:3|5|7|8|9)\d{8}$/.test(compact) ||
    /^02\d{9}$/.test(compact)
  );
}

/**
 * Kiểm tra lỗi cho các trường trong form Thông tin giới thiệu chuyên môn
 */
export function validateProfileForm(
  pureFullName: string,
  phone: string,
  yearsOfExperienceInput: string,
  bio: string,
  lang: "vi" | "en"
): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  const cleanName = stripExpertPrefix(pureFullName).trim();
  if (!cleanName) {
    errors.pureFullName =
      lang === "en"
        ? "Full name is required."
        : "Vui lòng nhập họ và tên thuần (bắt buộc).";
  } else if (cleanName.length < 2) {
    errors.pureFullName =
      lang === "en"
        ? "Full name must be at least 2 characters."
        : "Họ và tên phải có ít nhất 2 ký tự.";
  }

  const cleanPhone = phone.trim();
  if (!cleanPhone) {
    errors.phone =
      lang === "en"
        ? "Phone number is required."
        : "Vui lòng nhập số điện thoại liên hệ (bắt buộc).";
  } else if (!isValidVietnamesePhone(cleanPhone)) {
    errors.phone =
      lang === "en"
        ? "Invalid Vietnamese phone format (e.g. 0912 345 678 or +84912345678)."
        : "Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912 345 678 hoặc +84912345678).";
  }

  const cleanExp = yearsOfExperienceInput.trim();
  if (cleanExp === "") {
    errors.yearsOfExperience =
      lang === "en"
        ? "Years of experience is required."
        : "Vui lòng nhập số năm kinh nghiệm.";
  } else {
    const parsedExp = Number(cleanExp);
    if (
      Number.isNaN(parsedExp) ||
      !Number.isInteger(parsedExp) ||
      parsedExp < 0 ||
      parsedExp > 60
    ) {
      errors.yearsOfExperience =
        lang === "en"
          ? "Years of experience must be an integer between 0 and 60."
          : "Số năm kinh nghiệm phải là số nguyên từ 0 đến 60.";
    }
  }

  if (bio.length > MAX_BIO_LENGTH) {
    errors.bio =
      lang === "en"
        ? `Biography exceeds the ${MAX_BIO_LENGTH}-character limit (${bio.length}/${MAX_BIO_LENGTH}).`
        : `Giới thiệu bản thân vượt quá giới hạn ${MAX_BIO_LENGTH} ký tự (đang dư ${
            bio.length - MAX_BIO_LENGTH
          } ký tự).`;
  }

  return errors;
}

/**
 * Đánh giá độ mạnh mật khẩu mới (Mục 18): tối thiểu 8 ký tự, hiển thị mức độ mạnh/yếu kèm gợi ý ngắn
 */
export function evaluatePasswordStrength(
  password: string,
  lang: "vi" | "en"
): PasswordStrengthResult {
  if (!password) {
    return {
      level: "empty",
      bars: 0,
      label: "",
      textColorClass: "text-zinc-500",
      barColorClass: "bg-zinc-200 dark:bg-zinc-700",
      hint:
        lang === "en"
          ? "Minimum 8 characters; combine uppercase, lowercase, numbers, and symbols."
          : "Tối thiểu 8 ký tự; nên kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt.",
    };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const varietyCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(
    Boolean
  ).length;

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      level: "weak",
      bars: 1,
      label: lang === "en" ? "Weak" : "Yếu",
      textColorClass: "text-rose-600 dark:text-rose-400",
      barColorClass: "bg-rose-500",
      hint:
        lang === "en"
          ? `Add ${MIN_PASSWORD_LENGTH - password.length} more character(s) to reach the 8-character minimum.`
          : `Cần thêm ít nhất ${MIN_PASSWORD_LENGTH - password.length} ký tự nữa để đạt tối thiểu 8 ký tự.`,
    };
  }

  if (
    (password.length >= 10 && varietyCount >= 3) ||
    (password.length >= MIN_PASSWORD_LENGTH && varietyCount === 4)
  ) {
    return {
      level: "strong",
      bars: 3,
      label: lang === "en" ? "Strong" : "Mạnh",
      textColorClass: "text-emerald-600 dark:text-emerald-400",
      barColorClass: "bg-emerald-500",
      hint:
        lang === "en"
          ? "Strong password — great protection for your specialist account."
          : "Mật khẩu mạnh — đảm bảo an toàn cao cho tài khoản chuyên viên.",
    };
  }

  if (varietyCount >= 2) {
    return {
      level: "medium",
      bars: 2,
      label: lang === "en" ? "Medium" : "Trung bình",
      textColorClass: "text-amber-600 dark:text-amber-400",
      barColorClass: "bg-amber-500",
      hint:
        lang === "en"
          ? "Tip: Add a special symbol (@, #, !) or uppercase letter to make it Strong."
          : "Gợi ý: Thêm ký tự đặc biệt (@, #, !...) hoặc chữ in hoa và tăng độ dài từ 10 ký tự để đạt mức Mạnh.",
    };
  }

  return {
    level: "weak",
    bars: 1,
    label: lang === "en" ? "Weak" : "Yếu",
    textColorClass: "text-rose-600 dark:text-rose-400",
    barColorClass: "bg-rose-500",
    hint:
      lang === "en"
        ? "Tip: Combine letters, numbers, and special characters instead of a single character type."
        : "Gợi ý: Hãy kết hợp thêm chữ hoa, chữ số hoặc ký tự đặc biệt thay vì chỉ dùng một kiểu ký tự.",
  };
}

