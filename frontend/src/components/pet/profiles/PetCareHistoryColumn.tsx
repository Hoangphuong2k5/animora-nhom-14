import React from 'react';
import {
  AlertTriangle,
  CalendarCheck,
  Clock,
  Download,
  FileText,
  Lock,
  PawPrint,
  Pill,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Language } from '@/types';
import {
  CareRecord,
  CareRecordType,
  PetProfileEntity,
  formatDisplayDate,
  getCareRecordStatusBadge,
  sortAndGroupCareRecords,
} from '@/data/petProfilesData';
import type { MedicalRecord, Prescription } from '@/types/expert.type';
import { MEDICINE_CATALOG } from '@/data/medicineCatalog';

interface PetCareHistoryColumnProps {
  lang: Language;
  activePet: PetProfileEntity;
  referenceNow: Date;
  careFilter: 'all' | CareRecordType;
  petRecordsCount: number;
  filteredRecordsCount: number;
  groupedByYear: ReturnType<typeof sortAndGroupCareRecords>['groupedByYear'];
  showYearGroups: boolean;
  isEmailReminderOn: boolean;
  medicalRecords?: MedicalRecord[];
  prescriptions?: Prescription[];
  onChangeFilter: (filter: 'all' | CareRecordType) => void;
  onDownloadAttachment: (rec: CareRecord) => void;
  onToggleEmailReminder: () => void;
  onExportPdf: () => void;
  onRefillPrescription?: (prescription: Prescription) => void;
  onBookRevisit?: () => void;
}

function getCareTypeIcon(type: CareRecordType) {
  switch (type) {
    case 'vaccine':
      return <Syringe className="w-5 h-5" />;
    case 'deworm':
      return <Pill className="w-5 h-5" />;
    case 'checkup':
      return <Stethoscope className="w-5 h-5" />;
    case 'spa':
      return <Sparkles className="w-5 h-5" />;
  }
}

export const PetCareHistoryColumn = ({
  lang,
  activePet,
  referenceNow,
  careFilter,
  petRecordsCount,
  filteredRecordsCount,
  groupedByYear,
  showYearGroups,
  isEmailReminderOn,
  medicalRecords = [],
  prescriptions = [],
  onChangeFilter,
  onDownloadAttachment,
  onToggleEmailReminder,
  onExportPdf,
  onRefillPrescription,
  onBookRevisit,
}: PetCareHistoryColumnProps) => {
  return (
    <div className="lg:col-span-7 w-full flex flex-col justify-between space-y-6">
      {/* 1. Lịch sử tiêm chủng, khám bệnh & chăm sóc (Chỉ xem) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4
            className="font-heading text-[24px] font-bold leading-snug"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi'
              ? 'Sổ sức khỏe & Lịch sử khám'
              : 'Health record & care history'}
          </h4>

          <span
            className="px-3 py-1.5 rounded-full text-[12px] font-bold border inline-flex items-center gap-1.5"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>
              {lang === 'vi'
                ? 'Chỉ xem • Bác sĩ cập nhật'
                : 'Read-only • Doctor updated'}
            </span>
          </span>
        </div>

        <Tabs
          value={careFilter}
          onValueChange={(val) => {
            if (val) onChangeFilter(val as 'all' | CareRecordType);
          }}
        >
          <TabsList
            aria-label={
              lang === 'vi' ? 'Lọc lịch sử chăm sóc' : 'Filter care history'
            }
            className="h-auto! flex-wrap items-center justify-start gap-2 bg-transparent p-0"
          >
            {(
              [
                { id: 'all', vi: 'Tất cả', en: 'All' },
                { id: 'vaccine', vi: 'Tiêm phòng', en: 'Vaccines' },
                { id: 'deworm', vi: 'Tẩy giun', en: 'Deworming' },
                { id: 'checkup', vi: 'Khám bệnh', en: 'Checkups' },
                { id: 'spa', vi: 'Chăm sóc', en: 'Grooming' },
              ] as const
            ).map((chip) => (
              <TabsTrigger
                key={chip.id}
                value={chip.id}
                data-testid={`care-filter-chip-${chip.id}`}
                className="h-9 px-3.5 rounded-full text-[13px] font-bold border border-(--border) bg-(--surface-2) text-(--text) data-active:bg-(--primary)! data-active:text-(--on-primary)! data-active:border-(--primary)! shadow-none transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
              >
                {lang === 'vi' ? chip.vi : chip.en}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {petRecordsCount === 0 ? (
          <div
            data-testid="pet-care-empty-zero"
            className="p-8 rounded-2xl border text-center space-y-3"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
              style={{
                backgroundColor: 'var(--surface-2)',
                color: 'var(--primary)',
              }}
            >
              <PawPrint className="w-6 h-6" />
            </div>
            <p
              className="text-[16px] font-bold max-w-md mx-auto"
              style={{ color: 'var(--text)' }}
            >
              {lang === 'vi'
                ? `Chưa có lịch sử khám cho ${activePet.name}. Sổ sức khỏe sẽ tự động cập nhật sau khi Bác sĩ hoàn tất thăm khám.`
                : `No health history yet for ${activePet.name}. Records update automatically after veterinary visits.`}
            </p>
            {onBookRevisit && (
              <button
                type="button"
                onClick={onBookRevisit}
                className="btn-primary px-5 py-2.5 text-[14px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{lang === 'vi' ? 'Đặt lịch khám ngay' : 'Book checkup'}</span>
              </button>
            )}
          </div>
        ) : filteredRecordsCount === 0 ? (
          <div
            className="p-6 rounded-2xl border text-center space-y-2"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>
              {lang === 'vi'
                ? 'Không có mục nào trong phân loại này.'
                : 'No records in this category.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedByYear.map((group) => (
              <div key={group.year} className="space-y-2.5">
                {showYearGroups && (
                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className="text-[12px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        color: 'var(--text)',
                      }}
                    >
                      {lang === 'vi' ? `Năm ${group.year}` : `Year ${group.year}`}
                    </span>
                    <div
                      className="h-px flex-1"
                      style={{ backgroundColor: 'var(--border)' }}
                    />
                  </div>
                )}

                {group.items.map((rec) => {
                  const badge = getCareRecordStatusBadge(
                    rec,
                    lang,
                    referenceNow
                  );
                  const displayTitle =
                    lang === 'en' && rec.nameEn ? rec.nameEn : rec.name;
                  const displayNotes =
                    lang === 'en' && rec.notesEn ? rec.notesEn : rec.notes;

                  return (
                    <div
                      key={rec.id}
                      data-testid={`care-record-row-${rec.id}`}
                      className="group p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all hover:shadow-sm"
                      style={{
                        backgroundColor: 'var(--bg)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: 'var(--surface-2)',
                            color: 'var(--primary)',
                          }}
                        >
                          {getCareTypeIcon(rec.type)}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <p
                            className="text-[16px] font-bold leading-snug"
                            style={{ color: 'var(--text)' }}
                          >
                            {displayTitle}
                          </p>

                          <div
                            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <span className="tabular-nums">
                              {lang === 'vi' ? 'Thực hiện: ' : 'Date: '}
                              {formatDisplayDate(rec.date, lang)}
                            </span>
                            {rec.nextDueDate && (
                              <span className="tabular-nums font-semibold">
                                · {lang === 'vi' ? 'Hẹn tiếp: ' : 'Next due: '}
                                {formatDisplayDate(rec.nextDueDate, lang)}
                              </span>
                            )}
                          </div>

                          {displayNotes && (
                            <p
                              className="text-[14px] leading-snug"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {displayNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        {badge.variant === 'done' && (
                          <span
                            data-testid={`care-status-pill-${rec.id}`}
                            className="px-3 py-1 rounded-full text-[13px] font-bold bg-[#F4B6C2] text-[#3A0F1B]"
                          >
                            {badge.label}
                          </span>
                        )}
                        {badge.variant === 'upcoming' && (
                          <span
                            data-testid={`care-status-pill-${rec.id}`}
                            className="px-3 py-1 rounded-full text-[13px] font-bold bg-[#FFD2C9] text-[#3A0F1B] inline-flex items-center gap-1"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{badge.label}</span>
                          </span>
                        )}
                        {badge.variant === 'overdue' && (
                          <span
                            data-testid={`care-status-pill-${rec.id}`}
                            className="px-3 py-1 rounded-full text-[13px] font-bold bg-[#C2410C] text-white"
                          >
                            {badge.label}
                          </span>
                        )}

                        {rec.attachmentUrl && (
                          <button
                            type="button"
                            onClick={() => onDownloadAttachment(rec)}
                            aria-label={
                              lang === 'vi'
                                ? `Tải đính kèm ${displayTitle}`
                                : `Download attachment for ${displayTitle}`
                            }
                            className="px-2.5 py-1 rounded-lg text-[12px] font-bold border inline-flex items-center gap-1 hover:bg-[var(--surface-2)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                            style={{
                              borderColor: 'var(--border)',
                              color: 'var(--text)',
                              backgroundColor: 'var(--surface)',
                            }}
                          >
                            <Download className="w-3 h-3" />
                            <span>
                              {lang === 'vi' ? 'Tải đính kèm' : 'Download'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Đơn thuốc từ Bác sĩ & Mua lại thuốc theo đơn từ Shop */}
      <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h5
            className="font-heading text-[20px] font-bold flex items-center gap-2"
            style={{ color: 'var(--text)' }}
          >
            <Pill className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <span>
              {lang === 'vi'
                ? 'Đơn thuốc của Bác sĩ & Mua lại từ Shop'
                : 'Doctor Prescriptions & Shop Refills'}
            </span>
          </h5>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            {prescriptions.length} {lang === 'vi' ? 'đơn thuốc' : 'prescriptions'}
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <div
            className="p-4 rounded-2xl border text-xs"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {lang === 'vi'
              ? `Bé ${activePet.name} hiện chưa có đơn thuốc nào do Bác sĩ kê.`
              : `No prescriptions issued for ${activePet.name} yet.`}
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((rx) => {
              const remaining = Math.max(0, rx.refillsAllowed - rx.refillsUsed);
              const isSevere = rx.severity === 'severe';
              const isExhausted = !isSevere && remaining === 0;
              const linkedRecord = medicalRecords.find(
                (m) => m.id === rx.medicalRecordId || m.prescriptionId === rx.id
              );

              return (
                <div
                  key={rx.id}
                  data-testid={`pet-prescription-card-${rx.code}`}
                  className="p-4 rounded-2xl border space-y-3"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-extrabold text-sm"
                        style={{ color: 'var(--primary)' }}
                      >
                        {rx.code}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isSevere
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                        }`}
                      >
                        {isSevere
                          ? lang === 'vi'
                            ? 'Bệnh nặng (Khám lại trực tiếp)'
                            : 'Severe (Revisit required)'
                          : lang === 'vi'
                          ? `Bệnh nhẹ • Còn ${remaining}/${rx.refillsAllowed} lượt mua lại`
                          : `Mild • ${remaining}/${rx.refillsAllowed} refills left`}
                      </span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {formatDisplayDate(rx.issuedAt, lang)}
                    </span>
                  </div>

                  <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                    {lang === 'vi' ? 'Chẩn đoán: ' : 'Diagnosis: '}
                    {rx.diagnosis}
                  </div>

                  {linkedRecord && (
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {lang === 'vi' ? 'Triệu chứng ghi nhận: ' : 'Symptoms: '}
                      {linkedRecord.symptoms}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {rx.lines.map((line, i) => {
                      const med = MEDICINE_CATALOG.find((m) => m.id === line.medicineId);
                      return (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl border flex items-start justify-between gap-2 text-xs"
                          style={{
                            backgroundColor: 'var(--surface-2)',
                            borderColor: 'var(--border)',
                          }}
                        >
                          <div>
                            <div className="font-bold" style={{ color: 'var(--text)' }}>
                              {med?.name || line.medicineId}
                            </div>
                            <div style={{ color: 'var(--text-muted)' }}>
                              {line.dosage} • {line.days} {lang === 'vi' ? 'ngày' : 'days'} — {line.instruction}
                            </div>
                          </div>
                          {med && (
                            <span className="font-extrabold shrink-0" style={{ color: 'var(--primary)' }}>
                              {med.price.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {rx.note && (
                    <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                      {rx.note}
                    </p>
                  )}

                  {/* Refill Action / Revisit Warning */}
                  {isSevere ? (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-700 dark:text-rose-300">
                      <div className="flex items-start gap-2 font-semibold">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          {lang === 'vi'
                            ? 'Bệnh nặng bắt buộc tái khám trực tiếp để Bác sĩ kiểm tra và kê đơn thuốc mới.'
                            : 'Severe illness requires an in-clinic revisit for a new prescription.'}
                        </span>
                      </div>
                      {onBookRevisit && (
                        <button
                          type="button"
                          onClick={onBookRevisit}
                          className="px-3.5 py-1.5 rounded-full font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shrink-0"
                        >
                          {lang === 'vi' ? 'Đặt lịch tái khám' : 'Book revisit'}
                        </button>
                      )}
                    </div>
                  ) : isExhausted ? (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <div className="flex items-start gap-2 font-semibold">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          {lang === 'vi'
                            ? 'Đơn thuốc đã hết lượt mua lại (không gia hạn từ xa). Vui lòng đặt lịch khám mới.'
                            : 'No refills remaining (remote renewal is not allowed). Please book a new appointment.'}
                        </span>
                      </div>
                      {onBookRevisit && (
                        <button
                          type="button"
                          onClick={onBookRevisit}
                          className="px-3.5 py-1.5 rounded-full font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] cursor-pointer shrink-0"
                        >
                          {lang === 'vi' ? 'Đặt lịch khám mới' : 'Book new exam'}
                        </button>
                      )}
                    </div>
                  ) : (
                    onRefillPrescription && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          data-testid={`refill-prescription-btn-${rx.code}`}
                          onClick={() => onRefillPrescription(rx)}
                          className="btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'vi'
                              ? `Mua lại thuốc theo đơn từ Shop (còn ${remaining} lượt)`
                              : `Refill prescription from Shop (${remaining} left)`}
                          </span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div
        className="pt-5 mt-4 border-t flex flex-wrap items-center justify-between gap-4"
        style={{ borderColor: 'var(--border)' }}
      >
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={isEmailReminderOn}
            data-testid="pet-email-reminder-toggle"
            onClick={onToggleEmailReminder}
            className="w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
            style={{
              backgroundColor: isEmailReminderOn
                ? 'var(--primary)'
                : 'var(--border)',
            }}
          >
            <span
              className="block w-5 h-5 rounded-full transition-transform shadow-sm"
              style={{
                backgroundColor: isEmailReminderOn
                  ? 'var(--on-primary)'
                  : 'var(--surface)',
                transform: isEmailReminderOn
                  ? 'translateX(20px)'
                  : 'translateX(0px)',
              }}
            />
          </button>
          <span className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>
            {lang === 'vi' ? 'Nhắc lịch qua email' : 'Email reminders'}
          </span>
        </label>

        <button
          type="button"
          data-testid="pet-export-pdf-btn"
          onClick={onExportPdf}
          className="btn-secondary px-5 py-2.5 text-[14px] font-bold inline-flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
        >
          <FileText className="w-4 h-4" />
          <span>{lang === 'vi' ? 'Xuất hồ sơ PDF' : 'Export PDF'}</span>
        </button>
      </div>
    </div>
  );
};
