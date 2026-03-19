/**
 * frondend/lib/api/maintenance.api.js
 * Backend: /api/maintenance
 */
import api from './axiosInstance';

export const maintenanceAPI = {
  // ── Tenant ───────────────────────────────────────────────
  getMyRequests: (params) =>
    api.get('/maintenance/my', { params }).then((r) => r.data),

  // ⚠️ multipart/form-data (รูปภาพ optional)
  create: (data, imageFile) => {
    const form = new FormData();
    // data: { category, description (min 10 chars), priority?: 'low'|'medium'|'high' }
    Object.entries(data).forEach(([k, v]) => form.append(k, v));
    if (imageFile) form.append('image', imageFile);
    return api.post('/maintenance', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  cancel: (id) =>
    api.put(`/maintenance/${id}/cancel`).then((r) => r.data),

  // ── Admin ─────────────────────────────────────────────────
  getStats: () =>
    api.get('/maintenance/stats').then((r) => r.data),

  getAll: (params) =>
    api.get('/maintenance', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/maintenance/${id}`).then((r) => r.data),

  updateStatus: (id, status) =>
    api.put(`/maintenance/${id}/status`, { status }).then((r) => r.data),
  // status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
};
