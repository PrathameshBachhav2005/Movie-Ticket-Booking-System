import axios from 'axios';

// Always use /api — Vite proxy forwards to localhost:8080 in dev,
// and vercel.json rewrites handle it in production.
// Do NOT set VITE_API_BASE_URL unless using Kiro preview.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
