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
import { RoomStatusBadge } from '@/components/common/status-badge'
import { Plus, Search, Pencil, Trash2, DoorOpen } from 'lucide-react'
import { mockRooms, Room, getRoomTypeLabel, formatCurrency } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    number: '',
    floor: '1',
    type: 'standard' as Room['type'],
    status: 'available' as Room['status'],
    monthlyRent: '',
    deposit: '',
  })

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingRoom) {
      // Update existing room
      setRooms(prev => prev.map(room => 
        room.id === editingRoom.id
          ? {
              ...room,
              number: formData.number,
              floor: parseInt(formData.floor),
              type: formData.type,
              status: formData.status,
              monthlyRent: parseInt(formData.monthlyRent),
              deposit: parseInt(formData.deposit),
            }
          : room
      ))
      toast.success('อัปเดตข้อมูลห้องเรียบร้อย')
    } else {
      // Add new room
      const newRoom: Room = {
        id: Date.now().toString(),
        number: formData.number,
        floor: parseInt(formData.floor),
        type: formData.type,
        status: formData.status,
        monthlyRent: parseInt(formData.monthlyRent),
        deposit: parseInt(formData.deposit),
        amenities: [],
      }
      setRooms(prev => [...prev, newRoom])
      toast.success('เพิ่มห้องใหม่เรียบร้อย')
    }
    
    resetForm()
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      number: room.number,
      floor: room.floor.toString(),
      type: room.type,
      status: room.status,
      monthlyRent: room.monthlyRent.toString(),
      deposit: room.deposit.toString(),
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (roomId: string) => {
    if (confirm('คุณต้องการลบห้องนี้หรือไม่?')) {
      setRooms(prev => prev.filter(room => room.id !== roomId))
      toast.success('ลบห้องเรียบร้อย')
    }
  }

  const resetForm = () => {
    setFormData({
      number: '',
      floor: '1',
      type: 'standard',
      status: 'available',
      monthlyRent: '',
      deposit: '',
    })
    setEditingRoom(null)
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">จัดการห้องพัก</h1>
          <p className="text-muted-foreground">จัดการห้องพักทั้งหมดในระบบ</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsAddDialogOpen(open)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มห้อง
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'แก้ไขห้อง' : 'เพิ่มห้องใหม่'}</DialogTitle>
              <DialogDescription>
                {editingRoom ? 'แก้ไขข้อมูลห้องพัก' : 'กรอกข้อมูลเพื่อเพิ่มห้องใหม่'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="number">หมายเลขห้อง</FieldLabel>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="เช่น 101"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="floor">ชั้น</FieldLabel>
                    <Select
                      value={formData.floor}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, floor: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((floor) => (
                          <SelectItem key={floor} value={floor.toString()}>
                            ชั้น {floor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="type">ประเภทห้อง</FieldLabel>
                    <Select
                      value={formData.type}
                      onValueChange={(value: Room['type']) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">ห้องมาตรฐาน</SelectItem>
                        <SelectItem value="deluxe">ห้องดีลักซ์</SelectItem>
                        <SelectItem value="suite">ห้องสวีท</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="status">สถานะ</FieldLabel>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Room['status']) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">ว่าง</SelectItem>
                        <SelectItem value="occupied">มีผู้เช่า</SelectItem>
                        <SelectItem value="maintenance">ซ่อมบำรุง</SelectItem>
                        <SelectItem value="reserved">จอง</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="monthlyRent">ค่าเช่า/เดือน (บาท)</FieldLabel>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={formData.monthlyRent}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                      placeholder="4500"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="deposit">เงินประกัน (บาท)</FieldLabel>
                    <Input
                      id="deposit"
                      type="number"
                      value={formData.deposit}
                      onChange={(e) => setFormData(prev => ({ ...prev, deposit: e.target.value }))}
                      placeholder="9000"
                      required
                    />
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
                <Button type="submit">
                  {editingRoom ? 'บันทึก' : 'เพิ่มห้อง'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="สถานะทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="available">ว่าง</SelectItem>
                <SelectItem value="occupied">มีผู้เช่า</SelectItem>
                <SelectItem value="maintenance">ซ่อมบำรุง</SelectItem>
                <SelectItem value="reserved">จอง</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            รายการห้องพัก
          </CardTitle>
          <CardDescription>ทั้งหมด {filteredRooms.length} ห้อง</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ห้อง</TableHead>
                <TableHead>ชั้น</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>ค่าเช่า</TableHead>
                <TableHead>เงินประกัน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.number}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{getRoomTypeLabel(room.type)}</TableCell>
                  <TableCell>{formatCurrency(room.monthlyRent)}</TableCell>
                  <TableCell>{formatCurrency(room.deposit)}</TableCell>
                  <TableCell>
                    <RoomStatusBadge status={room.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(room)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(room.id)}
                        disabled={room.status === 'occupied'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    ไม่พบห้องพักที่ตรงกับการค้นหา
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
