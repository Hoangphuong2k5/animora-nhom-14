import { useState, useEffect, useCallback } from 'react';
import {
  Booking,
  Language,
  Pet,
  Product,
  Vaccination,
} from '@/types/animora.type';
import {
  initialPets,
  initialProducts,
  initialVaccinations,
} from '@/data/mockData';
import { createLiveSeededServiceBookings } from '@/data/serviceBookingData';
import { translations } from '@/data/translations';
import { safeGetStorage, safeSetStorage } from '@/utils/cartLogic';
import { syncCustomerBookingToExpertStore } from '@/utils/clinicalSync';
import { fetchBookings } from '@/services/animora/bookingApi';
import { ToastOptions } from './useAnimoraPreferences';

interface UseAnimoraDomainDataParams {
  lang: Language;
  isStorageHydrated: boolean;
  addToast: (text: string, options?: ToastOptions) => void;
}

/**
 * Manages pets, vaccinations, products, and bookings
 * along with localStorage persistence and CRUD handlers.
 */
export function useAnimoraDomainData({
  lang,
  isStorageHydrated,
  addToast,
}: UseAnimoraDomainDataParams) {
  const [pets, setPets] = useState<Pet[]>(initialPets);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(
    initialVaccinations
  );
  const [products] = useState<Product[]>(initialProducts);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const hydrateDomainFromStorage = useCallback(() => {
    setPets(safeGetStorage<Pet[]>('animora_pets_v2', initialPets));
    setVaccinations(
      safeGetStorage<Vaccination[]>(
        'animora_vaccinations_v2',
        initialVaccinations
      )
    );

    const parsedBookings = safeGetStorage<Booking[]>('animora_bookings_v2', []);
    if (Array.isArray(parsedBookings) && parsedBookings.length > 0) {
      setBookings(parsedBookings);
    } else {
      setBookings(createLiveSeededServiceBookings());
    }

    // Hydrate from Backend APIs when user session / backend is active
    fetchBookings()
      .then((apiBookings) => {
        if (Array.isArray(apiBookings) && apiBookings.length > 0) {
          setBookings(apiBookings);
          safeSetStorage('animora_bookings_v2', apiBookings);
        }
      })
      .catch(() => {
        // Fallback already populated from storage/seed
      });
  }, []);

  useEffect(() => {
    if (!isStorageHydrated) return;
    const handleBookingsSync = () => {
      const syncedBookings = safeGetStorage<Booking[]>('animora_bookings_v2', []);
      if (Array.isArray(syncedBookings) && syncedBookings.length > 0) {
        setBookings(syncedBookings);
      }
    };
    window.addEventListener('animora_bookings_sync', handleBookingsSync);
    window.addEventListener('storage', handleBookingsSync);
    return () => {
      window.removeEventListener('animora_bookings_sync', handleBookingsSync);
      window.removeEventListener('storage', handleBookingsSync);
    };
  }, [isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('animora_pets_v2', pets);
  }, [pets, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    safeSetStorage('animora_vaccinations_v2', vaccinations);
  }, [vaccinations, isStorageHydrated]);

  const handleAddBooking = useCallback(
    (newBooking: Booking) => {
      setBookings((prev) => {
        const next = [...prev, newBooking];
        safeSetStorage('animora_bookings_v2', next);
        return next;
      });
      syncCustomerBookingToExpertStore(newBooking);
      addToast(translations[lang].quickBooking.successToast);
    },
    [addToast, lang]
  );

  const handleUpdateBooking = useCallback((updatedBooking: Booking) => {
    setBookings((prev) => {
      const next = prev.map((b) =>
        b.id === updatedBooking.id ? updatedBooking : b
      );
      safeSetStorage('animora_bookings_v2', next);
      return next;
    });
    syncCustomerBookingToExpertStore(updatedBooking);
  }, []);

  const handleUpdatePet = useCallback(
    (updatedPet: Pet, updatedVaccinations: Vaccination[]) => {
      setPets((prev) =>
        prev.map((p) => (p.id === updatedPet.id ? updatedPet : p))
      );
      setVaccinations((prev) => {
        const otherVac = prev.filter((v) => v.petId !== updatedPet.id);
        return [...otherVac, ...updatedVaccinations];
      });
      addToast(translations[lang].petProfiles.saveSuccessToast);
    },
    [addToast, lang]
  );

  const handleAddPet = useCallback(
    (newPet: Pet, newVaccines: Vaccination[]) => {
      setPets((prev) => [...prev, newPet]);
      setVaccinations((prev) => [...prev, ...newVaccines]);
      addToast(
        lang === 'vi'
          ? `Đã thêm hồ sơ mới cho bé ${newPet.name}!`
          : `Added new profile for ${newPet.name}!`
      );
    },
    [addToast, lang]
  );

  const handleDeletePet = useCallback(
    (petId: string) => {
      const target = pets.find((p) => p.id === petId);
      setPets((prev) => prev.filter((p) => p.id !== petId));
      setVaccinations((prev) => prev.filter((v) => v.petId !== petId));
      addToast(
        lang === 'vi'
          ? `Đã xóa hồ sơ của bé ${target?.name || 'thú cưng'}!`
          : `Deleted ${target?.name || 'pet'}'s profile!`
      );
    },
    [addToast, lang, pets]
  );

  return {
    pets,
    vaccinations,
    products,
    bookings,
    hydrateDomainFromStorage,
    handleAddBooking,
    handleUpdateBooking,
    handleUpdatePet,
    handleAddPet,
    handleDeletePet,
  };
}

