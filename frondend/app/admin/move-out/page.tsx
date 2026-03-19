"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  Search,
} from "lucide-react";
import { moveOutAPI } from "@/lib/api/moveOut.api";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MoveOutRequest {
  request_id: number;
  tenant_id: number;
  first_name: string;
  last_name: string;
  room_number: string;
  move_out_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const statusConfig = {
  pending: {
    label: "รอพิจารณา",
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  approved: {
    label: "อนุมัติแล้ว",
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  rejected: {
    label: "ไม่อนุมัติ",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminMoveOutPage() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<MoveOutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRequest, setViewingRequest] = useState<MoveOutRequest | null>(
    null,
  );
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await moveOutAPI.getAll();
      setRequests(res.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
      r.room_number?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!viewingRequest) return;
    if (
      !confirm(
        `อนุมัติการย้ายออกของ ${viewingRequest.first_name} ${viewingRequest.last_name}?\nสัญญาจะถูกยกเลิกและห้องจะว่างทันที`,
      )
    )
      return;
    setProcessing(true);
    try {
      await moveOutAPI.approve(viewingRequest.request_id, adminNote);
      toast.success("อนุมัติการย้ายออกเรียบร้อย ห้องพร้อมให้เช่าแล้ว");
      setViewingRequest(null);
      setAdminNote("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "อนุมัติไม่สำเร็จ");
    } finally {
      setProcessing(false);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!viewingRequest) return;
    if (!adminNote.trim()) {
      toast.error("กรุณากรอกเหตุผลที่ไม่อนุมัติ");
      return;
    }
    setProcessing(true);
    try {
      await moveOutAPI.reject(viewingRequest.request_id, adminNote);
      toast.success("ปฏิเสธคำร้องเรียบร้อย");
      setViewingRequest(null);
      setAdminNote("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "ดำเนินการไม่สำเร็จ");
    } finally {
      setProcessing(false);
    }
  };

  const openDialog = (r: MoveOutRequest) => {
    setViewingRequest(r);
    setAdminNote(r.admin_note ?? "");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LogOut className="h-6 w-6" />
          คำร้องขอย้ายออก
        </h1>
        <p className="text-muted-foreground">
          ตรวจสอบและอนุมัติคำร้องขอย้ายออกจากผู้เช่า
        </p>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อผู้เช่า หรือหมายเลขห้อง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="สถานะทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="pending">รอพิจารณา</SelectItem>
                <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                <SelectItem value="rejected">ไม่อนุมัติ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการคำร้องทั้งหมด</CardTitle>
          <CardDescription>ทั้งหมด {filtered.length} รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลด...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้เช่า</TableHead>
                  <TableHead>ห้อง</TableHead>
                  <TableHead>วันที่ต้องการย้ายออก</TableHead>
                  <TableHead>วันที่ส่งคำร้อง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const s = statusConfig[r.status];
                  const Icon = s.icon;
                  return (
                    <TableRow key={r.request_id}>
                      <TableCell className="font-medium">
                        {r.first_name} {r.last_name}
                      </TableCell>
                      <TableCell>{r.room_number}</TableCell>
                      <TableCell>{fmtDate(r.move_out_date)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmtDate(r.created_at)}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${s.bg} ${s.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {s.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(r)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      ไม่พบคำร้องขอย้ายออก
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail / Action Dialog */}
      <Dialog
        open={!!viewingRequest}
        onOpenChange={(open) => {
          if (!open) {
            setViewingRequest(null);
            setAdminNote("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>รายละเอียดคำร้องขอย้ายออก</DialogTitle>
            <DialogDescription>ตรวจสอบข้อมูลและดำเนินการ</DialogDescription>
          </DialogHeader>

          {viewingRequest && (
            <div className="space-y-4">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ผู้เช่า</p>
                  <p className="font-medium">
                    {viewingRequest.first_name} {viewingRequest.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">ห้อง</p>
                  <p className="font-medium">{viewingRequest.room_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">วันที่ส่งคำร้อง</p>
                  <p className="font-medium">
                    {fmtDate(viewingRequest.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">วันที่ต้องการย้ายออก</p>
                  <p className="font-medium text-primary">
                    {fmtDate(viewingRequest.move_out_date)}
                  </p>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground mb-1">เหตุผล</p>
                <p className="bg-muted/50 p-3 rounded-lg">
                  {viewingRequest.reason}
                </p>
              </div>

              {/* Admin note */}
              {viewingRequest.status === "pending" ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="adminNote">
                      หมายเหตุ (ถ้าปฏิเสธต้องกรอก)
                    </FieldLabel>
                    <Textarea
                      id="adminNote"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="เหตุผลที่อนุมัติหรือไม่อนุมัติ..."
                      rows={3}
                    />
                  </Field>
                </FieldGroup>
              ) : (
                viewingRequest.admin_note && (
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">หมายเหตุแอดมิน</p>
                    <p className="bg-muted/50 p-3 rounded-lg">
                      {viewingRequest.admin_note}
                    </p>
                  </div>
                )
              )}

              {/* Actions */}
              {viewingRequest.status === "pending" && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewingRequest(null);
                      setAdminNote("");
                    }}
                    disabled={processing}
                  >
                    ปิด
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={processing}
                  >
                    {processing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <XCircle className="mr-2 h-4 w-4" />
                    ไม่อนุมัติ
                  </Button>
                  <Button onClick={handleApprove} disabled={processing}>
                    {processing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <CheckCircle className="mr-2 h-4 w-4" />
                    อนุมัติ
                  </Button>
                </DialogFooter>
              )}

              {viewingRequest.status !== "pending" && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setViewingRequest(null)}
                  >
                    ปิด
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
