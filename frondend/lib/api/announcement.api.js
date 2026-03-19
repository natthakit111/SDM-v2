/**
 * frondend/lib/api/announcement.api.js
 * Backend: /api/announcements
 */
import api from './axiosInstance';

export const announcementAPI = {
  getAll: (params) =>
    api.get('/announcements', { params }).then((r) => r.data),
  // params?: { target_audience: 'all'|'admin'|'tenant' }

  getById: (id) =>
    api.get(`/announcements/${id}`).then((r) => r.data),

  // ── Admin only ────────────────────────────────────────────
  create: (data) =>
    api.post('/announcements', data).then((r) => r.data),
  // data: { title, content, target_audience?, expires_at? }

  update: (id, data) =>
    api.put(`/announcements/${id}`, data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/announcements/${id}`).then((r) => r.data),
};
