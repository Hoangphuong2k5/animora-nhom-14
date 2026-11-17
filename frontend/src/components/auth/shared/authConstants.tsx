import React from 'react';
import { CONTACT_INFO } from '@/constants/contact.constant';

export const DEMO_OTP_CODE = '123456';
export const ANIMORA_LOGO_SRC = '/assets/images/animora_pet_logo_1793179870995.jpg';

export interface GmailQuickAccount {
  fullName: string;
  email: string;
  phone: string;
  badgeVi: string;
  badgeEn: string;
}

export const GMAIL_QUICK_ACCOUNTS: GmailQuickAccount[] = [
  {
    fullName: CONTACT_INFO.personName,
    email: CONTACT_INFO.email,
    phone: '0337203332',
    badgeVi: 'Tài khoản Gmail chính chủ',
    badgeEn: 'Primary Gmail Account',
  },
  {
    fullName: 'Nguyễn Minh Anh',
    email: 'minhanh.animora@gmail.com',
    phone: '0901234567',
    badgeVi: 'Thành viên Thân thiết',
    badgeEn: 'Loyalty Member',
  },
];

export const PET_SLIDES = [
  {
    id: 'corgi-smile',
    image: '/assets/aistudio/auth_corgi_centered.jpg',
    tagVi: 'Bé Corgi siêu đáng yêu',
    tagEn: 'Happy Corgi companion',
    captionVi:
      'Chăm sóc toàn diện cho hàng ngàn thú cưng cùng đội ngũ bác sĩ & chuyên gia tận tâm.',
    captionEn:
      'Comprehensive care for thousands of pets with trusted veterinary & spa specialists.',
    subVi: 'Đồng hành cùng bé cưng trên mọi hành trình sức khỏe và niềm vui.',
    subEn: 'Partnering with your furry family on every step of health and joy.',
    objectPosition: '50% 55%',
  },
  {
    id: 'golden-bow',
    image: '/assets/aistudio/auth_golden_centered.jpg',
    tagVi: 'Bé Golden thắt nơ nhung',
    tagEn: 'Golden Retriever puppy',
    captionVi:
      'Đặt lịch Spa, khám thú y và lưu sổ tiêm chủng điện tử cho bé cưng chỉ với 1 chạm.',
    captionEn:
      'Book grooming spa, vet checkups, and track digital vaccination records with 1 click.',
    subVi: 'Quyền lợi độc quyền và tích điểm đổi quà thành viên Animora Club.',
    subEn: 'Exclusive perks and rewards for Animora Club pet parents.',
    objectPosition: '50% 50%',
  },
];

/** Official multi-color Google "G" SVG icon. */
export const GoogleLogoIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
    />
    <path
      fill="#FBBC05"
      d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.1 7.4 24 12 24z"
    />
  </svg>
);
