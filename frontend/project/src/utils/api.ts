// Utility fetcher for API requests using VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API error: ${res.status}`);
  }
  return res.json();
} 
