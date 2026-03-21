/**
 * frondend/lib/api/bill.api.js
 * Backend: /api/bills
 *
 * ⚠️ QR อยู่ที่ GET /bills/:id/qr  (ไม่ใช่ /payments/qr/:id)
 */
import api from './axiosInstance';

export const billAPI = {
  // ── Tenant ───────────────────────────────────────────────
  getMyBills: (params) =>
    api.get('/bills/my', { params }).then((r) => r.data),

  // ── Admin ─────────────────────────────────────────────────
  getMonthlyReport: (params) =>
    api.get('/bills/report/monthly', { params }).then((r) => r.data),
  // params: { month, year }

  generate: (data) =>
    api.post('/bills/generate', data).then((r) => r.data),
  // data: { room_id, month, year, other_amount?, due_date? }

  getAll: (params) =>
    api.get('/bills', { params }).then((r) => r.data),

  cancel: (id) =>
    api.put(`/bills/${id}/cancel`).then((r) => r.data),

  // ── Shared ───────────────────────────────────────────────
  getById: (id) =>
    api.get(`/bills/${id}`).then((r) => r.data),

  // ⚠️ QR อยู่ใน bills ไม่ใช่ payments
  getQR: (id) =>
    api.get(`/bills/${id}/qr`).then((r) => r.data),
  // returns: { qr_data_url, amount, bill_id }
};
