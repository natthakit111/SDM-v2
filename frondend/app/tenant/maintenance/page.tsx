'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import StatusBadge from '@/components/common/status-badge'

interface MaintenanceRequest {
  id: string
  category: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  createdDate: string
  priority: 'low' | 'medium' | 'high'
}

export default function TenantMaintenancePage() {
  const [requests] = useState<MaintenanceRequest[]>([
    {
      id: 'MR001',
      category: 'ซ่อมแซม',
      title: 'หลอดไฟห้องน้ำเสีย',
      description: 'หลอดไฟห้องน้ำเสีย จำเป็นต้องเปลี่ยน',
      status: 'completed',
      createdDate: '2024-02-20',
      priority: 'medium'
    },
    {
      id: 'MR002',
      category: 'ซ่อมแซม',
      title: 'ท่อน้ำรั่วไหล',
      description: 'ท่อน้ำใต้อ่างล้างจานรั่วไหล',
      status: 'in-progress',
      createdDate: '2024-02-28',
      priority: 'high'
    },
    {
      id: 'MR003',
      category: 'ทำความสะอาด',
      title: 'ต้องการทำความสะอาดท่อเสียน้ำ',
      description: 'ท่อเสียน้ำช้า ต้องการลดปัญหา',
      status: 'pending',
      createdDate: '2024-03-10',
      priority: 'low'
    }
  ])

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'medium'
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (formData.category && formData.title && formData.description) {
      setSubmitted(true)
      setTimeout(() => {
        setDialogOpen(false)
        setSubmitted(false)
        setFormData({ category: '', title: '', description: '', priority: 'medium' })
      }, 1500)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-info" />
      default:
        return <AlertCircle className="w-5 h-5 text-warning" />
    }
  }

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive'
      case 'medium':
        return 'bg-warning/10 text-warning'
      default:
        return 'bg-info/10 text-info'
    }
  }

  const priorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'ด่วน'
      case 'medium':
        return 'ปกติ'
      default:
        return 'ไม่ด่วน'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ขอซ่อมแซม</h1>
          <p className="text-muted-foreground mt-2">ส่งคำขอซ่อมแซมหรือปัญหาต่างๆ</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              ส่งคำขอใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ส่งคำขอซ่อมแซม</DialogTitle>
              <DialogDescription>อธิบายปัญหาและเราจะดำเนินการ</DialogDescription>
            </DialogHeader>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="font-medium">ส่งคำขอสำเร็จ</p>
                <p className="text-sm text-muted-foreground mt-2">ทีมของเราจะติดต่อคุณในเร็วๆนี้</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">หมวดหมู่</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ซ่อมแซม">ซ่อมแซม</SelectItem>
                      <SelectItem value="ทำความสะอาด">ทำความสะอาด</SelectItem>
                      <SelectItem value="ปัญหาความเสียงรบกวน">ปัญหาความเสียงรบกวน</SelectItem>
                      <SelectItem value="ปัญหาอื่นๆ">ปัญหาอื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">หัวข้อ</label>
                  <Input 
                    placeholder="เช่น หลอดไฟห้องน้ำเสีย"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">รายละเอียด</label>
                  <Textarea 
                    placeholder="อธิบายปัญหาอย่างละเอียด"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 min-h-32"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ความเร่งด่วน</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">ไม่ด่วน</SelectItem>
                      <SelectItem value="medium">ปกติ</SelectItem>
                      <SelectItem value="high">ด่วน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSubmit} className="w-full">ส่งคำขอ</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">กำลังดำเนินการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{requests.filter(r => r.status === 'in-progress').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เสร็จสิ้น</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{requests.filter(r => r.status === 'completed').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>คำขอซ่อมแซมทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests.map(request => (
              <div key={request.id} className="flex items-start gap-4 p-4 border rounded-lg">
                {statusIcon(request.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                      <div className="flex gap-2 mt-3">
                        <span className="text-xs bg-muted px-2 py-1 rounded">{request.category}</span>
                        <span className={`text-xs px-2 py-1 rounded ${priorityColor(request.priority)}`}>
                          {priorityLabel(request.priority)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{request.id}</p>
                      <StatusBadge status={request.status} />
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(request.createdDate).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
