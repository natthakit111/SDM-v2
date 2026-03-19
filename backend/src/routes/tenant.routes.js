/**
 * routes/tenant.routes.js
 * Base path: /api/tenants
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/tenantController');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

const createValidation = [
  body('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 6 }),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),

  // ✅ FIX: strip dashes ก่อน validate เพราะ user กรอก "1-2345-67890-12-3" (17 ตัว)
  body('id_card_number')
    .trim()
    .customSanitizer((val) => val.replace(/-/g, ''))   // ลบขีดออก → เหลือ 13 ตัว
    .isLength({ min: 13, max: 13 })
    .withMessage('ID card must be 13 digits'),

  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').optional().isEmail(),
];

const updateValidation = [
  body('phone').optional().notEmpty(),
  body('email').optional().isEmail(),
];

// Tenant self-service (must come BEFORE /:id to avoid route conflict)
router.get('/me/profile',   authenticate, authorizeRoles('tenant'), ctrl.getMyProfile);
router.put('/me/profile',   authenticate, authorizeRoles('tenant'), ctrl.updateMyProfile);

// Admin routes
router.get('/',       authenticate, authorizeRoles('admin'), ctrl.getAllTenants);
router.get('/:id',    authenticate, authorizeRoles('admin'), ctrl.getTenantById);
router.post('/',      authenticate, authorizeRoles('admin'), createValidation, ctrl.createTenant);
router.put('/:id',    authenticate, authorizeRoles('admin'), updateValidation, ctrl.updateTenant);
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteTenant);

module.exports = router;