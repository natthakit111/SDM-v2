"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, TrendingUp, Loader2 } from "lucide-react";
import { paymentAPI } from "@/lib/api/payment.api";
import { toast } from "sonner";

interface Payment {
  payment_id: number;
  bill_id: number;
  amount_paid: number;
  payment_method: string;
  paid_at: string;
  status: "pending_verify" | "verified" | "rejected";
  remark: string | null;
  bill_month?: number;
  bill_year?: number;
  room_number?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const methodLabel: Record<string, string> = {
  qr_promptpay: "QR PromptPay",
  cash: "เงินสด",
  bank_transfer: "โอนธนาคาร",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending_verify: {
    label: "รอยืนยัน",
    color: "bg-yellow-500/10 text-yellow-600",
  },
  verified: { label: "ยืนยันแล้ว", color: "bg-green-500/10 text-green-600" },
  rejected: { label: "ถูกปฏิเสธ", color: "bg-red-500/10 text-red-600" },
};

export default function TenantPaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState("all");

  useEffect(() => {
    paymentAPI
      .getMyPayments()
      .then((r) => setPayments(r.data ?? []))
      .catch(() => toast.error("โหลดประวัติไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  const months = [...new Set(payments.map((p) => p.paid_at.substring(0, 7)))]
    .sort()
    .reverse();

  const filtered =
    filterMonth === "all"
      ? payments
      : payments.filter((p) => p.paid_at.startsWith(filterMonth));

  const totalPaid = filtered
    .filter((p) => p.status === "verified")
    .reduce((s, p) => s + Number(p.amount_paid), 0);
  const totalAll = payments.reduce((s, p) => s + Number(p.amount_paid), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ประวัติการชำระเงิน</h1>
        <p className="text-muted-foreground mt-2">
          ดูประวัติการชำระเงินทั้งหมด
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลด...
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  ยืนยันแล้ว
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {fmt(totalPaid)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> รวมทั้งสิ้น
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(totalAll)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  จำนวนรายการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payments.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card>
            <CardContent className="pt-6">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {months.map((m) => {
                    const d = new Date(m + "-01");
                    return (
                      <SelectItem key={m} value={m}>
                        {d.toLocaleDateString("th-TH", {
                          month: "long",
                          year: "numeric",
                        })}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    ไม่พบประวัติการชำระเงิน
                  </p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((p) => {
                const s = statusConfig[p.status] ?? statusConfig.pending_verify;
                return (
                  <Card key={p.payment_id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          <div className="bg-green-500/10 p-3 rounded-lg h-fit">
                            <FileText className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <p className="font-bold">บิล #{p.bill_id}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {methodLabel[p.payment_method] ??
                                  p.payment_method}
                              </span>
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {fmtDate(p.paid_at)}
                              </span>
                            </div>
                            {p.remark && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {p.remark}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-green-500">
                            {fmt(Number(p.amount_paid))}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${s.color}`}
                          >
                            {s.label}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
