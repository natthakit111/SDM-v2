/**
 * services/bill.service.js
 * Core bill calculation logic.
 * Called by billController when generating a new monthly bill.
 *
 * Bill formula:
 *   total = rent + (electric_units × electric_rate) + (water_units × water_rate) + other
 */

const MeterModel      = require('../models/meter.model');
const UtilityRateModel = require('../models/utilityRate.model');

/**
 * Calculate the bill amounts for a given room and month/year.
 * Requires that meter readings have already been saved for this period.
 *
 * @param {number} roomId
 * @param {number} month  - 1–12
 * @param {number} year
 * @param {number} rentAmount  - from contract
 * @param {number} otherAmount - optional extra charges (default 0)
 * @returns {Object} { rent_amount, electric_amount, water_amount, other_amount, total_amount,
 *                     electric_units, water_units, electric_rate, water_rate }
 */
const calculateBill = async (roomId, month, year, rentAmount, otherAmount = 0) => {
  // ── Electric ───────────────────────────────────────────────
  const electricReading = await MeterModel.findByRoomMonthYear(roomId, 'electric', month, year);
  const waterReading    = await MeterModel.findByRoomMonthYear(roomId, 'water',    month, year);

  if (!electricReading) {
    throw new Error(`Electric meter reading not found for room ${roomId} — ${month}/${year}`);
  }
  if (!waterReading) {
    throw new Error(`Water meter reading not found for room ${roomId} — ${month}/${year}`);
  }

  const electricUnits = parseFloat(electricReading.units_used) || 0;
  const waterUnits    = parseFloat(waterReading.units_used)    || 0;

  const electricRate  = parseFloat(electricReading.rate_per_unit);
  const waterRate     = parseFloat(waterReading.rate_per_unit);

  const electricAmount = +(electricUnits * electricRate).toFixed(2);
  const waterAmount    = +(waterUnits    * waterRate).toFixed(2);
  const totalAmount    = +(rentAmount + electricAmount + waterAmount + otherAmount).toFixed(2);

  return {
    rent_amount:     +rentAmount.toFixed(2),
    electric_amount: electricAmount,
    water_amount:    waterAmount,
    other_amount:    +otherAmount.toFixed(2),
    total_amount:    totalAmount,
    // Breakdown metadata (not stored in bills table, used for display/logging)
    electric_units:  electricUnits,
    water_units:     waterUnits,
    electric_rate:   electricRate,
    water_rate:      waterRate,
  };
};

/**
 * Calculate default due date: last day of the current billing month.
 * e.g., bill for March 2025 → due 31 March 2025.
 *
 * @param {number} month
 * @param {number} year
 * @returns {string} 'YYYY-MM-DD'
 */
const getDefaultDueDate = (month, year) => {
  // Day 0 of next month = last day of current month
  const lastDay = new Date(year, month, 0);
  const mm = String(lastDay.getMonth() + 1).padStart(2, '0');
  const dd = String(lastDay.getDate()).padStart(2, '0');
  return `${lastDay.getFullYear()}-${mm}-${dd}`;
};

module.exports = { calculateBill, getDefaultDueDate };
