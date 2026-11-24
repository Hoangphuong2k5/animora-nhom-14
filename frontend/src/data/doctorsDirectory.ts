import type { Booking } from '@/types/animora.type';
import type { ServiceEntity } from './servicesData';
import { readVetStoreSnapshot } from '@/utils/clinicalSync';

export interface DoctorDirectoryItem {
  id: string;
  name: string;
  roleTitleVi: string;
  roleTitleEn: string;
  expertType: 'vet' | 'groomer' | 'trainer';
  avatar: string;
  specialtyVi: string;
  specialtyEn: string;
  experienceYears: number;
  baseRating: number;
  baseReviewCount: number;
  rating: number;
  reviewCount: number;
  completedCases: number;
  serviceCategories: Array<ServiceEntity['category']>;
  bioVi: string;
  bioEn: string;
}

const BASE_DOCTORS: Omit<DoctorDirectoryItem, 'rating' | 'reviewCount'>[] = [
  {
    id: 'exp-vet-01',
    name: 'BS. Lê Huy Hoàng',
    roleTitleVi: 'Bác sĩ Thú y Nội khoa & Phẫu thuật',
    roleTitleEn: 'Lead Veterinarian (Internal & Surgery)',
    expertType: 'vet',
    avatar:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    specialtyVi: 'Khám lâm sàng nội khoa, tiêm chủng, da liễu & nha khoa thú nhỏ',
    specialtyEn: 'Internal medicine, vaccinations, dermatology & small pet dental',
    experienceYears: 8,
    baseRating: 4.9,
    baseReviewCount: 64,
    completedCases: 142,
    serviceCategories: ['vet'],
    bioVi: 'Chuyên sâu khám lâm sàng 12 bước Fear-Free và điều trị bệnh lý chó, mèo, thú nhỏ.',
    bioEn: 'Specializes in Fear-Free 12-point exams and clinical treatment for dogs, cats & exotics.',
  },
  {
    id: 'st-1',
    name: 'BS. Nguyễn Thúc Hoàng Phương',
    roleTitleVi: 'Bác sĩ CKI Ngoại khoa & Chẩn đoán hình ảnh',
    roleTitleEn: 'Senior Vet Surgeon & Diagnostics',
    expertType: 'vet',
    avatar:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    specialtyVi: 'Siêu âm ổ bụng, ngoại khoa & nha khoa sóng siêu âm',
    specialtyEn: 'Abdominal ultrasound, surgery & ultrasonic dental scaling',
    experienceYears: 9,
    baseRating: 4.95,
    baseReviewCount: 86,
    completedCases: 168,
    serviceCategories: ['vet'],
    bioVi: 'Bác sĩ CKI với 9 năm kinh nghiệm chẩn đoán hình ảnh và nha khoa thú y.',
    bioEn: 'Senior specialist with 9 years in veterinary imaging and dentistry.',
  },
  {
    id: 'st-4',
    name: 'BS. Ngô Phước Toàn',
    roleTitleVi: 'Bác sĩ Nội khoa Thú nhỏ & Tiêm phòng',
    roleTitleEn: 'Small Pet & Exotic Veterinarian',
    expertType: 'vet',
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    specialtyVi: 'Tiêm chủng vaccine, tẩy giun & khám định kỳ thỏ, hamster, mèo',
    specialtyEn: 'Vaccination protocols, deworming & feline/exotic checkups',
    experienceYears: 6,
    baseRating: 4.8,
    baseReviewCount: 52,
    completedCases: 118,
    serviceCategories: ['vet'],
    bioVi: 'Nhẹ nhàng, tận tâm với các bé mèo và thú nhỏ nhạy cảm.',
    bioEn: 'Gentle Fear-Free care for cats, rabbits, and sensitive small pets.',
  },
  {
    id: 'exp-spa-01',
    name: 'Phan Thị Đình Thùy',
    roleTitleVi: 'Nhân viên chăm sóc thú cưng',
    roleTitleEn: 'Pet Care Staff',
    expertType: 'groomer',
    avatar:
      'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&auto=format&fit=crop&q=80',
    specialtyVi: 'Thực hiện toàn bộ dịch vụ chăm sóc: Tắm thảo mộc, Spa, Cắt tỉa lông & Vệ sinh cơ bản',
    specialtyEn: 'Full pet care services: Herbal bath, Spa, Grooming & Basic hygiene',
    experienceYears: 6,
    baseRating: 4.92,
    baseReviewCount: 79,
    completedCases: 160,
    serviceCategories: ['spa', 'training'],
    bioVi: 'Nhân viên chăm sóc thú cưng toàn thời gian, thực hiện đầy đủ các dịch vụ tắm, spa, cắt tỉa và vệ sinh chuẩn Animora.',
    bioEn: 'Full-time pet care staff performing all Animora bath, spa, grooming, and basic hygiene services.',
  },
  {
    id: 'exp-spa-02',
    name: 'Nguyễn Văn Tuấn Anh',
    roleTitleVi: 'Nhân viên chăm sóc thú cưng',
    roleTitleEn: 'Pet Care Staff',
    expertType: 'groomer',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    specialtyVi: 'Thực hiện toàn bộ dịch vụ chăm sóc: Tắm thảo mộc, Spa, Cắt tỉa lông & Vệ sinh cơ bản',
    specialtyEn: 'Full pet care services: Herbal bath, Spa, Grooming & Basic hygiene',
    experienceYears: 4,
    baseRating: 4.85,
    baseReviewCount: 62,
    completedCases: 95,
    serviceCategories: ['spa', 'training'],
    bioVi: 'Nhân viên chăm sóc thú cưng toàn thời gian, thực hiện đầy đủ các dịch vụ tắm, spa, cắt tỉa và vệ sinh chuẩn Animora.',
    bioEn: 'Full-time pet care staff performing all Animora bath, spa, grooming, and basic hygiene services.',
  },
];

export function getDoctorsWithLiveRatings(
  bookings: Booking[] = [],
  serviceCategory?: ServiceEntity['category']
): DoctorDirectoryItem[] {
  const vetStore = typeof window !== 'undefined' ? readVetStoreSnapshot() : null;

  const list = BASE_DOCTORS.map((doc) => {
    const storeReviews =
      vetStore && doc.id === 'exp-vet-01' ? vetStore.reviews : [];
    const bookingReviews = bookings.filter(
      (b) => b.doctorId === doc.id && b.review && b.review.rating >= 1
    );

    const extraCount = storeReviews.length + bookingReviews.length;
    const extraSum =
      storeReviews.reduce((s, r) => s + r.rating, 0) +
      bookingReviews.reduce((s, b) => s + (b.review?.rating ?? 0), 0);

    const totalCount = doc.baseReviewCount + extraCount;
    const weightedAvg =
      totalCount > 0
        ? (doc.baseRating * doc.baseReviewCount + extraSum) / totalCount
        : doc.baseRating;

    return {
      ...doc,
      rating: Math.round(weightedAvg * 100) / 100,
      reviewCount: totalCount,
    };
  });

  const filtered = serviceCategory
    ? list.filter((d) => d.serviceCategories.includes(serviceCategory))
    : list;

  return filtered.sort((a, b) => b.rating - a.rating);
}
