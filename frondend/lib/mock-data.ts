// Mock Data for DormFlow

export interface Room {
  id: string
  number: string
  floor: number
  type: 'standard' | 'deluxe' | 'suite'
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  monthlyRent: number
  deposit: number
  amenities: string[]
}

export interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  idCard: string
  roomId: string | null
  roomNumber: string | null
  moveInDate: string | null
  contractEndDate: string | null
  emergencyContact: string
  telegramId?: string
  status: 'active' | 'pending' | 'moved_out'
}

export interface Contract {
  id: string
  tenantId: string
  roomId: string
  startDate: string
  endDate: string
  monthlyRent: number
  deposit: number
  depositPaid: boolean
  status: 'active' | 'expired' | 'terminated'
}

export interface MeterReading {
  id: string
  roomId: string
  roomNumber: string
  month: string
  year: number
  electricityPrevious: number
  electricityCurrent: number
  electricityUsed: number
  waterPrevious: number
  waterCurrent: number
  waterUsed: number
  recordedAt: string
  recordedBy: string
}

export interface Bill {
  id: string
  roomId: string
  roomNumber: string
  tenantId: string
  tenantName: string
  month: string
  year: number
  rent: number
  electricityUnits: number
  electricityRate: number
  electricityCost: number
  waterUnits: number
  waterRate: number
  waterCost: number
  commonFee: number
  otherFees: number
  otherFeesDescription?: string
  latePenalty: number
  total: number
  status: 'pending' | 'paid' | 'overdue' | 'partial'
  dueDate: string
  createdAt: string
  paidAt?: string
  paidAmount?: number
}

export interface Payment {
  id: string
  billId: string
  roomNumber: string
  tenantName: string
  amount: number
  method: 'cash' | 'transfer' | 'promptpay'
  slipUrl?: string
  status: 'pending' | 'verified' | 'rejected'
  note?: string
  createdAt: string
  verifiedAt?: string
  verifiedBy?: string
}

export interface MaintenanceRequest {
  id: string
  roomId: string
  roomNumber: string
  tenantId: string
  tenantName: string
  category: 'electrical' | 'plumbing' | 'aircon' | 'furniture' | 'other'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  images?: string[]
  createdAt: string
  assignedTo?: string
  completedAt?: string
  adminNote?: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: 'normal' | 'important' | 'urgent'
  targetAudience: 'all' | 'tenants' | 'specific_rooms'
  targetRooms?: string[]
  createdAt: string
  createdBy: string
  expiresAt?: string
  isActive: boolean
}

// Mock Data
export const mockRooms: Room[] = [
  { id: '1', number: '101', floor: 1, type: 'standard', status: 'occupied', monthlyRent: 4500, deposit: 9000, amenities: ['แอร์', 'เฟอร์นิเจอร์', 'เครื่องทำน้ำอุ่น'] },
  { id: '2', number: '102', floor: 1, type: 'standard', status: 'occupied', monthlyRent: 4500, deposit: 9000, amenities: ['แอร์', 'เฟอร์นิเจอร์', 'เครื่องทำน้ำอุ่น'] },
  { id: '3', number: '103', floor: 1, type: 'deluxe', status: 'available', monthlyRent: 5500, deposit: 11000, amenities: ['แอร์', 'เฟอร์นิเจอร์', 'เครื่องทำน้ำอุ่น', 'ทีวี', 'ตู้เย็น'] },
  { id: '4', number: '104', floor: 1, type: 'standard', status: 'maintenance', monthlyRent: 4500, deposit: 9000, amenities: ['แอร์', 'เฟอร์นิเจอร์', 'เครื่องทำน้ำอุ่น'] },
  { id: '5', number: '201', floor: 2, type: 'deluxe', status: 'occupied', monthlyRent: 5500, deposit: 11000, amenities: ['แอร์', 'เฟอร์นิเจอร์', 'เครื่องทำน้ำอุ่น', 'ทีวี', 'ตู้เย็น'] },
  { id: '6', number: '202', floor: 2, type: 'standard', status: 'available', monthlyRent: 4500, deposit: 9000, amenities: ['แอร์', 'เฟอร์นิเจอร์', 'เครื่องทำน้ำอุ่น'] },
  { id: '7', number: '203', floor: 2, type: 'suite', status: 'reserved', monthlyRent: 7500, deposit: 15000, amenities: ['แอร์', 'เฟอร์นิเจอร์', 'เครื่องทำน้ำอุ่น', 'ทีวี', 'ตู้เย็น', 'ไมโครเวฟ', 'เครื่องซักผ้า'] },
  { id: '8', number: '204', floor: 2, type: 'standard', status: 'occupied', monthlyRent: 4500, deposit: 9000, amenities: ['แอร์', 'เฟอร์นิเจอร์', 'เครื่องทำน้ำอุ่น'] },
  { id: '9', number: '301', floor: 3, type: 'deluxe', status: 'occupied', monthlyRent: 5500, deposit: 11000, amenities: ['แอร์', 'เฟอร์นิเจอร์', 'เครื่องทำน้ำอุ่น', 'ทีวี', 'ตู้เย็น'] },
  { id: '10', number: '302', floor: 3, type: 'standard', status: 'available', monthlyRent: 4500, deposit: 9000, amenities: ['แอร์', 'เฟอร์นิเจอร์', 'เครื่องทำน้ำอุ่น'] },
]

export const mockTenants: Tenant[] = [
  { id: '1', name: 'สมชาย ใจดี', email: 'somchai@email.com', phone: '081-234-5678', idCard: '1-2345-67890-12-3', roomId: '1', roomNumber: '101', moveInDate: '2024-01-15', contractEndDate: '2025-01-14', emergencyContact: '089-111-2222', status: 'active' },
  { id: '2', name: 'สมหญิง รักเรียน', email: 'somying@email.com', phone: '082-345-6789', idCard: '1-3456-78901-23-4', roomId: '2', roomNumber: '102', moveInDate: '2024-02-01', contractEndDate: '2025-01-31', emergencyContact: '089-222-3333', status: 'active' },
  { id: '3', name: 'มานะ ขยันดี', email: 'mana@email.com', phone: '083-456-7890', idCard: '1-4567-89012-34-5', roomId: '5', roomNumber: '201', moveInDate: '2024-03-01', contractEndDate: '2025-02-28', emergencyContact: '089-333-4444', status: 'active' },
  { id: '4', name: 'วิไล สุขใจ', email: 'wilai@email.com', phone: '084-567-8901', idCard: '1-5678-90123-45-6', roomId: '8', roomNumber: '204', moveInDate: '2024-04-01', contractEndDate: '2025-03-31', emergencyContact: '089-444-5555', status: 'active' },
  { id: '5', name: 'ประเสริฐ ยิ่งยง', email: 'prasert@email.com', phone: '085-678-9012', idCard: '1-6789-01234-56-7', roomId: '9', roomNumber: '301', moveInDate: '2024-05-01', contractEndDate: '2025-04-30', emergencyContact: '089-555-6666', status: 'active' },
  { id: '6', name: 'นภาพร งามตา', email: 'napaporn@email.com', phone: '086-789-0123', idCard: '1-7890-12345-67-8', roomId: null, roomNumber: null, moveInDate: null, contractEndDate: null, emergencyContact: '089-666-7777', status: 'pending' },
]

export const mockContracts: Contract[] = [
  { id: '1', tenantId: '1', roomId: '1', startDate: '2024-01-15', endDate: '2025-01-14', monthlyRent: 4500, deposit: 9000, depositPaid: true, status: 'active' },
  { id: '2', tenantId: '2', roomId: '2', startDate: '2024-02-01', endDate: '2025-01-31', monthlyRent: 4500, deposit: 9000, depositPaid: true, status: 'active' },
  { id: '3', tenantId: '3', roomId: '5', startDate: '2024-03-01', endDate: '2025-02-28', monthlyRent: 5500, deposit: 11000, depositPaid: true, status: 'active' },
  { id: '4', tenantId: '4', roomId: '8', startDate: '2024-04-01', endDate: '2025-03-31', monthlyRent: 4500, deposit: 9000, depositPaid: true, status: 'active' },
  { id: '5', tenantId: '5', roomId: '9', startDate: '2024-05-01', endDate: '2025-04-30', monthlyRent: 5500, deposit: 11000, depositPaid: true, status: 'active' },
]

export const mockMeterReadings: MeterReading[] = [
  { id: '1', roomId: '1', roomNumber: '101', month: 'มีนาคม', year: 2026, electricityPrevious: 1250, electricityCurrent: 1380, electricityUsed: 130, waterPrevious: 45, waterCurrent: 52, waterUsed: 7, recordedAt: '2026-03-01', recordedBy: 'admin' },
  { id: '2', roomId: '2', roomNumber: '102', month: 'มีนาคม', year: 2026, electricityPrevious: 980, electricityCurrent: 1090, electricityUsed: 110, waterPrevious: 38, waterCurrent: 44, waterUsed: 6, recordedAt: '2026-03-01', recordedBy: 'admin' },
  { id: '3', roomId: '5', roomNumber: '201', month: 'มีนาคม', year: 2026, electricityPrevious: 2100, electricityCurrent: 2280, electricityUsed: 180, waterPrevious: 62, waterCurrent: 71, waterUsed: 9, recordedAt: '2026-03-01', recordedBy: 'admin' },
  { id: '4', roomId: '8', roomNumber: '204', month: 'มีนาคม', year: 2026, electricityPrevious: 890, electricityCurrent: 995, electricityUsed: 105, waterPrevious: 41, waterCurrent: 47, waterUsed: 6, recordedAt: '2026-03-01', recordedBy: 'admin' },
  { id: '5', roomId: '9', roomNumber: '301', month: 'มีนาคม', year: 2026, electricityPrevious: 1560, electricityCurrent: 1720, electricityUsed: 160, waterPrevious: 55, waterCurrent: 63, waterUsed: 8, recordedAt: '2026-03-01', recordedBy: 'admin' },
]

export const mockBills: Bill[] = [
  { id: '1', roomId: '1', roomNumber: '101', tenantId: '1', tenantName: 'สมชาย ใจดี', month: 'มีนาคม', year: 2026, rent: 4500, electricityUnits: 130, electricityRate: 8, electricityCost: 1040, waterUnits: 7, waterRate: 20, waterCost: 140, commonFee: 200, otherFees: 0, latePenalty: 0, total: 5880, status: 'pending', dueDate: '2026-03-10', createdAt: '2026-03-01' },
  { id: '2', roomId: '2', roomNumber: '102', tenantId: '2', tenantName: 'สมหญิง รักเรียน', month: 'มีนาคม', year: 2026, rent: 4500, electricityUnits: 110, electricityRate: 8, electricityCost: 880, waterUnits: 6, waterRate: 20, waterCost: 120, commonFee: 200, otherFees: 0, latePenalty: 0, total: 5700, status: 'paid', dueDate: '2026-03-10', createdAt: '2026-03-01', paidAt: '2026-03-05', paidAmount: 5700 },
  { id: '3', roomId: '5', roomNumber: '201', tenantId: '3', tenantName: 'มานะ ขยันดี', month: 'มีนาคม', year: 2026, rent: 5500, electricityUnits: 180, electricityRate: 8, electricityCost: 1440, waterUnits: 9, waterRate: 20, waterCost: 180, commonFee: 200, otherFees: 0, latePenalty: 0, total: 7320, status: 'overdue', dueDate: '2026-03-10', createdAt: '2026-03-01' },
  { id: '4', roomId: '8', roomNumber: '204', tenantId: '4', tenantName: 'วิไล สุขใจ', month: 'มีนาคม', year: 2026, rent: 4500, electricityUnits: 105, electricityRate: 8, electricityCost: 840, waterUnits: 6, waterRate: 20, waterCost: 120, commonFee: 200, otherFees: 0, latePenalty: 0, total: 5660, status: 'pending', dueDate: '2026-03-10', createdAt: '2026-03-01' },
  { id: '5', roomId: '9', roomNumber: '301', tenantId: '5', tenantName: 'ประเสริฐ ยิ่งยง', month: 'มีนาคม', year: 2026, rent: 5500, electricityUnits: 160, electricityRate: 8, electricityCost: 1280, waterUnits: 8, waterRate: 20, waterCost: 160, commonFee: 200, otherFees: 0, latePenalty: 0, total: 7140, status: 'paid', dueDate: '2026-03-10', createdAt: '2026-03-01', paidAt: '2026-03-08', paidAmount: 7140 },
]

export const mockPayments: Payment[] = [
  { id: '1', billId: '2', roomNumber: '102', tenantName: 'สมหญิง รักเรียน', amount: 5700, method: 'transfer', status: 'verified', createdAt: '2026-03-05', verifiedAt: '2026-03-05', verifiedBy: 'admin' },
  { id: '2', billId: '5', roomNumber: '301', tenantName: 'ประเสริฐ ยิ่งยง', amount: 7140, method: 'promptpay', status: 'verified', createdAt: '2026-03-08', verifiedAt: '2026-03-08', verifiedBy: 'admin' },
  { id: '3', billId: '1', roomNumber: '101', tenantName: 'สมชาย ใจดี', amount: 5880, method: 'transfer', slipUrl: '/uploads/slips/slip-001.jpg', status: 'pending', createdAt: '2026-03-15' },
]

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  { id: '1', roomId: '1', roomNumber: '101', tenantId: '1', tenantName: 'สมชาย ใจดี', category: 'aircon', title: 'แอร์ไม่เย็น', description: 'แอร์เปิดแล้วไม่เย็น มีเสียงดังผิดปกติ', priority: 'high', status: 'in_progress', createdAt: '2026-03-10', assignedTo: 'ช่างสมบัติ' },
  { id: '2', roomId: '5', roomNumber: '201', tenantId: '3', tenantName: 'มานะ ขยันดี', category: 'plumbing', title: 'ก๊อกน้ำรั่ว', description: 'ก๊อกน้ำในห้องน้ำรั่วซึม หยดน้ำตลอดเวลา', priority: 'medium', status: 'pending', createdAt: '2026-03-12' },
  { id: '3', roomId: '2', roomNumber: '102', tenantId: '2', tenantName: 'สมหญิง รักเรียน', category: 'electrical', title: 'ไฟกระพริบ', description: 'หลอดไฟในห้องนอนกระพริบ อยากให้มาเปลี่ยนให้', priority: 'low', status: 'completed', createdAt: '2026-03-08', completedAt: '2026-03-09', adminNote: 'เปลี่ยนหลอดไฟใหม่เรียบร้อย' },
  { id: '4', roomId: '8', roomNumber: '204', tenantId: '4', tenantName: 'วิไล สุขใจ', category: 'furniture', title: 'ตู้เสื้อผ้าพัง', description: 'บานประตูตู้เสื้อผ้าหลุดออกจากบานพับ', priority: 'low', status: 'pending', createdAt: '2026-03-14' },
]

export const mockAnnouncements: Announcement[] = [
  { id: '1', title: 'แจ้งปิดน้ำชั่วคราว', content: 'แจ้งให้ทราบว่าจะมีการปิดน้ำเพื่อซ่อมแซมท่อประปาในวันที่ 20 มีนาคม 2026 ตั้งแต่เวลา 09:00 - 12:00 น. กรุณาสำรองน้ำไว้ใช้งานล่วงหน้า', priority: 'important', targetAudience: 'all', createdAt: '2026-03-15', createdBy: 'admin', isActive: true },
  { id: '2', title: 'ค่าส่วนกลางเดือนเมษายน', content: 'แจ้งเตือนผู้เช่าทุกท่าน กรุณาชำระค่าห้องและค่าส่วนกลางภายในวันที่ 10 ของทุกเดือน หากชำระล่าช้าจะมีค่าปรับ 50 บาท/วัน', priority: 'normal', targetAudience: 'tenants', createdAt: '2026-03-01', createdBy: 'admin', isActive: true },
  { id: '3', title: 'กฎระเบียบการอยู่อาศัย', content: 'เตือนความจำ: ห้ามส่งเสียงดังหลัง 22:00 น. ห้ามเลี้ยงสัตว์โดยไม่ได้รับอนุญาต และกรุณารักษาความสะอาดพื้นที่ส่วนกลาง', priority: 'normal', targetAudience: 'all', createdAt: '2026-02-15', createdBy: 'admin', isActive: true },
]

// Settings
export const dormSettings = {
  name: 'หอพักสุขใจ',
  address: '123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110',
  phone: '02-123-4567',
  email: 'info@sukjai-dorm.com',
  electricityRate: 8, // บาท/หน่วย
  waterRate: 20, // บาท/หน่วย
  commonFee: 200, // บาท/เดือน
  latePenaltyRate: 50, // บาท/วัน
  promptPayNumber: '0812345678',
  bankAccount: {
    bank: 'ธนาคารกสิกรไทย',
    accountNumber: '123-4-56789-0',
    accountName: 'หอพักสุขใจ',
  },
}

// Helper functions
export function getRoomTypeLabel(type: Room['type']) {
  const labels = {
    standard: 'ห้องมาตรฐาน',
    deluxe: 'ห้องดีลักซ์',
    suite: 'ห้องสวีท',
  }
  return labels[type]
}

export function getRoomStatusLabel(status: Room['status']) {
  const labels = {
    available: 'ว่าง',
    occupied: 'มีผู้เช่า',
    maintenance: 'ซ่อมบำรุง',
    reserved: 'จอง',
  }
  return labels[status]
}

export function getBillStatusLabel(status: Bill['status']) {
  const labels = {
    pending: 'รอชำระ',
    paid: 'ชำระแล้ว',
    overdue: 'เกินกำหนด',
    partial: 'ชำระบางส่วน',
  }
  return labels[status]
}

export function getMaintenanceStatusLabel(status: MaintenanceRequest['status']) {
  const labels = {
    pending: 'รอดำเนินการ',
    in_progress: 'กำลังดำเนินการ',
    completed: 'เสร็จสิ้น',
    cancelled: 'ยกเลิก',
  }
  return labels[status]
}

export function getMaintenanceCategoryLabel(category: MaintenanceRequest['category']) {
  const labels = {
    electrical: 'ไฟฟ้า',
    plumbing: 'ประปา',
    aircon: 'แอร์',
    furniture: 'เฟอร์นิเจอร์',
    other: 'อื่นๆ',
  }
  return labels[category]
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
