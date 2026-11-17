import { api } from './apiClient';
import { UserAccount } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export async function loginUser(email: string, password: string): Promise<UserAccount> {
  return api<UserAccount>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload: RegisterPayload): Promise<UserAccount> {
  return api<UserAccount>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function googleLoginUser(credential: string): Promise<UserAccount> {
  return api<UserAccount>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export async function getMeUser(): Promise<UserAccount> {
  return api<UserAccount>('/auth/me', {
    method: 'GET',
  });
}

export async function forgotPasswordUser(email: string): Promise<void> {
  await api<unknown>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordUser(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> {
  await api<unknown>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  });
}

export async function logoutUser(): Promise<void> {
  await api<unknown>('/auth/logout', {
    method: 'POST',
  });
}
