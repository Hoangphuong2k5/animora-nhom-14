import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Language } from '@/types';
import {
  CareRecord,
  CareRecordType,
  PetProfileEntity,
  computeDaysFromToday,
  offsetDaysIso,
  toLocalIsoDate,
  validateCareRecordInput,
} from '@/data/petProfilesData';

interface CareRecordFormModalProps {
  open: boolean;
  lang: Language;
  activePet: PetProfileEntity;
  editingRecord: CareRecord | null;
  defaultType: CareRecordType;
  onOpenChange: (open: boolean) => void;
  onSaveRecord: (record: CareRecord, isEdit: boolean) => void;
}

function CareRecordFormInner({
  lang,
  activePetId,
  editingRecord,
  defaultType,
  onCancel,
  onSaveRecord,
}: {
  lang: Language;
  activePetId: string;
  editingRecord: CareRecord | null;
  defaultType: CareRecordType;
  onCancel: () => void;
  onSaveRecord: (record: CareRecord, isEdit: boolean) => void;
}) {
  const [careType, setCareType] = useState<CareRecordType>(
    editingRecord ? editingRecord.type : defaultType
  );
  const [careName, setCareName] = useState(
    editingRecord
      ? lang === 'en' && editingRecord.nameEn
        ? editingRecord.nameEn
        : editingRecord.name
      : ''
  );
  const [careDate, setCareDate] = useState(
    editingRecord ? editingRecord.date : toLocalIsoDate(new Date())
  );
  const [careNextDue, setCareNextDue] = useState(
    editingRecord
      ? editingRecord.nextDueDate || ''
      : offsetDaysIso(30, new Date())
  );
  const [careNotes, setCareNotes] = useState(
    editingRecord
      ? lang === 'en' && editingRecord.notesEn
        ? editingRecord.notesEn
        : editingRecord.notes || ''
      : ''
  );
  const [careAttachmentName, setCareAttachmentName] = useState(
    editingRecord?.attachmentName || ''
  );
  const [careAttachmentSize, setCareAttachmentSize] = useState(0);
  const [careAttachmentType, setCareAttachmentType] = useState('');
  const [careFormError, setCareFormError] = useState('');

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCareAttachmentName('');
      setCareAttachmentSize(0);
      setCareAttachmentType('');
      return;
    }
    setCareAttachmentName(file.name);
    setCareAttachmentSize(file.size);
    setCareAttachmentType(file.type);
    setCareFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCareRecordInput({
      type: careType,
      name: careName,
      date: careDate,
      nextDueDate: careNextDue,
      fileSize: careAttachmentSize,
      fileType: careAttachmentType,
    });

    if (!validation.valid) {
      setCareFormError(
        lang === 'vi'
          ? validation.errorVi || 'Thông tin không hợp lệ.'
          : validation.errorEn || 'Invalid input.'
      );
      return;
    }

    const diff = computeDaysFromToday(careNextDue, new Date());
    const computedStatus =
      diff === null
        ? 'done'
        : diff < 0
        ? 'overdue'
        : diff <= 60
        ? 'upcoming'
        : 'done';

    if (editingRecord) {
      const updatedRec: CareRecord = {
        ...editingRecord,
        type: careType,
        name: careName.trim(),
        nameEn: careName.trim(),
        date: careDate,
        nextDueDate: careNextDue.trim() || undefined,
        notes: careNotes.trim() || undefined,
        notesEn: careNotes.trim() || undefined,
        attachmentName: careAttachmentName || editingRecord.attachmentName,
        attachmentUrl: careAttachmentName
          ? `#attachment-${Date.now()}`
          : editingRecord.attachmentUrl,
        status: computedStatus,
      };
      onSaveRecord(updatedRec, true);
    } else {
      const newRec: CareRecord = {
        id: 'care-' + Date.now(),
        pet: activePetId,
        type: careType,
        name: careName.trim(),
        nameEn: careName.trim(),
        date: careDate,
        nextDueDate: careNextDue.trim() || undefined,
        notes: careNotes.trim() || undefined,
        notesEn: careNotes.trim() || undefined,
        attachmentName: careAttachmentName || undefined,
        attachmentUrl: careAttachmentName
          ? `#attachment-${Date.now()}`
          : undefined,
        status: computedStatus,
      };
      onSaveRecord(newRec, false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {careFormError && (
        <div
          role="alert"
          className="p-3 rounded-xl text-[14px] font-bold bg-[#C2410C] text-white"
        >
          {careFormError}
        </div>
      )}

      <div className="space-y-1">
        <label
          className="text-[13px] font-bold block"
          style={{ color: 'var(--text)' }}
        >
          {lang === 'vi' ? 'Loại *' : 'Type *'}
        </label>
        <Select
          value={careType}
          onValueChange={(val) => {
            if (val !== null) setCareType(val as CareRecordType);
          }}
          items={{
            vaccine: lang === 'vi' ? 'Tiêm phòng' : 'Vaccine',
            deworm: lang === 'vi' ? 'Tẩy giun' : 'Deworming',
            checkup: lang === 'vi' ? 'Khám bệnh' : 'Checkup',
            spa: lang === 'vi' ? 'Spa & chăm sóc' : 'Spa & grooming',
          }}
        >
          <SelectTrigger
            data-testid="care-modal-type"
            className="form-input w-full h-11! cursor-pointer"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-(--surface) border-(--border) text-(--text)">
            <SelectItem value="vaccine">
              {lang === 'vi' ? 'Tiêm phòng' : 'Vaccine'}
            </SelectItem>
            <SelectItem value="deworm">
              {lang === 'vi' ? 'Tẩy giun' : 'Deworming'}
            </SelectItem>
            <SelectItem value="checkup">
              {lang === 'vi' ? 'Khám bệnh' : 'Checkup'}
            </SelectItem>
            <SelectItem value="spa">
              {lang === 'vi' ? 'Spa & chăm sóc' : 'Spa & grooming'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label
          className="text-[13px] font-bold block"
          style={{ color: 'var(--text)' }}
        >
          {lang === 'vi' ? 'Tên mũi tiêm / dịch vụ chăm sóc *' : 'Record name *'}
        </label>
        <input
          type="text"
          data-testid="care-modal-name"
          value={careName}
          onChange={(e) => setCareName(e.target.value)}
          placeholder={
            lang === 'vi'
              ? 'VD: Vắc-xin 4 bệnh FVRCP, Tẩy giun Drontal...'
              : 'e.g. FVRCP Booster, Heartgard Plus...'
          }
          className="form-input w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Ngày thực hiện *' : 'Date performed *'}
          </label>
          <input
            type="date"
            data-testid="care-modal-date"
            value={careDate}
            onChange={(e) => setCareDate(e.target.value)}
            className="form-input w-full"
          />
        </div>

        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Ngày nhắc tiếp theo' : 'Next due date'}
          </label>
          <input
            type="date"
            data-testid="care-modal-next-due"
            value={careNextDue}
            onChange={(e) => setCareNextDue(e.target.value)}
            className="form-input w-full"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          className="text-[13px] font-bold block"
          style={{ color: 'var(--text)' }}
        >
          {lang === 'vi' ? 'Ghi chú' : 'Notes'}
        </label>
        <Textarea
          rows={2}
          data-testid="care-modal-notes"
          value={careNotes}
          onChange={(e) => setCareNotes(e.target.value)}
          placeholder={
            lang === 'vi'
              ? 'Ghi chú phản ứng sau tiêm, liều lượng hoặc lời dặn của bác sĩ...'
              : 'Notes on dosage, vet instructions, or reactions...'
          }
          className="form-input w-full min-h-[72px] h-auto! py-2.5"
        />
      </div>

      <div className="space-y-1">
        <label
          className="text-[13px] font-bold block"
          style={{ color: 'var(--text)' }}
        >
          {lang === 'vi'
            ? 'Đính kèm (Ảnh hoặc PDF, tối đa 5MB)'
            : 'Attachment (Image or PDF, max 5MB)'}
        </label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleAttachmentChange}
          className="block w-full text-[13px] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[13px] file:font-bold file:bg-[var(--surface-2)] file:text-[var(--text)] hover:file:opacity-90"
          style={{ color: 'var(--text-muted)' }}
        />
        {careAttachmentName && (
          <p
            className="text-[12px] font-semibold"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Đã chọn: ' : 'Selected: '}
            {careAttachmentName}
          </p>
        )}
      </div>

      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary px-5 py-2.5 text-[14px] font-bold cursor-pointer"
        >
          {lang === 'vi' ? 'Hủy' : 'Cancel'}
        </button>
        <button
          type="submit"
          data-testid="care-modal-submit-btn"
          className="btn-primary px-6 py-2.5 text-[14px] font-bold shadow-md cursor-pointer"
        >
          {lang === 'vi' ? 'Lưu lịch chăm sóc' : 'Save record'}
        </button>
      </div>
    </form>
  );
}

export const CareRecordFormModal = ({
  open,
  lang,
  activePet,
  editingRecord,
  defaultType,
  onOpenChange,
  onSaveRecord,
}: CareRecordFormModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-label={
          editingRecord
            ? lang === 'vi'
              ? 'Sửa lịch chăm sóc'
              : 'Edit care record'
            : lang === 'vi'
            ? 'Thêm mũi tiêm / lịch chăm sóc'
            : 'Add vaccine / care record'
        }
        className="animora-card sm:max-w-lg p-6 gap-4 max-h-[92vh] overflow-y-auto scrollbar-thin"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label={lang === 'vi' ? 'Đóng' : 'Close'}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--surface-2)] cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <DialogTitle
          className="font-heading text-2xl font-bold leading-snug pr-8"
          style={{ color: 'var(--text)' }}
        >
          {editingRecord
            ? lang === 'vi'
              ? `Sửa lịch chăm sóc (${activePet.name})`
              : `Edit care record (${activePet.name})`
            : lang === 'vi'
            ? `Thêm mũi tiêm / lịch chăm sóc (${activePet.name})`
            : `Add vaccine / care record (${activePet.name})`}
        </DialogTitle>

        {open && (
          <CareRecordFormInner
            key={`${activePet.id}-${editingRecord?.id || 'new'}-${defaultType}`}
            lang={lang}
            activePetId={activePet.id}
            editingRecord={editingRecord}
            defaultType={defaultType}
            onCancel={() => onOpenChange(false)}
            onSaveRecord={onSaveRecord}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

