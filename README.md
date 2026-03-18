# SDM
=======
# 🏠 Smart Dormitory Management System
### ระบบบริหารจัดการหอพักและแจ้งเตือนอัตโนมัติ

> โปรเจกต์วิศวกรรมนิพนธ์ — สาขาวิชาวิศวกรรมคอมพิวเตอร์  
> มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา เชียงใหม่

---

## 📋 สารบัญ
1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [Tech Stack](#tech-stack)
3. [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
4. [การติดตั้ง (Local)](#การติดตั้ง-local)
5. [การติดตั้ง (Docker)](#การติดตั้ง-docker)
6. [การตั้งค่า Environment](#การตั้งค่า-environment)
7. [API Reference](#api-reference)
8. [Telegram Bot Setup](#telegram-bot-setup)
9. [Default Accounts](#default-accounts)
10. [Use Case Coverage](#use-case-coverage)

---

## ภาพรวมระบบ

ระบบบริหารจัดการหอพักแบบ Active System ที่รวม:
- **เว็บแอปพลิเคชัน** (React.js) สำหรับ Admin และ Tenant
- **REST API** (Node.js + Express) พร้อม JWT authentication
- **Telegram Bot** แจ้งเตือนอัตโนมัติ (บิล, ชำระเงิน, แจ้งซ่อม)
- **PromptPay Dynamic QR** สำหรับชำระเงิน
- **node-cron** สำหรับงานอัตโนมัติรายวัน

### 3-Tier Architecture
```
Client Tier     │  React.js (Vite) + Tailwind CSS
                │  Telegram App
────────────────┼──────────────────────────────────
Application Tier│  Node.js + Express API Server
                │  Telegram Bot Service
                │  Bill Calculation Service
                │  PromptPay QR Service
                │  node-cron Scheduler
────────────────┼──────────────────────────────────
Data Tier       │  MySQL 8.x Database
                │  File Storage (uploads/)
```

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, react-qr-code |
| Backend | Node.js 20, Express.js, mysql2, bcryptjs, jsonwebtoken |
| Database | MySQL 8.0 |
| Notifications | node-telegram-bot-api |
| Payment QR | promptpay-qr (EMVCo format) |
| Reports | ExcelJS, PDFKit |
| Scheduler | node-cron |
| Container | Docker + nginx |

---

## โครงสร้างโปรเจกต์

```
smart-dormitory/
├── backend/
│   ├── src/
│   │   ├── config/        # db.js, telegram.js
│   │   ├── controllers/   # 10 controllers
│   │   ├── middlewares/   # auth, upload, errorHandler
│   │   ├── models/        # 11 models (raw SQL)
│   │   ├── routes/        # 12 route files
│   │   ├── services/      # telegram, qr, bill, cron
│   │   └── utils/         # response, logger, dateHelper
│   ├── uploads/           # meter-images, payment-slips, contracts
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/           # axiosInstance + all API calls
│   │   ├── components/    # AdminLayout, TenantLayout, Modal, StatusBadge
│   │   ├── context/       # AuthContext
│   │   ├── hooks/         # useRooms, useBills
│   │   ├── pages/
│   │   │   ├── admin/     # 11 pages
│   │   │   ├── tenant/    # 5 pages
│   │   │   └── auth/      # Login, Register
│   │   ├── router/        # AppRouter (protected routes)
│   │   └── utils/         # formatCurrency, formatDate
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── database/
│   ├── schema.sql         # 11 tables
│   └── seed.sql           # default accounts + sample data
├── docker-compose.yml
└── README.md
```

---

## การติดตั้ง (Local)

### ข้อกำหนด
- Node.js >= 20
- MySQL 8.0
- npm >= 9

### 1. Clone และติดตั้ง dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. สร้างฐานข้อมูล

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS smart_dormitory CHARACTER SET utf8mb4;"
mysql -u root -p smart_dormitory < database/schema.sql
mysql -u root -p smart_dormitory < database/seed.sql
```

### 3. ตั้งค่า Environment

```bash
cd backend
cp .env.example .env
# แก้ไขค่าใน .env ตามขั้นตอนถัดไป
```

### 4. รันระบบ

```bash
# Terminal 1 — Backend
cd backend
npm run dev      # http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev      # http://localhost:5173
```

---

## การติดตั้ง (Docker)

```bash
# 1. สร้างไฟล์ .env สำหรับ Docker
cat > .env << EOF
JWT_SECRET=your_super_secret_key_here
TELEGRAM_BOT_TOKEN=your_bot_token
ADMIN_TELEGRAM_CHAT_ID=your_chat_id
PROMPTPAY_ID=0812345678
EOF

# 2. Build และรัน
docker-compose up -d --build

# 3. ตรวจสอบ logs
docker-compose logs -f backend
```

เปิด `http://localhost` เพื่อใช้งาน

---

## การตั้งค่า Environment

แก้ไขไฟล์ `backend/.env`:

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

# JWT — ต้องเปลี่ยนเป็น random string ยาวๆ ใน production
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d

# Telegram Bot (ดูขั้นตอนด้านล่าง)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
ADMIN_TELEGRAM_CHAT_ID=987654321

# PromptPay — เบอร์โทรหรือเลขผู้เสียภาษีของหอพัก
PROMPTPAY_ID=0812345678

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5

# Frontend URL (สำหรับ CORS)
FRONTEND_URL=http://localhost:5173
```

---

## API Reference

Base URL: `http://localhost:5000/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | สมัครสมาชิก |
| POST | `/auth/login` | เข้าสู่ระบบ → JWT |
| GET | `/auth/me` | ข้อมูลผู้ใช้ปัจจุบัน |
| PUT | `/auth/change-password` | เปลี่ยนรหัสผ่าน |

### Rooms (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms` | รายการห้องทั้งหมด |
| GET | `/rooms/stats` | สรุปสถิติห้อง |
| POST | `/rooms` | เพิ่มห้องใหม่ |
| PUT | `/rooms/:id` | แก้ไขห้อง |
| DELETE | `/rooms/:id` | ลบห้อง |

### Tenants (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tenants` | รายชื่อผู้เช่าทั้งหมด |
| POST | `/tenants` | เพิ่มผู้เช่า (สร้าง user + tenant) |
| PUT | `/tenants/:id` | แก้ไขข้อมูล |
| DELETE | `/tenants/:id` | ปิดการใช้งาน |
| GET | `/tenants/me/profile` | โปรไฟล์ตัวเอง (Tenant) |
| PUT | `/tenants/me/profile` | แก้ไขโปรไฟล์ (Tenant) |

### Contracts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contracts` | รายการสัญญา |
| POST | `/contracts` | Check-in — สร้างสัญญา |
| PUT | `/contracts/:id/terminate` | Check-out — ยกเลิกสัญญา |
| GET | `/contracts/my/active` | สัญญาปัจจุบัน (Tenant) |

### Meters (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/meters` | รายการบันทึกมิเตอร์ |
| POST | `/meters` | บันทึกมิเตอร์ใหม่ (multipart) |
| GET | `/meters/rooms/:id/previous?type=electric` | หน่วยครั้งก่อน |

### Bills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bills` | รายการบิลทั้งหมด (Admin) |
| POST | `/bills/generate` | ออกบิลรายเดือน (Admin) |
| GET | `/bills/:id/qr` | PromptPay QR payload |
| PUT | `/bills/:id/cancel` | ยกเลิกบิล |
| GET | `/bills/my` | บิลของตัวเอง (Tenant) |
| GET | `/bills/report/monthly?year=` | สรุปรายรับรายปี |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments` | ส่งสลิปการชำระ (Tenant, multipart) |
| PUT | `/payments/:id/verify` | ยืนยันการชำระ (Admin) |
| PUT | `/payments/:id/reject` | ปฏิเสธการชำระ (Admin) |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance` | รายการแจ้งซ่อม (Admin) |
| POST | `/maintenance` | แจ้งซ่อมใหม่ (Tenant) |
| PUT | `/maintenance/:id/status` | อัปเดตสถานะ (Admin) |
| PUT | `/maintenance/:id/cancel` | ยกเลิก (Tenant) |

### Utility Rates (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/utility-rates/current` | อัตราปัจจุบัน |
| POST | `/utility-rates` | เพิ่มอัตราใหม่ |

### Reports (Admin) — ดาวน์โหลดไฟล์โดยตรง
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/revenue?year=&format=excel\|pdf` | รายงานรายรับรายปี |
| GET | `/reports/rooms?format=excel` | รายงานห้องพัก |
| GET | `/reports/payments?month=&year=&format=excel` | รายงานการชำระ |

### Telegram
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/telegram/status` | สถานะการเชื่อมต่อ |
| POST | `/telegram/link` | เชื่อมต่อ chat_id |
| DELETE | `/telegram/unlink` | ยกเลิกการเชื่อมต่อ |

---

## Telegram Bot Setup

### ขั้นตอนสร้าง Bot

1. เปิด Telegram แล้วค้นหา **@BotFather**
2. พิมพ์ `/newbot` และตั้งชื่อ Bot
3. คัดลอก **Bot Token** และใส่ใน `.env`

```
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
```

4. รับ **Admin Chat ID** — ส่งข้อความหา [@userinfobot](https://t.me/userinfobot) เพื่อดู ID ของตัวเอง

```
ADMIN_TELEGRAM_CHAT_ID=987654321
```

### ผู้เช่าเชื่อมต่อ (ทำทุกคน)
วิธีที่ 1 — ผ่าน Bot โดยตรง (แนะนำ)

1. เปิด Telegram → ค้นหาชื่อ Bot ที่สร้าง
2. พิมพ์ /start <username> เช่น /start natthakit
3. Bot จะตอบว่า "เชื่อมต่อสำเร็จ"

วิธีที่ 2 — ผ่านหน้าเว็บ

1. Login → เมนู "ข้อมูลส่วนตัว"
2. ส่วน "เชื่อมต่อ Telegram" → กดดูขั้นตอน
3. ทำตามคำแนะนำในหน้านั้น

### คำสั่ง Bot สำหรับผู้เช่า

| คำสั่ง | ฟังก์ชัน |
|--------|---------|
| `/start <username>` | เชื่อมต่อบัญชีผู้เช่ากับ Telegram |
| `/status` | ดูบิลค้างชำระ |
| `/help` | แสดงคำสั่งทั้งหมด |

### การแจ้งเตือนอัตโนมัติ (node-cron)

| เวลา | งาน |
|------|-----|
| 00:05 ทุกวัน | ทำเครื่องหมายบิลที่เกินกำหนดเป็น `overdue` |
| 01:00 ทุกวัน | สัญญาที่หมดอายุ → `expired` |
| 08:00 ทุกวัน | แจ้งเตือนบิลที่ใกล้ครบกำหนด (3 วัน) |
| 08:30 ทุกวัน | แจ้งเตือนบิลค้างชำระ |
| 09:00 ทุกวัน | แจ้งเตือนรอบสุดท้าย (1 วันก่อนครบ) |

---

## Default Accounts

หลังจาก run `seed.sql` แล้ว:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin1234` |
| Tenant | `tenant01` | `tenant1234` |
| Tenant | `tenant02` | `tenant1234` |

> ⚠️ **เปลี่ยนรหัสผ่าน Admin ทันทีหลัง login ครั้งแรก!**
>
> หากต้องการ generate bcrypt hash ใหม่:
> ```bash
> node -e "require('bcryptjs').hash('newpassword', 12).then(h => console.log(h))"
> ```

---

## Use Case Coverage

### ผู้ดูแลหอพัก (Admin)
| Use Case | หน้า | สถานะ |
|----------|------|-------|
| จัดการข้อมูลห้องพัก | `/admin/rooms` | ✅ |
| จัดการข้อมูลผู้เช่า | `/admin/tenants` | ✅ |
| จัดการสัญญาเช่า (Check-in/out) | `/admin/contracts` | ✅ |
| บันทึกมิเตอร์น้ำและไฟฟ้าพร้อมแนบรูป | `/admin/meters` | ✅ |
| ตั้งค่าอัตราค่าสาธารณูปโภค | `/admin/utility-rates` | ✅ |
| ออกใบแจ้งหนี้ + สร้าง Dynamic QR | `/admin/bills` | ✅ |
| ตรวจสอบการชำระเงิน (Verify/Reject) | `/admin/payments` | ✅ |
| อัปเดตสถานะการซ่อม | `/admin/maintenance` | ✅ |
| ส่งประกาศข่าวสาร + Telegram Broadcast | `/admin/announcements` | ✅ |
| ส่งการแจ้งเตือนผ่าน Telegram | อัตโนมัติ (cron + events) | ✅ |
| ดูสรุปรายรับ | `/admin/reports` | ✅ |
| ส่งออกรายงาน PDF / Excel | `/admin/reports` | ✅ |

### ผู้เช่า (Tenant)
| Use Case | หน้า | สถานะ |
|----------|------|-------|
| สมัครสมาชิกและเข้าสู่ระบบ | `/register`, `/login` | ✅ |
| ดูใบแจ้งหนี้ | `/tenant/bills` | ✅ |
| ชำระเงินผ่าน QR Code + อัปโหลดสลิป | `/tenant/bills/:id/pay` | ✅ |
| แจ้งซ่อม + ติดตามสถานะ | `/tenant/maintenance` | ✅ |
| แก้ไขข้อมูลส่วนตัว | `/tenant/profile` | ✅ |
| เปลี่ยนรหัสผ่าน | `/tenant/profile` | ✅ |
| เชื่อมต่อ Telegram | `/tenant/profile` | ✅ |
| รับการแจ้งเตือนอัตโนมัติ | Telegram Bot | ✅ |
| ดูสัญญาเช่าปัจจุบัน | `/tenant` (dashboard) | ✅ |
| แจ้งความประสงค์ย้ายออก | ผ่านการติดต่อ Admin | — |

---

## Database Schema

11 ตาราง:

```
users ──────────────────────> tenants ──> contracts ──> bills ──> payments
  │                                                │
  └──> utility_rates           rooms ─────────────┘
                                 │
                                 └──> meter_readings
                                 └──> maintenance_requests
                                 
announcements (published_by → users)
notifications_log (user_id → users, bill_id → bills)
```

---

## License

MIT License — โปรเจกต์นี้จัดทำเพื่อการศึกษา

---

*Smart Dormitory Management System v1.0.0*  
*Computer Engineering, RMUTL Chiang Mai — 2/2559*
>>>>>>> 354504c (add project sdm)
