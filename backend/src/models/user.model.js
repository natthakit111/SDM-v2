/**
 * models/user.model.js
 * Raw SQL query functions for the `users` table.
 * No ORM — uses mysql2 connection pool directly.
 */

const { pool } = require('../config/db');

/**
 * Find a user by their username.
 * @param {string} username
 * @returns {Object|null} user row or null
 */
const findByUsername = async (username) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] || null;
};

/**
 * Find a user by their user_id.
 * @param {number} userId
 * @returns {Object|null} user row (without password_hash) or null
 */
const findById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT user_id, username, role, telegram_chat_id, is_active, created_at
     FROM users WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

/**
 * Create a new user account.
 * @param {Object} param0 - { username, password_hash, role }
 * @returns {number} insertId of the new user
 */
const createUser = async ({ username, password_hash, role = 'tenant' }) => {
  const [result] = await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [username, password_hash, role]
  );
  return result.insertId;
};

/**
 * Update a user's Telegram chat ID (for notification linking).
 * @param {number} userId
 * @param {number} telegramChatId
 */
const updateTelegramChatId = async (userId, telegramChatId) => {
  await pool.query(
    'UPDATE users SET telegram_chat_id = ? WHERE user_id = ?',
    [telegramChatId, userId]
  );
};

/**
 * Deactivate a user account (soft delete).
 * @param {number} userId
 */
const deactivateUser = async (userId) => {
  await pool.query(
    'UPDATE users SET is_active = 0 WHERE user_id = ?',
    [userId]
  );
};

/**
 * Get all users (admin use — excludes password_hash).
 * @returns {Array} array of user rows
 */
const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT user_id, username, role, telegram_chat_id, is_active, created_at
     FROM users ORDER BY created_at DESC`
  );
  return rows;
};

module.exports = {
  findByUsername,
  findById,
  createUser,
  updateTelegramChatId,
  deactivateUser,
  findAll,
};
