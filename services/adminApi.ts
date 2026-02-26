// Admin API Client
// Wraps all /api/admin/* endpoints with Firebase auth headers

import { auth } from '@/lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (user) {
    // Force refresh to avoid stale token issues
    headers['Authorization'] = `Bearer ${await user.getIdToken(true)}`;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data as T;
}

// Types
export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
  lastSignIn: string | null;
}

export interface UsageDoc {
  uid: string;
  email?: string;
  credits: number;
  totalGenerations: number;
  createdAt?: string;
}

export interface GenerationRequest {
  id: string;
  userId: string;
  email: string;
  type: string;
  prompt: string;
  improvedPrompt: string;
  language: string;
  style: string | null;
  inputImageProvided: boolean;
  generationTimeMs: number;
  success: boolean;
  timestamp: string | null;
}

export interface CreditRequest {
  id: string;
  userId: string;
  email: string;
  message: string;
  status: string;
  createdAt: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalGenerations: number;
  activeUsers: number;
  totalCreditsInCirculation: number;
  pendingCreditRequests: number;
}

// API calls
export const adminApi = {
  checkAdmin: () => request<{ success: boolean; isAdmin: boolean }>('/api/admin/check'),
  getStats: () => request<{ success: boolean; stats: AdminStats }>('/api/admin/stats'),
  getUsers: () => request<{ success: boolean; users: AdminUser[] }>('/api/admin/users'),
  getUser: (uid: string) => request<{ success: boolean; user: AdminUser }>(`/api/admin/users/${uid}`),
  deleteUser: (uid: string) => request<{ success: boolean }>(`/api/admin/users/${uid}`, { method: 'DELETE' }),
  getUsage: () => request<{ success: boolean; usage: UsageDoc[] }>('/api/admin/usage'),
  setCredits: (uid: string, credits: number) =>
    request<{ success: boolean }>(`/api/admin/usage/${uid}/credits`, {
      method: 'PUT',
      body: JSON.stringify({ credits }),
    }),
  getRequests: (limit = 50) =>
    request<{ success: boolean; requests: GenerationRequest[] }>(`/api/admin/requests?limit=${limit}`),
  getCreditRequests: () =>
    request<{ success: boolean; requests: CreditRequest[] }>('/api/admin/credit-requests'),
  reviewCreditRequest: (id: string, status: 'approved' | 'denied', credits?: number) =>
    request<{ success: boolean }>(`/api/admin/credit-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, credits }),
    }),
};

export default adminApi;
