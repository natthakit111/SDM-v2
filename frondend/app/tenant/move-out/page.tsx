'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/common/status-badge'
import { Plus, LogOut, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/mock-data'

interface MoveOutRequest {
  id: string
  requestDate: string
  moveOutDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  createdAt: string
}

export default function MoveOutPage() {
  const [requests, setRequests] = useState<MoveOutRequest[]>([
    {
      id: '1',
      requestDate: '2026-03-15',
      moveOutDate: '2026-04-30',
      reason: 'ย้ายกลับบ้านเกิด',
      status: 'approved',
      notes: 'อนุมัติแล้ว',
      createdAt: '2026-03-15',
    },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    moveOutDate: '',
    reason: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.moveOutDate || !formData.reason) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const moveOutDateObj = new Date(formData.moveOutDate)
    const today = new Date()
    const daysNotice = Math.ceil((moveOutDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysNotice < 30) {
      toast.error('กรุณาแจ้งย้ายออกล่วงหน้าอย่างน้อย 30 วัน')
      return
    }

    const newRequest: MoveOutRequest = {
      id: Date.now().toString(),
      requestDate: today.toISOString().split('T')[0],
      moveOutDate: formData.moveOutDate,
      reason: formData.reason,
      status: 'pending',
      createdAt: today.toISOString().split('T')[0],
    }

    setRequests([...requests, newRequest])
    toast.success('ส่งคำร้องขอย้ายออกเรียบร้อย')
    setFormData({ moveOutDate: '', reason: '' })
    setIsDialogOpen(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ขอย้ายออก</h1>
          <p className="text-muted-foreground">แจ้งการย้ายออกจากหอพัก</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              ส่งคำร้องขอย้ายออก
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                ส่งคำร้องขอย้ายออก
              </DialogTitle>
              <DialogDescription>
                กรุณาแจ้งความประสงค์ย้ายออกล่วงหน้าอย่างน้อย 30 วัน
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="bg-warning/20 border border-warning/30 rounded-lg p-3 mb-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-warning-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-warning-foreground">
                    <p className="font-medium">ต้องแจ้งล่วงหน้า 30 วัน</p>
                    <p className="text-xs">การแจ้งล่าช้ากว่านี้อาจส่งผลต่อการคืนเงินประกัน</p>
                  </div>
                </div>

                <Field>
                  <FieldLabel htmlFor="moveOutDate">วันที่ต้องการย้ายออก</FieldLabel>
                  <Input
                    id="moveOutDate"
                    type="date"
                    value={formData.moveOutDate}
                    onChange={(e) => setFormData({ ...formData, moveOutDate: e.target.value })}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="reason">เหตุผลในการย้ายออก</FieldLabel>
                  <Textarea
                    id="reason"
                    placeholder="เช่น ย้ายกลับบ้านเกิด, ย้ายไปทำงานต่างจังหวัด, อื่นๆ"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="min-h-24"
                    required
                  />
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit">ส่งคำร้อง</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">รอพิจารณา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">อนุมัติแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {requests.filter(r => r.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">ไม่อนุมัติ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            รายการคำร้องขอย้ายออก
          </CardTitle>
          <CardDescription>ทั้งหมด {requests.length} รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่ส่งคำร้อง</TableHead>
                <TableHead>วันที่ต้องการย้ายออก</TableHead>
                <TableHead>เหตุผล</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>หมายเหตุ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="text-sm">{formatDate(request.requestDate)}</TableCell>
                  <TableCell className="text-sm">{formatDate(request.moveOutDate)}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{request.reason}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <StatusBadge
                        status={request.status === 'approved' ? 'อนุมัติ' : request.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอพิจารณา'}
                        variant={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'destructive' : 'default'}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{request.notes}</TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    ยังไม่มีคำร้องขอย้ายออก
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Important Info */}
      <Card className="border-info/30 bg-info/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-info" />
            ข้อมูลสำคัญเกี่ยวกับการย้ายออก
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">ระยะเวลาแจ้ง:</span> กรุณาแจ้งล่วงหน้าไม่น้อยกว่า 30 วัน
          </p>
          <p>
            <span className="font-medium">การคืนเงินประกัน:</span> หากแจ้งล่าช้ากว่า 30 วัน อาจได้รับเงินประกันไม่ครบ
          </p>
          <p>
            <span className="font-medium">การตรวจห้อง:</span> ทางหอพักจะตรวจสถานะห้องพักก่อนคืนเงินประกัน
          </p>
          <p>
            <span className="font-medium">ชำระบิลคงค้าง:</span> ต้องชำระบิลทั้งหมดก่อนวันย้ายออก
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
