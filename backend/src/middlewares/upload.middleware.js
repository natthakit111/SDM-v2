/**
 * middlewares/upload.middleware.js
 * Multer + Cloudinary — รูปและ PDF เก็บบน cloud ไม่หายเมื่อ redeploy
 *
 * ต้องติดตั้ง:
 *   npm install cloudinary multer-storage-cloudinary
 *
 * env vars ที่ต้องใส่ใน Railway:
 *   CLOUDINARY_CLOUD_NAME=xxx
 *   CLOUDINARY_API_KEY=xxx
 *   CLOUDINARY_API_SECRET=xxx
 */

const multer               = require('multer');
const cloudinary           = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ── Config Cloudinary ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_SIZE_BYTES = (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

// ── Map fieldname → Cloudinary folder + allowed formats ─────────────────────
const FIELD_CONFIG = {
  meter_image:   { folder: 'dormflow/meter-images',   resource_type: 'image', formats: ['jpg','jpeg','png','webp'] },
  payment_slip:  { folder: 'dormflow/payment-slips',  resource_type: 'image', formats: ['jpg','jpeg','png','webp'] },
  contract_file: { folder: 'dormflow/contracts',      resource_type: 'raw',   formats: ['pdf'] },
  profile_image: { folder: 'dormflow/profiles',       resource_type: 'image', formats: ['jpg','jpeg','png','webp'] },
};

// ── สร้าง multer instance ต่อ fieldname ─────────────────────────────────────
function makeUpload(fieldname) {
  const cfg = FIELD_CONFIG[fieldname];

  const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder:        cfg.folder,
      resource_type: cfg.resource_type,
      // ชื่อไฟล์ = timestamp-random (เหมือนเดิม)
      public_id:     `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      // สำหรับ PDF ต้องส่ง format ด้วย ไม่งั้น Cloudinary เดาผิด
      ...(cfg.resource_type === 'raw' ? { format: 'pdf' } : {}),
    }),
  });

  const fileFilter = (req, file, cb) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    cb(null, cfg.formats.includes(ext));
  };

  return multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE_BYTES } })
    .single(fieldname);
}

// ── Export เหมือนเดิมทุก controller ใช้ได้เลย ───────────────────────────────
const uploadMeterImage   = makeUpload('meter_image');
const uploadPaymentSlip  = makeUpload('payment_slip');
const uploadContractFile = makeUpload('contract_file');
const uploadProfileImage = makeUpload('profile_image');

module.exports = { uploadMeterImage, uploadPaymentSlip, uploadContractFile, uploadProfileImage };