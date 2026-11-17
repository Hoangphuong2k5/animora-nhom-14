import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Language } from '@/types';

interface TermsPrivacyDialogProps {
  lang: Language;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'terms' | 'privacy';
}

/** Modal dialog showing Animora Terms of Service or Privacy Policy. */
export const TermsPrivacyDialog = ({
  lang,
  open,
  onOpenChange,
  type,
}: TermsPrivacyDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg rounded-3xl bg-(--surface) border border-(--border) p-6 sm:p-8 gap-4 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin"
      >
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-(--border)">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-(--primary)" />
            <DialogTitle className="font-heading text-lg font-bold text-(--text)">
              {type === 'terms'
                ? lang === 'vi'
                  ? 'Điều khoản Dịch vụ Animora'
                  : 'Animora Terms of Service'
                : lang === 'vi'
                ? 'Chính sách Bảo mật Animora'
                : 'Animora Privacy Policy'}
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={lang === 'vi' ? 'Đóng' : 'Close'}
            className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text) hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="text-xs sm:text-[13px] leading-relaxed text-(--text-muted) space-y-3">
          {type === 'terms' ? (
            <>
              <p>
                {lang === 'vi'
                  ? '1. Chào mừng bạn đến với hệ sinh thái chăm sóc thú cưng toàn diện Animora. Khi đăng ký tài khoản, bạn đồng ý tuân thủ các quy tắc đặt lịch, dịch vụ chăm sóc và mua sắm trên nền tảng.'
                  : '1. Welcome to the Animora pet care ecosystem. By creating an account, you agree to comply with our booking, pet care, and marketplace policies.'}
              </p>
              <p>
                {lang === 'vi'
                  ? '2. Tất cả thông tin hồ sơ thú cưng, lịch tiêm chủng và bệnh án sẽ được lưu trữ an toàn để hỗ trợ bác sĩ thú y tư vấn chăm sóc chính xác nhất.'
                  : '2. All pet profiles, vaccination schedules, and medical notes are safely stored to assist licensed veterinarians in providing optimal care.'}
              </p>
              <p>
                {lang === 'vi'
                  ? '3. Bạn có quyền cập nhật, chỉnh sửa thông tin hoặc xóa tài khoản bất cứ lúc nào thông qua trang Quản lý tài khoản.'
                  : '3. You retain full control to modify personal information or request account deletion via your Account dashboard.'}
              </p>
            </>
          ) : (
            <>
              <p>
                {lang === 'vi'
                  ? '1. Animora cam kết bảo mật tuyệt đối thông tin cá nhân (Email, Số điện thoại, Địa chỉ) và không chia sẻ cho bên thứ ba vì mục đích thương mại.'
                  : '1. Animora is committed to safeguarding your personal data (Email, Phone, Shipping addresses) and will never sell your details to third parties.'}
              </p>
              <p>
                {lang === 'vi'
                  ? '2. Dữ liệu tài khoản Google OAuth chỉ được sử dụng để xác thực danh tính nhanh chóng và đồng bộ họ tên người nuôi thú cưng.'
                  : '2. Google OAuth credentials are exclusively used for seamless authentication and owner profile identity synchronization.'}
              </p>
              <p>
                {lang === 'vi'
                  ? '3. Kết nối mã hóa SSL/TLS tiêu chuẩn cao đảm bảo an toàn tuyệt đối cho mọi giao dịch đặt lịch và thanh toán dịch vụ.'
                  : '3. High-grade SSL/TLS encryption secures all appointments, transactions, and personal pet records.'}
              </p>
            </>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="btn-primary px-5 py-2.5 !rounded-xl text-xs font-bold cursor-pointer"
          >
            {lang === 'vi' ? 'Đã hiểu & Đồng ý' : 'I Understand & Agree'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
