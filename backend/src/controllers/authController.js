/**
 * controllers/authController.js
 * Handles: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
 */

const crypto = require('crypto');
const PasswordResetModel = require('../models/passwordReset.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const UserModel = require('../models/user.model');
const { sendResetPasswordEmail } = require('../services/email.service');
const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendUnauthorized,
  sendError,
} = require('../utils/response');

// ─────────────────────────────────────────────
// Helper: sign a JWT for a user
// ─────────────────────────────────────────────
const signToken = (user, rememberMe = false) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? "7d" : "1d" }
  );
};

// ─────────────────────────────────────────────
// POST /api/auth/register
// Body: { username, password, role? }
// Only 'admin' can create another admin account (enforced in route via middleware)
// ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendBadRequest(res, 'Validation failed', errors.array());
    }

    const { username, password, role = 'tenant' } = req.body;

    // Check if username already taken
    const existing = await UserModel.findByUsername(username);
    if (existing) {
      return sendBadRequest(res, 'Username is already taken');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const userId = await UserModel.createUser({ username, password_hash, role });

    return sendCreated(res, { user_id: userId, username, role }, 'Account registered successfully');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// Body: { username, password }
// Returns: JWT token + user info
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { username, password, rememberMe } = req.body;

    const user = await UserModel.findByUsername(username);
    if (!user) {
      return sendUnauthorized(res, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }

    if (!user.is_active) {
      return sendUnauthorized(res, "บัญชีนี้ถูกปิดการใช้งาน");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendUnauthorized(res, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }

    const token = signToken(user, rememberMe);

    return sendSuccess(res, {
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/me
// Protected: requires valid JWT
// ─────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.user_id);
    if (!user) {
      return sendUnauthorized(res, 'User no longer exists');
    }
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PUT /api/auth/profile
// Protected: requires valid JWT
// Body: { firstName, lastName, email, phone }
// ─────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendBadRequest(res, 'Validation failed', errors.array());
    }

    const { firstName, lastName, email, phone } = req.body;
    const { pool } = require('../config/db');

    await pool.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, phone = ?
       WHERE user_id = ?`,
      [firstName || null, lastName || null, email || null, phone || null, req.user.user_id]
    );

    const [rows] = await pool.query(
      'SELECT user_id, username, role, first_name, last_name, email, phone, telegram_chat_id FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    return sendSuccess(res, rows[0], 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { username } = req.body;
 
    if (!username || !username.trim()) {
      return sendBadRequest(res, 'กรุณากรอก username');
    }
 
    const user = await UserModel.findByUsername(username.trim());
 
    // ไม่บอกว่าไม่มี user — ป้องกัน user enumeration attack
    if (!user) {
      return sendSuccess(res, null, 'หากมีบัญชีนี้อยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้');
    }
 
    // ตรวจว่ามี email ไหม
    if (!user.email) {
      return sendBadRequest(res, 'บัญชีนี้ไม่มีอีเมลผูกอยู่ กรุณาติดต่อผู้ดูแลระบบ');
    }
 
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 นาที
 
    await PasswordResetModel.createResetToken(user.user_id, token, expiresAt);
 
    // ส่ง email จริง
    await sendResetPasswordEmail(user.email, user.username, token);
 
    return sendSuccess(res, null, 'ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const record = await PasswordResetModel.findByToken(token);
    if (!record) {
      return sendBadRequest(res, 'Token ไม่ถูกต้อง');
    }

    if (new Date(record.expires_at) < new Date()) {
      return sendBadRequest(res, 'Token หมดอายุ');
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);

    const { pool } = require('../config/db');
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [newHash, record.user_id]
    );

    await PasswordResetModel.deleteToken(token);

    return sendSuccess(res, null, 'เปลี่ยนรหัสผ่านสำเร็จ');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PUT /api/auth/change-password
// Protected: requires valid JWT
// Body: { currentPassword, newPassword }
// ─────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendBadRequest(res, 'Validation failed', errors.array());
    }

    const { currentPassword, newPassword } = req.body;
    const { pool } = require('../config/db');

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE user_id = ? LIMIT 1',
      [req.user.user_id]
    );
    const user = rows[0];
    if (!user) return sendUnauthorized(res, 'User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return sendBadRequest(res, 'Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [newHash, req.user.user_id]
    );

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword,  };