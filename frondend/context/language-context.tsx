"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type Language = "th" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// ── Translations ──────────────────────────────────────────────────────────────
const translations: Record<string, { th: string; en: string }> = {
  // ── Common ─────────────────────────────────────────────────────────────────
  "common.home": { th: "หน้าแรก", en: "Home" },
  "common.dashboard": { th: "แดชบอร์ด", en: "Dashboard" },
  "common.settings": { th: "ตั้งค่า", en: "Settings" },
  "common.logout": { th: "ออกจากระบบ", en: "Logout" },
  "common.profile": { th: "โปรไฟล์", en: "Profile" },
  "common.admin": { th: "ผู้ดูแลระบบ", en: "Administrator" },
  "common.tenant": { th: "ผู้เช่า", en: "Tenant" },
  "common.notifications": { th: "แจ้งเตือน", en: "Notifications" },
  "common.language": { th: "ภาษา", en: "Language" },
  "common.thai": { th: "ไทย", en: "Thai" },
  "common.english": { th: "อังกฤษ", en: "English" },
  "common.myAccount": { th: "บัญชีของฉัน", en: "My Account" },
  "common.save": { th: "บันทึก", en: "Save" },
  "common.cancel": { th: "ยกเลิก", en: "Cancel" },
  "common.delete": { th: "ลบ", en: "Delete" },
  "common.edit": { th: "แก้ไข", en: "Edit" },
  "common.add": { th: "เพิ่ม", en: "Add" },
  "common.search": { th: "ค้นหา", en: "Search" },
  "common.filter": { th: "กรอง", en: "Filter" },
  "common.all": { th: "ทั้งหมด", en: "All" },
  "common.loading": { th: "กำลังโหลด...", en: "Loading..." },
  "common.noData": { th: "ไม่พบข้อมูล", en: "No data found" },
  "common.confirm": { th: "ยืนยัน", en: "Confirm" },
  "common.close": { th: "ปิด", en: "Close" },
  "common.view": { th: "ดู", en: "View" },
  "common.download": { th: "ดาวน์โหลด", en: "Download" },
  "common.upload": { th: "อัปโหลด", en: "Upload" },
  "common.status": { th: "สถานะ", en: "Status" },
  "common.actions": { th: "จัดการ", en: "Actions" },
  "common.date": { th: "วันที่", en: "Date" },
  "common.note": { th: "หมายเหตุ", en: "Note" },
  "common.total": { th: "รวม", en: "Total" },
  "common.amount": { th: "จำนวนเงิน", en: "Amount" },
  "common.name": { th: "ชื่อ", en: "Name" },
  "common.phone": { th: "เบอร์โทรศัพท์", en: "Phone" },
  "common.email": { th: "อีเมล", en: "Email" },
  "common.submit": { th: "ส่ง", en: "Submit" },
  "common.viewAll": { th: "ดูทั้งหมด", en: "View all" },
  "common.created": { th: "วันที่สร้าง", en: "Created date" },

  // ── Status ─────────────────────────────────────────────────────────────────
  "status.active": { th: "ใช้งานอยู่", en: "Active" },
  "status.inactive": { th: "ไม่ใช้งาน", en: "Inactive" },
  "status.pending": { th: "รอดำเนินการ", en: "Pending" },
  "status.approved": { th: "อนุมัติแล้ว", en: "Approved" },
  "status.rejected": { th: "ไม่อนุมัติ", en: "Rejected" },
  "status.paid": { th: "ชำระแล้ว", en: "Paid" },
  "status.unpaid": { th: "ยังไม่ชำระ", en: "Unpaid" },
  "status.overdue": { th: "เกินกำหนด", en: "Overdue" },
  "status.cancelled": { th: "ยกเลิก", en: "Cancelled" },
  "status.expired": { th: "หมดอายุ", en: "Expired" },
  "status.terminated": { th: "ยกเลิกแล้ว", en: "Terminated" },
  "status.available": { th: "ว่าง", en: "Available" },
  "status.occupied": { th: "มีผู้เช่า", en: "Occupied" },
  "status.maintenance": { th: "ซ่อมบำรุง", en: "Maintenance" },
  "status.resolved": { th: "เสร็จสิ้น", en: "Resolved" },
  "status.in_progress": { th: "กำลังดำเนินการ", en: "In Progress" },
  "status.verified": { th: "ยืนยันแล้ว", en: "Verified" },
  "status.pending_verify": { th: "รอยืนยัน", en: "Pending Verify" },

  // ── Priority ───────────────────────────────────────────────────────────────
  "priority.low": { th: "ไม่ด่วน", en: "Low" },
  "priority.medium": { th: "ปกติ", en: "Medium" },
  "priority.high": { th: "ด่วน", en: "High" },

  // ── Sidebar / Menu ─────────────────────────────────────────────────────────
  "menu.dashboard": { th: "แดชบอร์ด", en: "Dashboard" },
  "menu.rooms": { th: "ห้องพัก", en: "Rooms" },
  "menu.tenants": { th: "ผู้เช่า", en: "Tenants" },
  "menu.contracts": { th: "สัญญาเช่า", en: "Contracts" },
  "menu.moveOut": { th: "คำร้องย้ายออก", en: "Move-out Requests" },
  "menu.meters": { th: "บันทึกมิเตอร์", en: "Meter Readings" },
  "menu.bills": { th: "บิล", en: "Bills" },
  "menu.payments": { th: "การชำระเงิน", en: "Payments" },
  "menu.maintenance": { th: "แจ้งซ่อม", en: "Maintenance" },
  "menu.announcements": { th: "ประกาศ", en: "Announcements" },
  "menu.settings": { th: "ตั้งค่า", en: "Settings" },
  "menu.group.main": { th: "หลัก", en: "Main" },
  "menu.group.rooms": { th: "จัดการห้องพัก", en: "Room Management" },
  "menu.group.finance": { th: "การเงิน", en: "Finance" },
  "menu.group.other": { th: "อื่นๆ", en: "Others" },

  // ── Rooms ──────────────────────────────────────────────────────────────────
  "rooms.title": { th: "จัดการห้องพัก", en: "Room Management" },
  "rooms.subtitle": {
    th: "จัดการห้องพักทั้งหมดในระบบ",
    en: "Manage all rooms in the system",
  },
  "rooms.add": { th: "เพิ่มห้อง", en: "Add Room" },
  "rooms.roomNumber": { th: "หมายเลขห้อง", en: "Room Number" },
  "rooms.floor": { th: "ชั้น", en: "Floor" },
  "rooms.type": { th: "ประเภทห้อง", en: "Room Type" },
  "rooms.area": { th: "พื้นที่ (ตร.ม.)", en: "Area (sqm)" },
  "rooms.rent": { th: "ค่าเช่า/เดือน", en: "Rent/Month" },
  "rooms.list": { th: "รายการห้องพัก", en: "Room List" },
  "rooms.standard": { th: "ห้องมาตรฐาน", en: "Standard" },
  "rooms.deluxe": { th: "ห้องดีลักซ์", en: "Deluxe" },
  "rooms.suite": { th: "ห้องสวีท", en: "Suite" },
  "rooms.searchPlaceholder": {
    th: "ค้นหาหมายเลขห้อง...",
    en: "Search room number...",
  },

  // ── Tenants ────────────────────────────────────────────────────────────────
  "tenants.title": { th: "จัดการผู้เช่า", en: "Tenant Management" },
  "tenants.subtitle": {
    th: "จัดการข้อมูลผู้เช่าทั้งหมด",
    en: "Manage all tenant information",
  },
  "tenants.add": { th: "เพิ่มผู้เช่า", en: "Add Tenant" },
  "tenants.firstName": { th: "ชื่อ", en: "First Name" },
  "tenants.lastName": { th: "นามสกุล", en: "Last Name" },
  "tenants.idCard": { th: "เลขบัตรประชาชน", en: "ID Card Number" },
  "tenants.emergency": { th: "ผู้ติดต่อฉุกเฉิน", en: "Emergency Contact" },
  "tenants.emergencyPhone": { th: "เบอร์ติดต่อฉุกเฉิน", en: "Emergency Phone" },
  "tenants.username": { th: "ชื่อผู้ใช้ (Login)", en: "Username (Login)" },
  "tenants.password": { th: "รหัสผ่าน", en: "Password" },
  "tenants.list": { th: "รายการผู้เช่า", en: "Tenant List" },
  "tenants.contractStatus": { th: "สถานะสัญญา", en: "Contract Status" },
  "tenants.hasContract": { th: "มีสัญญาเช่า", en: "Has Contract" },
  "tenants.noContract": { th: "ยังไม่มีสัญญา", en: "No Contract" },
  "tenants.searchPlaceholder": {
    th: "ค้นหาชื่อ, อีเมล, เบอร์โทร หรือเลขบัตร...",
    en: "Search name, email, phone or ID...",
  },

  // ── Contracts ──────────────────────────────────────────────────────────────
  "contracts.title": { th: "สัญญาเช่า", en: "Rental Contracts" },
  "contracts.subtitle": {
    th: "จัดการสัญญาเช่าและเงินประกัน",
    en: "Manage rental contracts and deposits",
  },
  "contracts.new": { th: "สัญญาใหม่", en: "New Contract" },
  "contracts.startDate": { th: "วันเริ่มต้น", en: "Start Date" },
  "contracts.endDate": { th: "วันสิ้นสุด", en: "End Date" },
  "contracts.rentAmount": { th: "ค่าเช่า/เดือน", en: "Rent/Month" },
  "contracts.deposit": { th: "เงินประกัน", en: "Deposit" },
  "contracts.totalDeposit": { th: "รวมเงินประกัน", en: "Total Deposit" },
  "contracts.terminate": { th: "ยกเลิกสัญญา", en: "Terminate Contract" },
  "contracts.checkout": { th: "Check-out", en: "Check-out" },
  "contracts.searchPlaceholder": {
    th: "ค้นหา ชื่อ ห้อง หรือ ID...",
    en: "Search name, room or ID...",
  },

  // ── Bills ──────────────────────────────────────────────────────────────────
  "bills.title": { th: "จัดการบิล", en: "Bill Management" },
  "bills.subtitle": {
    th: "สร้างและจัดการบิลค่าเช่า",
    en: "Create and manage rental bills",
  },
  "bills.generate": { th: "สร้างบิล", en: "Generate Bill" },
  "bills.month": { th: "เดือน", en: "Month" },
  "bills.year": { th: "ปี", en: "Year" },
  "bills.dueDate": { th: "กำหนดชำระ", en: "Due Date" },
  "bills.rentAmount": { th: "ค่าเช่า", en: "Rent" },
  "bills.electricAmount": { th: "ค่าไฟฟ้า", en: "Electric" },
  "bills.waterAmount": { th: "ค่าน้ำ", en: "Water" },
  "bills.otherAmount": { th: "ค่าอื่นๆ", en: "Other" },
  "bills.totalAmount": { th: "ยอดรวม", en: "Total Amount" },
  "bills.list": { th: "รายการบิล", en: "Bill List" },
  "bills.cancelBill": { th: "ยกเลิกบิล", en: "Cancel Bill" },
  "bills.detail": { th: "รายละเอียดบิล", en: "Bill Detail" },
  "bills.searchPlaceholder": {
    th: "ค้นหาหมายเลขห้อง หรือชื่อผู้เช่า...",
    en: "Search room or tenant...",
  },

  // ── Meters ─────────────────────────────────────────────────────────────────
  "meters.title": { th: "บันทึกมิเตอร์", en: "Meter Readings" },
  "meters.subtitle": {
    th: "บันทึกค่ามิเตอร์ไฟฟ้าและน้ำประปา",
    en: "Record electric and water meter readings",
  },
  "meters.record": { th: "บันทึกมิเตอร์", en: "Record Meter" },
  "meters.electric": { th: "มิเตอร์ไฟฟ้า", en: "Electric Meter" },
  "meters.water": { th: "มิเตอร์น้ำ", en: "Water Meter" },
  "meters.previous": { th: "เลขก่อนหน้า", en: "Previous Reading" },
  "meters.current": { th: "เลขปัจจุบัน", en: "Current Reading" },
  "meters.used": { th: "ใช้ไป", en: "Used" },
  "meters.rate": { th: "อัตรา", en: "Rate" },
  "meters.image": { th: "รูปมิเตอร์", en: "Meter Image" },
  "meters.list": { th: "รายการมิเตอร์", en: "Meter List" },
  "meters.recordedAt": { th: "บันทึกเมื่อ", en: "Recorded At" },

  // ── Payments ───────────────────────────────────────────────────────────────
  "payments.title": { th: "การชำระเงิน", en: "Payments" },
  "payments.subtitle": { th: "จัดการการชำระเงิน", en: "Manage payments" },
  "payments.method": { th: "วิธีการชำระ", en: "Payment Method" },
  "payments.qr": { th: "สแกน QR Code", en: "Scan QR Code" },
  "payments.slip": { th: "อัปโหลดสลิป", en: "Upload Slip" },
  "payments.verify": { th: "ยืนยันการชำระ", en: "Verify Payment" },
  "payments.reject": { th: "ปฏิเสธ", en: "Reject" },
  "payments.history": { th: "ประวัติการชำระเงิน", en: "Payment History" },
  "payments.paidAt": { th: "ชำระเมื่อ", en: "Paid At" },
  "payments.totalDue": { th: "รวมค้างชำระ", en: "Total Due" },

  // ── Maintenance ────────────────────────────────────────────────────────────
  "maintenance.title": { th: "จัดการแจ้งซ่อม", en: "Maintenance Management" },
  "maintenance.subtitle": {
    th: "รับและจัดการรายการแจ้งซ่อมจากผู้เช่า",
    en: "Receive and manage maintenance requests from tenants",
  },
  "maintenance.request": { th: "แจ้งซ่อม", en: "Request Maintenance" },
  "maintenance.category": { th: "หมวดหมู่", en: "Category" },
  "maintenance.description": { th: "รายละเอียด", en: "Description" },
  "maintenance.assignedTo": { th: "มอบหมายให้", en: "Assigned To" },
  "maintenance.adminNote": { th: "หมายเหตุ", en: "Admin Note" },
  "maintenance.list": { th: "รายการแจ้งซ่อม", en: "Maintenance List" },
  "maintenance.pending": { th: "รอดำเนินการ", en: "Pending" },
  "maintenance.searchPlaceholder": {
    th: "ค้นหาหมายเลขห้อง, หมวดหมู่ หรือชื่อผู้เช่า...",
    en: "Search room, category or tenant...",
  },

  // ── Announcements ──────────────────────────────────────────────────────────
  "announcements.title": { th: "ประกาศข่าวสาร", en: "Announcements" },
  "announcements.subtitle": {
    th: "สร้างและจัดการประกาศสำหรับผู้เช่า",
    en: "Create and manage announcements for tenants",
  },
  "announcements.create": { th: "สร้างประกาศ", en: "Create Announcement" },
  "announcements.titleField": { th: "หัวข้อประกาศ", en: "Announcement Title" },
  "announcements.content": { th: "เนื้อหา", en: "Content" },
  "announcements.audience": { th: "กลุ่มเป้าหมาย", en: "Target Audience" },
  "announcements.floor": { th: "เฉพาะชั้น", en: "Specific Floor" },
  "announcements.pinned": { th: "ปักหมุด", en: "Pinned" },
  "announcements.expires": { th: "วันหมดอายุ", en: "Expiry Date" },
  "announcements.everyone": { th: "ทุกคน", en: "Everyone" },
  "announcements.tenantOnly": { th: "ผู้เช่าเท่านั้น", en: "Tenants Only" },
  "announcements.adminOnly": { th: "แอดมินเท่านั้น", en: "Admin Only" },
  "announcements.important": {
    th: "ประกาศสำคัญ",
    en: "Important Announcements",
  },
  "announcements.others": { th: "ประกาศอื่น", en: "Other Announcements" },
  "announcements.empty": { th: "ยังไม่มีประกาศ", en: "No announcements yet" },

  // ── Move-out ───────────────────────────────────────────────────────────────
  "moveout.title": { th: "คำร้องขอย้ายออก", en: "Move-out Requests" },
  "moveout.subtitle": {
    th: "ตรวจสอบและอนุมัติคำร้องขอย้ายออกจากผู้เช่า",
    en: "Review and approve move-out requests from tenants",
  },
  "moveout.request": {
    th: "ส่งคำร้องขอย้ายออก",
    en: "Submit Move-out Request",
  },
  "moveout.moveOutDate": { th: "วันที่ต้องการย้ายออก", en: "Move-out Date" },
  "moveout.reason": { th: "เหตุผล", en: "Reason" },
  "moveout.notice30": {
    th: "ต้องแจ้งล่วงหน้า 30 วัน",
    en: "Must give 30 days notice",
  },
  "moveout.fine": { th: "ค่าปรับ", en: "Fine" },
  "moveout.refund": { th: "ยอดคืนเงินประกัน", en: "Deposit Refund" },
  "moveout.approve": { th: "อนุมัติ", en: "Approve" },
  "moveout.reject": { th: "ไม่อนุมัติ", en: "Reject" },

  // ── Tenant Dashboard ───────────────────────────────────────────────────────
  "tenant.welcome": { th: "สวัสดี", en: "Hello" },
  "tenant.myRoom": { th: "ห้องพักของคุณ", en: "Your Room" },
  "tenant.rentPerMonth": { th: "ค่าเช่ารายเดือน", en: "Monthly Rent" },
  "tenant.pendingBill": {
    th: "คุณมีบิลที่รอชำระ",
    en: "You have a pending bill",
  },
  "tenant.overdueBill": { th: "บิลเกินกำหนดชำระ!", en: "Overdue bill!" },
  "tenant.payNow": { th: "ชำระเงิน", en: "Pay Now" },

  // ── Tenant Bills ───────────────────────────────────────────────────────────
  "tenant.bills.title": { th: "บิลของฉัน", en: "My Bills" },
  "tenant.bills.subtitle": {
    th: "ดูรายละเอียดบิลค่าเช่าทั้งหมด",
    en: "View all your rental bills",
  },
  "tenant.bills.invoice": { th: "ใบแจ้งหนี้", en: "Invoice" },
  "tenant.bills.payBill": { th: "ชำระบิลนี้", en: "Pay This Bill" },

  // ── Tenant Payment ─────────────────────────────────────────────────────────
  "tenant.payment.title": { th: "ชำระเงิน", en: "Payment" },
  "tenant.payment.subtitle": {
    th: "ชำระค่าห้อง ค่าน้ำ ค่าไฟ",
    en: "Pay room, water, electric fees",
  },
  "tenant.payment.selectBill": {
    th: "เลือกบิลที่ต้องการชำระ",
    en: "Select bill to pay",
  },
  "tenant.payment.methods": { th: "วิธีการชำระเงิน", en: "Payment Methods" },
  "tenant.payment.totalDue": { th: "รวมค้างชำระ", en: "Total Due" },
  "tenant.payment.afterPay": {
    th: "หลังชำระแล้ว กรุณาอัปโหลดสลิปด้วยครับ",
    en: "After payment, please upload slip.",
  },

  // ── Tenant Maintenance ─────────────────────────────────────────────────────
  "tenant.maintenance.title": { th: "ขอซ่อมแซม", en: "Maintenance Request" },
  "tenant.maintenance.subtitle": {
    th: "ส่งคำขอซ่อมแซมหรือปัญหาต่างๆ",
    en: "Submit repair or issue requests",
  },
  "tenant.maintenance.new": { th: "ส่งคำขอใหม่", en: "New Request" },
  "tenant.maintenance.success": {
    th: "ส่งคำขอสำเร็จ",
    en: "Request submitted",
  },

  // ── Tenant Contract ────────────────────────────────────────────────────────
  "tenant.contract.title": { th: "สัญญาเช่า", en: "Rental Contract" },
  "tenant.contract.subtitle": {
    th: "ดูและจัดการสัญญาเช่าของคุณ",
    en: "View and manage your rental contract",
  },
  "tenant.contract.current": { th: "สัญญาปัจจุบัน", en: "Current Contract" },
  "tenant.contract.none": {
    th: "ยังไม่มีสัญญาเช่า",
    en: "No rental contract yet",
  },

  // ── Tenant Move-out ────────────────────────────────────────────────────────
  "tenant.moveout.title": { th: "ขอย้ายออก", en: "Move-out Request" },
  "tenant.moveout.subtitle": {
    th: "แจ้งความประสงค์ย้ายออกจากหอพัก",
    en: "Notify your intention to move out",
  },
  "tenant.moveout.hasPending": {
    th: "มีคำร้องรออยู่แล้ว",
    en: "Already has pending request",
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  "notifications.title": { th: "แจ้งเตือน", en: "Notifications" },
  "notifications.unread": { th: "รายการที่ยังไม่ได้อ่าน", en: "unread items" },
  "notifications.markAll": {
    th: "ทำเครื่องหมายว่าอ่านทั้งหมด",
    en: "Mark all as read",
  },
  "notifications.empty": { th: "ไม่มีการแจ้งเตือน", en: "No notifications" },
  "notifications.new": { th: "ใหม่", en: "New" },

  // ── Months ─────────────────────────────────────────────────────────────────
  "month.1": { th: "มกราคม", en: "January" },
  "month.2": { th: "กุมภาพันธ์", en: "February" },
  "month.3": { th: "มีนาคม", en: "March" },
  "month.4": { th: "เมษายน", en: "April" },
  "month.5": { th: "พฤษภาคม", en: "May" },
  "month.6": { th: "มิถุนายน", en: "June" },
  "month.7": { th: "กรกฎาคม", en: "July" },
  "month.8": { th: "สิงหาคม", en: "August" },
  "month.9": { th: "กันยายน", en: "September" },
  "month.10": { th: "ตุลาคม", en: "October" },
  "month.11": { th: "พฤศจิกายน", en: "November" },
  "month.12": { th: "ธันวาคม", en: "December" },
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("th");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language | null;
    if (saved === "th" || saved === "en") setLanguage(saved);
    setMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    const trans = translations[key];
    if (!trans) return key;
    return trans[language] || key;
  };

  if (!mounted) return <>{children}</>;

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
