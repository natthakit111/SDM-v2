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
import { MaintenanceStatusBadge, PriorityBadge } from '@/components/common/status-badge'
import { Search, Wrench, Eye, CheckCircle } from 'lucide-react'
import { mockMaintenanceRequests, MaintenanceRequest, getMaintenanceCategoryLabel, formatDate } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(mockMaintenanceRequests)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewingRequest, setViewingRequest] = useState<MaintenanceRequest | null>(null)
  const [updateData, setUpdateData] = useState({
    status: '',
    assignedTo: '',
    adminNote: '',
  })

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUpdate = () => {
    if (!viewingRequest) return

    setRequests(prev => prev.map(request => 
      request.id === viewingRequest.id
        ? {
            ...request,
            status: updateData.status as MaintenanceRequest['status'] || request.status,
            assignedTo: updateData.assignedTo || request.assignedTo,
            adminNote: updateData.adminNote || request.adminNote,
            completedAt: updateData.status === 'completed' ? new Date().toISOString().split('T')[0] : request.completedAt,
          }
        : request
    ))
    toast.success('อัปเดตรายการแจ้งซ่อมเรียบร้อย')
    setViewingRequest(null)
    resetUpdateData()
  }

  const resetUpdateData = () => {
    setUpdateData({
      status: '',
      assignedTo: '',
      adminNote: '',
    })
  }

  const openViewDialog = (request: MaintenanceRequest) => {
    setViewingRequest(request)
    setUpdateData({
      status: request.status,
      assignedTo: request.assignedTo || '',
      adminNote: request.adminNote || '',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">จัดการแจ้งซ่อม</h1>
        <p className="text-muted-foreground">รับและจัดการรายการแจ้งซ่อมจากผู้เช่า</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาหมายเลขห้อง, หัวข้อ หรือชื่อผู้เช่า..."
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
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Alert */}
      {requests.filter(r => r.status === 'pending').length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Wrench className="h-5 w-5 text-warning-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-warning-foreground">รอดำเนินการ</h3>
                <p className="text-sm text-muted-foreground">
                  มี {requests.filter(r => r.status === 'pending').length} รายการที่รอดำเนินการ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            รายการแจ้งซ่อม
          </CardTitle>
          <CardDescription>ทั้งหมด {filteredRequests.length} รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ห้อง</TableHead>
                <TableHead>หัวข้อ</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>ความสำคัญ</TableHead>
                <TableHead>แจ้งเมื่อ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.roomNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {request.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getMaintenanceCategoryLabel(request.category)}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={request.priority} />
                  </TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell>
                    <MaintenanceStatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openViewDialog(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    ไม่พบรายการแจ้งซ่อมที่ตรงกับการค้นหา
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View/Update Dialog */}
      <Dialog open={!!viewingRequest} onOpenChange={(open) => {
        if (!open) {
          setViewingRequest(null)
          resetUpdateData()
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>รายละเอียดการแจ้งซ่อม</DialogTitle>
            <DialogDescription>
              ดูรายละเอียดและอัปเดตสถานะการแจ้งซ่อม
            </DialogDescription>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ห้อง</p>
                  <p className="font-medium">{viewingRequest.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ผู้แจ้ง</p>
                  <p className="font-medium">{viewingRequest.tenantName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">หมวดหมู่</p>
                  <p className="font-medium">{getMaintenanceCategoryLabel(viewingRequest.category)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ความสำคัญ</p>
                  <PriorityBadge priority={viewingRequest.priority} />
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">หัวข้อ</p>
                <p className="font-medium">{viewingRequest.title}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">รายละเอียด</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{viewingRequest.description}</p>
              </div>

              <div className="pt-4 border-t space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>สถานะ</FieldLabel>
                    <Select
                      value={updateData.status}
                      onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">รอดำเนินการ</SelectItem>
                        <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                        <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                        <SelectItem value="cancelled">ยกเลิก</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>มอบหมายให้</FieldLabel>
                    <Input
                      value={updateData.assignedTo}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, assignedTo: e.target.value }))}
                      placeholder="ชื่อช่างหรือผู้รับผิดชอบ"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>หมายเหตุ</FieldLabel>
                    <Textarea
                      value={updateData.adminNote}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, adminNote: e.target.value }))}
                      placeholder="บันทึกเพิ่มเติม..."
                      rows={3}
                    />
                  </Field>
                </FieldGroup>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingRequest(null)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleUpdate}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  บันทึก
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
