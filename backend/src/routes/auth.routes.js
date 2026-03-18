/**
 * routes/auth.routes.js
 * Base path: /api/auth
 *
 * Public:    POST /register   — create new account
 *            POST /login      — get JWT
 * Protected: GET  /me         — current user info
 *            PUT  /change-password
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

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

// ── Routes ───────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Public endpoint — but creating an admin account requires an existing admin JWT.
 * If role='admin' is in the body, the route enforces authenticate + authorizeRoles('admin').
 */
router.post('/register', registerValidation, (req, res, next) => {
  // If registering as admin, require existing admin token
  if (req.body.role === 'admin') {
    return authenticate(req, res, () => {
      authorizeRoles('admin')(req, res, () => {
        authController.register(req, res, next);
      });
    });
  }
  // Regular tenant self-registration — no token required
  authController.register(req, res, next);
});

/**
 * POST /api/auth/login
 * Returns a signed JWT on valid credentials.
 */
router.post('/login', loginValidation, authController.login);

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
router.get('/me', authenticate, authController.getMe);

/**
 * PUT /api/auth/change-password
 * Allows any authenticated user to change their own password.
 */
router.put(
  '/change-password',
  authenticate,
  changePasswordValidation,
  authController.changePassword
);

module.exports = router;
