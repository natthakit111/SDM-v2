'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Contract {
  id: string
  tenantName: string
  room: string
  startDate: string
  endDate: string
  duration: number
  deposit: number
  rentAmount: number
  status: 'pending' | 'active' | 'expired'
  signedDate?: string
}

export default function TenantContractPage() {
  const [contracts] = useState<Contract[]>([
    {
      id: 'CNT001',
      tenantName: 'สมชาย สมการ',
      room: 'A101',
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      duration: 24,
      deposit: 5000,
      rentAmount: 5000,
      status: 'active',
      signedDate: '2023-12-20'
    },
  ])

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  const handleDownload = (contract: Contract) => {
    const element = document.createElement('a')
    const file = new Blob(
      [
        `สัญญาเช่าห้องพัก\n\n` +
        `รายละเอียดสัญญา:\n` +
        `ชื่อผู้เช่า: ${contract.tenantName}\n` +
        `ห้อง: ${contract.room}\n` +
        `วันเริ่มต้น: ${contract.startDate}\n` +
        `วันสิ้นสุด: ${contract.endDate}\n` +
        `ระยะเวลา: ${contract.duration} เดือน\n` +
        `ค่าเช่ารายเดือน: ${contract.rentAmount.toLocaleString('th-TH')} บาท\n` +
        `เงินประกัน: ${contract.deposit.toLocaleString('th-TH')} บาท\n` +
        `สถานะ: ${contract.status === 'active' ? 'ใช้งานอยู่' : contract.status === 'pending' ? 'รอการยืนยัน' : 'หมดอายุ'}`
      ],
      { type: 'text/plain' }
    )
    element.href = URL.createObjectURL(file)
    element.download = `contract_${contract.id}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success'
      case 'pending':
        return 'bg-warning/20 text-warning-foreground'
      case 'expired':
        return 'bg-destructive/20 text-destructive'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'ใช้งานอยู่'
      case 'pending':
        return 'รอการยืนยัน'
      case 'expired':
        return 'หมดอายุ'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">สัญญาเช่า</h1>
        <p className="text-muted-foreground mt-2">ดูและจัดการสัญญาเช่าของคุณ</p>
      </div>

      {/* Current Contract */}
      {contracts.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>สัญญาปัจจุบัน</CardTitle>
                <CardDescription>สัญญาที่กำลังใช้งาน</CardDescription>
              </div>
              <Badge className={`${getStatusColor(contracts[0].status)}`}>
                {getStatusLabel(contracts[0].status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ห้อง</p>
                <p className="text-lg font-bold">{contracts[0].room}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ระยะเวลา</p>
                <p className="text-lg font-bold">{contracts[0].duration} เดือน</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วันเริ่มต้น</p>
                <p className="text-lg font-bold">
                  {new Date(contracts[0].startDate).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วันสิ้นสุด</p>
                <p className="text-lg font-bold">
                  {new Date(contracts[0].endDate).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ค่าเช่ารายเดือน</p>
                <p className="text-lg font-bold text-info">
                  {contracts[0].rentAmount.toLocaleString('th-TH')} บาท
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">เงินประกัน</p>
                <p className="text-lg font-bold text-warning-foreground">
                  {contracts[0].deposit.toLocaleString('th-TH')} บาท
                </p>
              </div>
            </div>

            {contracts[0].signedDate && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  ลงนามวันที่: {new Date(contracts[0].signedDate).toLocaleDateString('th-TH')}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2" onClick={() => setSelectedContract(contracts[0])}>
                    <Eye className="h-4 w-4" />
                    ดู
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>สัญญาเช่า</DialogTitle>
                    <DialogDescription>รายละเอียดสัญญาเช่า</DialogDescription>
                  </DialogHeader>
                  {selectedContract && (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert">
                        <h3>สัญญาเช่าห้องพัก</h3>
                        <p>
                          ผู้ให้เช่า (บ้านเช่า DormFlow) ได้ตกลงให้เช่าห้องพักกับผู้เช่า (${selectedContract.tenantName}) 
                          โดยมีรายละเอียดดังต่อไปนี้
                        </p>
                        <h4>1. รายละเอียดห้องพัก</h4>
                        <p>
                          ห้องที่ ${selectedContract.room} ตั้งอยู่ในหอพัก ระยะเวลาการเช่า ${selectedContract.duration} เดือน
                        </p>
                        <h4>2. ข้อตกลงการชำระเงิน</h4>
                        <p>
                          ค่าเช่ารายเดือน: ${selectedContract.rentAmount.toLocaleString('th-TH')} บาท<br/>
                          เงินประกัน: ${selectedContract.deposit.toLocaleString('th-TH')} บาท
                        </p>
                        <h4>3. ระยะเวลาการเช่า</h4>
                        <p>
                          ตั้งแต่วันที่ ${new Date(selectedContract.startDate).toLocaleDateString('th-TH')} 
                          ถึงวันที่ ${new Date(selectedContract.endDate).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button className="gap-2" onClick={() => handleDownload(contracts[0])}>
                <Download className="h-4 w-4" />
                ดาวน์โหลด
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract History */}
      {contracts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>ประวัติสัญญา</CardTitle>
            <CardDescription>สัญญาทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contracts.map(contract => (
                <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">ห้อง {contract.room}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(contract.startDate).toLocaleDateString('th-TH')} - {new Date(contract.endDate).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(contract.status)}`}>
                      {getStatusLabel(contract.status)}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedContract(contract)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>สัญญาเช่า</DialogTitle>
                        </DialogHeader>
                        {selectedContract && (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            <p>ห้อง: {selectedContract.room}</p>
                            <p>ค่าเช่า: {selectedContract.rentAmount.toLocaleString('th-TH')} บาท</p>
                            <p>เงินประกัน: {selectedContract.deposit.toLocaleString('th-TH')} บาท</p>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDownload(contract)}
                      title="ดาวน์โหลด"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {contracts.length === 0 && (
        <Card>
          <CardContent className="pt-10 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">ไม่มีสัญญาเช่า</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
