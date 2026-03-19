/**
 * routes/settings.routes.js
 * Base path: /api/settings
 * Admin only
 *
 * GET  /api/settings        — ดึงค่าทั้งหมด
 * PUT  /api/settings        — อัปเดตหลาย key พร้อมกัน
 */

const express = require('express');
const router  = express.Router();
const { pool } = require('../config/db');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { sendSuccess, sendBadRequest } = require('../utils/response');

// GET /api/settings
router.get('/', authenticate, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM dorm_settings');
    // แปลงเป็น object { key: value }
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    return sendSuccess(res, settings);
  } catch (err) { next(err); }
});

// PUT /api/settings
// Body: { dorm_name, dorm_address, admin_email, ... }
router.put('/', authenticate, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const allowed = [
      'dorm_name', 'dorm_address', 'admin_email', 'admin_phone',
      'currency', 'tax_rate',
      'bank_name', 'bank_account', 'bank_account_name',
      'notify_payment', 'notify_maintenance', 'notify_overdue',
    ];

    const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k));
    if (updates.length === 0) return sendBadRequest(res, 'No valid fields to update');

    // UPSERT ทีละ key
    for (const [key, value] of updates) {
      await pool.query(
        `INSERT INTO dorm_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, String(value)]
      );
    }

    // คืนค่าล่าสุดทั้งหมด
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM dorm_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    return sendSuccess(res, settings, 'Settings updated');
  } catch (err) { next(err); }
});

module.exports = router;