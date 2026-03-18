'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PiggyBank, Plus, Check } from 'lucide-react'
import StatusBadge from '@/components/common/status-badge'

interface Deposit {
  id: string
  tenantName: string
  room: string
  amount: number
  status: 'held' | 'refunded' | 'deducted'
  dateDeposited: string
  dateModified?: string
  notes?: string
}

export default function DepositsPage() {
  const [deposits] = useState<Deposit[]>([
    {
      id: 'DEP001',
      tenantName: 'นายสมชาย มั่นสถิร',
      room: 'A101',
      amount: 2000,
      status: 'held',
      dateDeposited: '2023-11-15',
      notes: 'เงินประกันจากสัญญา 12 เดือน'
    },
    {
      id: 'DEP002',
      tenantName: 'นางสาวธัญชนก นามวงค์',
      room: 'B205',
      amount: 1500,
      status: 'held',
      dateDeposited: '2024-01-01',
      notes: 'เงินประกันจากสัญญา 6 เดือน'
    },
    {
      id: 'DEP003',
      tenantName: 'นายวิชัย ยศวินัย',
      room: 'A205',
      amount: 2000,
      status: 'deducted',
      dateDeposited: '2023-06-01',
      dateModified: '2024-05-31',
      notes: 'หักค่าเสียหายห้อง 500 บาท คืนเงินเหลือ 1500 บาท'
    },
    {
      id: 'DEP004',
      tenantName: 'นายพรรณรัตน์ ศรีสมบัติ',
      room: 'C310',
      amount: 1500,
      status: 'refunded',
      dateDeposited: '2023-09-20',
      dateModified: '2024-02-15',
      notes: 'คืนเงินประกันเต็มจำนวน'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [refundNotes, setRefundNotes] = useState('')
  const [refundAmount, setRefundAmount] = useState('')

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.room.includes(searchTerm) ||
                         deposit.id.includes(searchTerm)
    const matchesFilter = filterStatus === 'all' || deposit.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    totalHeld: deposits.filter(d => d.status === 'held').reduce((sum, d) => sum + d.amount, 0),
    totalRefunded: deposits.filter(d => d.status === 'refunded').reduce((sum, d) => sum + d.amount, 0),
    totalDeducted: deposits.filter(d => d.status === 'deducted').reduce((sum, d) => sum + d.amount, 0),
  }

  const handleRefund = () => {
    if (selectedDeposit && refundAmount) {
      setRefundDialogOpen(false)
      setRefundNotes('')
      setRefundAmount('')
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'held':
        return 'เก็บไว้'
      case 'refunded':
        return 'คืนเงินแล้ว'
      case 'deducted':
        return 'หักเงิน'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">เงินประกัน</h1>
          <p className="text-muted-foreground mt-2">จัดการเงินประกันและการคืนเงิน</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รวมทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deposits.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(stats.totalHeld + stats.totalDeducted + stats.totalRefunded).toLocaleString('th-TH')} บาท
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เก็บไว้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deposits.filter(d => d.status === 'held').length}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalHeld.toLocaleString('th-TH')} บาท</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">คืนเงินแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{deposits.filter(d => d.status === 'refunded').length}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalRefunded.toLocaleString('th-TH')} บาท</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">หักเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{deposits.filter(d => d.status === 'deducted').length}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalDeducted.toLocaleString('th-TH')} บาท</p>
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
                <SelectItem value="held">เก็บไว้</SelectItem>
                <SelectItem value="refunded">คืนเงินแล้ว</SelectItem>
                <SelectItem value="deducted">หักเงิน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deposits List */}
      <div className="space-y-3">
        {filteredDeposits.map(deposit => (
          <Card key={deposit.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <PiggyBank className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{deposit.tenantName}</h3>
                        <p className="text-sm text-muted-foreground">ห้อง {deposit.room} • {deposit.id}</p>
                        {deposit.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">{deposit.notes}</p>
                        )}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            ฝากเมื่อ {new Date(deposit.dateDeposited).toLocaleDateString('th-TH')}
                          </span>
                          {deposit.dateModified && (
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              อัปเดตเมื่อ {new Date(deposit.dateModified).toLocaleDateString('th-TH')}
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={deposit.status} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{deposit.amount.toLocaleString('th-TH')}</p>
                    <p className="text-xs text-muted-foreground">บาท</p>
                  </div>
                  {deposit.status === 'held' && (
                    <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedDeposit(deposit)
                            setRefundAmount(deposit.amount.toString())
                          }}
                        >
                          คืนเงิน
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>คืนเงินประกัน</DialogTitle>
                          <DialogDescription>ระบุจำนวนเงินที่จะคืนให้ผู้เช่า</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">ผู้เช่า</p>
                            <p>{selectedDeposit?.tenantName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">เงินประกันทั้งหมด</p>
                            <p className="text-lg font-bold">{selectedDeposit?.amount.toLocaleString('th-TH')} บาท</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">เงินที่คืน</label>
                            <Input 
                              type="number" 
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">หมายเหตุ</label>
                            <Textarea 
                              placeholder="เช่น หักค่าเสียหาย 500 บาท ฯลฯ"
                              value={refundNotes}
                              onChange={(e) => setRefundNotes(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <Button onClick={handleRefund} className="w-full gap-2">
                            <Check className="w-4 h-4" />
                            ยืนยันการคืนเงิน
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeposits.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">ไม่พบเงินประกัน</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
