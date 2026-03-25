import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

/** Base URL: trailing slash so POST 'articles/' → http://localhost:8000/api/articles/articles/ */
export const articlesApi = axios.create({
  baseURL: `${BASE}/api/articles/`,
  headers: { 'Content-Type': 'application/json' },
});

articlesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('niat_access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

articlesApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('niat_refresh');
      if (refresh) {
        try {
          const { data } = await axios.post<{ access: string }>(`${BASE}/api/token/refresh/`, { refresh });
          localStorage.setItem('niat_access', data.access);
          document.cookie = `niat_access=${data.access}; path=/; max-age=86400`;
          if (original.headers) original.headers.Authorization = `Bearer ${data.access}`;
          return articlesApi(original);
        } catch {
          localStorage.removeItem('niat_access');
          document.cookie = 'niat_access=; path=/; max-age=0';
          document.cookie = 'niat_onboarded=; path=/; max-age=0';
          document.cookie = 'niat_needs_onboarding=; path=/; max-age=0';
          localStorage.removeItem('niat_refresh');
        }
      }
    }
    return Promise.reject(error);
  }
);
