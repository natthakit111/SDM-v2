"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/language-context";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Wrench,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotification } from "@/context/notification-context";

export function TenantBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { unreadCount } = useNotification();

  const items = [
    { href: "/tenant", icon: LayoutDashboard, label: t("menu.dashboard") },
    { href: "/tenant/bills", icon: Receipt, label: t("tenant.bills.title") },
    {
      href: "/tenant/payment",
      icon: CreditCard,
      label: t("tenant.payment.title"),
    },
    { href: "/tenant/maintenance", icon: Wrench, label: t("menu.maintenance") },
    { href: "/tenant/profile", icon: User, label: t("tenant.profile.title") },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden
                    bg-background/95 backdrop-blur-sm
                    border-t border-border
                    safe-area-pb"
    >
      <div className="flex items-stretch h-16">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/tenant" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110",
                  )}
                />
                {/* Badge สำหรับ bills และ payment */}
                {unreadCount > 0 &&
                  (item.href === "/tenant/bills" ||
                    item.href === "/tenant/payment") && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
              </div>
              <span className="truncate max-w-[56px] text-center leading-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
