import React from 'react';
import {
  BriefcaseMedical,
  Flower2,
  GraduationCap,
  Home,
  ShieldPlus,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { ServiceIconType } from '@/data/servicesData';

export const SERVICE_ICON_MAP: Record<
  ServiceIconType,
  React.ComponentType<{ className?: string }>
> = {
  checkup: BriefcaseMedical,
  vaccine: Syringe,
  deworm: ShieldPlus,
  spa: Flower2,
  training: GraduationCap,
  boarding: Home,
  dental: Stethoscope,
};

interface ServiceIconProps {
  type: ServiceIconType;
  className?: string;
}

export const ServiceIcon = ({ type, className }: ServiceIconProps) => {
  const Icon = SERVICE_ICON_MAP[type] || Stethoscope;
  return <Icon className={className} />;
};

