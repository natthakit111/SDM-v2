/**
 * frondend/lib/api/telegram.api.js
 * Backend: /api/telegram
 */
import api from './axiosInstance';

export const telegramAPI = {
  // ── Tenant ───────────────────────────────────────────────
  // เชื่อม Telegram account กับระบบ
  link: (chat_id) =>
    api.post('/telegram/link', { chat_id }).then((r) => r.data),

  unlink: () =>
    api.delete('/telegram/unlink').then((r) => r.data),

  getStatus: () =>
    api.get('/telegram/status').then((r) => r.data),
  // returns: { linked: boolean, chat_id: string | null }

  // ── Admin only ────────────────────────────────────────────
  sendBroadcast: (message) =>
    api.post('/telegram/broadcast', { message }).then((r) => r.data),
  // returns: { sent: number, total: number }
};