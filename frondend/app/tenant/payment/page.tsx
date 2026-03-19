"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BillStatusBadge } from "@/components/common/status-badge";
import { QrCode, Upload, Loader2, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/context/language-context";
import { billAPI } from "@/lib/api/bill.api";
import { paymentAPI } from "@/lib/api/payment.api";
import { toast } from "sonner";

interface Bill {
  bill_id: number;
  bill_month: number;
  bill_year: number;
  total_amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  room_number: string;
  qr_payload: string | null;
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
    month: "long",
    day: "numeric",
  });

export default function TenantPaymentPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const billIdFromUrl = searchParams.get("bill");

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBillId, setSelectedBillId] = useState<string>("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [slipDialogOpen, setSlipDialogOpen] = useState(false);

  useEffect(() => {
    billAPI
      .getMyBills()
      .then((r) => {
        const data: Bill[] = r.data ?? [];
        setBills(data);
        const pending = data.filter(
          (b) => b.status === "pending" || b.status === "overdue",
        );
        if (billIdFromUrl) {
          setSelectedBillId(billIdFromUrl);
        } else if (pending.length > 0) {
          setSelectedBillId(String(pending[0].bill_id));
        }
      })
      .catch(() => toast.error("โหลดบิลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [billIdFromUrl]);

  const pendingBills = bills.filter(
    (b) => b.status === "pending" || b.status === "overdue",
  );
  const totalDue = pendingBills.reduce((s, b) => s + Number(b.total_amount), 0);
  const selectedBill = bills.find((b) => String(b.bill_id) === selectedBillId);

  // ── Load QR ────────────────────────────────────────────────────────────────
  const handleOpenQR = async () => {
    if (!selectedBill) {
      toast.error("กรุณาเลือกบิล");
      return;
    }
    try {
      const res = await billAPI.getQR(selectedBill.bill_id);
      setQrPayload(res.data?.qr_payload ?? null);
      setQrDialogOpen(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "โหลด QR ไม่สำเร็จ");
    }
  };

  // ── Upload slip ────────────────────────────────────────────────────────────
  const handleSlipUpload = async () => {
    if (!slipFile || !selectedBillId) return;
    setUploading(true);
    try {
      await paymentAPI.submit(selectedBillId, slipFile, "qr_promptpay");
      setUploadDone(true);
      setTimeout(() => {
        setSlipDialogOpen(false);
        setUploadDone(false);
        setSlipFile(null);
        billAPI.getMyBills().then((r) => setBills(r.data ?? []));
      }, 2000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "อัปโหลดสลิปไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ชำระเงิน</h1>
        <p className="text-muted-foreground mt-2">ชำระค่าห้อง ค่าน้ำ ค่าไฟ</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลด...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  รวมค้างชำระ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fmt(totalDue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingBills.length} บิล
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  บิลทั้งหมด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bills.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  ชำระแล้ว
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {bills.filter((b) => b.status === "paid").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Select Bill */}
          {pendingBills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>เลือกบิลที่ต้องการชำระ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={selectedBillId}
                  onValueChange={setSelectedBillId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกบิล" />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingBills.map((b) => (
                      <SelectItem key={b.bill_id} value={String(b.bill_id)}>
                        {MONTHS[b.bill_month]} {b.bill_year} —{" "}
                        {fmt(b.total_amount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedBill && (
                  <div className="text-sm text-muted-foreground">
                    กำหนดชำระ {fmtDate(selectedBill.due_date)} • ยอด{" "}
                    <span className="font-bold text-foreground">
                      {fmt(selectedBill.total_amount)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>วิธีการชำระเงิน</CardTitle>
              <CardDescription>เลือกวิธีที่สะดวก</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {/* QR */}
              <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={handleOpenQR}
                  disabled={!selectedBillId}
                >
                  <QrCode className="w-6 h-6" />
                  <span>สแกน QR Code</span>
                  <span className="text-xs text-muted-foreground">
                    PromptPay
                  </span>
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>QR Code PromptPay</DialogTitle>
                    <DialogDescription>สแกนเพื่อชำระเงิน</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg flex items-center justify-center">
                      {qrPayload ? (
                        <QRCodeSVG value={qrPayload} size={240} />
                      ) : (
                        <QrCode className="w-48 h-48 text-gray-800" />
                      )}
                    </div>
                    {selectedBill && (
                      <p className="text-center font-bold text-lg">
                        {fmt(selectedBill.total_amount)}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground text-center">
                      หลังชำระแล้ว กรุณาอัปโหลดสลิปด้วยครับ
                    </p>
                    <Button
                      onClick={() => setQrDialogOpen(false)}
                      className="w-full"
                    >
                      ปิด
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Upload Slip */}
              <Dialog open={slipDialogOpen} onOpenChange={setSlipDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    disabled={!selectedBillId}
                  >
                    <Upload className="w-6 h-6" />
                    <span>อัปโหลดสลิป</span>
                    <span className="text-xs text-muted-foreground">
                      JPG/PNG
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>อัปโหลดสลิปการโอนเงิน</DialogTitle>
                    <DialogDescription>
                      แนบสลิปเพื่อยืนยันการชำระเงิน
                    </DialogDescription>
                  </DialogHeader>
                  {uploadDone ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="font-medium">อัปโหลดสำเร็จ</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        รอการยืนยันจากแอดมิน
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label
                        htmlFor="slip-upload"
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted block"
                      >
                        <Input
                          id="slip-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setSlipFile(e.target.files?.[0] ?? null)
                          }
                        />
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium">
                          {slipFile?.name ?? "คลิกเพื่ออัปโหลด"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG
                        </p>
                      </label>
                      <Button
                        onClick={handleSlipUpload}
                        disabled={!slipFile || uploading}
                        className="w-full"
                      >
                        {uploading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        ยืนยันการอัปโหลด
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Pending Bills */}
          {pendingBills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>บิลค้างชำระ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingBills.map((b) => (
                    <div
                      key={b.bill_id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {MONTHS[b.bill_month]} {b.bill_year}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          กำหนดชำระ {fmtDate(b.due_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{fmt(b.total_amount)}</p>
                        <BillStatusBadge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
