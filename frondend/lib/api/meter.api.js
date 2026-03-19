/**
 * frondend/lib/api/meter.api.js
 * Backend: /api/meters  (Admin only)
 */
import api from './axiosInstance';

export const meterAPI = {
  getAll: (params) =>
    api.get('/meters', { params }).then((r) => r.data),

  getPreviousReading: (roomId) =>
    api.get(`/meters/rooms/${roomId}/previous`).then((r) => r.data),

  getById: (id) =>
    api.get(`/meters/${id}`).then((r) => r.data),

  // ⚠️ multipart/form-data
  create: (data, imageFile) => {
    const form = new FormData();
    // data: { room_id, meter_type:'electric'|'water', reading_month, reading_year, current_unit, rate_per_unit? }
    Object.entries(data).forEach(([k, v]) => form.append(k, v));
    if (imageFile) form.append('image', imageFile);
    return api.post('/meters', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  update: (id, data, imageFile) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v));
    if (imageFile) form.append('image', imageFile);
    return api.put(`/meters/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
