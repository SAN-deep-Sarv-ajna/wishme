import { supabase } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Cleanly get the Supabase access token via the SDK
  let token: string | undefined = undefined;
  if (typeof window !== 'undefined') {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred while fetching the data.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  wishes: {
    list: () => fetchApi('/wishes/'),
    get: (slug: string) => fetchApi(`/wishes/${slug}`),
    create: (data: any) => fetchApi('/wishes/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchApi(`/wishes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/wishes/${id}`, { method: 'DELETE' }),
  },
  analytics: {
    trackEvent: (data: { wish_id: string, event_type: string }) => fetchApi('/analytics/event', { method: 'POST', body: JSON.stringify(data) }),
    getSummary: () => fetchApi('/analytics/summary'),
  },
  ai: {
    generate: async (payload: {
      action: 'generate_reasons' | 'generate_single_reason' | 'generate_letter';
      recipient_name: string;
      sender_name?: string;
      occasion?: string;
      relationship?: string;
      tone?: string;
      custom_cues?: string;
      count?: number;
      existing_reasons?: { title: string }[];
    }) => {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI generation failed');
      }
      return data.data;
    }
  },
  qr: {
    getUrl: (slug: string) => `${API_URL}/qr/${slug}`
  },
  media: {
    uploadImage: async (file: File, wishId: string) => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('wish_id', wishId);
      const res = await fetch(`${API_URL}/media/images`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    deleteImage: (publicId: string) => fetchApi(`/media/images/${encodeURIComponent(publicId)}`, { method: 'DELETE' })
  }
};
