import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, Home, User } from 'lucide-react';
import { formatPhone433 } from '@/utils/adoptionFormLogic';
import { DraftFormData, FormErrors } from './applyTypes';

interface ApplyStep3CommitmentProps {
  isEn: boolean;
  petName: string;
  formData: DraftFormData;
  setFormData: React.Dispatch<React.SetStateAction<DraftFormData>>;
  errors: FormErrors;
  allCommitmentsChecked: boolean;
  isSubmitting: boolean;
  onJumpToStep: (step: number) => void;
  onPrevStep: () => void;
}

export const ApplyStep3Commitment: React.FC<ApplyStep3CommitmentProps> = ({
  isEn,
  petName,
  formData,
  setFormData,
  errors,
  allCommitmentsChecked,
  isSubmitting,
  onJumpToStep,
  onPrevStep,
}) => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-xl font-bold font-heading text-[var(--primary)]">
          {isEn ? 'Step 3: Review & Lifetime Commitment' : 'Bước 3: Xem lại thông tin & Cam kết nhân văn'}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          {isEn
            ? `Please verify your information and accept the 4 adoption commitments for ${petName}.`
            : `Vui lòng kiểm tra lại thông tin và xác nhận 4 cam kết nhận nuôi bé ${petName}.`}
        </p>
      </div>

      {/* Summary Card with Jump Edit links */}
      <div className="bg-[var(--surface-2)]/50 border border-[var(--border)] rounded-2xl p-5 space-y-4">
        {/* Block A: Personal Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {isEn ? 'Your Information' : 'Thông tin người nhận nuôi'}
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs font-bold text-[var(--coral)] hover:underline cursor-pointer"
            >
              {isEn ? 'Edit' : 'Sửa'}
            </button>
          </div>
          <div className="text-xs sm:text-sm text-[var(--text)] grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-[var(--text-muted)]">{isEn ? 'Name: ' : 'Họ tên: '}</span>
              <span className="font-bold">{formData.applicantName}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{isEn ? 'Phone: ' : 'SĐT: '}</span>
              <span className="font-bold font-mono">{formatPhone433(formData.phoneDigits)}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Email: </span>
              <span className="font-bold">{formData.email}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{isEn ? 'Area: ' : 'Khu vực: '}</span>
              <span className="font-bold">{formData.area}</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-[var(--border)]" />

        {/* Block B: Living Conditions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              {isEn ? 'Living Conditions' : 'Điều kiện sống'}
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs font-bold text-[var(--coral)] hover:underline cursor-pointer"
            >
              {isEn ? 'Edit' : 'Sửa'}
            </button>
          </div>
          <div className="text-xs sm:text-sm text-[var(--text)] grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-[var(--text-muted)]">{isEn ? 'Housing: ' : 'Nơi ở: '}</span>
              <span className="font-bold">
                {formData.housingType === 'house'
                  ? isEn
                    ? 'Private House'
                    : 'Nhà riêng'
                  : formData.housingType === 'apartment'
                  ? isEn
                    ? 'Apartment'
                    : 'Chung cư'
                  : formData.housingType === 'rented'
                  ? isEn
                    ? 'Rented'
                    : 'Nhà thuê'
                  : isEn
                  ? 'Other'
                  : 'Khác'}
              </span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{isEn ? 'Household: ' : 'Gia đình: '}</span>
              <span className="font-bold">
                {formData.householdSize} {isEn ? 'members' : 'thành viên'}
              </span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{isEn ? 'Time at home: ' : 'Thời gian ở nhà: '}</span>
              <span className="font-bold">
                {formData.hoursAtHome === 'full_day'
                  ? isEn
                    ? 'All day'
                    : 'Cả ngày'
                  : formData.hoursAtHome === 'flexible'
                  ? isEn
                    ? 'Flexible'
                    : 'Linh hoạt'
                  : isEn
                  ? 'Evening'
                  : 'Chỉ buổi tối'}
              </span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{isEn ? 'Monthly budget: ' : 'Ngân sách: '}</span>
              <span className="font-bold">
                {formData.monthlyBudget === 'under_1m'
                  ? '< 1M'
                  : formData.monthlyBudget === '1m_to_2m'
                  ? '1 - 2M'
                  : formData.monthlyBudget === '2m_to_4m'
                  ? '2 - 4M'
                  : '> 4M'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Notes Message */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-bold text-[var(--text)]">
            {isEn
              ? 'Message to Animora shelter (Optional)'
              : 'Lời nhắn gửi đến Animora / Lý do muốn nhận nuôi bé'}
          </label>
          <span className="text-xs text-[var(--text-muted)]">
            {isEn
              ? `${500 - formData.notes.length} chars left`
              : `Còn ${500 - formData.notes.length} ký tự`}
          </span>
        </div>
        <Textarea
          rows={3}
          maxLength={500}
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder={
            isEn
              ? `Tell us about your home, schedule, or why you feel drawn to ${petName}...`
              : `Hãy chia sẻ thêm về gia đình bạn hoặc lý do bạn cảm thấy gắn kết với bé ${petName}...`
          }
          className="form-input w-full min-h-[84px] h-auto py-2.5 text-sm"
        />
      </div>

      {/* 4 Mandatory Commitment Checkboxes */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider">
          {isEn ? '4 Mandatory Commitments *' : '4 Cam kết nhận nuôi nhân văn *'}
        </h3>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] cursor-pointer select-none hover:bg-[var(--surface-2)]/30 transition-colors">
          <Checkbox
            checked={formData.commit1}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, commit1: Boolean(checked) }))
            }
            className="mt-1 shrink-0 cursor-pointer data-checked:bg-(--primary) data-checked:border-(--primary) data-checked:text-(--on-primary)"
          />
          <span className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
            <strong>1. </strong>
            {isEn
              ? `I commit to providing a loving, lifelong home for ${petName} and will never abandon the pet.`
              : `Tôi cam kết chăm sóc bé ${petName} trọn đời và tuyệt đối không bỏ rơi bé vì bất kỳ lý do gì.`}
          </span>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] cursor-pointer select-none hover:bg-[var(--surface-2)]/30 transition-colors">
          <Checkbox
            checked={formData.commit2}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, commit2: Boolean(checked) }))
            }
            className="mt-1 shrink-0 cursor-pointer data-checked:bg-(--primary) data-checked:border-(--primary) data-checked:text-(--on-primary)"
          />
          <span className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
            <strong>2. </strong>
            {isEn
              ? 'I commit to keeping up with routine vaccinations, deworming, and prompt veterinary care.'
              : 'Tôi cam kết tiêm phòng nhắc lại định kỳ, tẩy giun và đưa bé đi thú y kịp thời khi có dấu hiệu ốm đau.'}
          </span>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] cursor-pointer select-none hover:bg-[var(--surface-2)]/30 transition-colors">
          <Checkbox
            checked={formData.commit3}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, commit3: Boolean(checked) }))
            }
            className="mt-1 shrink-0 cursor-pointer data-checked:bg-(--primary) data-checked:border-(--primary) data-checked:text-(--on-primary)"
          />
          <span className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
            <strong>3. </strong>
            {isEn
              ? 'I agree to share occasional photos or video updates with Animora during the first 6 months.'
              : 'Tôi đồng ý chia sẻ hình ảnh/video cập nhật tình hình hòa nhập của bé cho Animora trong 6 tháng đầu.'}
          </span>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] cursor-pointer select-none hover:bg-[var(--surface-2)]/30 transition-colors">
          <Checkbox
            checked={formData.commit4}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, commit4: Boolean(checked) }))
            }
            className="mt-1 shrink-0 cursor-pointer data-checked:bg-(--primary) data-checked:border-(--primary) data-checked:text-(--on-primary)"
          />
          <span className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
            <strong>4. </strong>
            {isEn
              ? 'I confirm that all information provided above is completely truthful, voluntary, and accurate.'
              : 'Tôi xác nhận mọi thông tin cung cấp ở trên là hoàn toàn chính xác và xuất phát từ thiện chí tự nguyện.'}
          </span>
        </label>

        {errors.commitments && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.commitments}
          </p>
        )}
      </div>

      {/* Step 3 Actions */}
      <div className="pt-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrevStep}
          className="btn-secondary px-6 py-3 cursor-pointer text-sm"
        >
          {isEn ? '← Back' : '← Quay lại'}
        </button>
        <button
          type="submit"
          disabled={!allCommitmentsChecked || isSubmitting}
          className={`btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2 ${
            !allCommitmentsChecked || isSubmitting
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{isEn ? 'Submitting...' : 'Đang gửi hồ sơ...'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>{isEn ? 'Submit Adoption Application' : 'Gửi đơn đăng ký nhận nuôi'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
