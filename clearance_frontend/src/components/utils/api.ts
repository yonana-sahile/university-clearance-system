import {
  User, ClearanceForm, PaymentMethod, PaymentRecord, DueRecord,
  ChatRoom, ChatMessage, ValidStudentCSV, College, Department, Building, FormStatus
} from '../types';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/";

// Session Management
export function getSession(): User | null {
  try {
    const raw = sessionStorage.getItem("ucs_current");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.user || parsed;
  } catch {
    return null;
  }
}

export function setSession(user: User): void {
  sessionStorage.setItem("ucs_current", JSON.stringify(user));
  if (user.token) {
    sessionStorage.setItem("ucs_token", user.token);
    sessionStorage.setItem("token", user.token);
  }
}

export function clearSession(): void {
  sessionStorage.removeItem("ucs_current");
  sessionStorage.removeItem("ucs_token");
  sessionStorage.removeItem("token");
}

/**
 * Universal API client for the Django REST backend.
 * Automatically attaches JWT and JSON headers.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE}${cleanEndpoint}`;

  const token = sessionStorage.getItem('token') || sessionStorage.getItem('ucs_token');
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (!isFormData && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`[API] ${options.method || 'GET'} -> ${url}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('ucs_token');
    sessionStorage.removeItem('ucs_current');
    throw new Error('Unauthorized. Please log in again.');
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}
