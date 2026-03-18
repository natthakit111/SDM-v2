'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { BillStatusBadge } from '@/components/common/status-badge'
import { Receipt, FileText, CreditCard, Zap, Droplets } from 'lucide-react'
import Link from 'next/link'
import { mockBills, Bill, formatCurrency, formatDate } from '@/lib/mock-data'

export default function TenantBillsPage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewingBill, setViewingBill] = useState<Bill | null>(null)

  // Get tenant's bills (mock: using room 101)
  const tenantBills = mockBills.filter(b => b.roomNumber === (user?.roomNumber || '101'))

  const filteredBills = tenantBills.filter(bill => {
    return statusFilter === 'all' || bill.status === statusFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">บิลของฉัน</h1>
          <p className="text-muted-foreground">ดูรายละเอียดบิลค่าเช่าทั้งหมด</p>
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
          </SelectContent>
        </Select>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {filteredBills.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ไม่มีบิลที่ตรงกับการค้นหา</p>
            </CardContent>
          </Card>
        ) : (
          filteredBills.map((bill) => (
            <Card key={bill.id} className={bill.status === 'overdue' ? 'border-destructive/50' : ''}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      bill.status === 'paid' ? 'bg-success/20' : 
                      bill.status === 'overdue' ? 'bg-destructive/20' : 
                      'bg-warning/20'
                    }`}>
                      <Receipt className={`h-6 w-6 ${
                        bill.status === 'paid' ? 'text-success' : 
                        bill.status === 'overdue' ? 'text-destructive' : 
                        'text-warning-foreground'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-lg">{bill.month} {bill.year}</p>
                      <p className="text-sm text-muted-foreground">
                        กำหนดชำระ {formatDate(bill.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(bill.total)}</p>
                      <BillStatusBadge status={bill.status} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingBill(bill)}>
                        <FileText className="h-4 w-4 mr-1" />
                        รายละเอียด
                      </Button>
                      {(bill.status === 'pending' || bill.status === 'overdue') && (
                        <Link href={`/tenant/payment?bill=${bill.id}`}>
                          <Button size="sm">
                            <CreditCard className="h-4 w-4 mr-1" />
                            ชำระเงิน
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Summary */}
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">ค่าเช่า:</span>
                    <span className="font-medium">{formatCurrency(bill.rent)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground">ไฟฟ้า:</span>
                    <span className="font-medium">{formatCurrency(bill.electricityCost)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">น้ำ:</span>
                    <span className="font-medium">{formatCurrency(bill.waterCost)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">ส่วนกลาง:</span>
                    <span className="font-medium">{formatCurrency(bill.commonFee)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Bill Dialog */}
      <Dialog open={!!viewingBill} onOpenChange={(open) => !open && setViewingBill(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ใบแจ้งหนี้
            </DialogTitle>
          </DialogHeader>
          {viewingBill && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="font-medium text-lg">ห้อง {viewingBill.roomNumber}</p>
                  <p className="text-sm text-muted-foreground">{viewingBill.tenantName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{viewingBill.month} {viewingBill.year}</p>
                  <BillStatusBadge status={viewingBill.status} />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ค่าเช่าห้อง</span>
                  <span className="font-medium">{formatCurrency(viewingBill.rent)}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    ค่าไฟฟ้า ({viewingBill.electricityUnits} หน่วย x {viewingBill.electricityRate} บาท)
                  </div>
                  <span className="font-medium">{formatCurrency(viewingBill.electricityCost)}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    ค่าน้ำประปา ({viewingBill.waterUnits} หน่วย x {viewingBill.waterRate} บาท)
                  </div>
                  <span className="font-medium">{formatCurrency(viewingBill.waterCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ค่าส่วนกลาง</span>
                  <span className="font-medium">{formatCurrency(viewingBill.commonFee)}</span>
                </div>
                {viewingBill.otherFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ค่าอื่นๆ {viewingBill.otherFeesDescription && `(${viewingBill.otherFeesDescription})`}
                    </span>
                    <span className="font-medium">{formatCurrency(viewingBill.otherFees)}</span>
                  </div>
                )}
                {viewingBill.latePenalty > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>ค่าปรับล่าช้า</span>
                    <span className="font-medium">{formatCurrency(viewingBill.latePenalty)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t text-xl font-bold">
                <span>รวมทั้งหมด</span>
                <span className="text-primary">{formatCurrency(viewingBill.total)}</span>
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

              {(viewingBill.status === 'pending' || viewingBill.status === 'overdue') && (
                <Link href={`/tenant/payment?bill=${viewingBill.id}`} className="block">
                  <Button className="w-full mt-4">
                    <CreditCard className="h-4 w-4 mr-2" />
                    ชำระเงิน
                  </Button>
                </Link>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
