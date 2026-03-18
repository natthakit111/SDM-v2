'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Plus, Download, Eye } from 'lucide-react'
import StatusBadge from '@/components/common/status-badge'

interface Contract {
  id: string
  tenantName: string
  room: string
  startDate: string
  endDate: string
  duration: number
  deposit: number
  rentAmount: number
  status: 'active' | 'expired' | 'pending'
  pdfUrl?: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: 'CNT001',
      tenantName: 'นายสมชาย มั่นสถิร',
      room: 'A101',
      startDate: '2023-11-15',
      endDate: '2024-11-14',
      duration: 12,
      deposit: 2000,
      rentAmount: 5000,
      status: 'active'
    },
    {
      id: 'CNT002',
      tenantName: 'นางสาวธัญชนก นามวงค์',
      room: 'B205',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      duration: 6,
      deposit: 1500,
      rentAmount: 4500,
      status: 'active'
    },
    {
      id: 'CNT003',
      tenantName: 'นายวิชัย ยศวินัย',
      room: 'A205',
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      duration: 12,
      deposit: 2000,
      rentAmount: 5000,
      status: 'expired'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isOpenNewContract, setIsOpenNewContract] = useState(false)
  const [newContract, setNewContract] = useState({
    tenantName: '',
    room: '',
    startDate: '',
    endDate: '',
    duration: 12,
    deposit: 0,
    rentAmount: 0,
  })

  const handleAddContract = () => {
    if (!newContract.tenantName || !newContract.room || !newContract.startDate || !newContract.endDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const contract: Contract = {
      id: `CNT${String(contracts.length + 1).padStart(3, '0')}`,
      tenantName: newContract.tenantName,
      room: newContract.room,
      startDate: newContract.startDate,
      endDate: newContract.endDate,
      duration: newContract.duration,
      deposit: newContract.deposit,
      rentAmount: newContract.rentAmount,
      status: 'pending'
    }

    setContracts([...contracts, contract])
    setIsOpenNewContract(false)
    setNewContract({
      tenantName: '',
      room: '',
      startDate: '',
      endDate: '',
      duration: 12,
      deposit: 0,
      rentAmount: 0,
    })
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.room.includes(searchTerm) ||
                         contract.id.includes(searchTerm)
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">สัญญาเช่า</h1>
          <p className="text-muted-foreground mt-2">จัดการสัญญาเช่าและเงินประกัน</p>
        </div>
        <Dialog open={isOpenNewContract} onOpenChange={setIsOpenNewContract}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              สัญญาใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>สร้างสัญญาเช่าใหม่</DialogTitle>
              <DialogDescription>กรอกข้อมูลสัญญาเช่า</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">ชื่อผู้เช่า</label>
                  <Input 
                    placeholder="ชื่อผู้เช่า"
                    value={newContract.tenantName}
                    onChange={(e) => setNewContract({...newContract, tenantName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">หมายเลขห้อง</label>
                  <Input 
                    placeholder="เช่น A101"
                    value={newContract.room}
                    onChange={(e) => setNewContract({...newContract, room: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">วันเริ่มต้น</label>
                  <Input 
                    type="date"
                    value={newContract.startDate}
                    onChange={(e) => setNewContract({...newContract, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">วันสิ้นสุด</label>
                  <Input 
                    type="date"
                    value={newContract.endDate}
                    onChange={(e) => setNewContract({...newContract, endDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">ระยะเวลา (เดือน)</label>
                  <Input 
                    type="number"
                    placeholder="12"
                    value={newContract.duration}
                    onChange={(e) => setNewContract({...newContract, duration: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">ค่าเช่ารายเดือน (บาท)</label>
                  <Input 
                    type="number"
                    placeholder="5000"
                    value={newContract.rentAmount}
                    onChange={(e) => setNewContract({...newContract, rentAmount: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">เงินประกัน (บาท)</label>
                  <Input 
                    type="number"
                    placeholder="2000"
                    value={newContract.deposit}
                    onChange={(e) => setNewContract({...newContract, deposit: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsOpenNewContract(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleAddContract}>
                  สร้างสัญญา
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ใช้งานอยู่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{contracts.filter(c => c.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">หมดอายุ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{contracts.filter(c => c.status === 'expired').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมเงินประกัน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.reduce((sum, c) => sum + c.deposit, 0).toLocaleString('th-TH')} บาท</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="ค้นหา ชื่อ ห้อง หรือ ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="active">ใช้งานอยู่</SelectItem>
                <SelectItem value="expired">หมดอายุ</SelectItem>
                <SelectItem value="pending">รอการยืนยัน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="space-y-3">
        {filteredContracts.map(contract => (
          <Card key={contract.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{contract.tenantName}</h3>
                        <p className="text-sm text-muted-foreground">ห้อง {contract.room} • {contract.id}</p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            ค่าเช่า {contract.rentAmount.toLocaleString('th-TH')} บาท
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            เงินประกัน {contract.deposit.toLocaleString('th-TH')} บาท
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {contract.duration} เดือน
                          </span>
                        </div>
                      </div>
                      <StatusBadge 
                        status={contract.status === 'active' ? 'ใช้งานอยู่' : contract.status === 'expired' ? 'หมดอายุ' : 'รอการยืนยัน'}
                        variant={contract.status === 'active' ? 'success' : contract.status === 'expired' ? 'destructive' : 'default'}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">ดู</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>รายละเอียดสัญญาเช่า</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">ชื่อผู้เช่า</p>
                            <p className="font-medium">{selectedContract?.tenantName || contract.tenantName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">ห้อง</p>
                            <p className="font-medium">{selectedContract?.room || contract.room}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">วันเริ่มต้น</p>
                            <p className="font-medium">
                              {new Date(contract.startDate).toLocaleDateString('th-TH', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">วันสิ้นสุด</p>
                            <p className="font-medium">
                              {new Date(contract.endDate).toLocaleDateString('th-TH', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">ค่าเช่ารายเดือน</p>
                            <p className="font-medium">{contract.rentAmount.toLocaleString('th-TH')} บาท</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">เงินประกัน</p>
                            <p className="font-medium">{contract.deposit.toLocaleString('th-TH')} บาท</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full gap-2">
                          <Download className="w-4 h-4" />
                          ดาวน์โหลด PDF
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">ดาวน์โหลด</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">ไม่พบสัญญาเช่า</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
