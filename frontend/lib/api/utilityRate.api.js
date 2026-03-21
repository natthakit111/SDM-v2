/**
 * frondend/lib/api/utilityRate.api.js
 * Backend: /api/utility-rates  (สังเกต: มี dash ไม่ใช่ underscore)
 */
import api from './axiosInstance';

export const utilityRateAPI = {
  // ทุก role ดูได้ — ใช้แสดงราคาหน่วยในหน้า meter
  getCurrent: () =>
    api.get('/utility-rates/current').then((r) => r.data),
  // returns: { electric: { rate_per_unit }, water: { rate_per_unit } }

  getAll: () =>
    api.get('/utility-rates').then((r) => r.data),

  create: (data) =>
    api.post('/utility-rates', data).then((r) => r.data),
  // data: { utility_type: 'electric'|'water', rate_per_unit, effective_from }
};
