# Smart Dormitory Management System
## Project Structure & Database Schema

---

## 📁 PART 1: Project Folder Structure (3-Tier Architecture)

```
smart-dormitory/
│
├── 📁 backend/                        # Application Tier (Node.js + Express)
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   ├── db.js                  # MySQL connection pool (mysql2)
│   │   │   ├── telegram.js            # Telegram Bot initialization
│   │   │   └── promptpay.js           # PromptPay QR config
│   │   │
│   │   ├── 📁 controllers/            # Business logic handlers
│   │   │   ├── authController.js
│   │   │   ├── roomController.js
│   │   │   ├── tenantController.js
│   │   │   ├── contractController.js
│   │   │   ├── meterController.js
│   │   │   ├── billController.js
│   │   │   ├── paymentController.js
│   │   │   ├── maintenanceController.js
│   │   │   ├── announcementController.js
│   │   │   └── reportController.js
│   │   │
│   │   ├── 📁 routes/                 # Express routers
│   │   │   ├── index.js               # Route aggregator
│   │   │   ├── auth.routes.js
│   │   │   ├── room.routes.js
│   │   │   ├── tenant.routes.js
│   │   │   ├── contract.routes.js
│   │   │   ├── meter.routes.js
│   │   │   ├── bill.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── maintenance.routes.js
│   │   │   ├── announcement.routes.js
│   │   │   └── report.routes.js
│   │   │
│   │   ├── 📁 middlewares/
│   │   │   ├── auth.middleware.js      # JWT verification
│   │   │   ├── role.middleware.js      # Admin / Tenant role guard
│   │   │   ├── upload.middleware.js    # Multer (meter images, slip)
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── 📁 services/               # Reusable business logic
│   │   │   ├── telegram.service.js    # Send notifications via Telegram Bot
│   │   │   ├── qr.service.js          # Generate PromptPay Dynamic QR
│   │   │   ├── bill.service.js        # Bill calculation logic
│   │   │   └── cron.service.js        # node-cron scheduled jobs
│   │   │
│   │   ├── 📁 models/                 # SQL query helpers (no ORM)
│   │   │   ├── user.model.js
│   │   │   ├── room.model.js
│   │   │   ├── tenant.model.js
│   │   │   ├── contract.model.js
│   │   │   ├── meter.model.js
│   │   │   ├── bill.model.js
│   │   │   ├── payment.model.js
│   │   │   └── maintenance.model.js
│   │   │
│   │   └── 📁 utils/
│   │       ├── response.js            # Standardized API response helper
│   │       ├── logger.js              # Winston logger
│   │       └── dateHelper.js
│   │
│   ├── 📁 uploads/                    # Data Tier: stored files
│   │   ├── 📁 meter-images/           # Water/Electric meter photos
│   │   ├── 📁 payment-slips/          # Payment slip uploads
│   │   └── 📁 contracts/              # Contract PDFs
│   │
│   ├── .env                           # Environment variables
│   ├── .env.example
│   ├── app.js                         # Express app setup
│   ├── server.js                      # Entry point (listen + cron init)
│   └── package.json
│
├── 📁 frontend/                       # Client Tier (React.js + Vite)
│   ├── 📁 public/
│   │   └── favicon.ico
│   │
│   ├── 📁 src/
│   │   ├── 📁 api/                    # Axios instances & API calls
│   │   │   ├── axiosInstance.js       # Base URL + JWT interceptor
│   │   │   ├── auth.api.js
│   │   │   ├── room.api.js
│   │   │   ├── tenant.api.js
│   │   │   ├── contract.api.js
│   │   │   ├── meter.api.js
│   │   │   ├── bill.api.js
│   │   │   ├── payment.api.js
│   │   │   └── maintenance.api.js
│   │   │
│   │   ├── 📁 components/             # Reusable UI components
│   │   │   ├── 📁 common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   │
│   │   │   ├── 📁 admin/
│   │   │   │   ├── RoomCard.jsx
│   │   │   │   ├── MeterForm.jsx
│   │   │   │   ├── BillSummaryCard.jsx
│   │   │   │   └── QRCodeDisplay.jsx
│   │   │   │
│   │   │   └── 📁 tenant/
│   │   │       ├── BillDetail.jsx
│   │   │       ├── PaymentSlipUpload.jsx
│   │   │       └── MaintenanceForm.jsx
│   │   │
│   │   ├── 📁 pages/                  # Route-level page components
│   │   │   ├── 📁 auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   │
│   │   │   ├── 📁 admin/
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── RoomsPage.jsx
│   │   │   │   ├── TenantsPage.jsx
│   │   │   │   ├── ContractsPage.jsx
│   │   │   │   ├── MeterReadingPage.jsx
│   │   │   │   ├── BillsPage.jsx
│   │   │   │   ├── PaymentsPage.jsx
│   │   │   │   ├── MaintenancePage.jsx
│   │   │   │   ├── AnnouncementsPage.jsx
│   │   │   │   └── ReportsPage.jsx
│   │   │   │
│   │   │   └── 📁 tenant/
│   │   │       ├── TenantDashboard.jsx
│   │   │       ├── MyBillsPage.jsx
│   │   │       ├── PaymentPage.jsx
│   │   │       └── MaintenanceRequestPage.jsx
│   │   │
│   │   ├── 📁 hooks/                  # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useBills.js
│   │   │   └── useRooms.js
│   │   │
│   │   ├── 📁 context/
│   │   │   └── AuthContext.jsx        # Global auth state
│   │   │
│   │   ├── 📁 router/
│   │   │   ├── AppRouter.jsx          # React Router v6 setup
│   │   │   ├── AdminRoute.jsx         # Protected admin route
│   │   │   └── TenantRoute.jsx        # Protected tenant route
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── formatCurrency.js
│   │   │   └── formatDate.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                  # Tailwind CSS directives
│   │
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── 📁 database/
│   ├── schema.sql                     # All CREATE TABLE statements
│   ├── seed.sql                       # Sample data for development
│   └── migrations/                    # Future schema changes
│
├── docker-compose.yml                 # Optional: MySQL + Backend + Frontend
└── README.md
```

---

## 🗄️ PART 2: MySQL Database Schema (CREATE TABLE)

> Based on ER Diagram (Section 13.4) and Use Case requirements from the PDF.

```sql
-- ============================================================
-- Smart Dormitory Management System — Database Schema
-- Engine: MySQL 8.x | Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_dormitory
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smart_dormitory;

-- ============================================================
-- 1. USERS (ผู้ใช้งานระบบ: Admin + Tenant login accounts)
-- ============================================================
CREATE TABLE users (
  user_id       INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)      NOT NULL UNIQUE,
  password_hash VARCHAR(255)     NOT NULL,              -- bcrypt hash
  role          ENUM('admin','tenant') NOT NULL DEFAULT 'tenant',
  telegram_chat_id BIGINT        NULL,                  -- for Telegram notifications
  is_active     TINYINT(1)       NOT NULL DEFAULT 1,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. ROOMS (ห้องพัก)
-- ============================================================
CREATE TABLE rooms (
  room_id       INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  room_number   VARCHAR(20)      NOT NULL UNIQUE,       -- e.g. "101", "A202"
  floor         TINYINT UNSIGNED NOT NULL,
  room_type     VARCHAR(50)      NOT NULL,              -- e.g. "single", "double"
  area_sqm      DECIMAL(5,2)     NULL,
  base_rent     DECIMAL(10,2)    NOT NULL,              -- ค่าเช่ารายเดือน (บาท)
  status        ENUM('available','occupied','maintenance') NOT NULL DEFAULT 'available',
  description   TEXT             NULL,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. TENANTS (ข้อมูลผู้เช่า)
-- ============================================================
CREATE TABLE tenants (
  tenant_id     INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED     NOT NULL UNIQUE,       -- FK → users
  first_name    VARCHAR(100)     NOT NULL,
  last_name     VARCHAR(100)     NOT NULL,
  id_card_number VARCHAR(13)     NOT NULL UNIQUE,       -- เลขบัตรประชาชน
  phone         VARCHAR(20)      NOT NULL,
  email         VARCHAR(150)     NULL,
  emergency_contact_name  VARCHAR(200) NULL,
  emergency_contact_phone VARCHAR(20)  NULL,
  profile_image VARCHAR(255)     NULL,                  -- path to uploaded image
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_tenants_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 4. CONTRACTS (สัญญาเช่า)
-- ============================================================
CREATE TABLE contracts (
  contract_id   INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  tenant_id     INT UNSIGNED     NOT NULL,              -- FK → tenants
  room_id       INT UNSIGNED     NOT NULL,              -- FK → rooms
  start_date    DATE             NOT NULL,
  end_date      DATE             NOT NULL,
  rent_amount   DECIMAL(10,2)    NOT NULL,              -- ค่าเช่าตกลงในสัญญา
  deposit_amount DECIMAL(10,2)   NOT NULL DEFAULT 0,    -- เงินมัดจำ
  status        ENUM('active','expired','terminated') NOT NULL DEFAULT 'active',
  contract_file VARCHAR(255)     NULL,                  -- path to PDF scan
  note          TEXT             NULL,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_contracts_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  CONSTRAINT fk_contracts_room FOREIGN KEY (room_id)
    REFERENCES rooms(room_id) ON DELETE RESTRICT
);

-- ============================================================
-- 5. METER_READINGS (บันทึกมิเตอร์น้ำและไฟฟ้า)
-- ============================================================
CREATE TABLE meter_readings (
  reading_id      INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  room_id         INT UNSIGNED   NOT NULL,              -- FK → rooms
  meter_type      ENUM('electric','water') NOT NULL,
  reading_month   TINYINT UNSIGNED NOT NULL,            -- 1–12
  reading_year    SMALLINT UNSIGNED NOT NULL,
  previous_unit   DECIMAL(10,2)  NOT NULL DEFAULT 0,
  current_unit    DECIMAL(10,2)  NOT NULL,
  units_used      DECIMAL(10,2)  GENERATED ALWAYS AS (current_unit - previous_unit) STORED,
  rate_per_unit   DECIMAL(6,2)   NOT NULL,              -- อัตราค่าไฟ/น้ำต่อหน่วย
  image_path      VARCHAR(255)   NULL,                  -- รูปถ่ายมิเตอร์
  recorded_by     INT UNSIGNED   NULL,                  -- FK → users (admin)
  recorded_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_meter_room FOREIGN KEY (room_id)
    REFERENCES rooms(room_id) ON DELETE RESTRICT,
  CONSTRAINT fk_meter_user FOREIGN KEY (recorded_by)
    REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT uq_meter_room_month UNIQUE (room_id, meter_type, reading_month, reading_year)
);

-- ============================================================
-- 6. BILLS (ใบแจ้งหนี้รายเดือน)
-- ============================================================
CREATE TABLE bills (
  bill_id         INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  contract_id     INT UNSIGNED   NOT NULL,              -- FK → contracts
  room_id         INT UNSIGNED   NOT NULL,              -- FK → rooms (denormalized for query speed)
  bill_month      TINYINT UNSIGNED NOT NULL,
  bill_year       SMALLINT UNSIGNED NOT NULL,
  rent_amount     DECIMAL(10,2)  NOT NULL,
  electric_amount DECIMAL(10,2)  NOT NULL DEFAULT 0,
  water_amount    DECIMAL(10,2)  NOT NULL DEFAULT 0,
  other_amount    DECIMAL(10,2)  NOT NULL DEFAULT 0,    -- ค่าใช้จ่ายอื่นๆ
  total_amount    DECIMAL(10,2)  NOT NULL,
  due_date        DATE           NOT NULL,
  status          ENUM('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
  qr_payload      TEXT           NULL,                  -- PromptPay QR string
  note            TEXT           NULL,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_bills_contract FOREIGN KEY (contract_id)
    REFERENCES contracts(contract_id) ON DELETE RESTRICT,
  CONSTRAINT fk_bills_room FOREIGN KEY (room_id)
    REFERENCES rooms(room_id) ON DELETE RESTRICT,
  CONSTRAINT uq_bill_room_month UNIQUE (room_id, bill_month, bill_year)
);

-- ============================================================
-- 7. PAYMENTS (การชำระเงิน)
-- ============================================================
CREATE TABLE payments (
  payment_id      INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  bill_id         INT UNSIGNED   NOT NULL,              -- FK → bills
  tenant_id       INT UNSIGNED   NOT NULL,              -- FK → tenants
  amount_paid     DECIMAL(10,2)  NOT NULL,
  payment_method  ENUM('qr_promptpay','cash','bank_transfer') NOT NULL DEFAULT 'qr_promptpay',
  slip_image      VARCHAR(255)   NULL,                  -- รูปสลิปหลักฐาน
  paid_at         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_by     INT UNSIGNED   NULL,                  -- FK → users (admin ตรวจสอบ)
  verified_at     DATETIME       NULL,
  status          ENUM('pending_verify','verified','rejected') NOT NULL DEFAULT 'pending_verify',
  remark          TEXT           NULL,

  CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id)
    REFERENCES bills(bill_id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_verifier FOREIGN KEY (verified_by)
    REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================================
-- 8. MAINTENANCE_REQUESTS (แจ้งซ่อม)
-- ============================================================
CREATE TABLE maintenance_requests (
  request_id      INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  tenant_id       INT UNSIGNED   NOT NULL,              -- FK → tenants
  room_id         INT UNSIGNED   NOT NULL,              -- FK → rooms
  category        VARCHAR(100)   NOT NULL,              -- e.g. "ไฟฟ้า","ประปา","เฟอร์นิเจอร์"
  description     TEXT           NOT NULL,
  image_path      VARCHAR(255)   NULL,
  priority        ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  status          ENUM('pending','in_progress','resolved','cancelled') NOT NULL DEFAULT 'pending',
  assigned_to     INT UNSIGNED   NULL,                  -- FK → users (admin/technician)
  resolved_at     DATETIME       NULL,
  admin_note      TEXT           NULL,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_maint_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
  CONSTRAINT fk_maint_room FOREIGN KEY (room_id)
    REFERENCES rooms(room_id) ON DELETE RESTRICT,
  CONSTRAINT fk_maint_assigned FOREIGN KEY (assigned_to)
    REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================================
-- 9. ANNOUNCEMENTS (ประกาศข่าวสาร)
-- ============================================================
CREATE TABLE announcements (
  announcement_id INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255)   NOT NULL,
  content         TEXT           NOT NULL,
  target_audience ENUM('all','admin','tenant') NOT NULL DEFAULT 'all',
  is_pinned       TINYINT(1)     NOT NULL DEFAULT 0,
  published_by    INT UNSIGNED   NOT NULL,              -- FK → users (admin)
  published_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at      DATETIME       NULL,

  CONSTRAINT fk_announce_user FOREIGN KEY (published_by)
    REFERENCES users(user_id) ON DELETE RESTRICT
);

-- ============================================================
-- 10. NOTIFICATIONS_LOG (บันทึกการแจ้งเตือน Telegram)
-- ============================================================
CREATE TABLE notifications_log (
  log_id          INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED   NOT NULL,              -- FK → users
  bill_id         INT UNSIGNED   NULL,                  -- FK → bills (optional)
  notification_type VARCHAR(50)  NOT NULL,              -- e.g. 'bill_reminder','payment_confirm'
  message         TEXT           NOT NULL,
  sent_at         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status          ENUM('sent','failed') NOT NULL DEFAULT 'sent',

  CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_bill FOREIGN KEY (bill_id)
    REFERENCES bills(bill_id) ON DELETE SET NULL
);

-- ============================================================
-- 11. UTILITY_RATES (อัตราค่าน้ำ/ไฟฟ้า — admin กำหนด)
-- ============================================================
CREATE TABLE utility_rates (
  rate_id         INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  utility_type    ENUM('electric','water') NOT NULL,
  rate_per_unit   DECIMAL(6,2)   NOT NULL,
  effective_from  DATE           NOT NULL,
  created_by      INT UNSIGNED   NOT NULL,

  CONSTRAINT fk_rates_user FOREIGN KEY (created_by)
    REFERENCES users(user_id) ON DELETE RESTRICT
);
```

---

## 🔗 Entity Relationship Summary

| Table | References (FK) |
|-------|----------------|
| `tenants` | `users` |
| `contracts` | `tenants`, `rooms` |
| `meter_readings` | `rooms`, `users` |
| `bills` | `contracts`, `rooms` |
| `payments` | `bills`, `tenants`, `users` |
| `maintenance_requests` | `tenants`, `rooms`, `users` |
| `announcements` | `users` |
| `notifications_log` | `users`, `bills` |
| `utility_rates` | `users` |

---

## ⚙️ Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=smart_dormitory

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# PromptPay
PROMPTPAY_ID=0812345678   # เบอร์โทรหรือเลขประจำตัวผู้เสียภาษี

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5
```

---

## 🚀 Next Steps (Development Phases)

| Phase | Task |
|-------|------|
| **Phase 1** | Backend: Setup Express + MySQL connection + Auth (JWT + bcrypt) |
| **Phase 2** | Backend: CRUD APIs for rooms, tenants, contracts |
| **Phase 3** | Backend: Meter readings + Bill calculation service |
| **Phase 4** | Backend: PromptPay QR generation + Payment verification |
| **Phase 5** | Backend: Telegram Bot notification service + node-cron |
| **Phase 6** | Frontend: Auth pages + Admin dashboard + Room management |
| **Phase 7** | Frontend: Meter input, bill viewing, payment slip upload |
| **Phase 8** | Frontend: Tenant portal + Maintenance requests |
| **Phase 9** | Reports (PDF/Excel export) + Testing |
