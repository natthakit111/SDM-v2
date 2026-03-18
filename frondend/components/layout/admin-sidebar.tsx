'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Building2,
  LayoutDashboard,
  DoorOpen,
  Users,
  Gauge,
  Receipt,
  CreditCard,
  Wrench,
  Megaphone,
  FileText,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    group: 'หลัก',
    items: [
      { title: 'แดชบอร์ด', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    group: 'จัดการห้องพัก',
    items: [
      { title: 'ห้องพัก', href: '/admin/rooms', icon: DoorOpen },
      { title: 'ผู้เช่า', href: '/admin/tenants', icon: Users },
      { title: 'สัญญาเช่า', href: '/admin/contracts', icon: FileText },
    ],
  },
  {
    group: 'การเงิน',
    items: [
      { title: 'บันทึกมิเตอร์', href: '/admin/meters', icon: Gauge },
      { title: 'บิล', href: '/admin/bills', icon: Receipt },
      { title: 'การชำระเงิน', href: '/admin/payments', icon: CreditCard },
    ],
  },
  {
    group: 'อื่นๆ',
    items: [
      { title: 'แจ้งซ่อม', href: '/admin/maintenance', icon: Wrench },
      { title: 'ประกาศ', href: '/admin/announcements', icon: Megaphone },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/admin" className="flex items-center gap-3 px-4 py-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">DormFlow</h1>
            <p className="text-xs text-muted-foreground">ระบบจัดการหอพัก</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        isActive && 'bg-primary/20 text-primary'
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4" />
                <span>ตั้งค่า</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
