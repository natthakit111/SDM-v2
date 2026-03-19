"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BillStatusBadge } from "@/components/common/status-badge";
import {
  Receipt,
  FileText,
  CreditCard,
  Zap,
  Droplets,
  Loader2,
  ImageIcon,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { billAPI } from "@/lib/api/bill.api";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-context";

interface MeterReading {
  reading_id: number;
  meter_type: "electric" | "water";
  previous_unit: number;
  current_unit: number;
  units_used: number;
  rate_per_unit: number;
  image_path: string | null;
}

interface Bill {
  bill_id: number;
  bill_month: number;
  bill_year: number;
  rent_amount: number;
  electric_amount: number;
  water_amount: number;
  other_amount: number;
  total_amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  room_number: string;
  // detail จาก getById
  meter_readings?: MeterReading[];
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

const fmt = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const imgUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_API_URL ?? ""}/${path}`;
};

export default function TenantBillsPage() {
  const { t } = useLanguage();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    billAPI
      .getMyBills()
      .then((r) => setBills(r.data ?? r ?? []))
      .catch(() => toast.error("โหลดบิลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  // เปิด dialog พร้อม load รายละเอียด + รูปมิเตอร์
  // backend ส่ง flat fields: elec_image, elec_current ฯลฯ
  const handleViewBill = async (bill: Bill) => {
    setViewingBill(bill);
    setDetailLoading(true);
    try {
      const res = await billAPI.getById(bill.bill_id);
      const detail = res?.data ?? res;

      // แปลง flat fields → meter_readings array
      const meter_readings: MeterReading[] = [];
      if (detail.elec_current != null) {
        meter_readings.push({
          reading_id: 0,
          meter_type: "electric",
          previous_unit: Number(detail.elec_previous ?? 0),
          current_unit: Number(detail.elec_current),
          units_used: Number(detail.elec_units ?? 0),
          rate_per_unit: Number(detail.elec_rate ?? 0),
          image_path: detail.elec_image ?? null,
        });
      }
      if (detail.water_current != null) {
        meter_readings.push({
          reading_id: 0,
          meter_type: "water",
          previous_unit: Number(detail.water_previous ?? 0),
          current_unit: Number(detail.water_current),
          units_used: Number(detail.water_units ?? 0),
          rate_per_unit: Number(detail.water_rate ?? 0),
          image_path: detail.water_image ?? null,
        });
      }

      setViewingBill({ ...bill, ...detail, meter_readings });
    } catch {
      // ใช้ข้อมูลเดิมถ้าโหลดไม่ได้
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = bills.filter(
    (b) => statusFilter === "all" || b.status === statusFilter,
  );

  const elecReading = viewingBill?.meter_readings?.find(
    (r) => r.meter_type === "electric",
  );
  const waterReading = viewingBill?.meter_readings?.find(
    (r) => r.meter_type === "water",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">บิลของฉัน</h1>
          <p className="text-muted-foreground">ดูรายละเอียดบิลค่าเช่าทั้งหมด</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="สถานะทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">สถานะทั้งหมด</SelectItem>
            <SelectItem value="pending">รอชำระ</SelectItem>
            <SelectItem value="paid">ชำระแล้ว</SelectItem>
            <SelectItem value="overdue">เกินกำหนด</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลด...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>ไม่มีบิลที่ตรงกับการค้นหา</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((bill) => (
            <Card
              key={bill.bill_id}
              className={
                bill.status === "overdue" ? "border-destructive/50" : ""
              }
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${bill.status === "paid" ? "bg-green-500/20" : bill.status === "overdue" ? "bg-destructive/20" : "bg-yellow-500/20"}`}
                    >
                      <Receipt
                        className={`h-6 w-6 ${bill.status === "paid" ? "text-green-500" : bill.status === "overdue" ? "text-destructive" : "text-yellow-600"}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-lg">
                        {MONTHS[bill.bill_month]} {bill.bill_year}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        กำหนดชำระ {fmtDate(bill.due_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {fmt(bill.total_amount)}
                      </p>
                      <BillStatusBadge status={bill.status} />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBill(bill)}
                      >
                        <FileText className="h-4 w-4 mr-1" /> รายละเอียด
                      </Button>
                      {(bill.status === "pending" ||
                        bill.status === "overdue") && (
                        <Link href={`/tenant/payment?bill=${bill.bill_id}`}>
                          <Button size="sm">
                            <CreditCard className="h-4 w-4 mr-1" /> ชำระเงิน
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">ค่าเช่า:</span>
                    <span className="font-medium">{fmt(bill.rent_amount)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground">ไฟฟ้า:</span>
                    <span className="font-medium">
                      {fmt(bill.electric_amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">น้ำ:</span>
                    <span className="font-medium">
                      {fmt(bill.water_amount)}
                    </span>
                  </div>
                  {bill.other_amount > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">อื่นๆ:</span>
                      <span className="font-medium">
                        {fmt(bill.other_amount)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={!!viewingBill}
        onOpenChange={(open) => !open && setViewingBill(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> ใบแจ้งหนี้
            </DialogTitle>
          </DialogHeader>
          {viewingBill && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="font-medium text-lg">
                    ห้อง {viewingBill.room_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {MONTHS[viewingBill.bill_month]} {viewingBill.bill_year}
                  </p>
                </div>
                <BillStatusBadge status={viewingBill.status} />
              </div>

              {/* รายละเอียดค่าใช้จ่าย */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ค่าเช่าห้อง</span>
                  <span className="font-medium">
                    {fmt(viewingBill.rent_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    ค่าไฟฟ้า
                    {elecReading && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({elecReading.previous_unit} →{" "}
                        {elecReading.current_unit} = {elecReading.units_used}{" "}
                        หน่วย × ฿{elecReading.rate_per_unit})
                      </span>
                    )}
                  </span>
                  <span className="font-medium">
                    {fmt(viewingBill.electric_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Droplets className="h-3 w-3 text-blue-500" />
                    ค่าน้ำ
                    {waterReading && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({waterReading.previous_unit} →{" "}
                        {waterReading.current_unit} = {waterReading.units_used}{" "}
                        หน่วย × ฿{waterReading.rate_per_unit})
                      </span>
                    )}
                  </span>
                  <span className="font-medium">
                    {fmt(viewingBill.water_amount)}
                  </span>
                </div>
                {viewingBill.other_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค่าอื่นๆ</span>
                    <span className="font-medium">
                      {fmt(viewingBill.other_amount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t text-xl font-bold">
                <span>รวมทั้งหมด</span>
                <span className="text-primary">
                  {fmt(viewingBill.total_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">กำหนดชำระภายใน</span>
                <span>{fmtDate(viewingBill.due_date)}</span>
              </div>

              {/* รูปมิเตอร์ */}
              {detailLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : elecReading?.image_path || waterReading?.image_path ? (
                <div className="pt-4 border-t space-y-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    รูปหลักฐานมิเตอร์
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* รูปมิเตอร์ไฟ */}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        มิเตอร์ไฟฟ้า
                      </p>
                      {elecReading?.image_path ? (
                        <a
                          href={imgUrl(elecReading.image_path) ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={imgUrl(elecReading.image_path) ?? ""}
                            alt="มิเตอร์ไฟ"
                            className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                          />
                        </a>
                      ) : (
                        <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">ไม่มีรูป</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* รูปมิเตอร์น้ำ */}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Droplets className="h-3 w-3 text-blue-500" />
                        มิเตอร์น้ำ
                      </p>
                      {waterReading?.image_path ? (
                        <a
                          href={imgUrl(waterReading.image_path) ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={imgUrl(waterReading.image_path) ?? ""}
                            alt="มิเตอร์น้ำ"
                            className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                          />
                        </a>
                      ) : (
                        <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">ไม่มีรูป</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {(viewingBill.status === "pending" ||
                viewingBill.status === "overdue") && (
                <Link
                  href={`/tenant/payment?bill=${viewingBill.bill_id}`}
                  className="block"
                >
                  <Button className="w-full mt-2">
                    <CreditCard className="h-4 w-4 mr-2" />
                    ชำระเงิน
                  </Button>
                </Link>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
