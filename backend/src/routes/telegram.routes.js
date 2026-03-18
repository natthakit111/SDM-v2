/**
 * routes/telegram.routes.js
 * Base path: /api/telegram
 *
 * PURPOSE: Allow tenants to link their Telegram account to the system.
 *
 * SETUP FLOW:
 *   1. Admin creates a bot via @BotFather and gets TELEGRAM_BOT_TOKEN
 *   2. Set ADMIN_TELEGRAM_CHAT_ID in .env (admin's personal chat ID from @userinfobot)
 *   3. Tenant opens bot, types /start <username>
 *   4. Bot sends username to POST /api/telegram/link
 *   5. System saves chat_id to users.telegram_chat_id
 *
 * For production: use webhooks (setWebhook) instead of polling.
 * For development: use polling (enabled via initPolling below).
 */

const express = require('express');
const router  = express.Router();
const { pool } = require('../config/db');
const { authenticate } = require('../middlewares/auth.middleware');
const { sendSuccess, sendBadRequest, sendNotFound } = require('../utils/response');

// POST /api/telegram/link
// Body: { chat_id }  — called by the Telegram bot webhook when user sends /start
router.post('/link', authenticate, async (req, res, next) => {
  try {
    const { chat_id } = req.body;
    if (!chat_id) return sendBadRequest(res, 'chat_id is required');

    await pool.query(
      'UPDATE users SET telegram_chat_id = ? WHERE user_id = ?',
      [chat_id, req.user.user_id]
    );
    return sendSuccess(res, { chat_id }, 'Telegram account linked successfully');
  } catch (err) { next(err); }
});

// DELETE /api/telegram/unlink  — remove Telegram link
router.delete('/unlink', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE users SET telegram_chat_id = NULL WHERE user_id = ?',
      [req.user.user_id]
    );
    return sendSuccess(res, null, 'Telegram account unlinked');
  } catch (err) { next(err); }
});

// GET /api/telegram/status  — check if current user has linked Telegram
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

module.exports = router;


/**
 * ── TELEGRAM BOT POLLING SETUP (for development / simple deployments) ──────
 *
 * Add this to src/config/telegram.js and call initBot() from server.js
 * if you prefer polling over webhooks:
 *
 * const TelegramBot = require('node-telegram-bot-api');
 *
 * const initBot = () => {
 *   if (!process.env.TELEGRAM_BOT_TOKEN) return;
 *   const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
 *
 *   // /start command: tenant links their account
 *   // Usage: /start <username>
 *   bot.onText(/\/start (.+)/, async (msg, match) => {
 *     const chatId  = msg.chat.id;
 *     const username = match[1].trim();
 *
 *     try {
 *       const { pool } = require('./db');
 *       const [rows] = await pool.query(
 *         'UPDATE users SET telegram_chat_id = ? WHERE username = ? AND role = "tenant"',
 *         [chatId, username]
 *       );
 *       if (rows.affectedRows > 0) {
 *         bot.sendMessage(chatId, `✅ เชื่อมต่อ Telegram สำเร็จ!\nคุณจะได้รับแจ้งเตือนค่าเช่าและข่าวสารจากหอพักผ่านบัญชีนี้`);
 *       } else {
 *         bot.sendMessage(chatId, `❌ ไม่พบผู้ใช้ "${username}" กรุณาตรวจสอบ username อีกครั้ง`);
 *       }
 *     } catch (err) {
 *       console.error('[Bot] Error linking user:', err.message);
 *       bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
 *     }
 *   });
 *
 *   // /status — check bill status
 *   bot.onText(/\/status/, async (msg) => {
 *     const chatId = msg.chat.id;
 *     const { pool } = require('./db');
 *     const [bills] = await pool.query(`
 *       SELECT b.bill_month, b.bill_year, b.total_amount, b.status, r.room_number
 *       FROM bills b
 *       JOIN rooms r ON b.room_id = r.room_id
 *       JOIN contracts c ON b.contract_id = c.contract_id
 *       JOIN tenants t ON c.tenant_id = t.tenant_id
 *       JOIN users u ON t.user_id = u.user_id
 *       WHERE u.telegram_chat_id = ? AND b.status IN ('pending','overdue')
 *       ORDER BY b.bill_year DESC, b.bill_month DESC LIMIT 3
 *     `, [chatId]);
 *
 *     if (!bills.length) {
 *       return bot.sendMessage(chatId, '✅ ไม่มีบิลค้างชำระ');
 *     }
 *     const text = bills.map(b =>
 *       `📋 ห้อง ${b.room_number} | ${b.bill_month}/${b.bill_year} | ${Number(b.total_amount).toLocaleString()} บาท | ${b.status}`
 *     ).join('\n');
 *     bot.sendMessage(chatId, `📊 *สถานะบิลของคุณ:*\n\n${text}`, { parse_mode: 'Markdown' });
 *   });
 *
 *   console.log('🤖 Telegram Bot polling started');
 * };
 *
 * module.exports = { initBot };
 */
