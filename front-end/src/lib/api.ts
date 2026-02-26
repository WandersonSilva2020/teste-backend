import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://api.synexa.com.br', 
});

api.interceptors.request.use((config) => {
  // 1. Evita o erro de SSR no Next.js
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // 2. Injeta a sua API Key do .env
  config.headers['x-api-key'] = process.env.NEXT_PUBLIC_API_KEY;

  return config;
}, (error) => {
  return Promise.reject(error);
});
