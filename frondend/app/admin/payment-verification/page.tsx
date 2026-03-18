'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react'
import { PaymentSlipProcessor } from '@/components/payments/payment-slip-processor'
import StatusBadge from '@/components/common/status-badge'

interface PaymentVerification {
  id: string
  tenantName: string
  room: string
  amount: number
  billId: string
  slipUrl: string
  uploadDate: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
  notes?: string
}

export default function PaymentVerificationPage() {
  const [verifications] = useState<PaymentVerification[]>([
    {
      id: 'PV001',
      tenantName: 'นายสมชาย มั่นสถิร',
      room: 'A101',
      amount: 5000,
      billId: 'BL001',
      slipUrl: '/slips/pv001.jpg',
      uploadDate: '2024-03-15',
      verificationStatus: 'pending',
      notes: 'รอการตรวจสอบ'
    },
    {
      id: 'PV002',
      tenantName: 'นางสาวธัญชนก นามวงค์',
      room: 'B205',
      amount: 4500,
      billId: 'BL002',
      slipUrl: '/slips/pv002.jpg',
      uploadDate: '2024-03-14',
      verificationStatus: 'verified',
      notes: 'ตรวจสอบแล้ว จำนวนเงินถูกต้อง'
    },
    {
      id: 'PV003',
      tenantName: 'นายวิชัย ยศวินัย',
      room: 'C310',
      amount: 2000,
      billId: 'BL003',
      slipUrl: '/slips/pv003.jpg',
      uploadDate: '2024-03-10',
      verificationStatus: 'rejected',
      notes: 'จำนวนเงินไม่ตรงกับบิล ขอให้ส่งใหม่'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedVerification, setSelectedVerification] = useState<PaymentVerification | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = v.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.room.includes(searchTerm) ||
                         v.billId.includes(searchTerm) ||
                         v.id.includes(searchTerm)
    const matchesFilter = filterStatus === 'all' || v.verificationStatus === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    pending: verifications.filter(v => v.verificationStatus === 'pending').length,
    verified: verifications.filter(v => v.verificationStatus === 'verified').length,
    rejected: verifications.filter(v => v.verificationStatus === 'rejected').length,
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-success" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />
      default:
        return <Clock className="w-5 h-5 text-warning" />
    }
  }

  const handleRejectClick = (verification: PaymentVerification) => {
    setSelectedVerification(verification)
    setRejectDialogOpen(true)
  }

  const handleReject = () => {
    if (selectedVerification && rejectReason) {
      setRejectDialogOpen(false)
      setRejectReason('')
    }
  }

  const handleApprove = () => {
    if (selectedVerification) {
      setDetailsDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ตรวจสอบการชำระเงิน</h1>
        <p className="text-muted-foreground mt-2">ตรวจสอบและอนุมัติการชำระเงินจากสลิป</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รอการตรวจสอบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ตรวจสอบแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ปฏิเสธ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="ค้นหา ชื่อ ห้อง บิล หรือ ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="pending">รอการตรวจสอบ</SelectItem>
                <SelectItem value="verified">ตรวจสอบแล้ว</SelectItem>
                <SelectItem value="rejected">ปฏิเสธ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Verifications List */}
      <div className="space-y-3">
        {filteredVerifications.map(verification => (
          <Card key={verification.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="mt-1">
                    {statusIcon(verification.verificationStatus)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{verification.tenantName}</h3>
                        <p className="text-sm text-muted-foreground">
                          ห้อง {verification.room} • บิล {verification.billId}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {verification.amount.toLocaleString('th-TH')} บาท
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {new Date(verification.uploadDate).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                        {verification.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">{verification.notes}</p>
                        )}
                      </div>
                      <StatusBadge status={verification.verificationStatus} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedVerification(verification)
                        setDetailsDialogOpen(true)
                      }}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">ดู</span>
                    </Button>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>รายละเอียดการชำระเงิน</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">ชื่อผู้เช่า</p>
                            <p className="font-medium">{selectedVerification?.tenantName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">ห้อง</p>
                            <p className="font-medium">{selectedVerification?.room}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">บิล</p>
                            <p className="font-medium">{selectedVerification?.billId}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">จำนวนเงิน</p>
                            <p className="font-bold text-lg">{selectedVerification?.amount.toLocaleString('th-TH')} บาท</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">รูปสลิป</p>
                          <div className="bg-muted p-4 rounded-lg aspect-video flex items-center justify-center">
                            <Download className="w-8 h-8 text-muted-foreground opacity-50" />
                          </div>
                        </div>

                        {selectedVerification?.verificationStatus === 'pending' && (
                          <div className="flex gap-2">
                            <Button onClick={handleApprove} className="flex-1 gap-2">
                              <CheckCircle className="w-4 h-4" />
                              อนุมัติ
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleRejectClick(selectedVerification)}
                              className="gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              ปฏิเสธ
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ปฏิเสธการชำระเงิน</DialogTitle>
            <DialogDescription>ระบุเหตุผลในการปฏิเสธ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">ผู้เช่า</p>
              <p>{selectedVerification?.tenantName}</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">เหตุผล</label>
              <Textarea 
                placeholder="เช่น จำนวนเงินไม่ตรง, สลิปไม่ชัดเจน ฯลฯ"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <Button onClick={handleReject} disabled={!rejectReason} className="w-full">
              ยืนยันการปฏิเสธ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredVerifications.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">ไม่พบรายการ</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
