/**
 * frondend/lib/api/payment.api.js
 * Backend: /api/payments
 */
import api from './axiosInstance';

export const paymentAPI = {
  // ── Tenant ───────────────────────────────────────────────
  getMyPayments: (params) =>
    api.get('/payments/my', { params }).then((r) => r.data),

  // ⚠️ field ชื่อ `payment_slip` (ต้องตรงกับ multer ใน backend)
  submit: (billId, slipFile, paymentMethod = 'qr_promptpay') => {
    const form = new FormData();
    form.append('bill_id', billId);
    form.append('payment_method', paymentMethod);
    if (slipFile) form.append('payment_slip', slipFile); // ✅ แก้จาก 'slip' → 'payment_slip'
    return api.post('/payments', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  // ── Admin ─────────────────────────────────────────────────
  getAll: (params) =>
    api.get('/payments', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/payments/${id}`).then((r) => r.data),

  verify: (id) =>
    api.put(`/payments/${id}/verify`).then((r) => r.data),

  reject: (id, reason) =>
    api.put(`/payments/${id}/reject`, { reason }).then((r) => r.data),
};