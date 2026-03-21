"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminNavbar } from "@/components/layout/admin-navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    // ✅ defaultOpen={false} บนมือถือ (window < 768px) sidebar จะปิดตอนโหลด
    // ✅ บน desktop (md ขึ้นไป) ยังคง open ตามปกติ
    <SidebarProvider
      defaultOpen={
        typeof window !== "undefined" ? window.innerWidth >= 768 : true
      }
    >
      <AdminSidebar />
      <SidebarInset>
        <AdminNavbar />
        {/* ✅ p-3 บนมือถือ → p-6 บน md ขึ้นไป */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
