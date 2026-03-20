/**
 * routes/auth.routes.js
 * Base path: /api/auth
 *
 * Public:    POST /register        — create new account
 *            POST /login           — get JWT
 * Protected: GET  /me              — current user info
 *            PUT  /profile         — update profile info
 *            PUT  /change-password — change password
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// ── Validation rule sets ─────────────────────────────────────

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3–50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'tenant'])
    .withMessage('Role must be either admin or tenant'),
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ max: 100 }).withMessage('First name too long'),
  body('lastName').optional().trim().isLength({ max: 100 }).withMessage('Last name too long'),
  body('email').optional({ nullable: true }).trim().isEmail().withMessage('Invalid email format'),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 20 }).withMessage('Phone too long'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

// ── Routes ───────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Public — but creating an admin account requires existing admin JWT.
 */
router.post('/register', registerValidation, (req, res, next) => {
  if (req.body.role === 'admin') {
    return authenticate(req, res, () => {
      authorizeRoles('admin')(req, res, () => {
        authController.register(req, res, next);
      });
    });
  }
  authController.register(req, res, next);
});

/**
 * POST /api/auth/login
 */
router.post('/login', loginValidation, authController.login);

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, authController.getMe);

/**
 * PUT /api/auth/profile  ✅ เพิ่มใหม่
 * อัปเดตข้อมูลโปรไฟล์ (ชื่อ, อีเมล, เบอร์)
 */
router.put('/profile', authenticate, updateProfileValidation, authController.updateProfile);

/**
 * PUT /api/auth/change-password
 */
router.put('/change-password', authenticate, changePasswordValidation, authController.changePassword);

module.exports = router;