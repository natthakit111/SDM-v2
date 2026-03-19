"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  Plus,
  LogOut,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { moveOutAPI } from "@/lib/api/moveOut.api";
import { toast } from "sonner";

interface MoveOutRequest {
  request_id: number;
  move_out_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  room_number: string;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const statusConfig = {
  pending: { label: "รอพิจารณา", icon: Clock, color: "text-yellow-500" },
  approved: {
    label: "อนุมัติแล้ว",
    icon: CheckCircle,
    color: "text-green-500",
  },
  rejected: { label: "ไม่อนุมัติ", icon: XCircle, color: "text-destructive" },
};

export default function MoveOutPage() {
  const [requests, setRequests] = useState<MoveOutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ moveOutDate: "", reason: "" });

  const fetchRequests = () => {
    moveOutAPI
      .getAll()
      .then((r) => setRequests(r.data ?? []))
      .catch(() => toast.error("โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const hasPending = requests.some((r) => r.status === "pending");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.moveOutDate || !formData.reason) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    const daysNotice = Math.ceil(
      (new Date(formData.moveOutDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysNotice < 30) {
      toast.error("กรุณาแจ้งล่วงหน้าอย่างน้อย 30 วัน");
      return;
    }

    setSubmitting(true);
    try {
      await moveOutAPI.create({
        move_out_date: formData.moveOutDate,
        reason: formData.reason,
      });
      toast.success("ส่งคำร้องขอย้ายออกเรียบร้อย รอแอดมินอนุมัติ");
      setFormData({ moveOutDate: "", reason: "" });
      setIsDialogOpen(false);
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "ส่งคำร้องไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ขอย้ายออก</h1>
          <p className="text-muted-foreground">
            แจ้งความประสงค์ย้ายออกจากหอพัก
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={hasPending}>
              <Plus className="h-4 w-4" />
              {hasPending ? "มีคำร้องรออยู่แล้ว" : "ส่งคำร้องขอย้ายออก"}
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                ส่งคำร้องขอย้ายออก
              </DialogTitle>
              <DialogDescription>
                กรุณาแจ้งล่วงหน้าอย่างน้อย 30 วัน — แอดมินจะตรวจสอบและอนุมัติ
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">ต้องแจ้งล่วงหน้า 30 วัน</p>
                    <p className="text-xs text-muted-foreground">
                      การแจ้งล่าช้าอาจมีค่าปรับ 1 เดือน
                    </p>
                  </div>
                </div>

                <Field>
                  <FieldLabel htmlFor="moveOutDate">
                    วันที่ต้องการย้ายออก
                  </FieldLabel>
                  <Input
                    id="moveOutDate"
                    type="date"
                    value={formData.moveOutDate}
                    min={
                      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        moveOutDate: e.target.value,
                      }))
                    }
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="reason">เหตุผลในการย้ายออก</FieldLabel>
                  <Textarea
                    id="reason"
                    placeholder="เช่น ย้ายกลับบ้านเกิด, เปลี่ยนที่ทำงาน"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, reason: e.target.value }))
                    }
                    className="min-h-24"
                    required
                  />
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={submitting}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  ส่งคำร้อง
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "รอพิจารณา",
            value: requests.filter((r) => r.status === "pending").length,
            color: "text-yellow-500",
          },
          {
            label: "อนุมัติแล้ว",
            value: requests.filter((r) => r.status === "approved").length,
            color: "text-green-500",
          },
          {
            label: "ไม่อนุมัติ",
            value: requests.filter((r) => r.status === "rejected").length,
            color: "text-destructive",
          },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            รายการคำร้องขอย้ายออก
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลด...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่ส่งคำร้อง</TableHead>
                  <TableHead>วันที่ต้องการย้ายออก</TableHead>
                  <TableHead>เหตุผล</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>หมายเหตุ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => {
                  const s = statusConfig[r.status];
                  const Icon = s.icon;
                  return (
                    <TableRow key={r.request_id}>
                      <TableCell className="text-sm">
                        {fmtDate(r.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {fmtDate(r.move_out_date)}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {r.reason}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1.5 text-sm font-medium ${s.color}`}
                        >
                          <Icon className="h-4 w-4" />
                          {s.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.admin_note ?? "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      ยังไม่มีคำร้องขอย้ายออก
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            ข้อมูลสำคัญ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">ระยะเวลาแจ้ง:</span> อย่างน้อย 30
            วันล่วงหน้า
          </p>
          <p>
            <span className="font-medium">ขั้นตอน:</span> ส่งคำร้อง →
            แอดมินตรวจสอบ → อนุมัติ → ย้ายออก
          </p>
          <p>
            <span className="font-medium">ค่าปรับ:</span> หากออกก่อนกำหนดเกิน 30
            วัน จะถูกหักค่าปรับ 1 เดือน
          </p>
          <p>
            <span className="font-medium">เงินประกัน:</span>{" "}
            คืนหลังตรวจสอบสภาพห้องและหักค่าปรับ (ถ้ามี)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
