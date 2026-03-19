/**
 * frondend/lib/api/contract.api.js
 * Backend: /api/contracts
 */
import api from './axiosInstance';

export const contractAPI = {
  // ── Tenant ───────────────────────────────────────────────
  getMyContract: () =>
    api.get('/contracts/my').then((r) => r.data),
  // /my/active ก็ใช้ได้เช่นกัน (backend มี alias ให้แล้ว)

  // ── Admin ─────────────────────────────────────────────────
  getAll: (params) =>
    api.get('/contracts', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/contracts/${id}`).then((r) => r.data),

  create: (data) =>
    api.post('/contracts', data).then((r) => r.data),
  // data: { tenant_id, room_id, start_date, end_date, deposit_amount?, rent_amount? }

  update: (id, data) =>
    api.put(`/contracts/${id}`, data).then((r) => r.data),
  // data: { end_date?, rent_amount? }

  terminate: (id) =>
    api.put(`/contracts/${id}/terminate`).then((r) => r.data),
};
