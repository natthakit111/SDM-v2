/**
 * frondend/lib/api/axiosInstance.js
 *
 * Next.js App Router:
 *  - ใช้ process.env.NEXT_PUBLIC_API_URL  (ไม่ใช่ import.meta.env)
 *  - ไฟล์นี้ถูกเรียกจาก Client Component เท่านั้น
 *    (ทุกไฟล์ที่ import ต้องมี 'use client' ด้านบน)
 */
import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: แนบ JWT อัตโนมัติ ────────────────────────────────
api.interceptors.request.use((config) => {
  // Next.js App Router — localStorage ใช้ได้เฉพาะ client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: จัดการ 401 กลาง ────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
