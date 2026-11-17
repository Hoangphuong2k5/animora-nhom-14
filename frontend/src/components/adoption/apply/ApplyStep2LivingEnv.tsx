import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import {
  DraftFormData,
  FormErrors,
  HAD_PET_OPTIONS,
  HOURS_AT_HOME_OPTIONS,
  HOUSING_TYPE_OPTIONS,
  LANDLORD_PERMISSION_OPTIONS,
  MONTHLY_BUDGET_OPTIONS,
} from './applyTypes';

interface ApplyStep2LivingEnvProps {
  isEn: boolean;
  petName: string;
  formData: DraftFormData;
  setFormData: React.Dispatch<React.SetStateAction<DraftFormData>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const ApplyStep2LivingEnv: React.FC<ApplyStep2LivingEnvProps> = ({
  isEn,
  petName,
  formData,
  setFormData,
  errors,
  setErrors,
  onPrevStep,
  onNextStep,
}) => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-xl font-bold font-heading text-[var(--primary)]">
          {isEn ? 'Step 2: Home & Living Environment' : 'Bước 2: Môi trường & Điều kiện chăm sóc'}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          {isEn
            ? `Help us understand if ${petName} will be a great match for your daily routine.`
            : `Giúp Animora đảm bảo bé ${petName} sẽ hòa nhập tốt nhất với không gian sống của bạn.`}
        </p>
      </div>

      {/* Pet ownership experience */}
      <div>
        <label className="block text-sm font-bold text-[var(--text)] mb-2">
          {isEn ? 'Have you ever had a pet before? *' : 'Bạn đã từng nuôi thú cưng chưa? *'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {HAD_PET_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  hadPetBefore: item.id as 'never' | 'current' | 'past',
                }));
                if (errors.hadPetBefore) {
                  setErrors((prev) => {
                    const n = { ...prev };
                    delete n.hadPetBefore;
                    return n;
                  });
                }
              }}
              className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer text-center ${
                formData.hadPetBefore === item.id
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                  : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {isEn ? item.labelEn : item.labelVi}
            </button>
          ))}
        </div>
        {errors.hadPetBefore && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.hadPetBefore}
          </p>
        )}
      </div>

      {/* Housing Type */}
      <div>
        <label className="block text-sm font-bold text-[var(--text)] mb-2">
          {isEn ? 'Current housing type *' : 'Nơi ở hiện tại của bạn *'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {HOUSING_TYPE_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  housingType: item.id as 'house' | 'apartment' | 'rented' | 'other',
                }));
                if (errors.housingType) {
                  setErrors((prev) => {
                    const n = { ...prev };
                    delete n.housingType;
                    return n;
                  });
                }
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer text-center ${
                formData.housingType === item.id
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                  : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {isEn ? item.labelEn : item.labelVi}
            </button>
          ))}
        </div>
        {errors.housingType && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.housingType}
          </p>
        )}
      </div>

      {/* Conditional Question: Landlord / Building permission if apartment or rented */}
      {(formData.housingType === 'apartment' || formData.housingType === 'rented') && (
        <div className="bg-[var(--surface-2)]/60 border border-[var(--border)] p-4 rounded-2xl animate-fade-up">
          <label className="block text-sm font-bold text-[var(--primary)] mb-2">
            {isEn
              ? 'Does your landlord or building management permit pets? *'
              : 'Chủ nhà hoặc Ban quản lý tòa nhà có cho phép nuôi thú cưng không? *'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LANDLORD_PERMISSION_OPTIONS.map((perm) => (
              <button
                key={perm.id}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    landlordPermission: perm.id as 'yes' | 'not_needed' | 'in_progress',
                  }));
                  if (errors.landlordPermission) {
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n.landlordPermission;
                      return n;
                    });
                  }
                }}
                className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                  formData.landlordPermission === perm.id
                    ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                    : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
                }`}
              >
                {isEn ? perm.labelEn : perm.labelVi}
              </button>
            ))}
          </div>
          {errors.landlordPermission && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.landlordPermission}
            </p>
          )}
        </div>
      )}

      {/* Household Size Stepper & Young Children */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Household Size Stepper */}
        <div>
          <label className="block text-sm font-bold text-[var(--text)] mb-1.5">
            {isEn ? 'Household size' : 'Số thành viên trong gia đình'}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  householdSize: Math.max(1, prev.householdSize - 1),
                }))
              }
              className="w-11 h-11 rounded-xl bg-[var(--surface)] border border-[var(--border)] font-bold text-lg text-[var(--primary)] hover:bg-[var(--surface-2)] flex items-center justify-center cursor-pointer transition-colors"
            >
              -
            </button>
            <span className="w-14 text-center text-lg font-bold font-mono text-[var(--primary)]">
              {formData.householdSize} {isEn ? 'people' : 'người'}
            </span>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  householdSize: Math.min(12, prev.householdSize + 1),
                }))
              }
              className="w-11 h-11 rounded-xl bg-[var(--surface)] border border-[var(--border)] font-bold text-lg text-[var(--primary)] hover:bg-[var(--surface-2)] flex items-center justify-center cursor-pointer transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Children under 6 */}
        <div>
          <label className="block text-sm font-bold text-[var(--text)] mb-1.5">
            {isEn ? 'Children under 6 in household?' : 'Nhà có trẻ nhỏ dưới 6 tuổi không?'}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, hasYoungChildren: false }))}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
                !formData.hasYoungChildren
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                  : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
              }`}
            >
              {isEn ? 'No' : 'Không có'}
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, hasYoungChildren: true }))}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
                formData.hasYoungChildren
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                  : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
              }`}
            >
              {isEn ? 'Yes' : 'Có trẻ nhỏ'}
            </button>
          </div>
        </div>
      </div>

      {/* Current Pets in Home */}
      <div>
        <label className="block text-sm font-bold text-[var(--text)] mb-1.5">
          {isEn ? 'Are there other pets at home?' : 'Hiện trong nhà có bé thú cưng nào khác không?'}
        </label>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, hasOtherPets: false }))}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
              !formData.hasOtherPets
                ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
            }`}
          >
            {isEn ? 'No other pets' : 'Không có'}
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, hasOtherPets: true }))}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
              formData.hasOtherPets
                ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
            }`}
          >
            {isEn ? 'Yes, have pets' : 'Có thú cưng khác'}
          </button>
        </div>

        {formData.hasOtherPets && (
          <input
            type="text"
            value={formData.otherPetsDetail}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, otherPetsDetail: e.target.value }))
            }
            placeholder={
              isEn
                ? 'e.g. 1 vaccinated domestic cat, 2 years old'
                : 'Ví dụ: 1 mèo ta 2 tuổi đã tiêm phòng và triệt sản'
            }
            className="form-input w-full animate-fade-up text-sm"
          />
        )}
      </div>

      {/* Time at home */}
      <div>
        <label className="block text-sm font-bold text-[var(--text)] mb-2">
          {isEn
            ? 'How much time is someone at home each day? *'
            : 'Thời gian có người ở nhà mỗi ngày? *'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {HOURS_AT_HOME_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  hoursAtHome: t.id as 'full_day' | 'flexible' | 'evening_only' | 'often_away',
                }));
                if (errors.hoursAtHome) {
                  setErrors((prev) => {
                    const n = { ...prev };
                    delete n.hoursAtHome;
                    return n;
                  });
                }
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                formData.hoursAtHome === t.id
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                  : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {isEn ? t.labelEn : t.labelVi}
            </button>
          ))}
        </div>
        {errors.hoursAtHome && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.hoursAtHome}
          </p>
        )}
      </div>

      {/* Monthly Budget */}
      <div>
        <label className="block text-sm font-bold text-[var(--text)] mb-2">
          {isEn
            ? 'Estimated monthly care budget for the pet? *'
            : 'Ngân sách dự kiến mỗi tháng dành cho bé? *'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MONTHLY_BUDGET_OPTIONS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  monthlyBudget: b.id as 'under_1m' | '1m_to_2m' | '2m_to_4m' | 'over_4m',
                }));
                if (errors.monthlyBudget) {
                  setErrors((prev) => {
                    const n = { ...prev };
                    delete n.monthlyBudget;
                    return n;
                  });
                }
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                formData.monthlyBudget === b.id
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]'
                  : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {isEn ? b.labelEn : b.labelVi}
            </button>
          ))}
        </div>
        {errors.monthlyBudget && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.monthlyBudget}
          </p>
        )}
      </div>

      {/* Consent Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <Checkbox
            checked={formData.visitConsent}
            onCheckedChange={(checked) => {
              const nextChecked = Boolean(checked);
              setFormData((prev) => ({ ...prev, visitConsent: nextChecked }));
              if (errors.visitConsent && nextChecked) {
                setErrors((prev) => {
                  const n = { ...prev };
                  delete n.visitConsent;
                  return n;
                });
              }
            }}
            aria-invalid={Boolean(errors.visitConsent)}
            className="mt-1 shrink-0 cursor-pointer data-checked:bg-(--primary) data-checked:border-(--primary) data-checked:text-(--on-primary)"
          />
          <span className="text-xs sm:text-sm text-[var(--text)]">
            {isEn
              ? 'I agree to allow Animora’s adoption team to contact me and discuss my living conditions before finalizing the adoption.'
              : 'Tôi đồng ý để đội ngũ Animora gọi điện trao đổi chi tiết và hướng dẫn các bước tiếp theo.'}
          </span>
        </label>
        {errors.visitConsent && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.visitConsent}
          </p>
        )}
      </div>

      {/* Step 2 Actions */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevStep}
          className="btn-secondary px-6 py-3 cursor-pointer text-sm"
        >
          {isEn ? '← Back' : '← Quay lại'}
        </button>
        <button
          type="button"
          onClick={onNextStep}
          className="btn-primary px-8 py-3.5 cursor-pointer text-base"
        >
          {isEn ? 'Next: Commit & Review →' : 'Tiếp tục: Cam kết & gửi →'}
        </button>
      </div>
    </div>
  );
};
