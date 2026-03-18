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
import { TenantStatusBadge } from '@/components/common/status-badge'
import { Plus, Search, Pencil, Trash2, Users, Phone, Mail } from 'lucide-react'
import { mockTenants, mockRooms, Tenant, formatDate } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idCard: '',
    emergencyContact: '',
  })

  const availableRooms = mockRooms.filter(r => r.status === 'available')

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.includes(searchQuery) ||
      (tenant.roomNumber && tenant.roomNumber.includes(searchQuery))
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingTenant) {
      setTenants(prev => prev.map(tenant => 
        tenant.id === editingTenant.id
          ? { ...tenant, ...formData }
          : tenant
      ))
      toast.success('อัปเดตข้อมูลผู้เช่าเรียบร้อย')
    } else {
      const newTenant: Tenant = {
        id: Date.now().toString(),
        ...formData,
        roomId: null,
        roomNumber: null,
        moveInDate: null,
        contractEndDate: null,
        status: 'pending',
      }
      setTenants(prev => [...prev, newTenant])
      toast.success('เพิ่มผู้เช่าใหม่เรียบร้อย')
    }
    
    resetForm()
  }

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant)
    setFormData({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      idCard: tenant.idCard,
      emergencyContact: tenant.emergencyContact,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId)
    if (tenant?.status === 'active') {
      toast.error('ไม่สามารถลบผู้เช่าที่กำลังเช่าอยู่ได้')
      return
    }
    if (confirm('คุณต้องการลบผู้เช่านี้หรือไม่?')) {
      setTenants(prev => prev.filter(tenant => tenant.id !== tenantId))
      toast.success('ลบผู้เช่าเรียบร้อย')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      idCard: '',
      emergencyContact: '',
    })
    setEditingTenant(null)
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">จัดการผู้เช่า</h1>
          <p className="text-muted-foreground">จัดการข้อมูลผู้เช่าทั้งหมด</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsAddDialogOpen(open)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มผู้เช่า
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTenant ? 'แก้ไขผู้เช่า' : 'เพิ่มผู้เช่าใหม่'}</DialogTitle>
              <DialogDescription>
                {editingTenant ? 'แก้ไขข้อมูลผู้เช่า' : 'กรอกข้อมูลเพื่อเพิ่มผู้เช่าใหม่'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">ชื่อ-นามสกุล</FieldLabel>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="สมชาย ใจดี"
                    required
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="email">อีเมล</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">เบอร์โทรศัพท์</FieldLabel>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="081-234-5678"
                      required
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="idCard">เลขบัตรประชาชน</FieldLabel>
                  <Input
                    id="idCard"
                    value={formData.idCard}
                    onChange={(e) => setFormData(prev => ({ ...prev, idCard: e.target.value }))}
                    placeholder="1-2345-67890-12-3"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="emergencyContact">เบอร์ติดต่อฉุกเฉิน</FieldLabel>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="089-111-2222"
                    required
                  />
                </Field>
              </FieldGroup>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
                <Button type="submit">
                  {editingTenant ? 'บันทึก' : 'เพิ่มผู้เช่า'}
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
                placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร หรือเลขห้อง..."
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
                <SelectItem value="active">กำลังเช่า</SelectItem>
                <SelectItem value="pending">รอเข้าพัก</SelectItem>
                <SelectItem value="moved_out">ย้ายออก</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            รายการผู้เช่า
          </CardTitle>
          <CardDescription>ทั้งหมด {filteredTenants.length} คน</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>ติดต่อ</TableHead>
                <TableHead>ห้อง</TableHead>
                <TableHead>วันเข้าพัก</TableHead>
                <TableHead>สิ้นสุดสัญญา</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">{tenant.idCard}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {tenant.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {tenant.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tenant.roomNumber ? (
                      <span className="font-medium">{tenant.roomNumber}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tenant.moveInDate ? formatDate(tenant.moveInDate) : '-'}
                  </TableCell>
                  <TableCell>
                    {tenant.contractEndDate ? formatDate(tenant.contractEndDate) : '-'}
                  </TableCell>
                  <TableCell>
                    <TenantStatusBadge status={tenant.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tenant)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tenant.id)}
                        disabled={tenant.status === 'active'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    ไม่พบผู้เช่าที่ตรงกับการค้นหา
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
