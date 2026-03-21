const { pool } = require('../config/db');

const createResetToken = async (userId, token, expiresAt) => {
  await pool.query(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
};

const findByToken = async (token) => {
  const [rows] = await pool.query(
    'SELECT * FROM password_resets WHERE token = ? LIMIT 1',
    [token]
  );
  return rows[0] || null;
};

const deleteToken = async (token) => {
  await pool.query('DELETE FROM password_resets WHERE token = ?', [token]);
};

module.exports = {
  createResetToken,
  findByToken,
  deleteToken,
};