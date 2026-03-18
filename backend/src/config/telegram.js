/**
 * config/telegram.js
 * Initializes the Telegram Bot with polling (dev) or webhook (prod).
 * Called once from server.js.
 *
 * Bot commands available to tenants:
 *   /start <username>  — link Telegram account
 *   /status            — show pending bills
 *   /help              — list commands
 */

const TelegramBot = require('node-telegram-bot-api')
const { pool }    = require('./db')
const logger      = require('../utils/logger')

let bot = null

const initBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    logger.warn('TELEGRAM_BOT_TOKEN not set — bot disabled')
    return
  }

  bot = new TelegramBot(token, { polling: true })
  logger.info('🤖 Telegram Bot polling started')

  // /start <username> — link account
  bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId   = msg.chat.id
    const username = match[1].trim()
    try {
      const [rows] = await pool.query(
        'UPDATE users SET telegram_chat_id = ? WHERE username = ? AND role = "tenant" AND is_active = 1',
        [chatId, username]
      )
      if (rows.affectedRows > 0) {
        bot.sendMessage(chatId,
          `✅ *เชื่อมต่อ Telegram สำเร็จ!*\n\nสวัสดีคุณ *${username}*\nคุณจะได้รับแจ้งเตือนค่าเช่า, ยืนยันการชำระเงิน และข่าวสารจากหอพักผ่าน Telegram นี้\n\nพิมพ์ /help เพื่อดูคำสั่งทั้งหมด`,
          { parse_mode: 'Markdown' }
        )
      } else {
        bot.sendMessage(chatId, `❌ ไม่พบผู้ใช้ "*${username}*" กรุณาตรวจสอบ username ของท่านในแอปพลิเคชัน`, { parse_mode: 'Markdown' })
      }
    } catch (err) {
      logger.error('Bot /start error:', err)
      bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  })

  // /start without username
  bot.onText(/^\/start$/, (msg) => {
    bot.sendMessage(msg.chat.id,
      `🏠 *Smart Dormitory Bot*\n\nกรุณาเชื่อมต่อบัญชีด้วยการพิมพ์:\n\`/start <username>\`\n\nเช่น: \`/start john123\``,
      { parse_mode: 'Markdown' }
    )
  })

  // /status — pending bills
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id
    try {
      const [bills] = await pool.query(`
        SELECT b.bill_month, b.bill_year, b.total_amount, b.status, b.due_date, r.room_number
        FROM bills b
        JOIN rooms r ON b.room_id = r.room_id
        JOIN contracts c ON b.contract_id = c.contract_id
        JOIN tenants t ON c.tenant_id = t.tenant_id
        JOIN users u ON t.user_id = u.user_id
        WHERE u.telegram_chat_id = ? AND b.status IN ('pending','overdue')
        ORDER BY b.bill_year DESC, b.bill_month DESC LIMIT 5
      `, [chatId])

      if (!bills.length) {
        return bot.sendMessage(chatId, '✅ ไม่มีบิลค้างชำระ ขอบคุณที่ชำระตรงเวลาเสมอ 🙏')
      }

      const MONTHS = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
      const lines = bills.map(b =>
        `📋 ห้อง ${b.room_number} | ${MONTHS[b.bill_month]} ${b.bill_year} | *${Number(b.total_amount).toLocaleString('th-TH')} ฿* | ${b.status === 'overdue' ? '🔴 เกินกำหนด' : '🟡 รอชำระ'}`
      ).join('\n')

      bot.sendMessage(chatId, `📊 *บิลค้างชำระของคุณ:*\n\n${lines}\n\nกรุณาชำระผ่านแอปพลิเคชัน`, { parse_mode: 'Markdown' })
    } catch (err) {
      logger.error('Bot /status error:', err)
      bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  })

  // /help
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id,
      `🏠 *Smart Dormitory — คำสั่งทั้งหมด*\n\n` +
      `/start <username> — เชื่อมต่อบัญชี\n` +
      `/status — ดูบิลค้างชำระ\n` +
      `/help — แสดงคำสั่งทั้งหมด`,
      { parse_mode: 'Markdown' }
    )
  })
}

const getBot = () => bot

module.exports = { initBot, getBot }
