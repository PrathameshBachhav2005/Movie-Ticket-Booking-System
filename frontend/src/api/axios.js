import axios from 'axios';

// In the Kiro preview environment the backend is served under /_/backend.
// VITE_API_BASE_URL can override this; falls back to /api for local dev.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
