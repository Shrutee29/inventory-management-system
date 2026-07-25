import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const tokenStorage = {
  getAccess: () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  setTokens: ({ access, refresh }) => {
    if (access) {
      localStorage.setItem('access_token', access);
    }
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

export const api = axios.create({
  baseURL,
});

const refreshClient = axios.create({
  baseURL,
});

const shouldSkipRefresh = (url = '') =>
  url.includes('/api/users/login/') ||
  url.includes('/api/users/register/') ||
  url.includes('/api/users/refresh/');

api.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest?._retry || shouldSkipRefresh(originalRequest?.url)) {
      return Promise.reject(error);
    }

    const refresh = tokenStorage.getRefresh();
    if (!refresh) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;
      const refreshResponse = await refreshClient.post('/api/users/refresh/', { refresh });
      tokenStorage.setTokens({ access: refreshResponse.data.access });
      originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      return Promise.reject(refreshError);
    }
  }
);