'use client';

import { Lock, PawPrint, Plus, Trash2, X, Sparkles } from 'lucide-react';
import { Pet, Vaccination, Language, Booking, UserAccount } from '@/types';
import type { Prescription } from '@/types/expert.type';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { usePetProfilesState } from '@/hooks/pet/usePetProfilesState';
import { PetSelectorStrip } from './profiles/PetSelectorStrip';
import { PetReminderBanner } from './profiles/PetReminderBanner';
import { PetOverviewColumn } from './profiles/PetOverviewColumn';
import { PetCareHistoryColumn } from './profiles/PetCareHistoryColumn';
import { AddPetModal } from './profiles/modals/AddPetModal';
import { EditPetModal } from './profiles/modals/EditPetModal';
import { WeightHistoryModal } from './profiles/modals/WeightHistoryModal';
import {
  DeleteCareRecordDialog,
  ReminderQuickBookModal,
} from './profiles/modals/PetModalsMisc';
import { CareRecordFormModal } from './profiles/modals/CareRecordFormModal';

interface PetProfilesProps {
  lang: Language;
  currentUser?: UserAccount | null;
  isDemoMode?: boolean;
  onExitDemoMode?: () => void;
  onLogin?: () => void;
  pets?: Pet[];
  vaccinations?: Vaccination[];
  onUpdatePet?: (updatedPet: Pet, updatedVaccinations: Vaccination[]) => void;
  onAddPet?: (newPet: Pet, newVaccinations: Vaccination[]) => void;
  onDeletePet?: (petId: string) => void;
  onOpenDetail?: () => void;
  onBookService?: (serviceName: string) => void;
  onAddBooking?: (booking: Booking) => void;
  onRefillPrescription?: (prescription: Prescription) => void;
  onShowToast?: (text: string) => void;
}

export const PetProfiles = ({
  lang,
  isDemoMode,
  onExitDemoMode,
  onLogin,
  onUpdatePet,
  onAddPet,
  onDeletePet,
  onOpenDetail,
  onBookService,
  onAddBooking,
  onRefillPrescription,
  onShowToast,
}: PetProfilesProps) => {
  const state = usePetProfilesState({
    lang,
    onUpdatePet,
    onAddPet,
    onDeletePet,
    onBookService,
    onAddBooking,
    onShowToast,
  });

  return (
    <section
      id="pet-profiles"
      data-testid="pet-profiles-section"
      className="pt-[96px] pb-16 lg:pb-24 relative"
    >
      <div className="shared-container space-y-8">
        {isDemoMode && (
          <div
            data-testid="pet-profiles-demo-banner"
            className="rounded-2xl border p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold shadow-sm"
            style={{
              backgroundColor: 'rgba(255, 127, 107, 0.08)',
              borderColor: 'var(--coral)',
              color: 'var(--text)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--coral)' }} />
              <span>
                {lang === 'vi'
                  ? 'Bạn đang trải nghiệm giao diện mẫu với dữ liệu mô phỏng. Hãy đăng nhập để lưu trữ sổ sức khỏe thực tế của bé cưng.'
                  : 'You are viewing sample pet profiles in demo mode. Sign in to save real health records for your pets.'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onLogin && (
                <button
                  type="button"
                  onClick={onLogin}
                  className="btn-primary px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer"
                >
                  {lang === 'vi' ? 'Đăng nhập ngay' : 'Sign in'}
                </button>
              )}
              {onExitDemoMode && (
                <button
                  type="button"
                  onClick={onExitDemoMode}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {lang === 'vi' ? 'Đóng chế độ mẫu' : 'Exit demo'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <span
              data-testid="pet-profiles-eyebrow"
              className="block uppercase font-bold"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--primary)',
              }}
            >
              {lang === 'vi' ? 'HỒ SƠ THÚ CƯNG' : 'PET PROFILES'}
            </span>
            <h2
              data-testid="pet-profiles-title"
              className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: 'var(--primary)',
              }}
            >
              {lang === 'vi'
                ? 'Sổ sức khỏe của bé'
                : "Your pet's health record"}
            </h2>
            <p
              data-testid="pet-profiles-subtitle"
              className="text-[18px] leading-relaxed font-normal"
              style={{ color: 'var(--text-muted)' }}
            >
              {lang === 'vi'
                ? 'Theo dõi tiêm chủng, khám định kỳ và cân nặng của từng bé.'
                : 'Track vaccines, checkups and weight for each pet.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
            <div
              data-testid="pet-profiles-readonly-badge"
              className="px-4 py-2.5 rounded-full border text-xs font-bold inline-flex items-center gap-2"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--primary)',
              }}
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>
                {lang === 'vi'
                  ? 'Bệnh án do Bác sĩ cập nhật'
                  : 'Medical records by Vet'}
              </span>
            </div>

            <button
              type="button"
              data-testid="add-pet-btn"
              onClick={() => state.setIsAddPetModalOpen(true)}
              className="btn-primary px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>{lang === 'vi' ? 'Thêm thú cưng' : 'Add pet'}</span>
            </button>
          </div>
        </div>

        {!state.activePet ? (
          <div className="animora-card p-10 text-center space-y-4">
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--primary)',
              }}
            >
              <PawPrint className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3
                className="font-heading text-xl font-bold"
                style={{ color: 'var(--text)' }}
              >
                {lang === 'vi'
                  ? 'Chưa có hồ sơ thú cưng nào'
                  : 'No pet profiles yet'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi'
                  ? 'Hãy thêm hồ sơ thú cưng để theo dõi sức khỏe và đặt lịch nhanh hơn.'
                  : 'Add a pet profile to track health records and book faster.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => state.setIsAddPetModalOpen(true)}
              className="btn-primary px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Thêm thú cưng đầu tiên' : 'Add your first pet'}</span>
            </button>
          </div>
        ) : (
          <>
            <PetSelectorStrip
              lang={lang}
              profilesCount={state.profiles.length}
              visiblePets={state.visibleSelectorPets}
              activePetId={state.activePet.id}
              careRecords={state.careRecords}
              referenceNow={state.referenceNow}
              petSearchQuery={state.petSearchQuery}
              canScrollLeft={state.canScrollLeft}
              canScrollRight={state.canScrollRight}
              selectorScrollerRef={state.selectorScrollerRef}
              pillRefs={state.pillRefs}
              onScrollEdges={state.updateSelectorScrollEdges}
              onSelectPet={state.handleSelectPet}
              onChangeSearch={state.setPetSearchQuery}
            />

            <div
              data-testid="pet-profile-card"
              className="animora-card p-6 sm:p-8 space-y-7"
              style={{
                opacity: state.isCrossfading ? 0.35 : 1,
                transition: 'opacity 0.25s ease',
              }}
            >
              <PetReminderBanner
                lang={lang}
                nearestReminder={state.nearestReminder}
                medicationReminders={state.medicationReminders}
                onBookReminder={state.handleOpenReminderBooking}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <PetOverviewColumn
                  lang={lang}
                  activePet={state.activePet}
                  weightTrend={state.weightTrend}
                  nextCheckupDays={state.nextCheckupDays}
                  hasVaccinationHistory={state.petRecords.some(
                    (r) => r.type === 'vaccine'
                  )}
                  onOpenWeightModal={() => state.setIsWeightModalOpen(true)}
                  onEditPet={() => state.setIsEditPetModalOpen(true)}
                  onDeletePet={() => state.setIsDeletePetModalOpen(true)}
                />

                <PetCareHistoryColumn
                  lang={lang}
                  activePet={state.activePet}
                  referenceNow={state.referenceNow}
                  careFilter={state.careFilter}
                  petRecordsCount={state.petRecords.length}
                  filteredRecordsCount={state.filteredRecords.length}
                  groupedByYear={state.groupedByYear}
                  showYearGroups={state.showYearGroups}
                  isEmailReminderOn={state.isEmailReminderOn}
                  medicalRecords={state.syncedMedicalRecords}
                  prescriptions={state.syncedPrescriptions}
                  onChangeFilter={state.setCareFilter}
                  onDownloadAttachment={state.handleDownloadAttachment}
                  onToggleEmailReminder={state.handleToggleEmailReminder}
                  onExportPdf={state.handleExportPdf}
                  onRefillPrescription={onRefillPrescription}
                  onBookRevisit={() =>
                    onBookService
                      ? onBookService(
                        lang === 'vi' ? 'Khám tổng quát' : 'General Checkup'
                      )
                      : state.setBookingModalService(
                        lang === 'vi' ? 'Khám tổng quát' : 'General Checkup'
                      )
                  }
                />
              </div>
            </div>
          </>
        )}

        {onOpenDetail && (
          <div className="text-center pt-2">
            <button
              type="button"
              data-testid="home-cta-pet-profiles"
              onClick={onOpenDetail}
              className="btn-secondary px-7 py-3 text-[15px] font-bold cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            >
              {lang === 'vi'
                ? 'Mở trang Sổ sức khỏe & Chuyên gia dinh dưỡng hàng ngày →'
                : 'Open Full Health Record & Daily Nutrition Planner →'}
            </button>
          </div>
        )}
      </div>

      <AddPetModal
        open={state.isAddPetModalOpen}
        lang={lang}
        onOpenChange={state.setIsAddPetModalOpen}
        onAddNewPet={state.saveNewPet}
      />

      {state.activePet && (
        <>
          <EditPetModal
            open={state.isEditPetModalOpen}
            lang={lang}
            activePet={state.activePet}
            onOpenChange={state.setIsEditPetModalOpen}
            onSaveEditPet={state.saveEditPet}
          />

          <Dialog
            open={state.isDeletePetModalOpen}
            onOpenChange={state.setIsDeletePetModalOpen}
          >
            <DialogContent
              showCloseButton={false}
              aria-label={lang === 'vi' ? 'Xác nhận xóa hồ sơ' : 'Confirm delete profile'}
              className="animora-card sm:max-w-md p-6 gap-4"
            >
              <button
                type="button"
                onClick={() => state.setIsDeletePetModalOpen(false)}
                aria-label={lang === 'vi' ? 'Đóng' : 'Close'}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--surface-2)] cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>

              <DialogTitle
                className="font-heading text-xl font-bold flex items-center gap-2 pr-8"
                style={{ color: 'var(--text)' }}
              >
                <Trash2 className="w-5 h-5 text-rose-500 shrink-0" />
                <span>
                  {lang === 'vi'
                    ? `Xóa hồ sơ bé ${state.activePet.name}?`
                    : `Delete' ${state.activePet.name}'s profile?`}
                </span>
              </DialogTitle>

              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi'
                  ? `Hồ sơ và lịch sử cân nặng, nhắc lịch của bé ${state.activePet.name} sẽ bị xóa khỏi danh sách thú cưng của bạn.`
                  : `${state.activePet.name}'s profile, weight logs, and reminders will be removed from your pet list.`}
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => state.setIsDeletePetModalOpen(false)}
                  className="btn-secondary px-5 py-2.5 text-sm font-bold cursor-pointer"
                >
                  {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="button"
                  data-testid="confirm-delete-pet-btn"
                  onClick={() => state.deletePet(state.activePet.id)}
                  className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md cursor-pointer transition-colors"
                >
                  {lang === 'vi' ? 'Xóa hồ sơ' : 'Delete profile'}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <WeightHistoryModal
            open={state.isWeightModalOpen}
            lang={lang}
            activePet={state.activePet}
            weightTrend={state.weightTrend}
            readOnly={false}
            onOpenChange={state.setIsWeightModalOpen}
            onAddWeightLog={state.addWeightLog}
          />

          <ReminderQuickBookModal
            lang={lang}
            activePet={state.activePet}
            serviceName={state.bookingModalService}
            onChangeServiceName={state.setBookingModalService}
            onClose={() => state.setBookingModalService(null)}
            onSubmitBooking={state.submitReminderBooking}
          />

          <CareRecordFormModal
            open={state.isCareModalOpen}
            lang={lang}
            activePet={state.activePet}
            editingRecord={state.editingCareRecord}
            defaultType={state.careModalDefaultType}
            onOpenChange={state.setIsCareModalOpen}
            onSaveRecord={state.saveCareRecord}
          />

          <DeleteCareRecordDialog
            open={Boolean(state.deletingRecordId)}
            lang={lang}
            onOpenChange={(open) => {
              if (!open) state.setDeletingRecordId(null);
            }}
            onConfirmDelete={state.handleConfirmDeleteRecord}
          />
        </>
      )}
    </section>
  );
};
