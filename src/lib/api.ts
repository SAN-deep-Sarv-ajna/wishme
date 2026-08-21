const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Get Supabase token from local storage if available
  let token = null;
  if (typeof window !== 'undefined') {
    const sessionStr = localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0] + '-auth-token');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        token = session.access_token;
      } catch (e) {}
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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

  return response.json();
}

export const api = {
  wishes: {
    list: () => fetchApi('/wishes/'),
    get: (slug: string) => fetchApi(`/wishes/${slug}`),
    create: (data: any) => fetchApi('/wishes/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchApi(`/wishes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  analytics: {
    trackEvent: (data: { wish_id: string, event_type: string }) => fetchApi('/analytics/event', { method: 'POST', body: JSON.stringify(data) }),
  }
};
