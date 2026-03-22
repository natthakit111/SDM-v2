/**
 * routes/telegram.routes.js
 * Base path: /api/telegram
 */

const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { pool } = require('../config/db');
const { authenticate } = require('../middlewares/auth.middleware');
const { sendSuccess, sendBadRequest } = require('../utils/response');

// ─────────────────────────────────────────────
// GET /api/telegram/status
// ตรวจสอบว่า user เชื่อม Telegram แล้วหรือยัง
// ─────────────────────────────────────────────
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT telegram_chat_id FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    const linked = !!(rows[0]?.telegram_chat_id);
    return sendSuccess(res, { linked, chat_id: rows[0]?.telegram_chat_id || null });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────
// POST /api/telegram/generate-link
// สร้าง deep link สำหรับเชื่อม Telegram
// Bot จะรับ /start <token> แล้ว link กลับมา
// ─────────────────────────────────────────────
router.post('/generate-link', authenticate, async (req, res, next) => {
  try {
    const token     = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 นาที

    // บันทึก token ลงฐานข้อมูล
    await pool.query(
      `INSERT INTO telegram_link_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
      [req.user.user_id, token, expiresAt]
    );

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || '';
    const deepLink    = `https://t.me/${botUsername}?start=link_${token}`;

    return sendSuccess(res, { deepLink, token, expiresAt });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────
// POST /api/telegram/link
// เรียกโดย bot หลังจาก user กด deep link
// Body: { token, chat_id, telegram_username }
// ─────────────────────────────────────────────
router.post('/link', async (req, res, next) => {
  try {
    const { token, chat_id, telegram_username } = req.body;
    if (!token || !chat_id) return sendBadRequest(res, 'token and chat_id are required');

    // ตรวจ token
    const [rows] = await pool.query(
      'SELECT * FROM telegram_link_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    if (!rows.length) return sendBadRequest(res, 'Token ไม่ถูกต้องหรือหมดอายุ');

    const { user_id } = rows[0];

    // บันทึก chat_id
    await pool.query(
      'UPDATE users SET telegram_chat_id = ? WHERE user_id = ?',
      [String(chat_id), user_id]
    );

    // ลบ token ทิ้ง
    await pool.query('DELETE FROM telegram_link_tokens WHERE token = ?', [token]);

    // ส่งข้อความต้อนรับ
    try {
      const TelegramService = require('../services/telegram.service');
      const [userRows] = await pool.query(
        'SELECT username FROM users WHERE user_id = ?',
        [user_id]
      );
      const username = userRows[0]?.username || 'ผู้เช่า';
      const TelegramBot = require('node-telegram-bot-api');
      const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
      await bot.sendMessage(
        chat_id,
        `✅ *เชื่อมต่อ Telegram สำเร็จ!*\n\nสวัสดี @${telegram_username || username}!\nคุณจะได้รับการแจ้งเตือนค่าเช่า บิล และข่าวสารจากหอพักผ่าน Telegram นี้\n\nพิมพ์ /status เพื่อดูสถานะบิลปัจจุบัน`,
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      console.error('[Telegram] Welcome message failed:', e.message);
    }

    return sendSuccess(res, null, 'เชื่อมต่อ Telegram สำเร็จ');
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────
// DELETE /api/telegram/unlink
// ยกเลิกการเชื่อม Telegram
// ─────────────────────────────────────────────
router.delete('/unlink', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE users SET telegram_chat_id = NULL WHERE user_id = ?',
      [req.user.user_id]
    );
    return sendSuccess(res, null, 'ยกเลิกการเชื่อมต่อ Telegram แล้ว');
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────
// POST /api/telegram/broadcast  — admin only
// ─────────────────────────────────────────────
router.post('/broadcast', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const { message } = req.body;
    if (!message?.trim()) return sendBadRequest(res, 'message is required');

    const TelegramService = require('../services/telegram.service');
    await TelegramService.broadcastAnnouncement('ข้อความจากผู้ดูแล', message, 'tenant', null);

    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u
       JOIN tenants t ON u.user_id = t.user_id
       JOIN contracts c ON c.tenant_id = t.tenant_id AND c.status = 'active'
       WHERE u.is_active = 1 AND u.telegram_chat_id IS NOT NULL`
    );
    const total = rows[0]?.total ?? 0;
    return sendSuccess(res, { sent: total }, `Broadcast sent to ${total} tenant(s)`);
  } catch (err) { next(err); }
});

module.exports = router;