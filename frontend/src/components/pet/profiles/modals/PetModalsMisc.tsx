import React, { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Language } from '@/types';
import { PetProfileEntity, offsetDaysIso } from '@/data/petProfilesData';

interface DeleteCareRecordDialogProps {
  open: boolean;
  lang: Language;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export const DeleteCareRecordDialog = ({
  open,
  lang,
  onOpenChange,
  onConfirmDelete,
}: DeleteCareRecordDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        aria-label={lang === 'vi' ? 'Xác nhận xóa' : 'Confirm delete'}
        className="animora-card data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-sm p-6 gap-4 text-center max-h-[92vh] overflow-y-auto scrollbar-thin"
      >
        <div
          className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface-2)', color: '#C2410C' }}
        >
          <Trash2 className="w-6 h-6" />
        </div>
        <AlertDialogTitle
          className="font-heading text-xl font-bold text-center"
          style={{ color: 'var(--text)' }}
        >
          {lang === 'vi'
            ? 'Xóa mục lịch sử chăm sóc?'
            : 'Delete this care record?'}
        </AlertDialogTitle>
        <AlertDialogDescription
          className="text-[14px] text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          {lang === 'vi'
            ? 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa mục này khỏi sổ sức khỏe của bé?'
            : 'This action cannot be undone. Are you sure you want to delete this record?'}
        </AlertDialogDescription>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="btn-secondary px-5 py-2 text-[14px] font-bold cursor-pointer"
          >
            {lang === 'vi' ? 'Hủy' : 'Cancel'}
          </button>
          <button
            type="button"
            data-testid="confirm-delete-record-btn"
            onClick={onConfirmDelete}
            className="px-5 py-2 rounded-full text-[14px] font-bold bg-[#C2410C] text-white hover:opacity-90 cursor-pointer"
          >
            {lang === 'vi' ? 'Xóa' : 'Delete'}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface ReminderQuickBookModalProps {
  lang: Language;
  activePet: PetProfileEntity;
  serviceName: string | null;
  onChangeServiceName: (val: string) => void;
  onClose: () => void;
  onSubmitBooking: (customerName: string, phone: string, date: string) => void;
}

function ReminderQuickBookFormInner({
  lang,
  activePet,
  serviceName,
  onChangeServiceName,
  onClose,
  onSubmitBooking,
}: {
  lang: Language;
  activePet: PetProfileEntity;
  serviceName: string;
  onChangeServiceName: (val: string) => void;
  onClose: () => void;
  onSubmitBooking: (customerName: string, phone: string, date: string) => void;
}) {
  const [bookingCustomerName, setBookingCustomerName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  // Ngày mặc định chỉ tính sau khi component đã mount ở trình duyệt
  // (gọi new Date() lúc render sẽ làm Next.js chặn prerender).
  useEffect(() => {
    setBookingDate(offsetDaysIso(2, new Date()));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitBooking(bookingCustomerName, bookingPhone, bookingDate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="space-y-1">
        <label
          className="text-[13px] font-bold block"
          style={{ color: 'var(--text)' }}
        >
          {lang === 'vi' ? 'Dịch vụ đã chọn' : 'Selected service'}
        </label>
        <input
          type="text"
          data-testid="booking-modal-preselected-service"
          value={serviceName}
          onChange={(e) => onChangeServiceName(e.target.value)}
          className="form-input w-full font-bold"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Họ và tên' : 'Your name'}
          </label>
          <input
            type="text"
            required
            value={bookingCustomerName}
            onChange={(e) => setBookingCustomerName(e.target.value)}
            placeholder={activePet.owner || 'Nguyễn Thảo Nhi'}
            className="form-input w-full"
          />
        </div>
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Số điện thoại' : 'Phone number'}
          </label>
          <input
            type="tel"
            required
            value={bookingPhone}
            onChange={(e) => setBookingPhone(e.target.value)}
            placeholder="0901 234 567"
            className="form-input w-full"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          className="text-[13px] font-bold block"
          style={{ color: 'var(--text)' }}
        >
          {lang === 'vi' ? 'Ngày hẹn' : 'Preferred date'}
        </label>
        <input
          type="date"
          required
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          className="form-input w-full"
        />
      </div>

      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary px-5 py-2.5 text-[14px] font-bold cursor-pointer"
        >
          {lang === 'vi' ? 'Hủy' : 'Cancel'}
        </button>
        <button
          type="submit"
          data-testid="booking-modal-submit-btn"
          className="btn-primary px-6 py-2.5 text-[14px] font-bold shadow-md cursor-pointer"
        >
          {lang === 'vi' ? 'Xác nhận đặt lịch' : 'Confirm booking'}
        </button>
      </div>
    </form>
  );
}

export const ReminderQuickBookModal = ({
  lang,
  activePet,
  serviceName,
  onChangeServiceName,
  onClose,
  onSubmitBooking,
}: ReminderQuickBookModalProps) => {
  return (
    <Dialog
      open={Boolean(serviceName)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-label={lang === 'vi' ? 'Đặt lịch chăm sóc' : 'Book appointment'}
        data-testid="pet-reminder-booking-modal"
        className="animora-card sm:max-w-md p-6 gap-4 max-h-[92vh] overflow-y-auto scrollbar-thin"
      >
        <button
          type="button"
          onClick={onClose}
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
          {lang === 'vi'
            ? `Đặt lịch cho bé ${activePet.name}`
            : `Book appointment for ${activePet.name}`}
        </DialogTitle>

        {serviceName !== null && (
          <ReminderQuickBookFormInner
            key={activePet.id}
            lang={lang}
            activePet={activePet}
            serviceName={serviceName}
            onChangeServiceName={onChangeServiceName}
            onClose={onClose}
            onSubmitBooking={onSubmitBooking}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

