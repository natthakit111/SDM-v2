'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { BillStatusBadge } from '@/components/common/status-badge'
import { Plus, Search, Receipt, Eye, FileText, Settings } from 'lucide-react'
import {
  mockBills,
  mockTenants,
  mockRooms,
  mockMeterReadings,
  Bill,
  formatCurrency,
  formatDate,
  dormSettings,
} from '@/lib/mock-data'
import { toast } from 'sonner'

const months = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>(mockBills)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewingBill, setViewingBill] = useState<Bill | null>(null)
  const [penaltySettings, setPenaltySettings] = useState({
    penaltyRate: 5, // 5% per month
    penaltyStartDay: 15, // After 15 days from due date
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [formData, setFormData] = useState({
    roomId: '',
    month: 'มีนาคม',
    year: '2026',
    otherFees: '0',
    otherFeesDescription: '',
  })

  const calculatePenalty = (bill: Bill, asOfDate?: string): number => {
    if (bill.status === 'paid') return 0
    
    const today = asOfDate ? new Date(asOfDate) : new Date()
    const dueDate = new Date(bill.dueDate)
    const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLate <= penaltySettings.penaltyStartDay) return 0
    
    const monthsLate = Math.ceil(daysLate / 30)
    return Math.round((bill.total * penaltySettings.penaltyRate * monthsLate) / 100)
  }

  const activeTenants = mockTenants.filter(t => t.status === 'active')

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const tenant = activeTenants.find(t => t.roomId === formData.roomId)
    const room = mockRooms.find(r => r.id === formData.roomId)
    const meterReading = mockMeterReadings.find(
      m => m.roomId === formData.roomId && m.month === formData.month && m.year === parseInt(formData.year)
    )

    if (!tenant || !room) {
      toast.error('กรุณาเลือกห้องที่มีผู้เช่า')
      return
    }

    if (!meterReading) {
      toast.error('ไม่พบข้อมูลมิเตอร์สำหรับเดือนนี้ กรุณาบันทึกมิเตอร์ก่อน')
      return
    }

    const electricityCost = meterReading.electricityUsed * dormSettings.electricityRate
    const waterCost = meterReading.waterUsed * dormSettings.waterRate
    const otherFees = parseInt(formData.otherFees) || 0
    const baseTotal = room.monthlyRent + electricityCost + waterCost + dormSettings.commonFee + otherFees
    const total = baseTotal

    const newBill: Bill = {
      id: Date.now().toString(),
      roomId: formData.roomId,
      roomNumber: room.number,
      tenantId: tenant.id,
      tenantName: tenant.name,
      month: formData.month,
      year: parseInt(formData.year),
      rent: room.monthlyRent,
      electricityUnits: meterReading.electricityUsed,
      electricityRate: dormSettings.electricityRate,
      electricityCost,
      waterUnits: meterReading.waterUsed,
      waterRate: dormSettings.waterRate,
      waterCost,
      commonFee: dormSettings.commonFee,
      otherFees,
      otherFeesDescription: formData.otherFeesDescription || undefined,
      latePenalty: 0,
      total,
      status: 'pending',
      dueDate: `${formData.year}-${String(months.indexOf(formData.month) + 1).padStart(2, '0')}-10`,
      createdAt: new Date().toISOString().split('T')[0],
    }

    setBills(prev => [...prev, newBill])
    toast.success('สร้างบิลเรียบร้อย')
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      roomId: '',
      month: 'มีนาคม',
      year: '2026',
      otherFees: '0',
      otherFeesDescription: '',
    })
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">จัดการบิล</h1>
          <p className="text-muted-foreground">สร้างและจัดการบิลค่าเช่า</p>
        </div>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              ตั้งค่าค่าปรับ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ตั้งค่าค่าปรับล่าช้า</DialogTitle>
              <DialogDescription>กำหนดอัตราค่าปรับสำหรับการชำระที่ล่าช้า</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="penaltyRate">อัตราค่าปรับ (%)</FieldLabel>
                <Input
                  id="penaltyRate"
                  type="number"
                  value={penaltySettings.penaltyRate}
                  onChange={(e) => setPenaltySettings({...penaltySettings, penaltyRate: parseInt(e.target.value) || 0})}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-muted-foreground mt-1">อัตราค่าปรับต่อเดือนของยอดรวมบิล</p>
              </Field>
              <Field>
                <FieldLabel htmlFor="penaltyStartDay">เริ่มคิดปรับหลังจากวัน (วัน)</FieldLabel>
                <Input
                  id="penaltyStartDay"
                  type="number"
                  value={penaltySettings.penaltyStartDay}
                  onChange={(e) => setPenaltySettings({...penaltySettings, penaltyStartDay: parseInt(e.target.value) || 0})}
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">จำนวนวันหลังจากวันที่กำหนดชำระที่คิดค่าปรับ</p>
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                ปิด
              </Button>
              <Button onClick={() => {
                setIsSettingsOpen(false)
              }}>
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsAddDialogOpen(open)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              สร้างบิล
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>สร้างบิลใหม่</DialogTitle>
              <DialogDescription>
                เลือกห้องและเดือนเพื่อสร้างบิล
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="roomId">ห้อง</FieldLabel>
                  <Select
                    value={formData.roomId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกห้อง" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTenants.map((tenant) => (
                        <SelectItem key={tenant.roomId} value={tenant.roomId || ''}>
                          ห้อง {tenant.roomNumber} - {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="month">เดือน</FieldLabel>
                    <Select
                      value={formData.month}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="year">ปี</FieldLabel>
                    <Select
                      value={formData.year}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="otherFees">ค่าใช้จ่ายอื่นๆ (บาท)</FieldLabel>
                  <Input
                    id="otherFees"
                    type="number"
                    value={formData.otherFees}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherFees: e.target.value }))}
                    placeholder="0"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="otherFeesDescription">รายละเอียดค่าใช้จ่ายอื่นๆ</FieldLabel>
                  <Input
                    id="otherFeesDescription"
                    value={formData.otherFeesDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherFeesDescription: e.target.value }))}
                    placeholder="เช่น ค่าซ่อมแอร์"
                  />
                </Field>
              </FieldGroup>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
                <Button type="submit">สร้างบิล</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาหมายเลขห้อง หรือชื่อผู้เช่า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="สถานะทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="pending">รอชำระ</SelectItem>
                <SelectItem value="paid">ชำระแล้ว</SelectItem>
                <SelectItem value="overdue">เกินกำหนด</SelectItem>
                <SelectItem value="partial">ชำระบางส่วน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            รายการบิล
          </CardTitle>
          <CardDescription>ทั้งหมด {filteredBills.length} รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ห้อง</TableHead>
                <TableHead>ผู้เช่า</TableHead>
                <TableHead>เดือน/ปี</TableHead>
                <TableHead className="text-right">ยอดรวม</TableHead>
                <TableHead>กำหนดชำระ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.roomNumber}</TableCell>
                  <TableCell>{bill.tenantName}</TableCell>
                  <TableCell>{bill.month} {bill.year}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(bill.total)}
                  </TableCell>
                  <TableCell>{formatDate(bill.dueDate)}</TableCell>
                  <TableCell>
                    <BillStatusBadge status={bill.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingBill(bill)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    ไม่พบบิลที่ตรงกับการค้นหา
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Bill Dialog */}
      <Dialog open={!!viewingBill} onOpenChange={(open) => !open && setViewingBill(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              รายละเอียดบิล
            </DialogTitle>
          </DialogHeader>
          {viewingBill && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="font-medium">ห้อง {viewingBill.roomNumber}</p>
                  <p className="text-sm text-muted-foreground">{viewingBill.tenantName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{viewingBill.month} {viewingBill.year}</p>
                  <BillStatusBadge status={viewingBill.status} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ค่าเช่า</span>
                  <span>{formatCurrency(viewingBill.rent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ค่าไฟฟ้า ({viewingBill.electricityUnits} หน่วย x {viewingBill.electricityRate} บาท)
                  </span>
                  <span>{formatCurrency(viewingBill.electricityCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ค่าน้ำ ({viewingBill.waterUnits} หน่วย x {viewingBill.waterRate} บาท)
                  </span>
                  <span>{formatCurrency(viewingBill.waterCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ค่าส่วนกลาง</span>
                  <span>{formatCurrency(viewingBill.commonFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-muted-foreground">ค่าปรับล่าช้า</span>
                  <span className="text-destructive font-medium">
                    {formatCurrency(calculatePenalty(viewingBill))}
                  </span>
                </div>
                {viewingBill.otherFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ค่าอื่นๆ {viewingBill.otherFeesDescription && `(${viewingBill.otherFeesDescription})`}
                    </span>
                    <span>{formatCurrency(viewingBill.otherFees)}</span>
                  </div>
                )}
                {viewingBill.latePenalty > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>ค่าปรับล่าช้า</span>
                    <span>{formatCurrency(viewingBill.latePenalty)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t font-bold text-lg">
                <span>รวมทั้งหมด</span>
                <span>{formatCurrency(viewingBill.total)}</span>
              </div>

              <div className="flex justify-between text-sm pt-2">
                <span className="text-muted-foreground">กำหนดชำระภายใน</span>
                <span>{formatDate(viewingBill.dueDate)}</span>
              </div>

              {viewingBill.paidAt && (
                <div className="flex justify-between text-sm text-success">
                  <span>ชำระเมื่อ</span>
                  <span>{formatDate(viewingBill.paidAt)}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
