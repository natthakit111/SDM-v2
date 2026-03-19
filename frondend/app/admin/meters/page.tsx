'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Plus, Search, Gauge, Zap, Droplets, Pencil, Camera } from 'lucide-react'
import { mockMeterReadings, mockRooms, MeterReading, formatDate, dormSettings } from '@/lib/mock-data'
import { toast } from 'sonner'
import { PhotoEvidenceUpload } from '@/components/meters/photo-evidence-upload'

const months = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

interface PhotoEvidence {
  id: string
  readingId: string
  meterType: 'electricity' | 'water'
  imageUrl: string
  uploadedAt: string
  fileName: string
}

export default function MetersPage() {
  const [readings, setReadings] = useState<MeterReading[]>(mockMeterReadings)
  const [photos, setPhotos] = useState<PhotoEvidence[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
  const [editingReading, setEditingReading] = useState<MeterReading | null>(null)
  const [formData, setFormData] = useState({
    roomId: '',
    month: 'มีนาคม',
    year: '2026',
    electricityPrevious: '',
    electricityCurrent: '',
    waterPrevious: '',
    waterCurrent: '',
  })

  const occupiedRooms = mockRooms.filter(r => r.status === 'occupied')

  const filteredReadings = readings.filter(reading => {
    const matchesSearch = reading.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMonth = monthFilter === 'all' || reading.month === monthFilter
    return matchesSearch && matchesMonth
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const room = mockRooms.find(r => r.id === formData.roomId)
    if (!room) {
      toast.error('กรุณาเลือกห้อง')
      return
    }

    const electricityUsed = parseInt(formData.electricityCurrent) - parseInt(formData.electricityPrevious)
    const waterUsed = parseInt(formData.waterCurrent) - parseInt(formData.waterPrevious)

    if (electricityUsed < 0 || waterUsed < 0) {
      toast.error('ค่ามิเตอร์ปัจจุบันต้องมากกว่าค่าก่อนหน้า')
      return
    }

    if (editingReading) {
      setReadings(prev => prev.map(reading => 
        reading.id === editingReading.id
          ? {
              ...reading,
              electricityPrevious: parseInt(formData.electricityPrevious),
              electricityCurrent: parseInt(formData.electricityCurrent),
              electricityUsed,
              waterPrevious: parseInt(formData.waterPrevious),
              waterCurrent: parseInt(formData.waterCurrent),
              waterUsed,
            }
          : reading
      ))
      toast.success('อัปเดตข้อมูลมิเตอร์เรียบร้อย')
    } else {
      const newReading: MeterReading = {
        id: Date.now().toString(),
        roomId: formData.roomId,
        roomNumber: room.number,
        month: formData.month,
        year: parseInt(formData.year),
        electricityPrevious: parseInt(formData.electricityPrevious),
        electricityCurrent: parseInt(formData.electricityCurrent),
        electricityUsed,
        waterPrevious: parseInt(formData.waterPrevious),
        waterCurrent: parseInt(formData.waterCurrent),
        waterUsed,
        recordedAt: new Date().toISOString().split('T')[0],
        recordedBy: 'admin',
      }
      setReadings(prev => [...prev, newReading])
      toast.success('บันทึกมิเตอร์เรียบร้อย')
    }
    
    resetForm()
  }

  const handleEdit = (reading: MeterReading) => {
    setEditingReading(reading)
    setFormData({
      roomId: reading.roomId,
      month: reading.month,
      year: reading.year.toString(),
      electricityPrevious: reading.electricityPrevious.toString(),
      electricityCurrent: reading.electricityCurrent.toString(),
      waterPrevious: reading.waterPrevious.toString(),
      waterCurrent: reading.waterCurrent.toString(),
    })
    setIsAddDialogOpen(true)
  }

  const handleViewPhotos = (reading: MeterReading) => {
    setEditingReading(reading)
    setIsPhotoDialogOpen(true)
  }

  const handlePhotoAdded = (photo: PhotoEvidence) => {
    setPhotos(prev => [...prev, photo])
  }

  const handlePhotoDeleted = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  const resetForm = () => {
    setFormData({
      roomId: '',
      month: 'มีนาคม',
      year: '2026',
      electricityPrevious: '',
      electricityCurrent: '',
      waterPrevious: '',
      waterCurrent: '',
    })
    setEditingReading(null)
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">บันทึกมิเตอร์</h1>
          <p className="text-muted-foreground">บันทึกค่ามิเตอร์ไฟฟ้าและน้ำประปา</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsAddDialogOpen(open)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              บันทึกมิเตอร์
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingReading ? 'แก้ไขมิเตอร์' : 'บันทึกมิเตอร์ใหม่'}</DialogTitle>
              <DialogDescription>
                {editingReading ? 'แก้ไขข้อมูลมิเตอร์' : 'กรอกค่ามิเตอร์ไฟฟ้าและน้ำประปา'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-3 gap-4">
                  <Field className="col-span-1">
                    <FieldLabel htmlFor="roomId">ห้อง</FieldLabel>
                    <Select
                      value={formData.roomId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: value }))}
                      disabled={!!editingReading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกห้อง" />
                      </SelectTrigger>
                      <SelectContent>
                        {occupiedRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="month">เดือน</FieldLabel>
                    <Select
                      value={formData.month}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}
                      disabled={!!editingReading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="year">ปี</FieldLabel>
                    <Select
                      value={formData.year}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
                      disabled={!!editingReading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    มิเตอร์ไฟฟ้า
                    <span className="text-muted-foreground ml-auto">(อัตรา {dormSettings.electricityRate} บาท/หน่วย)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="electricityPrevious">เลขก่อนหน้า</FieldLabel>
                      <Input
                        id="electricityPrevious"
                        type="number"
                        value={formData.electricityPrevious}
                        onChange={(e) => setFormData(prev => ({ ...prev, electricityPrevious: e.target.value }))}
                        placeholder="0"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="electricityCurrent">เลขปัจจุบัน</FieldLabel>
                      <Input
                        id="electricityCurrent"
                        type="number"
                        value={formData.electricityCurrent}
                        onChange={(e) => setFormData(prev => ({ ...prev, electricityCurrent: e.target.value }))}
                        placeholder="0"
                        required
                      />
                    </Field>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    มิเตอร์น้ำ
                    <span className="text-muted-foreground ml-auto">(อัตรา {dormSettings.waterRate} บาท/หน่วย)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="waterPrevious">เลขก่อนหน้า</FieldLabel>
                      <Input
                        id="waterPrevious"
                        type="number"
                        value={formData.waterPrevious}
                        onChange={(e) => setFormData(prev => ({ ...prev, waterPrevious: e.target.value }))}
                        placeholder="0"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="waterCurrent">เลขปัจจุบัน</FieldLabel>
                      <Input
                        id="waterCurrent"
                        type="number"
                        value={formData.waterCurrent}
                        onChange={(e) => setFormData(prev => ({ ...prev, waterCurrent: e.target.value }))}
                        placeholder="0"
                        required
                      />
                    </Field>
                  </div>
                </div>
              </FieldGroup>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
                <Button type="submit">
                  {editingReading ? 'บันทึก' : 'บันทึกมิเตอร์'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Photo Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReading ? `รูปมิเตอร์ห้อง ${editingReading.roomNumber}` : 'รูปมิเตอร์'}
            </DialogTitle>
            <DialogDescription>
              จัดการรูปภาพหลักฐานของมิเตอร์
            </DialogDescription>
          </DialogHeader>
          {editingReading && (
            <PhotoEvidenceUpload
              readingId={editingReading.id}
              photos={photos.filter(p => p.readingId === editingReading.id)}
              onPhotoAdded={handlePhotoAdded}
              onPhotoDeleted={handlePhotoDeleted}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาหมายเลขห้อง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="เดือนทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">เดือนทั้งหมด</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Readings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            รายการมิเตอร์
          </CardTitle>
          <CardDescription>ทั้งหมด {filteredReadings.length} รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ห้อง</TableHead>
                <TableHead>เดือน/ปี</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    ไฟฟ้า (หน่วย)
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    น้ำ (หน่วย)
                  </div>
                </TableHead>
                <TableHead>บันทึกเมื่อ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReadings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium">{reading.roomNumber}</TableCell>
                  <TableCell>{reading.month} {reading.year}</TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{reading.electricityPrevious}</span>
                      {' → '}
                      <span>{reading.electricityCurrent}</span>
                      <span className="text-primary ml-2 font-medium">({reading.electricityUsed})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{reading.waterPrevious}</span>
                      {' → '}
                      <span>{reading.waterCurrent}</span>
                      <span className="text-primary ml-2 font-medium">({reading.waterUsed})</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(reading.recordedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewPhotos(reading)}
                        title="ดูรูปภาพ"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(reading)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReadings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    ไม่พบรายการมิเตอร์ที่ตรงกับการค้นหา
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
