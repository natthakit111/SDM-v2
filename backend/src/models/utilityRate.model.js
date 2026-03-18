/**
 * models/utilityRate.model.js
 * Manages electricity and water rates set by admin.
 */

const { pool } = require('../config/db');

// Get the current active rate for a given type (most recent effective_from <= today)
const getCurrentRate = async (utilityType) => {
  const [rows] = await pool.query(
    `SELECT * FROM utility_rates
     WHERE utility_type = ? AND effective_from <= CURDATE()
     ORDER BY effective_from DESC
     LIMIT 1`,
    [utilityType]
  );
  return rows[0] || null;
};

const findAll = async () => {
  const [rows] = await pool.query(
    'SELECT ur.*, u.username AS created_by_name FROM utility_rates ur JOIN users u ON ur.created_by = u.user_id ORDER BY effective_from DESC'
  );
  return rows;
};

const create = async ({ utility_type, rate_per_unit, effective_from, created_by }) => {
  const [result] = await pool.query(
    'INSERT INTO utility_rates (utility_type, rate_per_unit, effective_from, created_by) VALUES (?, ?, ?, ?)',
    [utility_type, rate_per_unit, effective_from, created_by]
  );
  return result.insertId;
};

module.exports = { getCurrentRate, findAll, create };
