/**
 * frondend/lib/api/payment.api.js
 * Backend: /api/payments
 *
 * ⚠️ submit payment ใช้ POST /payments (multipart)
 *    verify = PUT /:id/verify
 *    reject = PUT /:id/reject  (endpoint แยกกัน)
 */
import api from './axiosInstance';

export const paymentAPI = {
  // ── Tenant ───────────────────────────────────────────────
  getMyPayments: (params) =>
    api.get('/payments/my', { params }).then((r) => r.data),

  // ⚠️ multipart/form-data
  submit: (billId, slipFile, paymentMethod = 'qr_promptpay') => {
    const form = new FormData();
    form.append('bill_id', billId);
    form.append('payment_method', paymentMethod);
    // payment_method: 'qr_promptpay' | 'cash' | 'bank_transfer'
    if (slipFile) form.append('slip', slipFile);
    return api.post('/payments', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  // ── Admin ─────────────────────────────────────────────────
  getAll: (params) =>
    api.get('/payments', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/payments/${id}`).then((r) => r.data),

  // ⚠️ verify และ reject เป็น endpoint แยกกัน
  verify: (id) =>
    api.put(`/payments/${id}/verify`).then((r) => r.data),

  reject: (id, reason) =>
    api.put(`/payments/${id}/reject`, { reason }).then((r) => r.data),
};
