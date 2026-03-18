'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Plus, Megaphone, Pencil, Trash2, AlertCircle, Info, Bell } from 'lucide-react'
import { mockAnnouncements, Announcement, formatDate } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as Announcement['priority'],
    targetAudience: 'all' as Announcement['targetAudience'],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(ann => 
        ann.id === editingAnnouncement.id
          ? { ...ann, ...formData }
          : ann
      ))
      toast.success('อัปเดตประกาศเรียบร้อย')
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'admin',
        isActive: true,
      }
      setAnnouncements(prev => [newAnnouncement, ...prev])
      toast.success('สร้างประกาศใหม่เรียบร้อย')
    }
    
    resetForm()
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (announcementId: string) => {
    if (confirm('คุณต้องการลบประกาศนี้หรือไม่?')) {
      setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId))
      toast.success('ลบประกาศเรียบร้อย')
    }
  }

  const toggleActive = (announcementId: string) => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === announcementId
        ? { ...ann, isActive: !ann.isActive }
        : ann
    ))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      targetAudience: 'all',
    })
    setEditingAnnouncement(null)
    setIsAddDialogOpen(false)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case 'important':
        return <Bell className="h-5 w-5 text-warning-foreground" />
      default:
        return <Info className="h-5 w-5 text-primary" />
    }
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      normal: 'ปกติ',
      important: 'สำคัญ',
      urgent: 'เร่งด่วน',
    }
    return labels[priority] || priority
  }

  const getAudienceLabel = (audience: string) => {
    const labels: Record<string, string> = {
      all: 'ทุกคน',
      tenants: 'ผู้เช่าเท่านั้น',
      specific_rooms: 'ห้องที่เลือก',
    }
    return labels[audience] || audience
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ประกาศข่าวสาร</h1>
          <p className="text-muted-foreground">สร้างและจัดการประกาศสำหรับผู้เช่า</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsAddDialogOpen(open)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              สร้างประกาศ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}</DialogTitle>
              <DialogDescription>
                {editingAnnouncement ? 'แก้ไขข้อมูลประกาศ' : 'กรอกข้อมูลเพื่อสร้างประกาศใหม่'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">หัวข้อประกาศ</FieldLabel>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="เช่น แจ้งปิดน้ำชั่วคราว"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="content">เนื้อหา</FieldLabel>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="รายละเอียดประกาศ..."
                    rows={5}
                    required
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>ความสำคัญ</FieldLabel>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: Announcement['priority']) => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">ปกติ</SelectItem>
                        <SelectItem value="important">สำคัญ</SelectItem>
                        <SelectItem value="urgent">เร่งด่วน</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>กลุ่มเป้าหมาย</FieldLabel>
                    <Select
                      value={formData.targetAudience}
                      onValueChange={(value: Announcement['targetAudience']) => 
                        setFormData(prev => ({ ...prev, targetAudience: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทุกคน</SelectItem>
                        <SelectItem value="tenants">ผู้เช่าเท่านั้น</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
                <Button type="submit">
                  {editingAnnouncement ? 'บันทึก' : 'สร้างประกาศ'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีประกาศ</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`transition-opacity ${!announcement.isActive ? 'opacity-50' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(announcement.priority)}
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{formatDate(announcement.createdAt)}</span>
                        <span>•</span>
                        <span>{getAudienceLabel(announcement.targetAudience)}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                      {announcement.isActive ? 'เผยแพร่' : 'ซ่อน'}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={
                        announcement.priority === 'urgent' 
                          ? 'border-destructive text-destructive' 
                          : announcement.priority === 'important'
                          ? 'border-warning text-warning-foreground'
                          : ''
                      }
                    >
                      {getPriorityLabel(announcement.priority)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {announcement.content}
                </p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(announcement.id)}
                  >
                    {announcement.isActive ? 'ซ่อนประกาศ' : 'เผยแพร่'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    ลบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
