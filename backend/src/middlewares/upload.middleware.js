/**
 * middlewares/upload.middleware.js
 * Multer configuration for file uploads.
 * Supports: meter images, payment slips, contract PDFs, profile images.
 */

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const MAX_SIZE_BYTES = (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Dynamic storage: destination folder determined by fieldname
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'misc';
    if (file.fieldname === 'meter_image')   folder = 'meter-images';
    if (file.fieldname === 'payment_slip')  folder = 'payment-slips';
    if (file.fieldname === 'contract_file') folder = 'contracts';
    if (file.fieldname === 'profile_image') folder = 'profiles';
    const dir = path.join(process.env.UPLOAD_DIR || './uploads', folder);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedImages = /jpeg|jpg|png|webp/;
  const allowedDocs   = /pdf/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  if (file.fieldname === 'contract_file') {
    return cb(null, allowedDocs.test(ext));
  }
  cb(null, allowedImages.test(ext));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE_BYTES } });

// Named upload middleware exports
const uploadMeterImage   = upload.single('meter_image');
const uploadPaymentSlip  = upload.single('payment_slip');
const uploadContractFile = upload.single('contract_file');
const uploadProfileImage = upload.single('profile_image');

module.exports = { uploadMeterImage, uploadPaymentSlip, uploadContractFile, uploadProfileImage };
