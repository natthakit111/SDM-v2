/**
 * frondend/lib/api/tenant.api.js
 * Backend: /api/tenants
 */
import api from './axiosInstance';

// Header ป้องกัน 304 Not Modified (ทำให้ browser ไม่ใช้ cache)
const noCache = { headers: { 'Cache-Control': 'no-cache' } };

export const tenantAPI = {
  // ── Tenant self-service ───────────────────────────────────
  getMyProfile: () =>
    api.get('/tenants/me/profile', noCache).then((r) => r.data),

  updateMyProfile: (data) =>
    api.put('/tenants/me/profile', data).then((r) => r.data),

  // ── Admin ─────────────────────────────────────────────────
  getAll: (params) =>
    api.get('/tenants', { params, ...noCache }).then((r) => r.data),

  getById: (id) =>
    api.get(`/tenants/${id}`, noCache).then((r) => r.data),

  create: (data) =>
    api.post('/tenants', data).then((r) => r.data),
  // data: { username, password, first_name, last_name, id_card_number, phone, email? }

  update: (id, data) =>
    api.put(`/tenants/${id}`, data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/tenants/${id}`).then((r) => r.data),
};