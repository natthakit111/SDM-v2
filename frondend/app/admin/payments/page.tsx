'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { PaymentStatusBadge } from '@/components/common/status-badge'
import { Search, CreditCard, Eye, CheckCircle, XCircle, Image } from 'lucide-react'
import { mockPayments, Payment, formatCurrency, formatDate } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null)
  const [verifyNote, setVerifyNote] = useState('')

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleVerify = (paymentId: string, approved: boolean) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId
        ? {
            ...payment,
            status: approved ? 'verified' : 'rejected',
            verifiedAt: new Date().toISOString().split('T')[0],
            verifiedBy: 'admin',
            note: verifyNote || undefined,
          }
        : payment
    ))
    toast.success(approved ? 'อนุมัติการชำระเงินเรียบร้อย' : 'ปฏิเสธการชำระเงิน')
    setViewingPayment(null)
    setVerifyNote('')
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'เงินสด',
      transfer: 'โอนเงิน',
      promptpay: 'พร้อมเพย์',
    }
    return labels[method] || method
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ตรวจสอบการชำระเงิน</h1>
        <p className="text-muted-foreground">ตรวจสอบและอนุมัติการชำระเงินจากผู้เช่า</p>
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
                <SelectItem value="pending">รอตรวจสอบ</SelectItem>
                <SelectItem value="verified">ตรวจสอบแล้ว</SelectItem>
                <SelectItem value="rejected">ปฏิเสธ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments Alert */}
      {payments.filter(p => p.status === 'pending').length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <CreditCard className="h-5 w-5 text-warning-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-warning-foreground">รอตรวจสอบ</h3>
                <p className="text-sm text-muted-foreground">
                  มี {payments.filter(p => p.status === 'pending').length} รายการที่รอการตรวจสอบ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            รายการชำระเงิน
          </CardTitle>
          <CardDescription>ทั้งหมด {filteredPayments.length} รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ห้อง</TableHead>
                <TableHead>ผู้เช่า</TableHead>
                <TableHead className="text-right">จำนวนเงิน</TableHead>
                <TableHead>วิธีชำระ</TableHead>
                <TableHead>วันที่ชำระ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.roomNumber}</TableCell>
                  <TableCell>{payment.tenantName}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>{getMethodLabel(payment.method)}</TableCell>
                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingPayment(payment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    ไม่พบรายการชำระเงินที่ตรงกับการค้นหา
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Payment Dialog */}
      <Dialog open={!!viewingPayment} onOpenChange={(open) => {
        if (!open) {
          setViewingPayment(null)
          setVerifyNote('')
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>รายละเอียดการชำระเงิน</DialogTitle>
            <DialogDescription>
              ตรวจสอบข้อมูลและอนุมัติการชำระเงิน
            </DialogDescription>
          </DialogHeader>
          {viewingPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ห้อง</p>
                  <p className="font-medium">{viewingPayment.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ผู้เช่า</p>
                  <p className="font-medium">{viewingPayment.tenantName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">จำนวนเงิน</p>
                  <p className="font-medium text-lg">{formatCurrency(viewingPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">วิธีชำระ</p>
                  <p className="font-medium">{getMethodLabel(viewingPayment.method)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">วันที่ชำระ</p>
                  <p className="font-medium">{formatDate(viewingPayment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">สถานะ</p>
                  <PaymentStatusBadge status={viewingPayment.status} />
                </div>
              </div>

              {viewingPayment.slipUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">หลักฐานการชำระเงิน</p>
                  <div className="border rounded-lg p-4 bg-muted/50 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Image className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">สลิปการโอนเงิน</p>
                      <Button variant="link" size="sm" className="mt-2">
                        ดูรูปขนาดเต็ม
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {viewingPayment.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t">
                  <Field>
                    <FieldLabel>หมายเหตุ (ถ้ามี)</FieldLabel>
                    <Textarea
                      value={verifyNote}
                      onChange={(e) => setVerifyNote(e.target.value)}
                      placeholder="เพิ่มหมายเหตุสำหรับการตรวจสอบ..."
                      rows={3}
                    />
                  </Field>
                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleVerify(viewingPayment.id, false)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      ปฏิเสธ
                    </Button>
                    <Button
                      className="flex-1 bg-success hover:bg-success/90"
                      onClick={() => handleVerify(viewingPayment.id, true)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      อนุมัติ
                    </Button>
                  </div>
                </div>
              )}

              {viewingPayment.status !== 'pending' && (
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {viewingPayment.verifiedAt && (
                      <div>
                        <p className="text-muted-foreground">ตรวจสอบเมื่อ</p>
                        <p>{formatDate(viewingPayment.verifiedAt)}</p>
                      </div>
                    )}
                    {viewingPayment.verifiedBy && (
                      <div>
                        <p className="text-muted-foreground">ตรวจสอบโดย</p>
                        <p>{viewingPayment.verifiedBy}</p>
                      </div>
                    )}
                  </div>
                  {viewingPayment.note && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">หมายเหตุ</p>
                      <p className="text-sm">{viewingPayment.note}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
