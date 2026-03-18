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
  Receipt,
  CreditCard,
  Wrench,
  Bell,
  FileText,
  History,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    group: 'หลัก',
    items: [
      { title: 'หน้าหลัก', href: '/tenant', icon: LayoutDashboard },
    ],
  },
  {
    group: 'การเงิน',
    items: [
      { title: 'บิลของฉัน', href: '/tenant/bills', icon: Receipt },
      { title: 'ชำระเงิน', href: '/tenant/payment', icon: CreditCard },
      { title: 'ประวัติการชำระ', href: '/tenant/payment-history', icon: History },
    ],
  },
  {
    group: 'บริการ',
    items: [
      { title: 'แจ้งซ่อม', href: '/tenant/maintenance', icon: Wrench },
      { title: 'ประกาศ', href: '/tenant/announcements', icon: Bell },
      { title: 'สัญญาเช่า', href: '/tenant/contract', icon: FileText },
      { title: 'ขอย้ายออก', href: '/tenant/move-out', icon: LogOut },
    ],
  },
]

export function TenantSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/tenant" className="flex items-center gap-3 px-4 py-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">DormFlow</h1>
            <p className="text-xs text-muted-foreground">ผู้เช่า</p>
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
                  (item.href !== '/tenant' && pathname.startsWith(item.href))
                
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
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="text-xs text-muted-foreground text-center">
          หอพักสุขใจ
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
