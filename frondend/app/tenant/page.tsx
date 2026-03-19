"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BillStatusBadge,
  MaintenanceStatusBadge,
} from "@/components/common/status-badge";
import {
  DoorOpen,
  Receipt,
  CreditCard,
  Wrench,
  Bell,
  Calendar,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { billAPI } from "@/lib/api/bill.api";
import { maintenanceAPI } from "@/lib/api/maintenance.api";
import { announcementAPI } from "@/lib/api/announcement.api";
import { contractAPI } from "@/lib/api/contract.api";
import { useLanguage } from "@/context/language-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Bill {
  bill_id: number;
  bill_month: number;
  bill_year: number;
  total_amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
}

interface MaintenanceRequest {
  request_id: number;
  category: string;
  status: string;
  created_at: string;
}

interface Announcement {
  announcement_id: number;
  title: string;
  content: string;
  published_at: string;
  is_pinned: number;
}

interface Contract {
  contract_id: number;
  room_number: string;
  room_id: number;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  status: string;
}

const MONTHS = [
  "",
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ── Component ──────────────────────────────────────────────────────────────────

export default function TenantDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [bills, setBills] = useState<Bill[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch all data ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [billRes, maintRes, annRes, contractRes] =
          await Promise.allSettled([
            billAPI.getMyBills(),
            maintenanceAPI.getMyRequests(),
            announcementAPI.getAll(),
            contractAPI.getMyContract(),
          ]);

        if (billRes.status === "fulfilled") setBills(billRes.value.data ?? []);
        if (maintRes.status === "fulfilled")
          setMaintenance(maintRes.value.data ?? []);
        if (annRes.status === "fulfilled")
          setAnnouncements(annRes.value.data ?? []);
        if (contractRes.status === "fulfilled")
          setContract(contractRes.value.data ?? null);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const pendingBill = bills.find(
    (b) => b.status === "pending" || b.status === "overdue",
  );
  const activeMaintenance = maintenance.filter(
    (m) => m.status !== "resolved" && m.status !== "cancelled",
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          สวัสดี, {user?.username || "ผู้เช่า"}
        </h1>
        <p className="text-muted-foreground">ยินดีต้อนรับสู่ระบบจัดการหอพัก</p>
      </div>

      {/* Room Info Card */}
      {contract && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-primary/20">
                  <DoorOpen className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ห้องพักของคุณ</p>
                  <p className="text-3xl font-bold">{contract.room_number}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    สัญญาถึง {formatDate(contract.end_date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">ค่าเช่ารายเดือน</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(Number(contract.rent_amount))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Bill Alert */}
      {pendingBill && (
        <Card
          className={
            pendingBill.status === "overdue"
              ? "border-destructive/50 bg-destructive/5"
              : "border-yellow-500/50 bg-yellow-500/5"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${pendingBill.status === "overdue" ? "bg-destructive/20" : "bg-yellow-500/20"}`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 ${pendingBill.status === "overdue" ? "text-destructive" : "text-yellow-600"}`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-semibold ${pendingBill.status === "overdue" ? "text-destructive" : ""}`}
                  >
                    {pendingBill.status === "overdue"
                      ? "บิลเกินกำหนดชำระ!"
                      : "คุณมีบิลที่รอชำระ"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {MONTHS[pendingBill.bill_month]} {pendingBill.bill_year} •
                    ยอด {formatCurrency(pendingBill.total_amount)}
                  </p>
                </div>
              </div>
              <Link href="/tenant/payment">
                <Button
                  variant={
                    pendingBill.status === "overdue" ? "destructive" : "default"
                  }
                >
                  ชำระเงิน
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/tenant/bills", icon: Receipt, label: "ดูบิล" },
          { href: "/tenant/payment", icon: CreditCard, label: "ชำระเงิน" },
          { href: "/tenant/maintenance", icon: Wrench, label: "แจ้งซ่อม" },
          { href: "/tenant/contract", icon: Calendar, label: "สัญญาเช่า" },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Bills + Maintenance */}
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
                ดูทั้งหมด <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bills.slice(0, 3).map((bill) => (
                <div
                  key={bill.bill_id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {MONTHS[bill.bill_month]} {bill.bill_year}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      กำหนดชำระ {formatDate(bill.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(bill.total_amount)}
                    </p>
                    <BillStatusBadge status={bill.status} />
                  </div>
                </div>
              ))}
              {bills.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  ไม่มีบิล
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">รายการแจ้งซ่อม</CardTitle>
              <CardDescription>สถานะการแจ้งซ่อมของคุณ</CardDescription>
            </div>
            <Link href="/tenant/maintenance">
              <Button variant="ghost" size="sm">
                ดูทั้งหมด <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenance.slice(0, 3).map((req) => (
                <div
                  key={req.request_id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{req.category}</p>
                    <p className="text-sm text-muted-foreground">
                      แจ้งเมื่อ {formatDate(req.created_at)}
                    </p>
                  </div>
                  <MaintenanceStatusBadge status={req.status} />
                </div>
              ))}
              {maintenance.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  ไม่มีรายการแจ้งซ่อม
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              ประกาศล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.slice(0, 2).map((ann) => (
                <div
                  key={ann.announcement_id}
                  className={`p-4 rounded-lg ${ann.is_pinned ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-muted/50"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{ann.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(ann.published_at)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{ann.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Info */}
      {contract && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลสัญญาเช่า</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">วันเริ่มสัญญา</p>
                <p className="font-medium">{formatDate(contract.start_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">วันสิ้นสุดสัญญา</p>
                <p className="font-medium">{formatDate(contract.end_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ค่าเช่ารายเดือน</p>
                <p className="font-medium">
                  {formatCurrency(Number(contract.rent_amount))}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">เงินประกัน</p>
                <p className="font-medium">
                  {formatCurrency(Number(contract.deposit_amount))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
