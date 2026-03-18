'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Trash2, CheckCircle2 } from 'lucide-react'

interface Notification {
  id: string
  type: 'bill' | 'payment' | 'maintenance' | 'announcement'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  icon: string
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'bill',
    title: 'บิลใหม่',
    message: 'เกิดบิลใหม่สำหรับห้อง A101 จำนวน 5,500 บาท',
    timestamp: '2 นาทีที่แล้ว',
    isRead: false,
    icon: 'bill'
  },
  {
    id: '2',
    type: 'maintenance',
    title: 'คำขอบำรุงรักษา',
    message: 'มีคำขอบำรุงรักษาใหม่จากห้อง B205',
    timestamp: '1 ชั่วโมงที่แล้ว',
    isRead: false,
    icon: 'maintenance'
  },
  {
    id: '3',
    type: 'payment',
    title: 'ยืนยันการชำระเงิน',
    message: 'ผู้เช่าห้อง A102 ได้ชำระเงินบิล',
    timestamp: '3 ชั่วโมงที่แล้ว',
    isRead: true,
    icon: 'payment'
  },
  {
    id: '4',
    type: 'announcement',
    title: 'ประกาศใหม่',
    message: 'ประกาศซ่อมบำรุงอาคารสำนักงาน',
    timestamp: '5 ชั่วโมงที่แล้ว',
    isRead: true,
    icon: 'announcement'
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const typeColors = {
    bill: 'bg-blue-500/20 text-blue-400',
    payment: 'bg-green-500/20 text-green-400',
    maintenance: 'bg-yellow-500/20 text-yellow-400',
    announcement: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">แจ้งเตือน</h1>
          <p className="text-muted-foreground">
            {unreadCount} รายการที่ยังไม่ได้อ่าน
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            ทำเครื่องหมายว่าอ่านทั้งหมด
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-center">ไม่มีการแจ้งเตือน</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`flex gap-4 p-4 rounded-lg border transition-all ${
                notification.isRead
                  ? 'bg-card/50 border-border'
                  : 'bg-primary/5 border-primary/30'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${typeColors[notification.type]}`}>
                {notification.type === 'bill' && '📄'}
                {notification.type === 'payment' && '✓'}
                {notification.type === 'maintenance' && '🔧'}
                {notification.type === 'announcement' && '📢'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {notification.title}
                      {!notification.isRead && (
                        <Badge variant="secondary" className="ml-2 text-xs">ใหม่</Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notification.timestamp}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-primary"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(notification.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
