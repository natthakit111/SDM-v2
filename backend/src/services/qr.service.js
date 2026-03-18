/**
 * services/qr.service.js
 * Generates PromptPay Dynamic QR Code payload (EMVCo format).
 *
 * Uses the `promptpay-qr` algorithm to build the QR string.
 * Install: npm install promptpay-qr
 *
 * The generated string can be rendered as a QR image on the frontend
 * using libraries like `qrcode` or `react-qr-code`.
 */

const generatePayload = require('promptpay-qr');

/**
 * Generate a PromptPay Dynamic QR payload string.
 *
 * @param {string} promptPayId  - PromptPay registered ID (phone number or tax ID)
 * @param {number} amount       - Amount in THB (e.g., 1500.00)
 * @param {number} billId       - Bill ID to embed as reference (optional, for traceability)
 * @returns {string}            - EMVCo QR payload string
 */
const generatePromptPayQR = (promptPayId, amount, billId = null) => {
  if (!promptPayId) throw new Error('PromptPay ID is not configured');
  if (amount <= 0)  throw new Error('Amount must be greater than 0');

  // Round to 2 decimal places to avoid floating-point issues
  const roundedAmount = Math.round(amount * 100) / 100;

  const payload = generatePayload(promptPayId, { amount: roundedAmount });
  return payload;
};

/**
 * Format the PromptPay ID:
 * - 10-digit phone → 0066XXXXXXXXX
 * - 13-digit tax ID → used as-is
 */
const formatPromptPayId = (id) => {
  const cleaned = id.replace(/[-\s]/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `0066${cleaned.substring(1)}`; // Thai mobile format
  }
  return cleaned;
};

module.exports = { generatePromptPayQR, formatPromptPayId };
