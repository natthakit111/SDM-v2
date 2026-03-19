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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { BillStatusBadge } from "@/components/common/status-badge";
import {
  Plus,
  Search,
  Receipt,
  Eye,
  FileText,
  XCircle,
  Loader2,
} from "lucide-react";
import { billAPI } from "@/lib/api/bill.api";
import { roomAPI } from "@/lib/api/room.api";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Bill {
  bill_id: number;
  contract_id: number;
  room_id: number;
  room_number: string;
  tenant_name: string;
  tenant_id: number;
  bill_month: number;
  bill_year: number;
  rent_amount: number;
  electric_amount: number;
  water_amount: number;
  other_amount: number;
  total_amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  qr_payload: string | null;
}

interface Room {
  room_id: number;
  room_number: string;
  status: string;
}

interface FormData {
  room_id: string;
  month: string;
  year: string;
  other_amount: string;
  due_date: string;
}

const emptyForm: FormData = {
  room_id: "",
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
  other_amount: "0",
  due_date: "",
};

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
    month: "long",
    day: "numeric",
  });

// ── Component ──────────────────────────────────────────────────────────────────

export default function BillsPage() {
  const { t } = useLanguage();
  const [bills, setBills] = useState<Bill[]>([]);
  const [occupiedRooms, setOccupiedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // ── Fetch bills ───────────────────────────────────────────────────────────
  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await billAPI.getAll(params);
      setBills(res.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "โหลดข้อมูลบิลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // ── Fetch occupied rooms for generate form ────────────────────────────────
  const fetchOccupiedRooms = async () => {
    try {
      const res = await roomAPI.getAll({ status: "occupied" });
      setOccupiedRooms(res.data ?? []);
    } catch {
      /* ไม่ critical */
    }
  };

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);
  useEffect(() => {
    fetchOccupiedRooms();
  }, []);

  // ── Filter client-side ────────────────────────────────────────────────────
  const filteredBills = bills.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.room_number?.toLowerCase().includes(q) ||
      b.tenant_name?.toLowerCase().includes(q)
    );
  });

  // ── Generate bill ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await billAPI.generate({
        room_id: parseInt(formData.room_id),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        other_amount: parseFloat(formData.other_amount) || 0,
        due_date: formData.due_date || undefined,
      });
      toast.success("สร้างบิลเรียบร้อย");
      resetForm();
      fetchBills();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "สร้างบิลไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel bill ───────────────────────────────────────────────────────────
  const handleCancel = async (bill: Bill) => {
    if (
      !confirm(
        `ต้องการยกเลิกบิลห้อง ${bill.room_number} เดือน ${MONTHS[bill.bill_month]} ${bill.bill_year} หรือไม่?`,
      )
    )
      return;
    try {
      await billAPI.cancel(bill.bill_id);
      toast.success("ยกเลิกบิลเรียบร้อย");
      fetchBills();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "ยกเลิกบิลไม่สำเร็จ");
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setIsAddDialogOpen(false);
  };

  const currentYear = new Date().getFullYear();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">จัดการบิล</h1>
          <p className="text-muted-foreground">สร้างและจัดการบิลค่าเช่า</p>
        </div>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsAddDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              สร้างบิล
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>สร้างบิลใหม่</DialogTitle>
              <DialogDescription>
                เลือกห้องและเดือนเพื่อสร้างบิล (ต้องบันทึกมิเตอร์ก่อน)
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel>ห้อง (มีผู้เช่า)</FieldLabel>
                  <Select
                    value={formData.room_id}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, room_id: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกห้อง" />
                    </SelectTrigger>
                    <SelectContent>
                      {occupiedRooms.map((r) => (
                        <SelectItem key={r.room_id} value={String(r.room_id)}>
                          ห้อง {r.room_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>เดือน</FieldLabel>
                    <Select
                      value={formData.month}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, month: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.slice(1).map((m, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>ปี</FieldLabel>
                    <Select
                      value={formData.year}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, year: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[currentYear, currentYear - 1].map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="other_amount">
                    ค่าใช้จ่ายอื่นๆ (บาท)
                  </FieldLabel>
                  <Input
                    id="other_amount"
                    type="number"
                    value={formData.other_amount}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        other_amount: e.target.value,
                      }))
                    }
                    placeholder="0"
                    min="0"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="due_date">
                    วันกำหนดชำระ (ไม่บังคับ)
                  </FieldLabel>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, due_date: e.target.value }))
                    }
                  />
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.room_id}
                >
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  สร้างบิล
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("bills.searchPlaceholder")}
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
                <SelectItem value="pending">รอชำระ</SelectItem>
                <SelectItem value="paid">ชำระแล้ว</SelectItem>
                <SelectItem value="overdue">เกินกำหนด</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            รายการบิล
          </CardTitle>
          <CardDescription>
            ทั้งหมด {filteredBills.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              กำลังโหลด...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ห้อง</TableHead>
                  <TableHead>ผู้เช่า</TableHead>
                  <TableHead>เดือน/ปี</TableHead>
                  <TableHead className="text-right">ยอดรวม</TableHead>
                  <TableHead>กำหนดชำระ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.bill_id}>
                    <TableCell className="font-medium">
                      {bill.room_number}
                    </TableCell>
                    <TableCell>{bill.tenant_name}</TableCell>
                    <TableCell>
                      {MONTHS[bill.bill_month]} {bill.bill_year}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(bill.total_amount)}
                    </TableCell>
                    <TableCell>{formatDate(bill.due_date)}</TableCell>
                    <TableCell>
                      <BillStatusBadge status={bill.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingBill(bill)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(bill.status === "pending" ||
                          bill.status === "overdue") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancel(bill)}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBills.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      ไม่พบบิลที่ตรงกับการค้นหา
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Bill Dialog */}
      <Dialog
        open={!!viewingBill}
        onOpenChange={(open) => !open && setViewingBill(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              รายละเอียดบิล
            </DialogTitle>
          </DialogHeader>
          {viewingBill && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="font-medium">ห้อง {viewingBill.room_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {viewingBill.tenant_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {MONTHS[viewingBill.bill_month]} {viewingBill.bill_year}
                  </p>
                  <BillStatusBadge status={viewingBill.status} />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ค่าเช่า</span>
                  <span>{formatCurrency(viewingBill.rent_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ค่าไฟฟ้า</span>
                  <span>{formatCurrency(viewingBill.electric_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ค่าน้ำ</span>
                  <span>{formatCurrency(viewingBill.water_amount)}</span>
                </div>
                {viewingBill.other_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค่าอื่นๆ</span>
                    <span>{formatCurrency(viewingBill.other_amount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t font-bold text-lg">
                <span>รวมทั้งหมด</span>
                <span>{formatCurrency(viewingBill.total_amount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">กำหนดชำระภายใน</span>
                <span>{formatDate(viewingBill.due_date)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
