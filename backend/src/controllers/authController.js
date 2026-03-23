/**
 * controllers/authController.js
 */

const crypto = require('crypto');
const PasswordResetModel = require('../models/passwordReset.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const UserModel = require('../models/user.model');
const { sendResetPasswordEmail } = require('../services/email.service');
const {
  sendSuccess, sendCreated, sendBadRequest, sendUnauthorized,
} = require('../utils/response');

const signToken = (user, rememberMe = false) => {
  return jwt.sign(
    { user_id: user.user_id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? "7d" : "1d" }
  );
};

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

    const { username, password, role = 'tenant', name, email, phone } = req.body;
    const existing = await UserModel.findByUsername(username);
    if (existing) return sendBadRequest(res, 'Username is already taken');

    // แยก name → first_name / last_name
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || username;
    const lastName  = nameParts.slice(1).join(' ') || '';

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // สร้าง user พร้อม first_name/last_name/email/phone
    const { pool } = require('../config/db');
    const [userResult] = await pool.query(
      `INSERT INTO users (username, password_hash, role, first_name, last_name, email, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [username, password_hash, role, firstName, lastName || null, email || null, phone || null]
    );
    const userId = userResult.insertId;

    // สร้าง tenant record อัตโนมัติ (ถ้า role = tenant)
    if (role === 'tenant') {
      const { pool } = require('../config/db');
      const placeholderIdCard = `REG${String(userId).padStart(9, '0')}`;
      await pool.query(
        `INSERT IGNORE INTO tenants
           (user_id, first_name, last_name, id_card_number, phone, email)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          firstName,
          lastName || 'ไม่ระบุ',
          placeholderIdCard,
          phone || '0000000000',
          email || null,
        ]
      );
    }

    return sendCreated(res, { user_id: userId, username, role }, 'Account registered successfully');
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { username, password, rememberMe } = req.body;
    const user = await UserModel.findByUsername(username);
    if (!user) return sendUnauthorized(res, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    if (!user.is_active) return sendUnauthorized(res, "บัญชีนี้ถูกปิดการใช้งาน");

    // OAuth user ที่ยังไม่มีรหัสผ่าน
    if (!user.password_hash) return sendUnauthorized(res, "บัญชีนี้ใช้การเข้าสู่ระบบด้วย Google หรือ Telegram");

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return sendUnauthorized(res, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");

    const token = signToken(user, rememberMe);
    return sendSuccess(res, { token, user: { user_id: user.user_id, username: user.username, role: user.role } });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const { pool } = require('../config/db');
    const [rows] = await pool.query(
      `SELECT user_id, username, role, first_name, last_name, email, phone,
              telegram_chat_id, oauth_provider,
              CASE WHEN password_hash IS NOT NULL AND password_hash != '' THEN 1 ELSE 0 END AS has_password
       FROM users WHERE user_id = ? LIMIT 1`,
      [req.user.user_id]
    );
    if (!rows[0]) return sendUnauthorized(res, 'User no longer exists');
    return sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

    const { firstName, lastName, email, phone } = req.body;
    const { pool } = require('../config/db');

    await pool.query(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE user_id = ?`,
      [firstName || null, lastName || null, email || null, phone || null, req.user.user_id]
    );

    const [rows] = await pool.query(
      `SELECT user_id, username, role, first_name, last_name, email, phone,
              telegram_chat_id, oauth_provider,
              CASE WHEN password_hash IS NOT NULL AND password_hash != '' THEN 1 ELSE 0 END AS has_password
       FROM users WHERE user_id = ?`,
      [req.user.user_id]
    );
    return sendSuccess(res, rows[0], 'Profile updated successfully');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// POST /api/auth/set-password
// สำหรับ OAuth user ที่ต้องการตั้งรหัสผ่านครั้งแรก
// ไม่ต้องใส่รหัสเดิม เพราะไม่มี
// ─────────────────────────────────────────────
const setPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

    const { newPassword } = req.body;
    const { pool } = require('../config/db');

    // ตรวจว่ามีรหัสผ่านอยู่แล้วไหม
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = ? LIMIT 1',
      [req.user.user_id]
    );
    const user = rows[0];
    if (!user) return sendUnauthorized(res, 'User not found');

    if (user.password_hash && user.password_hash !== '') {
      return sendBadRequest(res, 'บัญชีนี้มีรหัสผ่านอยู่แล้ว กรุณาใช้ "เปลี่ยนรหัสผ่าน" แทน');
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [newHash, req.user.user_id]
    );

    return sendSuccess(res, null, 'ตั้งรหัสผ่านสำเร็จ');
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

    const { currentPassword, newPassword } = req.body;
    const { pool } = require('../config/db');

    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ? LIMIT 1', [req.user.user_id]);
    const user = rows[0];
    if (!user) return sendUnauthorized(res, 'User not found');

    if (!user.password_hash || user.password_hash === '') {
      return sendBadRequest(res, 'บัญชีนี้ยังไม่มีรหัสผ่าน กรุณาใช้ "ตั้งรหัสผ่าน" แทน');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return sendBadRequest(res, 'รหัสผ่านปัจจุบันไม่ถูกต้อง');

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHash, req.user.user_id]);

    return sendSuccess(res, null, 'เปลี่ยนรหัสผ่านสำเร็จ');
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username?.trim()) return sendBadRequest(res, 'กรุณากรอก username');

    const user = await UserModel.findByUsername(username.trim());
    if (!user) return sendSuccess(res, null, 'หากมีบัญชีนี้อยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้');
    if (!user.email) return sendBadRequest(res, 'บัญชีนี้ไม่มีอีเมลผูกอยู่ กรุณาติดต่อผู้ดูแลระบบ');

    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
    await PasswordResetModel.createResetToken(user.user_id, token, expiresAt);
    await sendResetPasswordEmail(user.email, user.username, token);

    return sendSuccess(res, null, 'ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว');
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const record = await PasswordResetModel.findByToken(token);
    if (!record) return sendBadRequest(res, 'Token ไม่ถูกต้อง');
    if (new Date(record.expires_at) < new Date()) return sendBadRequest(res, 'Token หมดอายุ');

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);
    const { pool } = require('../config/db');
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHash, record.user_id]);
    await PasswordResetModel.deleteToken(token);

    return sendSuccess(res, null, 'เปลี่ยนรหัสผ่านสำเร็จ');
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, updateProfile, changePassword, setPassword, forgotPassword, resetPassword };