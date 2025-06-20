// Utility fetcher for API requests
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function fetcher(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export async function apiRequest<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetcher(endpoint, options);
    const data = await response.json().catch(() => null);
    
    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? data : undefined,
      error: !response.ok ? (data?.detail || data?.error || `HTTP ${response.status}`) : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}