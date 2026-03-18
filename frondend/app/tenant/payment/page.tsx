'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QrCode, Upload, AlertCircle } from 'lucide-react'
import { mockBills } from '@/lib/mock-data'
import StatusBadge from '@/components/common/status-badge'

export default function TenantPaymentPage() {
  const [bills] = useState(mockBills)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [slipDialogOpen, setSlipDialogOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState(bills[0])
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'overdue')
  const totalDue = pendingBills.reduce((sum, b) => sum + b.total, 0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0])
      setUploadSuccess(false)
    }
  }

  const handleSlipUpload = () => {
    if (selectedFile) {
      setUploadSuccess(true)
      setTimeout(() => {
        setSlipDialogOpen(false)
        setSelectedFile(null)
        setUploadSuccess(false)
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ชำระเงิน</h1>
        <p className="text-muted-foreground mt-2">ชำระค่าห้อง ค่าน้ำ ค่าไฟ และค่าใช้งานอื่นๆ</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมค้างชำระ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDue.toLocaleString('th-TH')} บาท</div>
            <p className="text-xs text-muted-foreground mt-1">{pendingBills.length} บิล</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">บิลทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
            <p className="text-xs text-muted-foreground mt-1">บิลในรอบ 12 เดือน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ชำระแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{bills.filter(b => b.status === 'paid').length}</div>
            <p className="text-xs text-muted-foreground mt-1">บิล</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>วิธีการชำระเงิน</CardTitle>
          <CardDescription>เลือกวิธีการชำระเงินที่สะดวก</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <QrCode className="w-6 h-6" />
                <span>สแกน QR Code</span>
                <span className="text-xs text-muted-foreground">PromptPay</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR Code Payment</DialogTitle>
                <DialogDescription>สแกน QR Code เพื่อชำระเงินผ่าน PromptPay</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted p-8 rounded-lg flex items-center justify-center">
                  <div className="bg-white p-4 rounded">
                    <QrCode className="w-40 h-40 text-foreground" />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>เลขที่บัญชี:</strong> 0123456789</p>
                  <p><strong>ชื่อ:</strong> หอพัก DormFlow</p>
                  <p><strong>จำนวนเงิน:</strong> {totalDue.toLocaleString('th-TH')} บาท</p>
                </div>
                <Button onClick={() => setQrDialogOpen(false)} className="w-full">ปิด</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={slipDialogOpen} onOpenChange={setSlipDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Upload className="w-6 h-6" />
                <span>อัปโหลดสลิป</span>
                <span className="text-xs text-muted-foreground">JPG/PNG</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>อัปโหลดสลิปการโอนเงิน</DialogTitle>
                <DialogDescription>อัปโหลดสลิปการโอนเงินเพื่อยืนยันการชำระ</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {uploadSuccess ? (
                  <div className="bg-success/10 border border-success rounded-lg p-4 text-center">
                    <p className="text-success font-medium">✓ อัปโหลดสำเร็จ</p>
                    <p className="text-sm text-muted-foreground mt-1">กำลังตรวจสอบสลิป...</p>
                  </div>
                ) : (
                  <>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="slip-upload"
                      />
                      <label htmlFor="slip-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium">{selectedFile?.name || 'คลิกเพื่ออัปโหลด'}</p>
                        <p className="text-xs text-muted-foreground">หรือลากไฟล์มาวาง</p>
                      </label>
                    </div>
                    <Select defaultValue={selectedBill.id}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกบิล" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingBills.map(bill => (
                          <SelectItem key={bill.id} value={bill.id}>
                            {bill.month} {bill.year} - {bill.total.toLocaleString('th-TH')} บาท
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleSlipUpload} disabled={!selectedFile} className="w-full">
                      ยืนยันการอัปโหลด
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="h-24 flex flex-col gap-2 opacity-50 cursor-not-allowed">
            <AlertCircle className="w-6 h-6" />
            <span>โอนผ่านธนาคาร</span>
            <span className="text-xs text-muted-foreground">เร็วๆนี้</span>
          </Button>

          <Button variant="outline" className="h-24 flex flex-col gap-2 opacity-50 cursor-not-allowed">
            <AlertCircle className="w-6 h-6" />
            <span>บัตรเครดิต</span>
            <span className="text-xs text-muted-foreground">เร็วๆนี้</span>
          </Button>
        </CardContent>
      </Card>

      {/* Pending Bills */}
      {pendingBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>บิลค้างชำระ</CardTitle>
            <CardDescription>{pendingBills.length} บิลรอการชำระเงิน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">บิลห้อง {bill.roomNumber} - {bill.month} {bill.year}</p>
                    <p className="text-sm text-muted-foreground">
                      กำหนดชำระ: {new Date(bill.dueDate).toLocaleDateString('th-TH', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{bill.total.toLocaleString('th-TH')} บาท</p>
                    <StatusBadge status={bill.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Bills */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติบิลทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bills.map(bill => (
              <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">บิลห้อง {bill.roomNumber} - {bill.month} {bill.year}</p>
                  <p className="text-sm text-muted-foreground">
                    กำหนดชำระ: {new Date(bill.dueDate).toLocaleDateString('th-TH', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{bill.total.toLocaleString('th-TH')} บาท</p>
                  <StatusBadge status={bill.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
