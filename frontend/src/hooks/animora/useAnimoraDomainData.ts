import { useState, useEffect, useCallback } from 'react';
import {
  AdoptionPet,
  AdoptionRequest,
  Booking,
  Language,
  Pet,
  Product,
  Vaccination,
} from '@/types/animora.type';
import {
  initialAdoptionPets,
  initialPets,
  initialProducts,
  initialVaccinations,
} from '@/data/mockData';
import { createLiveSeededServiceBookings } from '@/data/serviceBookingData';
import { translations } from '@/data/translations';
import { safeGetStorage, safeSetStorage } from '@/utils/cartLogic';
import { syncCustomerBookingToExpertStore } from '@/utils/clinicalSync';
import {
  findConflictingApprovedAdoptionRequest,
  findDuplicateAdoptionRequest,
} from '@/utils/adoptionFormLogic';
import { fetchBookings } from '@/services/animora/bookingApi';
import { fetchAdoptionListingsApi } from '@/services/animora/adoptionApi';
import { ToastOptions } from './useAnimoraPreferences';

interface UseAnimoraDomainDataParams {
  lang: Language;
  isStorageHydrated: boolean;
  addToast: (text: string, options?: ToastOptions) => void;
}

/**
 * Manages pets, vaccinations, adoption pets/requests, products, and bookings
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
  const [adoptionPets, setAdoptionPets] = useState<AdoptionPet[]>(initialAdoptionPets);
  const [products] = useState<Product[]>(initialProducts);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);

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

    const syncedPets = safeGetStorage<AdoptionPet[]>('animora_adoption_pets_v2', []);
    if (Array.isArray(syncedPets) && syncedPets.length > 0) {
      setAdoptionPets(syncedPets);
    } else {
      setAdoptionPets(initialAdoptionPets);
    }

    const savedReqsV2 = safeGetStorage<AdoptionRequest[]>(
      'animora_adoption_requests_v2',
      []
    );
    const savedReqsLegacy = safeGetStorage<AdoptionRequest[]>(
      'animora_adoption_requests',
      []
    );
    const mergedReqs =
      savedReqsV2.length > 0
        ? savedReqsV2
        : savedReqsLegacy;
    setAdoptionRequests(mergedReqs);
    if (savedReqsV2.length === 0 && savedReqsLegacy.length > 0) {
      safeSetStorage('animora_adoption_requests_v2', savedReqsLegacy);
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

    fetchAdoptionListingsApi({ limit: 50 })
      .then((listings) => {
        if (Array.isArray(listings) && listings.length > 0) {
          const mapped: AdoptionPet[] = listings.map((l) => ({
            id: String(l.id),
            slug: `${(l.pet_name || 'pet').toLowerCase().replace(/\s+/g, '-')}-${l.id}`,
            name: l.pet_name || l.title,
            species: (l.species as AdoptionPet['species']) || 'Chó',
            breed: l.breed || 'Chưa rõ giống',
            age: '1 tuổi',
            gender: l.gender === 'Female' || l.gender === 'Cái' ? 'Cái' : 'Đực',
            weight: l.weight_kg ? `${l.weight_kg} kg` : undefined,
            color: l.color || undefined,
            shelterName: l.station_name || undefined,
            area: l.station_address || 'TP. Hồ Chí Minh',
            personality: l.temperament || l.description || 'Thân thiện, đáng yêu',
            photo: l.image_url || '/assets/aistudio/cute_dog_transparent.png',
            status:
              l.status === 'Adopted'
                ? 'adopted'
                : l.status === 'Pending'
                ? 'pending'
                : 'available',
            tags: ['Đã kiểm tra sức khỏe'],
            story: l.description || l.health_summary || '',
            createdAt: l.created_at || undefined,
          }));
          setAdoptionPets(mapped);
          safeSetStorage('animora_adoption_pets_v2', mapped);
        }
      })
      .catch(() => {
        // Keep local/mock catalog when backend has no listings or is offline
      });
  }, []);

  useEffect(() => {
    if (!isStorageHydrated) return;
    const handleAdoptionSync = () => {
      const syncedPets = safeGetStorage<AdoptionPet[]>('animora_adoption_pets_v2', []);
      if (Array.isArray(syncedPets) && syncedPets.length > 0) {
        setAdoptionPets(syncedPets);
      }
      const syncedReqs = safeGetStorage<AdoptionRequest[]>(
        'animora_adoption_requests_v2',
        []
      );
      if (Array.isArray(syncedReqs)) {
        setAdoptionRequests(syncedReqs);
      }
    };
    const handleBookingsSync = () => {
      const syncedBookings = safeGetStorage<Booking[]>('animora_bookings_v2', []);
      if (Array.isArray(syncedBookings) && syncedBookings.length > 0) {
        setBookings(syncedBookings);
      }
    };
    window.addEventListener('animora_adoption_sync', handleAdoptionSync);
    window.addEventListener('animora_bookings_sync', handleBookingsSync);
    window.addEventListener('storage', handleAdoptionSync);
    window.addEventListener('storage', handleBookingsSync);
    return () => {
      window.removeEventListener('animora_adoption_sync', handleAdoptionSync);
      window.removeEventListener('animora_bookings_sync', handleBookingsSync);
      window.removeEventListener('storage', handleAdoptionSync);
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

  const handleAddAdoptionRequest = useCallback(
    (req: AdoptionRequest) => {
      const approvedConflict = findConflictingApprovedAdoptionRequest(
        adoptionRequests,
        req.petId
      );
      if (approvedConflict) {
        addToast(
          lang === 'vi'
            ? 'Bé thú cưng này đã có hồ sơ nhận nuôi được duyệt.'
            : 'This pet already has an approved adoption application.'
        );
        return false;
      }

      const duplicate = findDuplicateAdoptionRequest(adoptionRequests, req);
      if (duplicate) {
        addToast(
          lang === 'vi'
            ? `Bạn đã gửi yêu cầu nhận nuôi cho bé ${req.petName} trước đó (${duplicate.requestCode || duplicate.id}).`
            : `You already submitted an active adoption request for ${req.petName}.`
        );
        return false;
      }

      setAdoptionRequests((prev) => {
        const next = [req, ...prev];
        safeSetStorage('animora_adoption_requests_v2', next);
        safeSetStorage('animora_adoption_requests', next);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('animora_adoption_sync'));
        }
        return next;
      });
      addToast(translations[lang].adoption.successToast);
      return true;
    },
    [addToast, adoptionRequests, lang]
  );

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
    adoptionPets,
    products,
    bookings,
    adoptionRequests,
    hydrateDomainFromStorage,
    handleAddBooking,
    handleUpdateBooking,
    handleAddAdoptionRequest,
    handleUpdatePet,
    handleAddPet,
    handleDeletePet,
  };
}

