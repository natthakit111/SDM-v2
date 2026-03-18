/**
 * controllers/maintenanceController.js (Phase 5 — Telegram wired in)
 */

const { validationResult } = require('express-validator');
const MaintenanceModel = require('../models/maintenance.model');
const TenantModel      = require('../models/tenant.model');
const ContractModel    = require('../models/contract.model');
const TelegramService  = require('../services/telegram.service');
const { sendSuccess, sendCreated, sendBadRequest, sendNotFound, sendForbidden } = require('../utils/response');

const getAllRequests = async (req, res, next) => {
  try {
    const { status, priority, room_id, tenant_id } = req.query;
    const requests = await MaintenanceModel.findAll({ status, priority, room_id, tenant_id });
    return sendSuccess(res, requests);
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await MaintenanceModel.getStatusSummary();
    return sendSuccess(res, stats);
  } catch (err) { next(err); }
};

const getMyRequests = async (req, res, next) => {
  try {
    const tenant = await TenantModel.findByUserId(req.user.user_id);
    if (!tenant) return sendNotFound(res, 'Tenant profile not found');
    const requests = await MaintenanceModel.findByTenantId(tenant.tenant_id);
    return sendSuccess(res, requests);
  } catch (err) { next(err); }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await MaintenanceModel.findById(req.params.id);
    if (!request) return sendNotFound(res, 'Maintenance request not found');
    if (req.user.role === 'tenant') {
      const tenant = await TenantModel.findByUserId(req.user.user_id);
      if (!tenant || tenant.tenant_id !== request.tenant_id) return sendForbidden(res, 'Access denied');
    }
    return sendSuccess(res, request);
  } catch (err) { next(err); }
};

const createRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

    const tenant = await TenantModel.findByUserId(req.user.user_id);
    if (!tenant) return sendNotFound(res, 'Tenant profile not found');

    const contract = await ContractModel.findActiveByTenant(tenant.tenant_id);
    if (!contract) return sendBadRequest(res, 'You do not have an active contract to submit a request for');

    const { category, description, priority } = req.body;
    const image_path = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const requestId = await MaintenanceModel.create({
      tenant_id: tenant.tenant_id, room_id: contract.room_id,
      category, description, image_path, priority: priority || 'medium',
    });

    const newRequest = await MaintenanceModel.findById(requestId);

    // ✅ Phase 5: Notify admin via Telegram
    TelegramService.notifyAdminNewMaintenance(newRequest).catch(() => {});

    return sendCreated(res, newRequest, 'Maintenance request submitted successfully');
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, admin_note, assigned_to } = req.body;
    const allowed = ['pending', 'in_progress', 'resolved', 'cancelled'];
    if (!allowed.includes(status)) return sendBadRequest(res, `status must be one of: ${allowed.join(', ')}`);

    const request = await MaintenanceModel.findById(req.params.id);
    if (!request) return sendNotFound(res, 'Maintenance request not found');
    if (request.status === 'resolved' || request.status === 'cancelled') {
      return sendBadRequest(res, `Cannot update a '${request.status}' request`);
    }

    await MaintenanceModel.updateStatus(req.params.id, status, admin_note || null, assigned_to || null);
    const updated = await MaintenanceModel.findById(req.params.id);

    // ✅ Phase 5: Notify tenant of status change
    TelegramService.sendMaintenanceUpdate(updated).catch(() => {});

    return sendSuccess(res, updated, `Request status updated to '${status}'`);
  } catch (err) { next(err); }
};

const cancelRequest = async (req, res, next) => {
  try {
    const request = await MaintenanceModel.findById(req.params.id);
    if (!request) return sendNotFound(res, 'Maintenance request not found');

    const tenant = await TenantModel.findByUserId(req.user.user_id);
    if (!tenant || tenant.tenant_id !== request.tenant_id) return sendForbidden(res, 'You can only cancel your own requests');
    if (request.status !== 'pending') return sendBadRequest(res, `Cannot cancel a request that is already '${request.status}'`);

    await MaintenanceModel.updateStatus(req.params.id, 'cancelled', 'Cancelled by tenant');
    return sendSuccess(res, null, 'Maintenance request cancelled');
  } catch (err) { next(err); }
};

module.exports = { getAllRequests, getStats, getMyRequests, getRequestById, createRequest, updateStatus, cancelRequest };
