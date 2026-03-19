"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { billAPI } from "@/lib/api/bill.api";
import { maintenanceAPI } from "@/lib/api/maintenance.api";
import { announcementAPI } from "@/lib/api/announcement.api";

interface Notification {
  id: string;
  type: "bill" | "maintenance" | "announcement";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const typeEmoji: Record<string, string> = {
  bill: "📄",
  maintenance: "🔧",
  announcement: "📢",
};

const typeColors: Record<string, string> = {
  bill: "bg-blue-500/20 text-blue-400",
  maintenance: "bg-yellow-500/20 text-yellow-400",
  announcement: "bg-purple-500/20 text-purple-400",
};

export default function TenantNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // สร้าง notification จากข้อมูลจริง
  useEffect(() => {
    const build = async () => {
      const items: Notification[] = [];
      try {
        const [billRes, maintRes, annRes] = await Promise.allSettled([
          billAPI.getMyBills(),
          maintenanceAPI.getMyRequests(),
          announcementAPI.getAll(),
        ]);

        if (billRes.status === "fulfilled") {
          const bills = billRes.value.data ?? [];
          bills
            .filter(
              (b: any) => b.status === "pending" || b.status === "overdue",
            )
            .forEach((b: any) => {
              items.push({
                id: `bill-${b.bill_id}`,
                type: "bill",
                title: b.status === "overdue" ? "บิลเกินกำหนด!" : "บิลรอชำระ",
                message: `บิลเดือน ${b.bill_month}/${b.bill_year} ยอด ${Number(b.total_amount).toLocaleString("th-TH")} บาท`,
                timestamp: new Date(b.due_date).toLocaleDateString("th-TH"),
                isRead: false,
              });
            });
        }

        if (maintRes.status === "fulfilled") {
          const reqs = maintRes.value.data ?? [];
          reqs
            .filter((r: any) => r.status === "resolved")
            .forEach((r: any) => {
              items.push({
                id: `maint-${r.request_id}`,
                type: "maintenance",
                title: "การซ่อมแซมเสร็จสิ้น",
                message: `${r.category} — ดำเนินการเสร็จแล้ว`,
                timestamp: new Date(r.created_at).toLocaleDateString("th-TH"),
                isRead: true,
              });
            });
        }

        if (annRes.status === "fulfilled") {
          const anns = annRes.value.data ?? [];
          anns.slice(0, 3).forEach((a: any) => {
            items.push({
              id: `ann-${a.announcement_id}`,
              type: "announcement",
              title: "ประกาศใหม่",
              message: a.title,
              timestamp: new Date(a.published_at).toLocaleDateString("th-TH"),
              isRead: a.is_pinned !== 1,
            });
          });
        }
      } catch {
        /* ไม่ทำอะไร */
      }

      setNotifications(items);
      setLoading(false);
    };
    build();
  }, []);

  const markRead = (id: string) =>
    setNotifications((p) =>
      p.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );

  const remove = (id: string) =>
    setNotifications((p) => p.filter((n) => n.id !== id));

  const markAllRead = () =>
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">แจ้งเตือน</h1>
          <p className="text-muted-foreground">
            {unread} รายการที่ยังไม่ได้อ่าน
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" />{" "}
            ทำเครื่องหมายว่าอ่านทั้งหมด
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลด...
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">ไม่มีการแจ้งเตือน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex gap-4 p-4 rounded-lg border transition-all ${n.isRead ? "bg-card/50 border-border" : "bg-primary/5 border-primary/30"}`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${typeColors[n.type]}`}
              >
                {typeEmoji[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">
                  {n.title}
                  {!n.isRead && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      ใหม่
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {n.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {n.timestamp}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markRead(n.id)}
                    className="text-primary"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(n.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
