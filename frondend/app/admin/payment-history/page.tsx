'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Eye, Filter, Printer, FileText } from 'lucide-react'
import StatusBadge from '@/components/common/status-badge'

interface PaymentRecord {
  id: string
  tenantName: string
  room: string
  billId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  status: 'completed' | 'pending'
  receiptNumber?: string
  notes?: string
}

export default function PaymentHistoryPage() {
  const [payments] = useState<PaymentRecord[]>([
    {
      id: 'PM001',
      tenantName: 'นายสมชาย มั่นสถิร',
      room: 'A101',
      billId: 'BL001',
      amount: 5000,
      paymentDate: '2024-03-15',
      paymentMethod: 'QR Code PromptPay',
      status: 'completed',
      receiptNumber: 'RCP001',
      notes: 'ชำระค่าห้องรายเดือน'
    },
    {
      id: 'PM002',
      tenantName: 'นายสมชาย มั่นสถิร',
      room: 'A101',
      billId: 'BL002',
      amount: 250,
      paymentDate: '2024-03-15',
      paymentMethod: 'QR Code PromptPay',
      status: 'completed',
      receiptNumber: 'RCP002',
      notes: 'ชำระค่าน้ำประปา'
    },
    {
      id: 'PM003',
      tenantName: 'นางสาวธัญชนก นามวงค์',
      room: 'B205',
      billId: 'BL003',
      amount: 4500,
      paymentDate: '2024-03-14',
      paymentMethod: 'สลิปธนาคาร',
      status: 'completed',
      receiptNumber: 'RCP003',
      notes: 'ชำระค่าห้องรายเดือน'
    },
    {
      id: 'PM004',
      tenantName: 'นายวิชัย ยศวินัย',
      room: 'C310',
      billId: 'BL004',
      amount: 3000,
      paymentDate: '2024-03-10',
      paymentMethod: 'QR Code PromptPay',
      status: 'completed',
      receiptNumber: 'RCP004',
      notes: 'ชำระค่าห้องและค่าไฟฟ้า'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.room.includes(searchTerm) ||
                         payment.billId.includes(searchTerm) ||
                         payment.id.includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod.includes(filterMethod)
    const paymentDate = new Date(payment.paymentDate)
    const matchesStartDate = !startDate || paymentDate >= new Date(startDate)
    const matchesEndDate = !endDate || paymentDate <= new Date(endDate)
    
    return matchesSearch && matchesStatus && matchesMethod && matchesStartDate && matchesEndDate
  })

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const completedCount = filteredPayments.filter(p => p.status === 'completed').length

  const handleExportPDF = (payment: PaymentRecord) => {
    // Simulate PDF export
    console.log(`Exporting PDF for payment ${payment.id}`)
  }

  const handlePrint = (payment: PaymentRecord) => {
    // Simulate print
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ประวัติการชำระเงิน</h1>
          <p className="text-muted-foreground mt-2">ดูและจัดการประวัติการชำระเงินทั้งหมด</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalAmount.toLocaleString('th-TH')} บาท</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ชำระสำเร็จ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ยังค้างชำระ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{payments.filter(p => p.status === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ยอดรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('th-TH')} บาท</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Filter className="w-5 h-5" />
            ตัวกรอง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="ค้นหา ชื่อ ห้อง บิล หรือ ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="completed">ชำระแล้ว</SelectItem>
                  <SelectItem value="pending">รอการชำระ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="วิธีการชำระ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="QR Code">QR Code PromptPay</SelectItem>
                  <SelectItem value="สลิป">สลิปธนาคาร</SelectItem>
                  <SelectItem value="บัตร">บัตรเครดิต</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="วันเริ่มต้น"
              />
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="วันสิ้นสุด"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-3">
        {filteredPayments.map(payment => (
          <Card key={payment.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="bg-success/10 p-3 rounded-lg h-fit">
                    <FileText className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{payment.tenantName}</h3>
                        <p className="text-sm text-muted-foreground">
                          ห้อง {payment.room} • บิล {payment.billId} • {payment.receiptNumber}
                        </p>
                        {payment.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{payment.notes}</p>
                        )}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {payment.paymentMethod}
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {new Date(payment.paymentDate).toLocaleDateString('th-TH', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-success">{payment.amount.toLocaleString('th-TH')}</p>
                    <p className="text-xs text-muted-foreground">บาท</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">ดู</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>รายละเอียดการชำระเงิน</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">ชื่อผู้เช่า</p>
                              <p className="font-medium">{selectedPayment?.tenantName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ห้อง</p>
                              <p className="font-medium">{selectedPayment?.room}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">บิล</p>
                              <p className="font-medium">{selectedPayment?.billId}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ใบเสร็จ</p>
                              <p className="font-medium">{selectedPayment?.receiptNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">จำนวนเงิน</p>
                              <p className="font-bold text-lg text-success">{selectedPayment?.amount.toLocaleString('th-TH')} บาท</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">วันที่ชำระ</p>
                              <p className="font-medium">
                                {selectedPayment && new Date(selectedPayment.paymentDate).toLocaleDateString('th-TH', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-sm text-muted-foreground">วิธีการชำระ</p>
                              <p className="font-medium">{selectedPayment?.paymentMethod}</p>
                            </div>
                            {selectedPayment?.notes && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">หมายเหตุ</p>
                                <p className="text-sm">{selectedPayment.notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 gap-2"
                              onClick={() => handleExportPDF(selectedPayment!)}
                            >
                              <Download className="w-4 h-4" />
                              ดาวน์โหลด PDF
                            </Button>
                            <Button 
                              variant="outline"
                              className="gap-2"
                              onClick={() => handlePrint(selectedPayment!)}
                            >
                              <Printer className="w-4 h-4" />
                              พิมพ์
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportPDF(payment)}
                      className="gap-1"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">ไม่พบประวัติการชำระเงิน</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
