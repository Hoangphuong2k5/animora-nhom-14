import React, { useState, useRef, useEffect } from 'react';
import { Booking, Language, PageId } from '@/types';
import {
  ServiceCategoryId,
  ServiceEntity,
} from '@/data/servicesData';
import { useSyncedActiveServices } from '@/hooks/booking/useSyncedActiveServices';
import { ServiceNotFoundView } from './services/ServiceNotFoundView';
import { ServiceDetailView } from './services/ServiceDetailView';
import { ServiceCatalogView } from './services/ServiceCatalogView';

interface ServicesPageProps {
  lang: Language;
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
  onNavigate: (page: PageId) => void;
  onBookService: (serviceSlug?: string) => void;
  initialSelectedService?: string;
}

function parseSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/dich-vu\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export const ServicesPage = ({
  lang,
  onBookService,
}: ServicesPageProps) => {
  const [activeSlug, setActiveSlug] = useState<string | null>(() =>
    typeof window !== 'undefined' ? parseSlugFromPath(window.location.pathname) : null
  );
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategoryId>('all');
  const listScrollYRef = useRef<number>(0);

  useEffect(() => {
    const applyLocationState = () => {
      setActiveSlug(parseSlugFromPath(window.location.pathname));
    };

    applyLocationState();
    window.addEventListener('popstate', applyLocationState);
    return () => window.removeEventListener('popstate', applyLocationState);
  }, []);

  const handleOpenServiceDetail = (slug: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!activeSlug) {
      listScrollYRef.current = window.scrollY;
    }
    setActiveSlug(slug);
    window.history.pushState({ serviceSlug: slug }, '', `/dich-vu/${slug}`);
    window.scrollTo({ top: 0, left: 0 });
  };

  const handleBackToList = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const savedY = listScrollYRef.current;
    setActiveSlug(null);
    window.history.pushState({}, '', '/dich-vu');
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedY, left: 0 });
    });
  };

  const handleBookFromDetail = (srv: ServiceEntity) => {
    onBookService(srv.slug);
  };

  const activeServices = useSyncedActiveServices();
  const filteredServices = activeServices.filter((srv) =>
    selectedCategory === 'all' ? true : srv.category === selectedCategory
  );

  if (activeSlug !== null) {
    const activeService = activeServices.find((s) => s.slug === activeSlug);
    if (!activeService) {
      return (
        <ServiceNotFoundView lang={lang} onBackToList={handleBackToList} />
      );
    }
    return (
      <ServiceDetailView
        lang={lang}
        activeService={activeService}
        onBackToList={handleBackToList}
        onBookFromDetail={handleBookFromDetail}
        onOpenServiceDetail={handleOpenServiceDetail}
      />
    );
  }

  return (
    <ServiceCatalogView
      lang={lang}
      selectedCategory={selectedCategory}
      filteredServices={filteredServices}
      onSelectCategory={setSelectedCategory}
      onOpenServiceDetail={handleOpenServiceDetail}
      onBookService={onBookService}
    />
  );
};
