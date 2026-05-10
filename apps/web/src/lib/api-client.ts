import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  withCredentials: true,
});

export async function getJson<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await api.get<T>(url, { params });
  return response.data;
}

export async function getJsonAllowMissing<T>(path: string): Promise<T | null> {
  try {
    return await getJson<T>(path);
  } catch {
    return null;
  }
}

export async function postJson<T>(url: string, data: unknown): Promise<T> {
  const response = await api.post<T>(url, data);
  return response.data;
}

export async function patchJson<T>(url: string, data: unknown): Promise<T> {
  const response = await api.patch<T>(url, data);
  return response.data;
}

export async function deleteJson<T>(url: string): Promise<T> {
  const response = await api.delete<T>(url);
  return response.data;
}
