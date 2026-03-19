"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { PaymentStatusBadge } from "@/components/common/status-badge";
import { paymentAPI } from "@/lib/api/payment.api";
import { toast } from "sonner";

interface Payment {
  payment_id: number;
  bill_id: number;
  tenant_name: string;
  room_number: string;
  amount_paid: number;
  payment_method: string;
  slip_image: string | null;
  status: string;
  remark: string | null;
  verified_by_name: string | null;
  verified_at: string | null;
  paid_at: string | null;
  created_at: string;
}

const getMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    qr_promptpay: "พร้อมเพย์",
    cash: "เงินสด",
    bank_transfer: "โอนเงิน",
  };
  return map[method] ?? method;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
    amount,
  );

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterMethod !== "all") params.payment_method = filterMethod;
      const res = await paymentAPI.getAll(params);
      setPayments(res?.data ?? res ?? []);
    } catch {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterMethod]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleVerify = async () => {
    if (!selectedPayment) return;
    try {
      setActionLoading(true);
      await paymentAPI.verify(selectedPayment.payment_id);
      toast.success("อนุมัติการชำระเงินเรียบร้อย");
      setDetailsDialogOpen(false);
      setSelectedPayment(null);
      fetchPayments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedPayment || !rejectReason.trim()) {
      toast.error("กรุณาระบุเหตุผล");
      return;
    }
    try {
      setActionLoading(true);
      await paymentAPI.reject(selectedPayment.payment_id, rejectReason);
      toast.success("ปฏิเสธการชำระเงินแล้ว");
      setRejectDialogOpen(false);
      setDetailsDialogOpen(false);
      setRejectReason("");
      setSelectedPayment(null);
      fetchPayments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      p.tenant_name?.toLowerCase().includes(q) ||
      p.room_number?.toLowerCase().includes(q) ||
      String(p.bill_id).includes(q) ||
      String(p.payment_id).includes(q)
    );
  });

  const stats = {
    total: payments.length,
    pending: payments.filter((p) => p.status === "pending_verify").length,
    verified: payments.filter((p) => p.status === "verified").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const slipUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_API_URL ?? ""}/${path}`;
  };

  const paidDate = (p: Payment) => p.paid_at ?? p.created_at;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">การชำระเงิน</h1>
        <p className="text-muted-foreground mt-2">
          รายการชำระเงินทั้งหมดในระบบ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "รวมทั้งหมด", value: stats.total, color: "" },
          {
            label: "รอการตรวจสอบ",
            value: stats.pending,
            color: "text-warning",
          },
          {
            label: "ตรวจสอบแล้ว",
            value: stats.verified,
            color: "text-success",
          },
          { label: "ปฏิเสธ", value: stats.rejected, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="ค้นหา ชื่อ ห้อง บิล หรือ ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="pending_verify">รอการตรวจสอบ</SelectItem>
                <SelectItem value="verified">ตรวจสอบแล้ว</SelectItem>
                <SelectItem value="rejected">ปฏิเสธ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="วิธีชำระ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">วิธีทั้งหมด</SelectItem>
                <SelectItem value="qr_promptpay">พร้อมเพย์</SelectItem>
                <SelectItem value="cash">เงินสด</SelectItem>
                <SelectItem value="bank_transfer">โอนเงิน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <Card key={payment.payment_id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="mt-1">{statusIcon(payment.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg">
                            {payment.tenant_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ห้อง {payment.room_number} • บิล #{payment.bill_id}
                          </p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {Number(payment.amount_paid).toLocaleString(
                                "th-TH",
                              )}{" "}
                              บาท
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {getMethodLabel(payment.payment_method)}
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {formatDate(paidDate(payment))}
                            </span>
                          </div>
                          {payment.remark && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              {payment.remark}
                            </p>
                          )}
                        </div>
                        <PaymentStatusBadge status={payment.status} />
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 flex-shrink-0"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setDetailsDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">ดู</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredPayments.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">ไม่พบรายการ</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsDialogOpen(false);
            setSelectedPayment(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              รายละเอียดการชำระเงิน #{selectedPayment?.payment_id}
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ชื่อผู้เช่า</p>
                  <p className="font-medium">{selectedPayment.tenant_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ห้อง</p>
                  <p className="font-medium">{selectedPayment.room_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">บิล #</p>
                  <p className="font-medium">{selectedPayment.bill_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">จำนวนเงิน</p>
                  <p className="font-bold text-lg">
                    {formatCurrency(Number(selectedPayment.amount_paid))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">วิธีชำระ</p>
                  <p className="font-medium">
                    {getMethodLabel(selectedPayment.payment_method)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">วันที่ชำระ</p>
                  <p className="font-medium">
                    {formatDate(paidDate(selectedPayment))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">สถานะ</p>
                  <PaymentStatusBadge status={selectedPayment.status} />
                </div>
                {selectedPayment.verified_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedPayment.status === "verified"
                        ? "อนุมัติเมื่อ"
                        : "ปฏิเสธเมื่อ"}
                    </p>
                    <p className="font-medium">
                      {formatDate(selectedPayment.verified_at)}
                    </p>
                  </div>
                )}
                {selectedPayment.verified_by_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      ดำเนินการโดย
                    </p>
                    <p className="font-medium">
                      {selectedPayment.verified_by_name}
                    </p>
                  </div>
                )}
              </div>

              {selectedPayment.remark && (
                <div>
                  <p className="text-sm text-muted-foreground">หมายเหตุ</p>
                  <p className="p-2 bg-muted rounded text-sm italic">
                    {selectedPayment.remark}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">รูปสลิป</p>
                {selectedPayment.slip_image ? (
                  <div className="border rounded-lg overflow-hidden bg-muted/30">
                    <img
                      src={slipUrl(selectedPayment.slip_image) ?? ""}
                      alt="สลิป"
                      className="w-full max-h-72 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="p-2 text-center">
                      <Button variant="link" size="sm" asChild>
                        <a
                          href={slipUrl(selectedPayment.slip_image) ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ImageIcon className="mr-1 h-4 w-4" />
                          ดูรูปขนาดเต็ม
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-lg aspect-video flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">ไม่มีสลิป</p>
                  </div>
                )}
              </div>

              {/* ✅ ปุ่ม อนุมัติ/ปฏิเสธ */}
              {selectedPayment.status === "pending_verify" && (
                <div className="flex gap-3 pt-2 border-t">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={actionLoading}
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      setRejectDialogOpen(true);
                    }}
                  >
                    <XCircle className="mr-2 w-4 h-4" />
                    ปฏิเสธ
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={actionLoading}
                    onClick={handleVerify}
                  >
                    {actionLoading ? (
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 w-4 h-4" />
                    )}
                    อนุมัติ
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialogOpen(false);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ปฏิเสธการชำระเงิน</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">ผู้เช่า</p>
              <p>
                {selectedPayment?.tenant_name} — ห้อง{" "}
                {selectedPayment?.room_number}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">เหตุผล</label>
              <Textarea
                placeholder="เช่น จำนวนเงินไม่ตรง, สลิปไม่ชัดเจน ฯลฯ"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <Button
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || actionLoading}
              variant="destructive"
              className="w-full"
            >
              {actionLoading ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 w-4 h-4" />
              )}
              ยืนยันการปฏิเสธ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
