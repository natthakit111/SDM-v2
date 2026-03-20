"use client";

import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut, User, DoorOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { contractAPI } from "@/lib/api/contract.api";
import { billAPI } from "@/lib/api/bill.api";

export function TenantNavbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const [roomNumber, setRoomNumber] = useState<string>("-");
  const [unreadCount, setUnreadCount] = useState(0);

  // ── ดึงห้องจาก contract จริง ──────────────────────────────────────────────
  useEffect(() => {
    contractAPI
      .getMyContract()
      .then((r) => {
        if (r.data?.room_number) setRoomNumber(r.data.room_number);
      })
      .catch(() => {});
  }, []);

  // ── นับ notification จากบิลค้างชำระ ──────────────────────────────────────
  useEffect(() => {
    billAPI
      .getMyBills()
      .then((r) => {
        const pending = (r.data ?? []).filter(
          (b: any) => b.status === "pending" || b.status === "overdue",
        );
        setUnreadCount(pending.length);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "US";

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      {/* Room info */}
      <div className="flex-1 flex items-center gap-3">
        <DoorOpen className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            {t("tenant.myRoom")} {roomNumber}
          </p>
          <p className="text-xs text-muted-foreground">DormFlow</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Bell — นับจากบิลค้างชำระจริง */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => router.push("/tenant/notifications")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("common.tenant")}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("common.myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* โปรไฟล์ → ไปหน้า contract */}
            <DropdownMenuItem onClick={() => router.push("/tenant/contract")}>
              <User className="mr-2 h-4 w-4" />
              {t("common.profile")}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">
              {t("common.language")}
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => setLanguage("th")}
              className={language === "th" ? "bg-primary/20" : ""}
            >
              <span className="mr-2">🇹🇭</span>
              {t("common.thai")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage("en")}
              className={language === "en" ? "bg-primary/20" : ""}
            >
              <span className="mr-2">🇬🇧</span>
              {t("common.english")}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
