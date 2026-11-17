import { api } from './apiClient';

export interface BackendAdoptionListingDTO {
  id: number;
  pet_id: number;
  rescue_station_id: number;
  title: string;
  description: string | null;
  health_summary: string | null;
  temperament: string | null;
  adoption_requirements: string | null;
  status: 'Draft' | 'Available' | 'Pending' | 'Adopted' | 'Closed';
  published_at: string | null;
  created_at: string | null;
  pet_name: string | null;
  species: string | null;
  breed: string | null;
  gender: string | null;
  weight_kg: number | null;
  color: string | null;
  image_url: string | null;
  station_name: string | null;
  station_address: string | null;
}

export interface BackendAdoptionApplicationDTO {
  id: number;
  listing_id: number;
  customer_id: number;
  pet_id: number | null;
  pet_name: string | null;
  listing_title: string | null;
  listing_status: string | null;
  rescue_station_id: number | null;
  station_name: string | null;
  status: 'Pending' | 'UnderReview' | 'Approved' | 'Rejected' | 'Withdrawn' | 'Completed';
  applicant_reason: string | null;
  living_environment: string | null;
  experience_description: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_note: string | null;
  handover_confirmed_by_station_at: string | null;
  handover_confirmed_by_customer_at: string | null;
  handover_note: string | null;
  created_at: string | null;
}

export async function fetchAdoptionListingsApi(params?: {
  page?: number;
  limit?: number;
  status?: string;
  species?: string;
  search?: string;
}): Promise<BackendAdoptionListingDTO[]> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status) qs.set('status', params.status);
  if (params?.species) qs.set('species', params.species);
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString();
  return await api<BackendAdoptionListingDTO[]>(`/adoptions/listings${query ? `?${query}` : ''}`);
}

export async function createAdoptionListingApi(payload: {
  pet_id: number;
  rescue_station_id?: number;
  title: string;
  description?: string;
  health_summary?: string;
  temperament?: string;
  adoption_requirements?: string;
}): Promise<BackendAdoptionListingDTO> {
  return await api<BackendAdoptionListingDTO>('/adoptions/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchMyAdoptionApplicationsApi(): Promise<BackendAdoptionApplicationDTO[]> {
  return await api<BackendAdoptionApplicationDTO[]>('/adoptions/applications/my?limit=100');
}

export async function fetchAllAdoptionApplicationsApi(
  status?: string
): Promise<BackendAdoptionApplicationDTO[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}&limit=100` : '?limit=100';
  return await api<BackendAdoptionApplicationDTO[]>(`/adoptions/applications${qs}`);
}

export async function submitAdoptionApplicationApi(payload: {
  listing_id: number;
  applicant_reason?: string;
  living_environment?: string;
  experience_description?: string;
}): Promise<BackendAdoptionApplicationDTO> {
  return await api<BackendAdoptionApplicationDTO>('/adoptions/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function reviewAdoptionApplicationApi(
  applicationId: number,
  status: 'UnderReview' | 'Approved' | 'Rejected' | 'Withdrawn',
  note?: string
): Promise<BackendAdoptionApplicationDTO> {
  return await api<BackendAdoptionApplicationDTO>(
    `/adoptions/applications/${applicationId}/review`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, note: note || '' }),
    }
  );
}

export async function scheduleAdoptionHandoverApi(
  applicationId: number,
  payload: { start_at: string; end_at: string; notes?: string }
): Promise<Record<string, unknown>> {
  return await api<Record<string, unknown>>(
    `/adoptions/applications/${applicationId}/handover`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function confirmAdoptionHandoverApi(
  applicationId: number,
  note?: string
): Promise<{
  application: BackendAdoptionApplicationDTO;
  completed: boolean;
  ownership_history_id: number | null;
}> {
  return await api(`/adoptions/applications/${applicationId}/handover-confirm`, {
    method: 'PATCH',
    body: JSON.stringify({ note: note || '' }),
  });
}

