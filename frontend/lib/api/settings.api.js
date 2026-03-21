/**
 * frondend/lib/api/settings.api.js
 * Backend: /api/settings  (Admin only)
 *
 * GET  /settings        — { dorm_name, dorm_address, admin_email, ... }
 * PUT  /settings        — อัปเดต key ที่ส่งมา
 */
import api from './axiosInstance';

export const settingsAPI = {
  getAll: () =>
    api.get('/settings').then((r) => r.data),

  update: (data) =>
    api.put('/settings', data).then((r) => r.data),
  // data: Partial<{ dorm_name, dorm_address, admin_email, admin_phone,
  //                 currency, tax_rate,
  //                 bank_name, bank_account, bank_account_name,
  //                 notify_payment, notify_maintenance, notify_overdue }>
};