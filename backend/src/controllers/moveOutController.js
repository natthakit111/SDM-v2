/**
 * controllers/moveOutController.js
 */
const { validationResult } = require('express-validator');
const { pool }        = require('../config/db');
const TenantModel     = require('../models/tenant.model');
const ContractModel   = require('../models/contract.model');
const RoomModel       = require('../models/room.model');
const {
  sendSuccess, sendCreated, sendBadRequest, sendNotFound, sendForbidden,
} = require('../utils/response');

// ── helpers ───────────────────────────────────────────────────────────────────
const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT r.*, t.first_name, t.last_name, ro.room_number
     FROM move_out_requests r
     JOIN tenants t  ON t.tenant_id  = r.tenant_id
     JOIN rooms ro   ON ro.room_id   = r.room_id
     WHERE r.request_id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ── GET /api/move-out  (admin: all | tenant: own) ────────────────────────────
const getAll = async (req, res, next) => {
  try {
    let sql = `
      SELECT r.*, t.first_name, t.last_name, ro.room_number
      FROM move_out_requests r
      JOIN tenants t  ON t.tenant_id  = r.tenant_id
      JOIN rooms ro   ON ro.room_id   = r.room_id`;
    const params = [];

    if (req.user.role === 'tenant') {
      const tenant = await TenantModel.findByUserId(req.user.user_id);
      if (!tenant) return sendNotFound(res, 'Tenant not found');
      sql += ' WHERE r.tenant_id = ?';
      params.push(tenant.tenant_id);
    }
    sql += ' ORDER BY r.created_at DESC';
    const [rows] = await pool.query(sql, params);
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
};

// ── POST /api/move-out  (tenant only) ────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

    const tenant = await TenantModel.findByUserId(req.user.user_id);
    if (!tenant) return sendNotFound(res, 'Tenant profile not found');

    const contract = await ContractModel.findActiveByTenant(tenant.tenant_id);
    if (!contract) return sendBadRequest(res, 'You do not have an active contract');

    // ตรวจว่ายังไม่มี pending request
    const [existing] = await pool.query(
      `SELECT request_id FROM move_out_requests
       WHERE tenant_id = ? AND status = 'pending' LIMIT 1`,
      [tenant.tenant_id]
    );
    if (existing.length > 0)
      return sendBadRequest(res, 'You already have a pending move-out request');

    const { move_out_date, reason } = req.body;

    // ตรวจ 30 วัน
    const moveOut = new Date(move_out_date);
    const daysNotice = Math.ceil((moveOut - new Date()) / (1000 * 60 * 60 * 24));
    if (daysNotice < 30)
      return sendBadRequest(res, 'Move-out date must be at least 30 days from today');

    const [result] = await pool.query(
      `INSERT INTO move_out_requests
         (tenant_id, contract_id, room_id, move_out_date, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [tenant.tenant_id, contract.contract_id, contract.room_id, move_out_date, reason]
    );

    const created = await findById(result.insertId);
    return sendCreated(res, created, 'Move-out request submitted successfully');
  } catch (err) { next(err); }
};

// ── PUT /api/move-out/:id/approve  (admin only) ──────────────────────────────
const approve = async (req, res, next) => {
  try {
    const request = await findById(req.params.id);
    if (!request) return sendNotFound(res, 'Request not found');
    if (request.status !== 'pending') return sendBadRequest(res, 'Request is already reviewed');

    const { admin_note } = req.body;

    // ยกเลิกสัญญาและเปิดห้องว่าง
    await pool.query(
      `UPDATE contracts SET status = 'terminated' WHERE contract_id = ?`,
      [request.contract_id]
    );
    await RoomModel.updateStatus(request.room_id, 'available');

    await pool.query(
      `UPDATE move_out_requests
       SET status = 'approved', admin_note = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE request_id = ?`,
      [admin_note || null, req.user.user_id, request.request_id]
    );

    return sendSuccess(res, await findById(request.request_id), 'Move-out approved');
  } catch (err) { next(err); }
};

// ── PUT /api/move-out/:id/reject  (admin only) ───────────────────────────────
const reject = async (req, res, next) => {
  try {
    const request = await findById(req.params.id);
    if (!request) return sendNotFound(res, 'Request not found');
    if (request.status !== 'pending') return sendBadRequest(res, 'Request is already reviewed');

    const { admin_note } = req.body;
    await pool.query(
      `UPDATE move_out_requests
       SET status = 'rejected', admin_note = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE request_id = ?`,
      [admin_note || null, req.user.user_id, request.request_id]
    );

    return sendSuccess(res, await findById(request.request_id), 'Move-out request rejected');
  } catch (err) { next(err); }
};

module.exports = { getAll, create, approve, reject };