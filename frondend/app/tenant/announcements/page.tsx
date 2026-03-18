'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Bell, Pin, Calendar, AlertCircle } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  category: 'maintenance' | 'payment' | 'event' | 'notice'
  isPinned: boolean
  date: string
  author: string
  isImportant: boolean
}

export default function TenantAnnouncementsPage() {
  const [announcements] = useState<Announcement[]>([
    {
      id: 'ANN001',
      title: 'ตรวจสอบและบำรุงรักษามิเตอร์ไฟฟ้า',
      content: 'ทำการตรวจสอบและบำรุงรักษามิเตอร์ไฟฟ้า วันที่ 25 มีนาคม 2026 โปรดให้ความสะดวก',
      category: 'maintenance',
      isPinned: true,
      date: '2026-03-17',
      author: 'ผู้จัดการหอพัก',
      isImportant: true
    },
    {
      id: 'ANN002',
      title: 'เตือนสำคัญ: วันกำหนดชำระเงินเลื่อน',
      content: 'วันกำหนดชำระเงินสำหรับเดือนมีนาคมเลื่อนไปเป็น 20 มีนาคม 2026 เนื่องจากวันหยุดราชการ',
      category: 'payment',
      isPinned: true,
      date: '2026-03-16',
      author: 'ฝ่ายการเงิน',
      isImportant: true
    },
    {
      id: 'ANN003',
      title: 'กิจกรรมสังสรรค์ผู้เช่า',
      content: 'เชิญชวนผู้เช่าทุกท่านร่วมกิจกรรมสังสรรค์ วันศุกร์ที่ 29 มีนาคม 2026 เวลา 18:00 น. ณ บริเวณลานของหอพัก',
      category: 'event',
      isPinned: false,
      date: '2026-03-15',
      author: 'ฝ่ายอำนวยความสะดวก',
      isImportant: false
    },
    {
      id: 'ANN004',
      title: 'ประกาศเปิดให้ใช้บริการซักฟอก',
      content: 'เปิดให้ใช้บริการซักฟอกหอพักแล้ว สามารถสมัครสมาชิกได้ที่โต๊ะอยู่เรือนขั้นตอนชั้น 1',
      category: 'notice',
      isPinned: false,
      date: '2026-03-14',
      author: 'ฝ่ายอำนวยความสะดวก',
      isImportant: false
    },
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const pinnedAnnouncements = announcements.filter(a => a.isPinned)
  const otherAnnouncements = announcements.filter(a => !a.isPinned)

  const filteredAnnouncements = (all: Announcement[]) => {
    return all
      .filter(a => selectedCategory === 'all' || a.category === selectedCategory)
      .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance':
        return 'bg-warning/20 text-warning-foreground'
      case 'payment':
        return 'bg-destructive/20 text-destructive'
      case 'event':
        return 'bg-info/20 text-info-foreground'
      case 'notice':
        return 'bg-primary/20 text-primary'
      default:
        return 'bg-muted'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'maintenance':
        return 'ซ่อมบำรุง'
      case 'payment':
        return 'ชำระเงิน'
      case 'event':
        return 'กิจกรรม'
      case 'notice':
        return 'ประกาศ'
      default:
        return category
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ประกาศ</h1>
        <p className="text-muted-foreground mt-2">อัพเดตข้อมูลและประกาศจากผู้จัดการหอพัก</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาประกาศ..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                ทั้งหมด
              </Button>
              <Button
                variant={selectedCategory === 'maintenance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('maintenance')}
              >
                ซ่อมบำรุง
              </Button>
              <Button
                variant={selectedCategory === 'payment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('payment')}
              >
                ชำระเงิน
              </Button>
              <Button
                variant={selectedCategory === 'event' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('event')}
              >
                กิจกรรม
              </Button>
              <Button
                variant={selectedCategory === 'notice' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('notice')}
              >
                ประกาศ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pinned Announcements */}
      {filteredAnnouncements(pinnedAnnouncements).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <Pin className="h-4 w-4" />
            ประกาศสำคัญ
          </h2>
          {filteredAnnouncements(pinnedAnnouncements).map(announcement => (
            <Card key={announcement.id} className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.isImportant && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        <h3 className="font-bold text-lg">{announcement.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getCategoryColor(announcement.category)}>
                          {getCategoryLabel(announcement.category)}
                        </Badge>
                        {announcement.isPinned && (
                          <Badge variant="outline" className="gap-1">
                            <Pin className="h-3 w-3" />
                            ปักหมุด
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground leading-relaxed">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(announcement.date).toLocaleDateString('th-TH')}
                    </span>
                    <span>{announcement.author}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Other Announcements */}
      {filteredAnnouncements(otherAnnouncements).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <Bell className="h-4 w-4" />
            ประกาศอื่น
          </h2>
          {filteredAnnouncements(otherAnnouncements).map(announcement => (
            <Card key={announcement.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold">{announcement.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2 mb-3">
                        <Badge className={getCategoryColor(announcement.category)}>
                          {getCategoryLabel(announcement.category)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground text-sm">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(announcement.date).toLocaleDateString('th-TH')}
                    </span>
                    <span>{announcement.author}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAnnouncements(announcements).length === 0 && (
        <Card>
          <CardContent className="pt-10 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">ไม่มีประกาศที่ตรงกับการค้นหา</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
