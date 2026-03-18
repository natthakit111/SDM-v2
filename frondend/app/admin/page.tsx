'use client'

import { StatsCard } from '@/components/common/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BillStatusBadge, MaintenanceStatusBadge } from '@/components/common/status-badge'
import {
  DoorOpen,
  Users,
  Receipt,
  Banknote,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Wrench,
} from 'lucide-react'
import {
  mockRooms,
  mockTenants,
  mockBills,
  mockMaintenanceRequests,
  formatCurrency,
} from '@/lib/mock-data'
import Link from 'next/link'

export default function AdminDashboard() {
  // Calculate stats
  const totalRooms = mockRooms.length
  const occupiedRooms = mockRooms.filter(r => r.status === 'occupied').length
  const availableRooms = mockRooms.filter(r => r.status === 'available').length
  const activeTenants = mockTenants.filter(t => t.status === 'active').length
  const pendingBills = mockBills.filter(b => b.status === 'pending' || b.status === 'overdue')
  const pendingAmount = pendingBills.reduce((sum, b) => sum + b.total, 0)
  const paidBills = mockBills.filter(b => b.status === 'paid')
  const monthlyIncome = paidBills.reduce((sum, b) => sum + b.total, 0)
  const overdueBills = mockBills.filter(b => b.status === 'overdue')
  const pendingMaintenance = mockMaintenanceRequests.filter(m => m.status === 'pending' || m.status === 'in_progress')

  const recentBills = mockBills.slice(0, 5)
  const recentMaintenance = mockMaintenanceRequests.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
        <p className="text-muted-foreground">ภาพรวมการจัดการหอพัก</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="ห้องทั้งหมด"
          value={`${occupiedRooms}/${totalRooms}`}
          description={`ว่าง ${availableRooms} ห้อง`}
          icon={DoorOpen}
          variant="primary"
        />
        <StatsCard
          title="ผู้เช่าทั้งหมด"
          value={activeTenants}
          description="คนที่กำลังเช่าอยู่"
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="บิลค้างชำระ"
          value={formatCurrency(pendingAmount)}
          description={`${pendingBills.length} รายการ`}
          icon={Receipt}
          variant={overdueBills.length > 0 ? 'destructive' : 'warning'}
        />
        <StatsCard
          title="รายได้เดือนนี้"
          value={formatCurrency(monthlyIncome)}
          description={`จาก ${paidBills.length} บิล`}
          icon={Banknote}
          variant="success"
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Alerts */}
      {(overdueBills.length > 0 || pendingMaintenance.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueBills.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive">บิลเกินกำหนดชำระ</h3>
                    <p className="text-sm text-muted-foreground">
                      มี {overdueBills.length} รายการที่เกินกำหนดชำระ
                    </p>
                  </div>
                  <Link href="/admin/bills?status=overdue">
                    <Button variant="destructive" size="sm">
                      ดูรายละเอียด
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          {pendingMaintenance.length > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Wrench className="h-5 w-5 text-warning-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-warning-foreground">รายการแจ้งซ่อมรอดำเนินการ</h3>
                    <p className="text-sm text-muted-foreground">
                      มี {pendingMaintenance.length} รายการที่รอดำเนินการ
                    </p>
                  </div>
                  <Link href="/admin/maintenance">
                    <Button variant="outline" size="sm">
                      ดูรายละเอียด
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">บิลล่าสุด</CardTitle>
              <CardDescription>รายการบิลที่สร้างล่าสุด</CardDescription>
            </div>
            <Link href="/admin/bills">
              <Button variant="ghost" size="sm">
                ดูทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">ห้อง {bill.roomNumber}</p>
                      <p className="text-sm text-muted-foreground">{bill.tenantName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(bill.total)}</p>
                    <BillStatusBadge status={bill.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Maintenance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">แจ้งซ่อมล่าสุด</CardTitle>
              <CardDescription>รายการแจ้งซ่อมล่าสุด</CardDescription>
            </div>
            <Link href="/admin/maintenance">
              <Button variant="ghost" size="sm">
                ดูทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMaintenance.map((request) => (
                <div key={request.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground">ห้อง {request.roomNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <MaintenanceStatusBadge status={request.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ภาพรวมห้องพัก</CardTitle>
          <CardDescription>สถานะห้องพักทั้งหมดในหอพัก</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {mockRooms.map((room) => (
              <Link
                key={room.id}
                href={`/admin/rooms/${room.id}`}
                className={`
                  p-4 rounded-lg border text-center transition-colors hover:border-primary
                  ${room.status === 'available' ? 'bg-success/10 border-success/30' : ''}
                  ${room.status === 'occupied' ? 'bg-primary/10 border-primary/30' : ''}
                  ${room.status === 'maintenance' ? 'bg-warning/10 border-warning/30' : ''}
                  ${room.status === 'reserved' ? 'bg-secondary border-border' : ''}
                `}
              >
                <p className="font-bold text-lg">{room.number}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {room.status === 'available' && 'ว่าง'}
                  {room.status === 'occupied' && 'มีผู้เช่า'}
                  {room.status === 'maintenance' && 'ซ่อมบำรุง'}
                  {room.status === 'reserved' && 'จอง'}
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
