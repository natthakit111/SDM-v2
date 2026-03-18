'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Eye, Printer, FileText, TrendingUp } from 'lucide-react'
import StatusBadge from '@/components/common/status-badge'
import { generateReceiptPDF } from '@/lib/pdf-export'

interface PaymentRecord {
  id: string
  billId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  status: 'completed' | 'pending'
  receiptNumber?: string
  description?: string
}

export default function TenantPaymentHistoryPage() {
  const [payments] = useState<PaymentRecord[]>([
    {
      id: 'PM001',
      billId: 'BL001',
      amount: 5000,
      paymentDate: '2024-03-15',
      paymentMethod: 'QR Code PromptPay',
      status: 'completed',
      receiptNumber: 'RCP001',
      description: 'ค่าห้องรายเดือน มีนาคม 2567'
    },
    {
      id: 'PM002',
      billId: 'BL002',
      amount: 250,
      paymentDate: '2024-03-15',
      paymentMethod: 'QR Code PromptPay',
      status: 'completed',
      receiptNumber: 'RCP002',
      description: 'ค่าน้ำประปา มีนาคม 2567'
    },
    {
      id: 'PM003',
      billId: 'BL003',
      amount: 300,
      paymentDate: '2024-03-15',
      paymentMethod: 'QR Code PromptPay',
      status: 'completed',
      receiptNumber: 'RCP003',
      description: 'ค่าไฟฟ้า มีนาคม 2567'
    },
    {
      id: 'PM004',
      billId: 'BL004',
      amount: 5000,
      paymentDate: '2024-02-28',
      paymentMethod: 'QR Code PromptPay',
      status: 'completed',
      receiptNumber: 'RCP004',
      description: 'ค่าห้องรายเดือน กุมภาพันธ์ 2567'
    },
    {
      id: 'PM005',
      billId: 'BL005',
      amount: 5000,
      paymentDate: '2024-01-31',
      paymentMethod: 'สลิปธนาคาร',
      status: 'completed',
      receiptNumber: 'RCP005',
      description: 'ค่าห้องรายเดือน มกราคม 2567'
    }
  ])

  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const filteredPayments = filterMonth === 'all' 
    ? payments 
    : payments.filter(p => new Date(p.paymentDate).toISOString().substring(0, 7) === filterMonth)

  const totalPaid = filteredPayments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0)
  const monthlyAverage = payments.length > 0 
    ? Math.round(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length)
    : 0

  const handleDownloadPDF = (payment: PaymentRecord) => {
    generateReceiptPDF({
      receiptNumber: payment.receiptNumber || '',
      tenantName: 'นายสมชาย มั่นสถิร',
      room: 'A101',
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      billId: payment.billId,
      notes: payment.description
    })
  }

  const handlePrint = (payment: PaymentRecord) => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ประวัติการชำระเงิน</h1>
        <p className="text-muted-foreground mt-2">ดูประวัติการชำระเงินและดาวน์โหลดใบเสร็จ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ชำระแล้วในงวดนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalPaid.toLocaleString('th-TH')} บาท</div>
            <p className="text-xs text-muted-foreground mt-1">{filteredPayments.filter(p => p.status === 'completed').length} รายการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex gap-2 items-center">
              <TrendingUp className="w-4 h-4" />
              เฉลี่ยรายเดือน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyAverage.toLocaleString('th-TH')} บาท</div>
            <p className="text-xs text-muted-foreground mt-1">จากทั้ง {payments.length} รายการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมทั้งสิ้น</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('th-TH')} บาท</div>
            <p className="text-xs text-muted-foreground mt-1">ทั้งหมด {payments.length} รายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="ทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {[...new Set(payments.map(p => new Date(p.paymentDate).toISOString().substring(0, 7)))].sort().reverse().map(month => {
                  const date = new Date(month + '-01')
                  return (
                    <SelectItem key={month} value={month}>
                      {date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-3">
        {filteredPayments.length > 0 ? (
          filteredPayments.map(payment => (
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
                          <h3 className="font-bold text-lg">{payment.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            บิล {payment.billId} • {payment.receiptNumber}
                          </p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {payment.paymentMethod}
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {new Date(payment.paymentDate).toLocaleDateString('th-TH', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric'
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
                            <DialogTitle>ใบเสร็จการชำระเงิน</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">ใบเสร็จที่</p>
                                <p className="font-medium">{selectedPayment?.receiptNumber}</p>
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
                              <div>
                                <p className="text-sm text-muted-foreground">บิล</p>
                                <p className="font-medium">{selectedPayment?.billId}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">วิธีการชำระ</p>
                                <p className="font-medium">{selectedPayment?.paymentMethod}</p>
                              </div>
                            </div>
                            
                            <div className="bg-success/10 border border-success rounded-lg p-4">
                              <p className="text-sm text-muted-foreground">จำนวนเงิน</p>
                              <p className="text-3xl font-bold text-success">{selectedPayment?.amount.toLocaleString('th-TH')} บาท</p>
                            </div>

                            {selectedPayment?.description && (
                              <div>
                                <p className="text-sm text-muted-foreground">รายละเอียด</p>
                                <p className="text-sm">{selectedPayment.description}</p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                className="flex-1 gap-2"
                                onClick={() => handleDownloadPDF(selectedPayment!)}
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
                        onClick={() => handleDownloadPDF(payment)}
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
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">ไม่พบประวัติการชำระเงิน</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
