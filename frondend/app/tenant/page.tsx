'use client'

import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BillStatusBadge, MaintenanceStatusBadge } from '@/components/common/status-badge'
import {
  DoorOpen,
  Receipt,
  CreditCard,
  Wrench,
  Bell,
  Calendar,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import {
  mockBills,
  mockMaintenanceRequests,
  mockAnnouncements,
  mockRooms,
  mockContracts,
  formatCurrency,
  formatDate,
} from '@/lib/mock-data'

export default function TenantDashboard() {
  const { user } = useAuth()

  // Get tenant's data (mock: using room 101)
  const tenantRoom = mockRooms.find(r => r.number === (user?.roomNumber || '101'))
  const tenantBills = mockBills.filter(b => b.roomNumber === (user?.roomNumber || '101'))
  const tenantMaintenance = mockMaintenanceRequests.filter(m => m.roomNumber === (user?.roomNumber || '101'))
  const activeAnnouncements = mockAnnouncements.filter(a => a.isActive)
  const tenantContract = mockContracts.find(c => c.roomId === tenantRoom?.id)

  const pendingBill = tenantBills.find(b => b.status === 'pending' || b.status === 'overdue')
  const activeMaintenance = tenantMaintenance.filter(m => m.status !== 'completed' && m.status !== 'cancelled')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">สวัสดี, {user?.name || 'ผู้เช่า'}</h1>
        <p className="text-muted-foreground">ยินดีต้อนรับสู่ระบบจัดการหอพัก</p>
      </div>

      {/* Room Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary/20">
                <DoorOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ห้องพักของคุณ</p>
                <p className="text-3xl font-bold">{user?.roomNumber || '101'}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ชั้น {tenantRoom?.floor || 1} • {tenantRoom?.type === 'standard' ? 'ห้องมาตรฐาน' : tenantRoom?.type === 'deluxe' ? 'ห้องดีลักซ์' : 'ห้องสวีท'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">ค่าเช่ารายเดือน</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(tenantRoom?.monthlyRent || 4500)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Bill Alert */}
      {pendingBill && (
        <Card className={pendingBill.status === 'overdue' ? 'border-destructive/50 bg-destructive/5' : 'border-warning/50 bg-warning/5'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pendingBill.status === 'overdue' ? 'bg-destructive/20' : 'bg-warning/20'}`}>
                  <AlertTriangle className={`h-5 w-5 ${pendingBill.status === 'overdue' ? 'text-destructive' : 'text-warning-foreground'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${pendingBill.status === 'overdue' ? 'text-destructive' : 'text-warning-foreground'}`}>
                    {pendingBill.status === 'overdue' ? 'บิลเกินกำหนดชำระ!' : 'คุณมีบิลที่รอชำระ'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {pendingBill.month} {pendingBill.year} • ยอด {formatCurrency(pendingBill.total)}
                  </p>
                </div>
              </div>
              <Link href="/tenant/payment">
                <Button variant={pendingBill.status === 'overdue' ? 'destructive' : 'default'}>
                  ชำระเงิน
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/tenant/bills">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <Receipt className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">ดูบิล</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tenant/payment">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">ชำระเงิน</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tenant/maintenance">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <Wrench className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">แจ้งซ่อม</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tenant/contract">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">สัญญาเช่า</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">บิลล่าสุด</CardTitle>
              <CardDescription>รายการบิลของคุณ</CardDescription>
            </div>
            <Link href="/tenant/bills">
              <Button variant="ghost" size="sm">
                ดูทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenantBills.slice(0, 3).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{bill.month} {bill.year}</p>
                    <p className="text-sm text-muted-foreground">
                      กำหนดชำระ {formatDate(bill.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(bill.total)}</p>
                    <BillStatusBadge status={bill.status} />
                  </div>
                </div>
              ))}
              {tenantBills.length === 0 && (
                <p className="text-center text-muted-foreground py-4">ไม่มีบิล</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">รายการแจ้งซ่อม</CardTitle>
              <CardDescription>สถานะการแจ้งซ่อมของคุณ</CardDescription>
            </div>
            <Link href="/tenant/maintenance">
              <Button variant="ghost" size="sm">
                ดูทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenantMaintenance.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{request.title}</p>
                    <p className="text-sm text-muted-foreground">
                      แจ้งเมื่อ {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <MaintenanceStatusBadge status={request.status} />
                </div>
              ))}
              {tenantMaintenance.length === 0 && (
                <p className="text-center text-muted-foreground py-4">ไม่มีรายการแจ้งซ่อม</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      {activeAnnouncements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              ประกาศล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAnnouncements.slice(0, 2).map((announcement) => (
                <div 
                  key={announcement.id} 
                  className={`p-4 rounded-lg ${
                    announcement.priority === 'urgent' 
                      ? 'bg-destructive/10 border border-destructive/30' 
                      : announcement.priority === 'important'
                      ? 'bg-warning/10 border border-warning/30'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{announcement.title}</h4>
                    <p className="text-xs text-muted-foreground">{formatDate(announcement.createdAt)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Info */}
      {tenantContract && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลสัญญาเช่า</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">วันเริ่มสัญญา</p>
                <p className="font-medium">{formatDate(tenantContract.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">วันสิ้นสุดสัญญา</p>
                <p className="font-medium">{formatDate(tenantContract.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ค่าเช่ารายเดือน</p>
                <p className="font-medium">{formatCurrency(tenantContract.monthlyRent)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">เงินประกัน</p>
                <p className="font-medium">{formatCurrency(tenantContract.deposit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
