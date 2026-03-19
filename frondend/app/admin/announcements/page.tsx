'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Plus, Megaphone, Pencil, Trash2, AlertCircle, Info, Bell, Loader2 } from 'lucide-react'
import { announcementAPI } from '@/lib/api/announcement.api'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Announcement {
  announcement_id: number
  title: string
  content: string
  target_audience: 'all' | 'admin' | 'tenant'
  target_floor: number | null
  is_pinned: number
  published_by: number
  published_at: string
  expires_at: string | null
}

interface FormData {
  title: string
  content: string
  target_audience: 'all' | 'admin' | 'tenant'
  target_floor: string
  is_pinned: boolean
  expires_at: string
}

const emptyForm: FormData = {
  title: '',
  content: '',
  target_audience: 'all',
  target_floor: '',
  is_pinned: false,
  expires_at: '',
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })

const audienceLabel: Record<string, string> = {
  all: 'ทุกคน', admin: 'แอดมิน', tenant: 'ผู้เช่า',
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true)
      const res = await announcementAPI.getAll()
      setAnnouncements(res.data ?? [])
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload: any = {
        title:           formData.title,
        content:         formData.content,
        target_audience: formData.target_audience,
        is_pinned:       formData.is_pinned ? 1 : 0,
      }
      if (formData.target_floor) payload.target_floor = parseInt(formData.target_floor)
      if (formData.expires_at)   payload.expires_at   = formData.expires_at

      if (editingAnn) {
        await announcementAPI.update(editingAnn.announcement_id, payload)
        toast.success('อัปเดตประกาศเรียบร้อย')
      } else {
        await announcementAPI.create(payload)
        toast.success('สร้างประกาศใหม่เรียบร้อย')
      }
      resetForm()
      fetchAnnouncements()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (ann: Announcement) => {
    setEditingAnn(ann)
    setFormData({
      title:           ann.title,
      content:         ann.content,
      target_audience: ann.target_audience,
      target_floor:    ann.target_floor ? String(ann.target_floor) : '',
      is_pinned:       ann.is_pinned === 1,
      expires_at:      ann.expires_at ? ann.expires_at.split('T')[0] : '',
    })
    setIsAddDialogOpen(true)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (ann: Announcement) => {
    if (!confirm(`ต้องการลบประกาศ "${ann.title}" หรือไม่?`)) return
    try {
      await announcementAPI.delete(ann.announcement_id)
      toast.success('ลบประกาศเรียบร้อย')
      fetchAnnouncements()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'ลบไม่สำเร็จ')
    }
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingAnn(null)
    setIsAddDialogOpen(false)
  }

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData(p => ({ ...p, [field]: e.target.value }))

  const getPriorityIcon = (ann: Announcement) => {
    if (ann.is_pinned) return <Bell className="h-5 w-5 text-yellow-500" />
    if (ann.target_audience === 'admin') return <AlertCircle className="h-5 w-5 text-destructive" />
    return <Info className="h-5 w-5 text-primary" />
  }

  const isExpired = (ann: Announcement) =>
    ann.expires_at ? new Date(ann.expires_at) < new Date() : false

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
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
              <DialogTitle>{editingAnn ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}</DialogTitle>
              <DialogDescription>
                {editingAnn ? 'แก้ไขข้อมูลประกาศ' : 'กรอกข้อมูลเพื่อสร้างประกาศใหม่'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">หัวข้อประกาศ</FieldLabel>
                  <Input id="title" value={formData.title} onChange={set('title')}
                    placeholder="เช่น แจ้งปิดน้ำชั่วคราว" required />
                </Field>

                <Field>
                  <FieldLabel htmlFor="content">เนื้อหา</FieldLabel>
                  <Textarea id="content" value={formData.content} onChange={set('content')}
                    placeholder="รายละเอียดประกาศ..." rows={5} required />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>กลุ่มเป้าหมาย</FieldLabel>
                    <Select value={formData.target_audience}
                      onValueChange={v => setFormData(p => ({ ...p, target_audience: v as FormData['target_audience'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทุกคน</SelectItem>
                        <SelectItem value="tenant">ผู้เช่าเท่านั้น</SelectItem>
                        <SelectItem value="admin">แอดมินเท่านั้น</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="target_floor">เฉพาะชั้น (ถ้ามี)</FieldLabel>
                    <Input id="target_floor" type="number" value={formData.target_floor}
                      onChange={set('target_floor')} placeholder="ทุกชั้น" min="1" max="10" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="expires_at">วันหมดอายุ (ถ้ามี)</FieldLabel>
                    <Input id="expires_at" type="date" value={formData.expires_at}
                      onChange={set('expires_at')} />
                  </Field>
                  <Field>
                    <FieldLabel>ปักหมุด</FieldLabel>
                    <Select value={formData.is_pinned ? 'yes' : 'no'}
                      onValueChange={v => setFormData(p => ({ ...p, is_pinned: v === 'yes' }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">ไม่ปักหมุด</SelectItem>
                        <SelectItem value="yes">ปักหมุด</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAnn ? 'บันทึก' : 'สร้างประกาศ'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          กำลังโหลด...
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>ยังไม่มีประกาศ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => (
            <Card key={ann.announcement_id}
              className={`transition-opacity ${isExpired(ann) ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(ann)}
                    <div>
                      <CardTitle className="text-lg">{ann.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                        <span>{formatDate(ann.published_at)}</span>
                        <span>•</span>
                        <span>{audienceLabel[ann.target_audience] ?? ann.target_audience}</span>
                        {ann.target_floor && <span>• ชั้น {ann.target_floor}</span>}
                        {ann.expires_at && <span>• หมดอายุ {formatDate(ann.expires_at)}</span>}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ann.is_pinned === 1 && <Badge variant="default">ปักหมุด</Badge>}
                    {isExpired(ann) && <Badge variant="secondary">หมดอายุ</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {ann.content}
                </p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(ann)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                  <Button variant="ghost" size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(ann)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    ลบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}