/**
 * frondend/lib/api/auth.api.js
 * Backend: POST /auth/login ใช้ field `username` (ไม่ใช่ email)
 */
import api from './axiosInstance';

export const authAPI = {
  // Tenant self-register — ไม่ต้องการ token
  register: (data) =>
    api.post('/auth/register', data).then((r) => r.data),
  // data: { username, password, role? }

  // ⚠️ field ชื่อ `username` ไม่ใช่ `email`
  login: (username, password) =>
    api.post('/auth/login', { username, password }).then((r) => r.data),
  // returns: { token, user: { user_id, username, role } }

  getMe: () =>
    api.get('/auth/me').then((r) => r.data),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
};
