import React, { useState } from 'react';
import { Language, PageId } from '@/types';
import {
  getSpeciesApproaches,
  getMilestones,
  getCoreValues,
  getStats,
  getClinicZones,
  getFaqs,
} from './about/aboutData';
import {
  AboutHeroAndStorySection,
  AboutStatsSection,
} from './about/AboutHeroAndStorySection';
import { AboutSpeciesAndValuesSection } from './about/AboutSpeciesAndValuesSection';
import { AboutClinicTourAndFaqSection } from './about/AboutClinicTourAndFaqSection';

export interface AboutPageProps {
  lang: Language;
  onNavigate: (page: PageId) => void;
  onBookWithSpecialist?: (serviceName: string) => void;
}

export const AboutPage = ({
  lang,
  onNavigate,
}: AboutPageProps) => {
  const isVi = lang === 'vi';
  const [activeZoneId, setActiveZoneId] = useState<string>('zone-exam');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const speciesApproaches = getSpeciesApproaches();
  const milestones = getMilestones();
  const coreValues = getCoreValues();
  const stats = getStats();
  const clinicZones = getClinicZones();
  const faqs = getFaqs();

  const activeZone =
    clinicZones.find((z) => z.id === activeZoneId) || clinicZones[0];

  const handleToggleFaq = (idx: number) => {
    setOpenFaqIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div
      data-testid="page-about"
      className="min-h-screen pt-24 pb-20 space-y-20 sm:space-y-24"
    >
      <AboutHeroAndStorySection
        isVi={isVi}
        milestones={milestones}
        onNavigate={onNavigate}
      />

      <AboutSpeciesAndValuesSection
        isVi={isVi}
        speciesApproaches={speciesApproaches}
        coreValues={coreValues}
        onNavigate={onNavigate}
      />

      <AboutStatsSection isVi={isVi} stats={stats} />

      <AboutClinicTourAndFaqSection
        isVi={isVi}
        clinicZones={clinicZones}
        activeZone={activeZone}
        onSelectZone={setActiveZoneId}
        faqs={faqs}
        openFaqIdx={openFaqIdx}
        onToggleFaq={handleToggleFaq}
        onNavigate={onNavigate}
      />
    </div>
  );
};
