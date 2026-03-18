/**
 * controllers/billController.js (Phase 5 — Telegram wired in)
 */

const { validationResult } = require('express-validator');
const BillModel          = require('../models/bill.model');
const ContractModel      = require('../models/contract.model');
const { calculateBill, getDefaultDueDate } = require('../services/bill.service');
const { generatePromptPayQR } = require('../services/qr.service');
const TelegramService    = require('../services/telegram.service');
const TenantModel        = require('../models/tenant.model');
const { sendSuccess, sendCreated, sendBadRequest, sendNotFound, sendError } = require('../utils/response');

const getAllBills = async (req, res, next) => {
  try {
    const { room_id, status, month, year, tenant_id } = req.query;
    const bills = await BillModel.findAll({ room_id, status, month, year, tenant_id });
    return sendSuccess(res, bills);
  } catch (err) { next(err); }
};

const getMyBills = async (req, res, next) => {
  try {
    const tenant = await TenantModel.findByUserId(req.user.user_id);
    if (!tenant) return sendNotFound(res, 'Tenant profile not found');
    const bills = await BillModel.findByTenantId(tenant.tenant_id);
    return sendSuccess(res, bills);
  } catch (err) { next(err); }
};

const getBillById = async (req, res, next) => {
  try {
    // JOIN meter_readings ด้วย
    const bill = await BillModel.findByIdWithMeters(req.params.id)
    if (!bill) return sendNotFound(res, 'Bill not found');
    if (req.user.role === 'tenant') {
      const tenant = await TenantModel.findByUserId(req.user.user_id);
      if (!tenant || tenant.tenant_id !== bill.tenant_id) return sendNotFound(res, 'Bill not found');
    }
    return sendSuccess(res, bill);
  } catch (err) { next(err); }
};

const getBillQR = async (req, res, next) => {
  try {
    const bill = await BillModel.findById(req.params.id);
    if (!bill) return sendNotFound(res, 'Bill not found');
    if (bill.status === 'paid')      return sendBadRequest(res, 'This bill has already been paid');
    if (bill.status === 'cancelled') return sendBadRequest(res, 'This bill is cancelled');

    let qrPayload = bill.qr_payload;
    if (!qrPayload) {
      const promptPayId = process.env.PROMPTPAY_ID;
      if (!promptPayId) return sendError(res, 'PromptPay ID not configured');
      qrPayload = generatePromptPayQR(promptPayId, bill.total_amount, bill.bill_id);
      await BillModel.updateQrPayload(bill.bill_id, qrPayload);
    }
    return sendSuccess(res, {
      bill_id: bill.bill_id, room_number: bill.room_number,
      tenant_name: bill.tenant_name, total_amount: bill.total_amount,
      due_date: bill.due_date, qr_payload: qrPayload,
    });
  } catch (err) { next(err); }
};

const generateBill = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

    const { room_id, month, year, other_amount = 0, due_date: customDueDate } = req.body;

    const existingBill = await BillModel.findByRoomMonthYear(room_id, month, year);
    if (existingBill) {
      return sendBadRequest(res, `Bill for room ${room_id} — ${month}/${year} already exists (bill_id: ${existingBill.bill_id})`);
    }

    const contract = await ContractModel.findActiveByRoom(room_id);
    if (!contract) return sendBadRequest(res, `Room ${room_id} has no active contract`);

    let amounts;
    try {
      amounts = await calculateBill(room_id, month, year, parseFloat(contract.rent_amount), parseFloat(other_amount));
    } catch (calcErr) {
      return sendBadRequest(res, calcErr.message);
    }

    const due_date = customDueDate || getDefaultDueDate(parseInt(month), parseInt(year));
    const promptPayId = process.env.PROMPTPAY_ID;
    let qrPayload = null;
    if (promptPayId) {
      try { qrPayload = generatePromptPayQR(promptPayId, amounts.total_amount); } catch (_) {}
    }

    const billId = await BillModel.create({
      contract_id: contract.contract_id, room_id: parseInt(room_id),
      bill_month: parseInt(month), bill_year: parseInt(year),
      rent_amount: amounts.rent_amount, electric_amount: amounts.electric_amount,
      water_amount: amounts.water_amount, other_amount: amounts.other_amount,
      total_amount: amounts.total_amount, due_date, qr_payload: qrPayload,
    });

    const newBill = await BillModel.findById(billId);

    // ✅ Phase 5: Notify tenant via Telegram
    TelegramService.sendBillNotification(newBill).catch(() => {});

    return sendCreated(res, {
      ...newBill,
      breakdown: {
        electric_units: amounts.electric_units, water_units: amounts.water_units,
        electric_rate: amounts.electric_rate,   water_rate:  amounts.water_rate,
      },
    }, 'Bill generated successfully');
  } catch (err) { next(err); }
};

const cancelBill = async (req, res, next) => {
  try {
    const bill = await BillModel.findById(req.params.id);
    if (!bill) return sendNotFound(res, 'Bill not found');
    if (bill.status === 'paid') return sendBadRequest(res, 'Cannot cancel a paid bill');
    await BillModel.updateStatus(req.params.id, 'cancelled');
    return sendSuccess(res, null, 'Bill cancelled successfully');
  } catch (err) { next(err); }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await BillModel.getMonthlyRevenue(year);
    return sendSuccess(res, { year, monthly_data: data });
  } catch (err) { next(err); }
};

module.exports = { getAllBills, getMyBills, getBillById, getBillQR, generateBill, cancelBill, getMonthlyReport };
