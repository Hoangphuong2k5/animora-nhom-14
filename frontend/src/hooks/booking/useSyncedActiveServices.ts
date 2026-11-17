'use client';

import { useEffect, useState } from 'react';
import {
  SERVICES_DATA,
  ServiceEntity,
  ServiceIconType,
} from '@/data/servicesData';

const MANAGER_SERVICE_CONFIG_KEY = 'animora_manager_service_config_v3';
const MANAGER_SYNC_EVENT = 'animora_manager_ops_sync';

interface StoredManagerServiceItem {
  id: string;
  name: string;
  category: 'vet' | 'spa' | 'boarding' | 'training';
  price: number;
  durationMinutes: number;
  paymentPolicy: 'prepaid' | 'postpaid' | 'flexible';
  depositPercent: number;
  active: boolean;
}

const CATEGORY_META: Record<
  StoredManagerServiceItem['category'],
  { labelVi: string; labelEn: string; icon: ServiceIconType }
> = {
  vet: {
    labelVi: 'Thú y & Nha khoa',
    labelEn: 'Veterinary & Dental',
    icon: 'checkup',
  },
  spa: {
    labelVi: 'Spa & Grooming',
    labelEn: 'Spa & Grooming',
    icon: 'spa',
  },
  boarding: {
    labelVi: 'Lưu trú 24/7',
    labelEn: '24/7 Boarding',
    icon: 'boarding',
  },
  training: {
    labelVi: 'Huấn luyện',
    labelEn: 'Training',
    icon: 'training',
  },
};

function formatDurationText(minutes: number, isVi: boolean): string {
  if (minutes >= 1440) {
    return isVi ? 'Theo đêm lưu trú' : 'Per night';
  }
  if (minutes >= 60 && minutes % 30 === 0) {
    const hrs = minutes / 60;
    return isVi ? `${hrs} giờ` : `${hrs} hrs`;
  }
  return isVi ? `${minutes} phút` : `${minutes} mins`;
}

function buildCustomServiceEntity(item: StoredManagerServiceItem): ServiceEntity {
  const meta = CATEGORY_META[item.category] || CATEGORY_META.vet;
  const paymentTiming: 'prepaid' | 'postpaid' =
    item.paymentPolicy === 'prepaid' ? 'prepaid' : 'postpaid';
  const durationVi = formatDurationText(item.durationMinutes || 30, true);
  const durationEn = formatDurationText(item.durationMinutes || 30, false);

  return {
    id: item.id as ServiceEntity['id'],
    slug: item.id,
    minAdvanceHours: item.category === 'boarding' || item.category === 'training' ? 12 : 2,
    name: { vi: item.name, en: item.name },
    category: item.category,
    categoryLabel: { vi: meta.labelVi, en: meta.labelEn },
    icon: meta.icon,
    shortDescription: {
      vi: `Dịch vụ ${item.name} chuyên nghiệp tại Animora (${durationVi}).`,
      en: `Professional ${item.name} care service at Animora (${durationEn}).`,
    },
    description: {
      vi: [`Dịch vụ ${item.name} được thực hiện bởi đội ngũ chuyên viên Animora.`],
      en: [`${item.name} performed by Animora specialists.`],
    },
    duration: { vi: durationVi, en: durationEn },
    durationMinutes: item.durationMinutes || 30,
    priceFrom: item.price || 0,
    dependsOnWeight: false,
    defaultPaymentTiming: paymentTiming,
    suitablePets: {
      vi: 'Chó, Mèo & Thú cưng',
      en: 'Dogs, Cats & Pets',
    },
    included: {
      vi: ['Kiểm tra tổng thể trước khi thực hiện', 'Theo dõi chăm sóc tận tâm'],
      en: ['Pre-service health check', 'Attentive care throughout'],
    },
    steps: [
      {
        titleVi: 'Tiếp nhận & kiểm tra',
        titleEn: 'Check-in & Assessment',
        textVi: 'Kiểm tra tình trạng của bé trước khi thực hiện.',
        textEn: 'Assess your pet before starting.',
      },
      {
        titleVi: 'Thực hiện dịch vụ',
        titleEn: 'Service Delivery',
        textVi: 'Chuyên viên thực hiện theo quy trình chuẩn Animora.',
        textEn: 'Specialist delivers care following Animora standards.',
      },
    ],
    priceTable: [
      { weightRangeVi: 'Dưới 5kg', weightRangeEn: 'Under 5kg', price: item.price || 0 },
      { weightRangeVi: '5 - 10kg', weightRangeEn: '5 - 10kg', price: item.price || 0 },
      { weightRangeVi: '10 - 20kg', weightRangeEn: '10 - 20kg', price: item.price || 0 },
      { weightRangeVi: 'Trên 20kg', weightRangeEn: 'Over 20kg', price: item.price || 0 },
    ],
    tips: {
      vi: ['Đặt lịch trước để được phục vụ đúng khung giờ mong muốn.'],
      en: ['Book ahead to secure your preferred time slot.'],
    },
    faq: [],
  };
}

export function getSyncedActiveServices(): ServiceEntity[] {
  if (typeof window === 'undefined') return SERVICES_DATA;
  try {
    const raw = window.localStorage.getItem(MANAGER_SERVICE_CONFIG_KEY);
    if (!raw) return SERVICES_DATA;
    const parsed = JSON.parse(raw) as StoredManagerServiceItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return SERVICES_DATA;

    const result: ServiceEntity[] = [];
    for (const item of parsed) {
      if (!item.active) continue;
      const base = SERVICES_DATA.find((s) => s.id === item.id || s.slug === item.id);
      if (base) {
        const paymentTiming: 'prepaid' | 'postpaid' =
          item.paymentPolicy === 'prepaid' ? 'prepaid' : 'postpaid';
        result.push({
          ...base,
          name: {
            ...base.name,
            vi: item.name || base.name.vi,
          },
          category: item.category || base.category,
          priceFrom: typeof item.price === 'number' ? item.price : base.priceFrom,
          duration: item.durationMinutes
            ? {
                vi:
                  item.id === 'boarding' && item.durationMinutes >= 1440
                    ? base.duration.vi
                    : formatDurationText(item.durationMinutes, true),
                en:
                  item.id === 'boarding' && item.durationMinutes >= 1440
                    ? base.duration.en
                    : formatDurationText(item.durationMinutes, false),
              }
            : base.duration,
          defaultPaymentTiming: paymentTiming,
        });
      } else {
        result.push(buildCustomServiceEntity(item));
      }
    }
    return result;
  } catch {
    return SERVICES_DATA;
  }
}

export function useSyncedActiveServices(): ServiceEntity[] {
  const [services, setServices] = useState<ServiceEntity[]>(SERVICES_DATA);

  useEffect(() => {
    const refresh = () => setServices(getSyncedActiveServices());
    refresh();

    window.addEventListener('storage', refresh);
    window.addEventListener(MANAGER_SYNC_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(MANAGER_SYNC_EVENT, refresh);
    };
  }, []);

  return services;
}
