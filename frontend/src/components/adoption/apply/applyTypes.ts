import { AdoptionPet, AdoptionRequest, Language, PageId } from '@/types';
import {
  cleanPhone,
  hasMeaningfulDraftValues,
  isValidDraftPhone,
  validatePhoneDigits,
} from '@/utils/adoptionFormLogic';

export interface AdoptionApplyPageProps {
  lang: Language;
  pet: AdoptionPet | null;
  onAddAdoptionRequest: (req: AdoptionRequest) => boolean | void;
  onNavigate: (page: PageId) => void;
  onNavigateUrl: (url: string) => void;
  isSuccessView?: boolean;
}

export interface DraftFormData {
  // Step 1
  applicantName: string;
  phoneDigits: string;
  email: string;
  area: string;
  preferredContact: 'phone' | 'zalo' | 'email';
  bestTime: 'morning' | 'afternoon' | 'evening' | 'anytime';

  // Step 2
  hadPetBefore: 'never' | 'current' | 'past' | '';
  housingType: 'house' | 'apartment' | 'rented' | 'other' | '';
  landlordPermission: 'yes' | 'not_needed' | 'in_progress' | '';
  householdSize: number;
  hasYoungChildren: boolean;
  hasOtherPets: boolean;
  otherPetsDetail: string;
  hoursAtHome: 'full_day' | 'evening_only' | 'flexible' | 'often_away' | '';
  monthlyBudget: 'under_1m' | '1m_to_2m' | '2m_to_4m' | 'over_4m' | '';
  visitConsent: boolean;

  // Step 3
  notes: string;
  commit1: boolean;
  commit2: boolean;
  commit3: boolean;
  commit4: boolean;

  // Form step
  currentStep: number;
}

export type FormErrors = Record<string, string>;

export const INITIAL_FORM_DATA: DraftFormData = {
  applicantName: '',
  phoneDigits: '',
  email: '',
  area: '',
  preferredContact: 'phone',
  bestTime: 'anytime',

  hadPetBefore: '',
  housingType: '',
  landlordPermission: '',
  householdSize: 2,
  hasYoungChildren: false,
  hasOtherPets: false,
  otherPetsDetail: '',
  hoursAtHome: '',
  monthlyBudget: '',
  visitConsent: false,

  notes: '',
  commit1: false,
  commit2: false,
  commit3: false,
  commit4: false,

  currentStep: 1,
};

export const DEFAULT_FORM_DATA: DraftFormData = INITIAL_FORM_DATA;

export const PREFERRED_CONTACT_OPTIONS = [
  { id: 'phone', labelVi: 'Gọi điện thoại', labelEn: 'Phone Call' },
  { id: 'zalo', labelVi: 'Nhắn qua Zalo', labelEn: 'Zalo Chat' },
  { id: 'email', labelVi: 'Gửi Email', labelEn: 'Email' },
] as const;

export const BEST_TIME_OPTIONS = [
  { id: 'morning', labelVi: 'Sáng (8h - 12h)', labelEn: 'Morning (8am-12)' },
  { id: 'afternoon', labelVi: 'Chiều (13h - 18h)', labelEn: 'Afternoon (1-6pm)' },
  { id: 'evening', labelVi: 'Tối (18h - 21h)', labelEn: 'Evening (6-9pm)' },
  { id: 'anytime', labelVi: 'Bất kỳ lúc nào', labelEn: 'Anytime' },
] as const;

export const HAD_PET_OPTIONS = [
  { id: 'never', labelVi: 'Chưa từng', labelEn: 'First-time owner' },
  { id: 'current', labelVi: 'Đang nuôi', labelEn: 'Currently have pets' },
  { id: 'past', labelVi: 'Đã từng trước đây', labelEn: 'Had pets before' },
] as const;

export const HOUSING_TYPE_OPTIONS = [
  { id: 'house', labelVi: 'Nhà riêng / Nhà phố', labelEn: 'Private House' },
  { id: 'apartment', labelVi: 'Căn hộ chung cư', labelEn: 'Apartment' },
  { id: 'rented', labelVi: 'Nhà thuê / Phòng trọ', labelEn: 'Rented Room' },
  { id: 'other', labelVi: 'Khác', labelEn: 'Other' },
] as const;

export const LANDLORD_PERMISSION_OPTIONS = [
  { id: 'yes', labelVi: 'Được phép nuôi', labelEn: 'Permitted' },
  { id: 'not_needed', labelVi: 'Không cấm / Tự do', labelEn: 'No restrictions' },
  { id: 'in_progress', labelVi: 'Đang xin phép', labelEn: 'In progress' },
] as const;

export const HOURS_AT_HOME_OPTIONS = [
  { id: 'full_day', labelVi: 'Cả ngày / WFH', labelEn: 'All day / WFH' },
  { id: 'flexible', labelVi: 'Linh hoạt', labelEn: 'Flexible' },
  { id: 'evening_only', labelVi: 'Chỉ buổi tối', labelEn: 'Evenings only' },
  { id: 'often_away', labelVi: 'Hay đi công tác', labelEn: 'Often away' },
] as const;

export const MONTHLY_BUDGET_OPTIONS = [
  { id: 'under_1m', labelVi: '< 1 triệu đ', labelEn: '< 1M VND' },
  { id: '1m_to_2m', labelVi: '1 – 2 triệu đ', labelEn: '1 – 2M VND' },
  { id: '2m_to_4m', labelVi: '2 – 4 triệu đ', labelEn: '2 – 4M VND' },
  { id: 'over_4m', labelVi: '> 4 triệu đ', labelEn: '> 4M VND' },
] as const;

export const loadInitialDraftFormData = (
  slug: string,
  storageKey: string,
  petArea?: string
): DraftFormData => {
  const initialBase: DraftFormData = {
    ...DEFAULT_FORM_DATA,
    area: petArea || '',
  };
  if (!slug) return initialBase;
  try {
    localStorage.removeItem(`animora_adopt_draft_${slug}`);
    localStorage.removeItem(`animora_adopt_draft_v1_${slug}`);

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      let restoredPhone = '';
      if (parsed.phoneDigits && isValidDraftPhone(parsed.phoneDigits)) {
        restoredPhone = parsed.phoneDigits;
      } else if (parsed.phone && isValidDraftPhone(cleanPhone(parsed.phone))) {
        restoredPhone = cleanPhone(parsed.phone);
      }
      return {
        ...initialBase,
        ...parsed,
        phoneDigits: restoredPhone,
        area: parsed.area !== undefined ? parsed.area : initialBase.area,
      };
    }
  } catch {
    // ignore
  }
  return initialBase;
};

export const checkHasRestoredDraft = (slug: string, storageKey: string): boolean => {
  if (!slug) return false;
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return false;
    const parsed = JSON.parse(saved);
    return hasMeaningfulDraftValues(parsed);
  } catch {
    return false;
  }
};

export const buildAdoptionRequest = (
  pet: AdoptionPet,
  formData: DraftFormData,
  generatedCode: string
): AdoptionRequest => ({
  id: 'adopt-req-' + Date.now(),
  requestCode: generatedCode,
  petId: pet.id,
  petSlug: pet.slug,
  petName: pet.name,
  applicantName: formData.applicantName.trim(),
  phone: formData.phoneDigits,
  email: formData.email.trim(),
  area: formData.area,
  preferredContact: formData.preferredContact,
  bestTime: formData.bestTime,
  hadPetBefore: formData.hadPetBefore === 'never' ? 'no' : 'yes',
  housingType: formData.housingType || 'other',
  landlordPermission: formData.landlordPermission || 'yes',
  householdSize: formData.householdSize,
  hasYoungChildren: formData.hasYoungChildren,
  hasOtherPets: formData.hasOtherPets,
  otherPetsDetail: formData.otherPetsDetail.trim(),
  hoursAtHome: formData.hoursAtHome || 'flexible',
  monthlyBudget: formData.monthlyBudget || '1m_to_2m',
  visitConsent: formData.visitConsent,
  notes: formData.notes.trim(),
  agreedCommitment: true,
  commitmentsAccepted: {
    lifelongCare: formData.commit1,
    vaccinations: formData.commit2,
    updatePhotos: formData.commit3,
    noAbandonment: formData.commit4,
  },
  status: 'pending',
  createdAt: new Date().toISOString(),
});

export const getPetFactChips = (pet: AdoptionPet, isEn: boolean): string[] => [
  pet.vaccinated
    ? isEn
      ? 'Vaccinated'
      : 'Đã tiêm phòng'
    : isEn
    ? 'Unvaccinated'
    : 'Chưa tiêm phòng',
  pet.neutered
    ? isEn
      ? 'Neutered'
      : 'Đã triệt sản'
    : isEn
    ? 'Not neutered'
    : 'Chưa triệt sản',
  (isEn ? pet.areaEn || pet.area : pet.area) || '',
];

export const validateStep1Fields = (formData: DraftFormData, isEn: boolean): FormErrors => {
  const errs: FormErrors = {};

  if (!formData.applicantName.trim() || formData.applicantName.trim().length < 2) {
    errs.applicantName = isEn
      ? 'Please enter your full name (at least 2 characters).'
      : 'Vui lòng nhập họ và tên của bạn (ít nhất 2 ký tự).';
  }

  const phoneRes = validatePhoneDigits(formData.phoneDigits, isEn);
  if (!phoneRes.isValid && phoneRes.error) {
    errs.phone = phoneRes.error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    errs.email = isEn
      ? 'Please enter your email address.'
      : 'Vui lòng nhập địa chỉ email.';
  } else if (!emailRegex.test(formData.email.trim())) {
    errs.email = isEn
      ? 'Please enter a valid email address.'
      : 'Địa chỉ email không đúng định dạng.';
  }

  if (!formData.area || !formData.area.trim()) {
    errs.area = isEn
      ? 'Please select your living province/city.'
      : 'Vui lòng chọn tỉnh/thành sinh sống.';
  }

  return errs;
};

export const validateStep2Fields = (formData: DraftFormData, isEn: boolean): FormErrors => {
  const errs: FormErrors = {};

  if (!formData.hadPetBefore) {
    errs.hadPetBefore = isEn
      ? 'Please select your pet ownership experience.'
      : 'Vui lòng chọn kinh nghiệm nuôi thú cưng.';
  }

  if (!formData.housingType) {
    errs.housingType = isEn
      ? 'Please select your current housing type.'
      : 'Vui lòng chọn nơi ở hiện tại.';
  }

  if (
    (formData.housingType === 'apartment' || formData.housingType === 'rented') &&
    !formData.landlordPermission
  ) {
    errs.landlordPermission = isEn
      ? 'Please indicate if pets are permitted at your residence.'
      : 'Vui lòng xác nhận quy định cho phép nuôi tại nơi ở.';
  }

  if (!formData.hoursAtHome) {
    errs.hoursAtHome = isEn
      ? 'Please choose daily time spent at home.'
      : 'Vui lòng chọn thời gian có người ở nhà.';
  }

  if (!formData.monthlyBudget) {
    errs.monthlyBudget = isEn
      ? 'Please estimate your monthly budget for the pet.'
      : 'Vui lòng chọn ngân sách dự kiến mỗi tháng.';
  }

  if (!formData.visitConsent) {
    errs.visitConsent = isEn
      ? 'Please agree to contact/consultation to continue.'
      : 'Vui lòng đồng ý để đội ngũ Animora liên hệ trao đổi.';
  }

  return errs;
};
