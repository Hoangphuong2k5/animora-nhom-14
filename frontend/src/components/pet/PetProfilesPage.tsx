import { useState } from 'react';
import {
  Language,
  PageId,
  Pet,
  Vaccination,
  Booking,
  UserAccount,
} from '@/types';
import type { Prescription } from '@/types/expert.type';
import {
  PawPrint,
  ShieldCheck,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  User,
  UserPlus,
  Eye,
} from 'lucide-react';
import { PetProfiles } from './PetProfiles';

interface PetProfilesPageProps {
  lang: Language;
  currentUser?: UserAccount | null;
  pets: Pet[];
  vaccinations: Vaccination[];
  onUpdatePet: (updatedPet: Pet, updatedVaccinations: Vaccination[]) => void;
  onAddPet: (newPet: Pet, newVaccinations: Vaccination[]) => void;
  onDeletePet?: (petId: string) => void;
  onNavigate: (page: PageId) => void;
  onBookService?: (serviceName: string) => void;
  onAddBooking?: (booking: Booking) => void;
  onRefillPrescription?: (prescription: Prescription) => void;
  onShowToast?: (text: string) => void;
  onRequestLogin?: () => void;
}

export const PetProfilesPage = ({
  lang,
  currentUser = null,
  pets,
  vaccinations,
  onUpdatePet,
  onAddPet,
  onDeletePet,
  onNavigate,
  onBookService,
  onAddBooking,
  onRefillPrescription,
  onShowToast,
  onRequestLogin,
}: PetProfilesPageProps) => {
  const isVi = lang === 'vi';
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleLoginClick = () => {
    if (onRequestLogin) {
      onRequestLogin();
    } else {
      onNavigate('login');
    }
  };

  // 1. Guest Barrier: Khi khách chưa đăng nhập và chưa bật chế độ trải nghiệm mẫu
  if (!currentUser && !isDemoMode) {
    return (
      <div
        data-testid="page-pet-profiles-guest"
        className="min-h-screen pt-24 sm:pt-28 pb-20 shared-container space-y-10"
      >
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest"
            style={{
              backgroundColor: 'rgba(255, 127, 107, 0.12)',
              color: 'var(--coral)',
            }}
          >
            <PawPrint className="w-3.5 h-3.5" />
            <span>{isVi ? 'SỔ SỨC KHỎE ĐIỆN TỬ' : 'DIGITAL HEALTH RECORDS'}</span>
          </span>
          <h1
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight"
            style={{ color: 'var(--primary)' }}
          >
            {isVi ? 'Hồ sơ thú cưng Animora' : 'Animora Pet Profiles'}
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? 'Lưu trữ trọn đời lịch sử sức khỏe, theo dõi phác đồ tiêm chủng và đồng bộ kết quả khám bệnh từ bác sĩ thú y cho các bé cưng của bạn.'
              : 'Save lifelong health records, track vaccination schedules, and sync vet medical records directly for your pets.'}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          <div
            className="p-6 rounded-[24px] border space-y-3 shadow-sm transition-transform hover:-translate-y-1"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 127, 107, 0.12)',
                color: 'var(--coral)',
              }}
            >
              <PawPrint className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>
              {isVi ? 'Hồ sơ trọn đời' : 'Lifelong Profile'}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {isVi
                ? 'Lưu trữ thông tin chi tiết từng bé: giống loài, cân nặng, dị ứng, thói quen và hình ảnh kỷ niệm.'
                : 'Store details for each pet: breed, weight trend, allergies, habits, and gallery.'}
            </p>
          </div>

          <div
            className="p-6 rounded-[24px] border space-y-3 shadow-sm transition-transform hover:-translate-y-1"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(46, 125, 50, 0.12)',
                color: '#2e7d32',
              }}
            >
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>
              {isVi ? 'Sổ tiêm & Nhắc hẹn' : 'Vaccine Reminders'}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {isVi
                ? 'Tự động nhắc lịch tiêm vắc-xin, tẩy giun và khám sức khỏe định kỳ trước 7 ngày.'
                : 'Automated smart reminders for vaccine shots, deworming, and periodic checkups.'}
            </p>
          </div>

          <div
            className="p-6 rounded-[24px] border space-y-3 shadow-sm transition-transform hover:-translate-y-1"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(2, 136, 209, 0.12)',
                color: '#0288d1',
              }}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>
              {isVi ? 'Đồng bộ từ Bác sĩ' : 'Vet Synced Data'}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {isVi
                ? 'Bệnh án, đơn thuốc và kết quả xét nghiệm được Bác sĩ cập nhật tự động sau mỗi lần khám.'
                : 'Diagnosis records, prescriptions, and test results are directly updated by vets.'}
            </p>
          </div>

          <div
            className="p-6 rounded-[24px] border space-y-3 shadow-sm transition-transform hover:-translate-y-1"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(156, 39, 176, 0.12)',
                color: '#9c27b0',
              }}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>
              {isVi ? 'Đặt lịch 1 chạm' : '1-Click Booking'}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {isVi
                ? 'Tự động chọn bé cưng khi đặt lịch khám hoặc spa mà không cần nhập lại thông tin.'
                : 'Fast-select your saved pets for checkups and grooming without re-entering data.'}
            </p>
          </div>
        </div>

        {/* Action Panel */}
        <div
          className="max-w-xl mx-auto rounded-[28px] border p-8 text-center space-y-6 shadow-md"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-extrabold" style={{ color: 'var(--primary)' }}>
              {isVi ? 'Đăng nhập để bắt đầu quản lý' : 'Sign in to manage your pets'}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {isVi
                ? 'Tạo tài khoản miễn phí chỉ trong 30 giây để tận hưởng toàn bộ tiện ích chăm sóc thú cưng từ Animora.'
                : 'Create a free account in 30 seconds to access all pet health tools from Animora.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              data-testid="pet-guest-login-btn"
              onClick={handleLoginClick}
              className="w-full sm:w-auto btn-primary px-7 py-3 rounded-full text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <User className="w-4 h-4" />
              <span>{isVi ? 'Đăng nhập ngay' : 'Sign In Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              data-testid="pet-guest-register-btn"
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-7 py-3 rounded-full text-sm font-extrabold inline-flex items-center justify-center gap-2 border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isVi ? 'Tạo tài khoản mới' : 'Register New'}</span>
            </button>
          </div>

          {/* Demo preview mode trigger */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              data-testid="pet-guest-demo-mode-btn"
              onClick={() => setIsDemoMode(true)}
              className="text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer opacity-85 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--coral)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isVi ? 'Khám phá giao diện mẫu (Chế độ Demo)' : 'Preview with Sample Pets (Demo)'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Thành viên đã đăng nhập HOẶC Khách đang xem ở chế độ Demo
  return (
    <div data-testid="page-pet-profiles" className="pb-12">
      <PetProfiles
        lang={lang}
        currentUser={currentUser}
        isDemoMode={isDemoMode}
        onExitDemoMode={() => setIsDemoMode(false)}
        onLogin={handleLoginClick}
        pets={pets}
        vaccinations={vaccinations}
        onUpdatePet={onUpdatePet}
        onAddPet={onAddPet}
        onDeletePet={onDeletePet}
        onBookService={onBookService}
        onAddBooking={onAddBooking}
        onRefillPrescription={onRefillPrescription}
        onShowToast={onShowToast}
      />
    </div>
  );
};
