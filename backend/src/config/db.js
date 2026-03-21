const mysql = require('mysql2/promise');

// Railway inject DATABASE_URL อัตโนมัติเมื่อเพิ่ม MySQL plugin
// รองรับทั้ง DATABASE_URL และ individual env vars
function getPoolConfig() {
  if (process.env.DATABASE_URL) {
    return { uri: process.env.DATABASE_URL, waitForConnections: true, connectionLimit: 10, queueLimit: 0, timezone: '+07:00', charset: 'utf8mb4' };
  }
  return {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'smart_dormitory',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    timezone:           '+07:00',
    charset:            'utf8mb4',
  };
}

const pool = mysql.createPool(getPoolConfig());

const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅  MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };