/**
 * controllers/paymentController.js (Phase 5 — Telegram wired in)
 */

const { validationResult } = require('express-validator');
const PaymentModel    = require('../models/payment.model');
const BillModel       = require('../models/bill.model');
const TenantModel     = require('../models/tenant.model');
const TelegramService = require('../services/telegram.service');
const { sendSuccess, sendCreated, sendBadRequest, sendNotFound, sendForbidden } = require('../utils/response');

const getAllPayments = async (req, res, next) => {
  try {
    const { tenant_id, bill_id, status } = req.query;
    const payments = await PaymentModel.findAll({ tenant_id, bill_id, status });
    return sendSuccess(res, payments);
  } catch (err) { next(err); }
};

const getMyPayments = async (req, res, next) => {
  try {
    const tenant = await TenantModel.findByUserId(req.user.user_id);
    if (!tenant) return sendNotFound(res, 'Tenant profile not found');
    const payments = await PaymentModel.findAll({ tenant_id: tenant.tenant_id });
    return sendSuccess(res, payments);
  } catch (err) { next(err); }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) return sendNotFound(res, 'Payment not found');
    if (req.user.role === 'tenant') {
      const tenant = await TenantModel.findByUserId(req.user.user_id);
      if (!tenant || tenant.tenant_id !== payment.tenant_id) return sendForbidden(res, 'Access denied');
    }
    return sendSuccess(res, payment);
  } catch (err) { next(err); }
};

const submitPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

    const { bill_id, payment_method } = req.body;
    const bill = await BillModel.findById(bill_id);
    if (!bill)                   return sendNotFound(res, 'Bill not found');
    if (bill.status === 'paid')  return sendBadRequest(res, 'This bill has already been paid');
    if (bill.status === 'cancelled') return sendBadRequest(res, 'This bill is cancelled');

    const tenant = await TenantModel.findByUserId(req.user.user_id);
    if (!tenant) return sendNotFound(res, 'Tenant profile not found');
    if (tenant.tenant_id !== bill.tenant_id) return sendForbidden(res, 'This bill does not belong to you');

    const existingPayments = await PaymentModel.findByBillId(bill_id);
    const hasPending = existingPayments.some(p => p.status === 'pending_verify');
    if (hasPending) return sendBadRequest(res, 'A payment for this bill is already pending verification');

    const slip_image = req.file ? req.file.path.replace(/\\/g, '/') : null;
    const paymentId = await PaymentModel.create({
      bill_id: parseInt(bill_id), tenant_id: tenant.tenant_id,
      amount_paid: bill.total_amount, payment_method: payment_method || 'qr_promptpay', slip_image,
    });

    const newPayment = await PaymentModel.findById(paymentId);

    // ✅ Phase 5: Notify admin via Telegram
    TelegramService.notifyAdminNewPayment(newPayment).catch(() => {});

    return sendCreated(res, newPayment, 'Payment submitted successfully. Awaiting admin verification.');
  } catch (err) { next(err); }
};

const verifyPayment = async (req, res, next) => {
  try {
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) return sendNotFound(res, 'Payment not found');
    if (payment.status !== 'pending_verify') return sendBadRequest(res, `Payment is already '${payment.status}'`);

    await PaymentModel.verify(req.params.id, req.user.user_id, 'verified', req.body.remark || null);
    await BillModel.updateStatus(payment.bill_id, 'paid');
    const updated = await PaymentModel.findById(req.params.id);

    // ✅ Phase 5: Notify tenant via Telegram
    TelegramService.sendPaymentConfirmation(updated).catch(() => {});

    return sendSuccess(res, updated, 'Payment verified — bill marked as paid');
  } catch (err) { next(err); }
};

const rejectPayment = async (req, res, next) => {
  try {
    const { remark } = req.body;
    if (!remark) return sendBadRequest(res, 'A remark/reason is required when rejecting a payment');

    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) return sendNotFound(res, 'Payment not found');
    if (payment.status !== 'pending_verify') return sendBadRequest(res, `Payment is already '${payment.status}'`);

    await PaymentModel.verify(req.params.id, req.user.user_id, 'rejected', remark);
    const updated = await PaymentModel.findById(req.params.id);

    // ✅ Phase 5: Notify tenant of rejection via Telegram
    TelegramService.sendPaymentRejected(updated).catch(() => {});

    return sendSuccess(res, updated, 'Payment rejected. Tenant will be notified.');
  } catch (err) { next(err); }
};

module.exports = { getAllPayments, getMyPayments, getPaymentById, submitPayment, verifyPayment, rejectPayment };
