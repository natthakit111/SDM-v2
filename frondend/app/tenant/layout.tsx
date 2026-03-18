'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { TenantSidebar } from '@/components/layout/tenant-sidebar'
import { TenantNavbar } from '@/components/layout/tenant-navbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Loader2 } from 'lucide-react'

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'tenant')) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'tenant') {
    return null
  }

  return (
    <SidebarProvider>
      <TenantSidebar />
      <SidebarInset>
        <TenantNavbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
