/**
 * frondend/lib/api/room.api.js
 * Backend: /api/rooms
 */
import api from './axiosInstance';

export const roomAPI = {
  getStats: () =>
    api.get('/rooms/stats').then((r) => r.data),

  getAll: (params) =>
    api.get('/rooms', { params }).then((r) => r.data),
  // params?: { status: 'available' | 'occupied' | 'maintenance' }

  getById: (id) =>
    api.get(`/rooms/${id}`).then((r) => r.data),

  create: (data) =>
    api.post('/rooms', data).then((r) => r.data),
  // data: { room_number, floor, room_type, base_rent, area_sqm? }

  update: (id, data) =>
    api.put(`/rooms/${id}`, data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/rooms/${id}`).then((r) => r.data),
};
