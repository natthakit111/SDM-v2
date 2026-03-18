/**
 * services/cron.service.js
 *
 * Scheduled background jobs using node-cron.
 * Called once from server.js on startup.
 *
 * Schedule summary:
 *   ┌─────────────────────── every day at 08:00 (bill reminder, 3 days before due)
 *   ├─────────────────────── every day at 00:05 (mark overdue bills)
 *   ├─────────────────────── every day at 08:30 (send overdue Telegram notices)
 *   └─────────────────────── 1st of every month at 07:00 (auto-generate bills — optional)
 */

const cron = require('node-cron');
const { pool } = require('../config/db');
const BillModel     = require('../models/bill.model');
const TelegramService = require('./telegram.service');

// ── Helper: get bills with tenant telegram_chat_id ────────────
const getBillsWithChatId = async (whereClause, params = []) => {
  const [rows] = await pool.query(`
    SELECT b.*,
           r.room_number,
           u.user_id,
           u.telegram_chat_id,
           CONCAT(t.first_name,' ',t.last_name) AS tenant_name
    FROM bills b
    JOIN rooms     r  ON b.room_id     = r.room_id
    JOIN contracts c  ON b.contract_id = c.contract_id
    JOIN tenants   t  ON c.tenant_id   = t.tenant_id
    JOIN users     u  ON t.user_id     = u.user_id
    WHERE u.telegram_chat_id IS NOT NULL
      AND u.is_active = 1
      AND ${whereClause}
  `, params);
  return rows;
};

// ════════════════════════════════════════════════════════════════
// JOB 1: Mark overdue bills
// Runs daily at 00:05 — sets status='overdue' for unpaid past-due bills
// ════════════════════════════════════════════════════════════════
const markOverdueBillsJob = () => {
  cron.schedule('5 0 * * *', async () => {
    console.log('[Cron] Running: markOverdueBillsJob');
    try {
      const count = await BillModel.markOverdueBills();
      console.log(`[Cron] Marked ${count} bill(s) as overdue`);
    } catch (err) {
      console.error('[Cron] markOverdueBillsJob error:', err.message);
    }
  }, { timezone: 'Asia/Bangkok' });
};

// ════════════════════════════════════════════════════════════════
// JOB 2: Send overdue Telegram notices
// Runs daily at 08:30 — notifies tenants with overdue bills
// ════════════════════════════════════════════════════════════════
const sendOverdueNoticesJob = () => {
  cron.schedule('30 8 * * *', async () => {
    console.log('[Cron] Running: sendOverdueNoticesJob');
    try {
      const bills = await getBillsWithChatId(`b.status = 'overdue'`);
      console.log(`[Cron] Sending overdue notices to ${bills.length} tenant(s)`);
      for (const bill of bills) {
        await TelegramService.sendOverdueNotice(bill);
      }
    } catch (err) {
      console.error('[Cron] sendOverdueNoticesJob error:', err.message);
    }
  }, { timezone: 'Asia/Bangkok' });
};

// ════════════════════════════════════════════════════════════════
// JOB 3: Send bill payment reminders (3 days before due date)
// Runs daily at 08:00
// ════════════════════════════════════════════════════════════════
const sendBillRemindersJob = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running: sendBillRemindersJob');
    try {
      // Find pending bills due in exactly 3 days
      const bills = await getBillsWithChatId(
        `b.status = 'pending' AND b.due_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY)`
      );
      console.log(`[Cron] Sending bill reminders to ${bills.length} tenant(s)`);
      for (const bill of bills) {
        await TelegramService.sendBillReminder(bill);
      }
    } catch (err) {
      console.error('[Cron] sendBillRemindersJob error:', err.message);
    }
  }, { timezone: 'Asia/Bangkok' });
};

// ════════════════════════════════════════════════════════════════
// JOB 4: Send 1-day-before reminder
// Runs daily at 09:00 — last warning before due date
// ════════════════════════════════════════════════════════════════
const sendFinalRemindersJob = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Running: sendFinalRemindersJob (1 day before due)');
    try {
      const bills = await getBillsWithChatId(
        `b.status = 'pending' AND b.due_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
      );
      console.log(`[Cron] Sending final reminders to ${bills.length} tenant(s)`);
      for (const bill of bills) {
        // Reuse sendBillReminder with a slightly different message suffix
        await TelegramService.sendBillReminder({ ...bill, _isFinalReminder: true });
      }
    } catch (err) {
      console.error('[Cron] sendFinalRemindersJob error:', err.message);
    }
  }, { timezone: 'Asia/Bangkok' });
};

// ════════════════════════════════════════════════════════════════
// JOB 5: Auto-expire contracts (optional)
// Runs daily at 01:00 — marks contracts as 'expired' if end_date passed
// ════════════════════════════════════════════════════════════════
const expireContractsJob = () => {
  cron.schedule('0 1 * * *', async () => {
    console.log('[Cron] Running: expireContractsJob');
    try {
      const [result] = await pool.query(`
        UPDATE contracts SET status = 'expired'
        WHERE status = 'active' AND end_date < CURDATE()
      `);
      if (result.affectedRows > 0) {
        console.log(`[Cron] Expired ${result.affectedRows} contract(s)`);
      }
    } catch (err) {
      console.error('[Cron] expireContractsJob error:', err.message);
    }
  }, { timezone: 'Asia/Bangkok' });
};

// ════════════════════════════════════════════════════════════════
// INIT — call this once from server.js
// ════════════════════════════════════════════════════════════════
const initCronJobs = () => {
  markOverdueBillsJob();
  sendOverdueNoticesJob();
  sendBillRemindersJob();
  sendFinalRemindersJob();
  expireContractsJob();

  console.log('⏰  Cron jobs initialized:');
  console.log('    00:05 — Mark overdue bills');
  console.log('    01:00 — Auto-expire contracts');
  console.log('    08:00 — Bill reminders (3 days before due)');
  console.log('    08:30 — Overdue notices');
  console.log('    09:00 — Final reminders (1 day before due)');
};

module.exports = { initCronJobs };
