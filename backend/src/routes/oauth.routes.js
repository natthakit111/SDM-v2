/**
 * routes/oauth.routes.js
 * Base path: /api/auth
 *
 * Google  : GET /api/auth/google  →  GET /api/auth/google/callback
 * Telegram: GET /api/auth/telegram  (Login Widget page)
 *           GET /api/auth/telegram/callback  (widget redirects here)
 *
 * Install:
 *   npm install passport passport-google-oauth20
 *   (ไม่ต้องใช้ passport-telegram แล้ว — verify เองด้วย HMAC)
 *
 * .env:
 *   GOOGLE_CLIENT_ID=...
 *   GOOGLE_CLIENT_SECRET=...
 *   TELEGRAM_BOT_TOKEN=...
 *   TELEGRAM_BOT_USERNAME=YourBotName
 *   BACKEND_URL=http://localhost:5000/api
 *   FRONTEND_URL=http://localhost:3000
 */

const express  = require('express');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const crypto   = require('crypto');
const jwt      = require('jsonwebtoken');
const router   = express.Router();
const { pool } = require('../config/db');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL  = process.env.BACKEND_URL  || 'http://localhost:5000/api';

/* ─────────────────────────────────────────
   Helper: sign JWT
───────────────────────────────────────── */
const signToken = (user) =>
  jwt.sign(
    { user_id: user.user_id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

/* ─────────────────────────────────────────
   Helper: upsert OAuth user
───────────────────────────────────────── */
async function upsertOAuthUser({ provider, providerId, email, displayName }) {
  // 1. Find by provider + providerId
  const [existing] = await pool.query(
    'SELECT * FROM users WHERE oauth_provider = ? AND oauth_provider_id = ? LIMIT 1',
    [provider, String(providerId)]
  );
  if (existing.length > 0) return existing[0];
 
  // 2. Find by email (link accounts)
  if (email) {
    const [byEmail] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (byEmail.length > 0) {
      await pool.query(
        'UPDATE users SET oauth_provider = ?, oauth_provider_id = ? WHERE user_id = ?',
        [provider, String(providerId), byEmail[0].user_id]
      );
      return byEmail[0];
    }
  }

  // 3. Create new tenant account
  const nameParts = (displayName || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName  = nameParts.slice(1).join(' ') || '';
 
  // ใช้ชื่อจริงเป็น base username (lowercase, no space)
  const baseUsername = (displayName || `${provider}_${providerId}`)
    .toLowerCase()
    .replace(/\s+/g, '_')       // space → underscore
    .replace(/[^a-z0-9_]/g, '') // ตัดอักขระพิเศษออก
    .slice(0, 40);              // จำกัดความยาว
 
  // ป้องกันชื่อซ้ำ — เติม _2, _3 ถ้าซ้ำ
  let username = baseUsername;
  let counter  = 2;
  while (true) {
    const [taken] = await pool.query(
      'SELECT user_id FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    if (taken.length === 0) break;
    username = `${baseUsername}_${counter++}`;
  }
 
  const [result] = await pool.query(
    `INSERT INTO users
       (username, password_hash, role, first_name, last_name, email,
        oauth_provider, oauth_provider_id, is_active)
     VALUES (?, '', 'tenant', ?, ?, ?, ?, ?, 1)`,
    [username, firstName, lastName, email || null, provider, String(providerId)]
  );

  const newUserId = result.insertId;

  // Auto-create tenant record (ข้อมูลบางส่วนยังไม่มี — ให้กรอกเพิ่มในโปรไฟล์ภายหลัง)
  const placeholderIdCard = `OAUTH${String(newUserId).padStart(8, '0')}`;
  await pool.query(
    `INSERT IGNORE INTO tenants
       (user_id, first_name, last_name, id_card_number, phone, email)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      newUserId,
      firstName || 'ไม่ระบุ',
      lastName  || 'ไม่ระบุ',
      placeholderIdCard,   // placeholder — แก้ได้ในหน้า profile
      '0000000000',        // placeholder — แก้ได้ในหน้า profile
      email || null,
    ]
  );

  const [newUser] = await pool.query(
    'SELECT * FROM users WHERE user_id = ? LIMIT 1',
    [newUserId]
  );
  return newUser[0];
}

/* ═════════════════════════════════════════
   GOOGLE OAUTH
═════════════════════════════════════════ */
passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${BACKEND_URL}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await upsertOAuthUser({
          provider:    'google',
          providerId:  profile.id,
          email:       profile.emails?.[0]?.value,
          displayName: profile.displayName,
        });
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    try {
      const token = signToken(req.user);
      res.redirect(`${FRONTEND_URL}/auth/google/callback?token=${token}`);
    } catch {
      res.redirect(`${FRONTEND_URL}/auth/google/callback?error=${encodeURIComponent('เกิดข้อผิดพลาด')}`);
    }
  }
);

/* ═════════════════════════════════════════
   TELEGRAM LOGIN WIDGET
   ไม่ต้องใช้ passport — verify HMAC เอง
   https://core.telegram.org/widgets/login
═════════════════════════════════════════ */

function verifyTelegramData(data) {
  const { hash, ...rest } = data;
  if (!hash) return false;

  // Reject if older than 5 minutes
  if (Date.now() / 1000 - parseInt(rest.auth_date, 10) > 300) return false;

  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join('\n');

  const secretKey = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest();

  const expected = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  return expected === hash;
}

// หน้า Login Widget
router.get('/telegram', (req, res) => {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || '';
  const callbackUrl = `${BACKEND_URL}/auth/telegram/callback`;

  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Login with Telegram</title>
  <style>
    body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f0f2f5;font-family:sans-serif}
    .box{background:#fff;padding:2rem;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,.1);text-align:center}
    p{color:#666;margin-top:.5rem;font-size:.9rem}
  </style>
</head>
<body>
  <div class="box">
    <h2>เข้าสู่ระบบด้วย Telegram</h2>
    <p>กดปุ่มด้านล่างเพื่ออนุญาต</p>
    <script async
      src="https://telegram.org/js/telegram-widget.js?22"
      data-telegram-login="${botUsername}"
      data-size="large"
      data-auth-url="${callbackUrl}"
      data-request-access="write">
    </script>
  </div>
</body>
</html>`);
});

// Callback ที่ widget redirect มา
router.get('/telegram/callback', async (req, res) => {
  try {
    if (!verifyTelegramData(req.query)) {
      return res.redirect(
        `${FRONTEND_URL}/auth/telegram/callback?error=${encodeURIComponent('ข้อมูลจาก Telegram ไม่ถูกต้อง')}`
      );
    }

    const { id, first_name, last_name } = req.query;

    const user = await upsertOAuthUser({
      provider:    'telegram',
      providerId:  id,
      email:       null,
      displayName: [first_name, last_name].filter(Boolean).join(' '),
    });

    await pool.query(
      'UPDATE users SET telegram_chat_id = ? WHERE user_id = ?',
      [String(id), user.user_id]
    );

    const token = signToken(user);
    res.redirect(`${FRONTEND_URL}/auth/telegram/callback?token=${token}`);
  } catch (err) {
    console.error('Telegram OAuth error:', err);
    res.redirect(
      `${FRONTEND_URL}/auth/telegram/callback?error=${encodeURIComponent('เกิดข้อผิดพลาด')}`
    );
  }
});

module.exports = router;