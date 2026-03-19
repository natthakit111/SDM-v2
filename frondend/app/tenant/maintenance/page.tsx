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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  MaintenanceStatusBadge,
  PriorityBadge,
} from "@/components/common/status-badge";
import { Plus, CheckCircle, Loader2 } from "lucide-react";
import { maintenanceAPI } from "@/lib/api/maintenance.api";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-context";

interface Request {
  request_id: number;
  category: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: string;
  created_at: string;
  admin_note: string | null;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function TenantMaintenancePage() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    priority: "medium",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchRequests = () => {
    maintenanceAPI
      .getMyRequests()
      .then((r) => setRequests(r.data ?? []))
      .catch(() => toast.error("โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async () => {
    if (!formData.category || formData.description.length < 10) {
      toast.error("กรุณากรอกข้อมูลให้ครบ (รายละเอียดอย่างน้อย 10 ตัวอักษร)");
      return;
    }
    setSubmitting(true);
    try {
      await maintenanceAPI.create(formData, imageFile ?? undefined);
      setDone(true);
      setTimeout(() => {
        setDialogOpen(false);
        setDone(false);
        setFormData({ category: "", description: "", priority: "medium" });
        setImageFile(null);
        fetchRequests();
      }, 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "ส่งคำขอไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ขอซ่อมแซม</h1>
          <p className="text-muted-foreground mt-2">
            ส่งคำขอซ่อมแซมหรือปัญหาต่างๆ
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setDone(false);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              ส่งคำขอใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ส่งคำขอซ่อมแซม</DialogTitle>
              <DialogDescription>
                อธิบายปัญหาและเราจะดำเนินการ
              </DialogDescription>
            </DialogHeader>

            {done ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="font-medium">ส่งคำขอสำเร็จ</p>
                <p className="text-sm text-muted-foreground mt-2">
                  ทีมของเราจะดำเนินการเร็วๆ นี้
                </p>
              </div>
            ) : (
              <FieldGroup>
                <Field>
                  <FieldLabel>หมวดหมู่</FieldLabel>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, category: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ซ่อมแซม">ซ่อมแซม</SelectItem>
                      <SelectItem value="ทำความสะอาด">ทำความสะอาด</SelectItem>
                      <SelectItem value="ไฟฟ้า">ไฟฟ้า</SelectItem>
                      <SelectItem value="ประปา">ประปา</SelectItem>
                      <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>รายละเอียด (อย่างน้อย 10 ตัวอักษร)</FieldLabel>
                  <Textarea
                    placeholder="อธิบายปัญหาอย่างละเอียด"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="min-h-28"
                  />
                </Field>
                <Field>
                  <FieldLabel>ความเร่งด่วน</FieldLabel>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, priority: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">ไม่ด่วน</SelectItem>
                      <SelectItem value="medium">ปกติ</SelectItem>
                      <SelectItem value="high">ด่วน</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>รูปภาพประกอบ (ไม่บังคับ)</FieldLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </Field>
              </FieldGroup>
            )}

            {!done && (
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  ยกเลิก
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  ส่งคำขอ
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "รวมทั้งหมด", value: requests.length, color: "" },
          {
            label: "กำลังดำเนินการ",
            value: requests.filter((r) => r.status === "in_progress").length,
            color: "text-blue-500",
          },
          {
            label: "เสร็จสิ้น",
            value: requests.filter((r) => r.status === "resolved").length,
            color: "text-green-500",
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

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>คำขอซ่อมแซมทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลด...
            </div>
          ) : requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              ยังไม่มีคำขอซ่อมแซม
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r.request_id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{r.category}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {r.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <PriorityBadge priority={r.priority} />
                          <span className="text-xs text-muted-foreground">
                            {fmtDate(r.created_at)}
                          </span>
                        </div>
                        {r.admin_note && (
                          <p className="text-xs text-muted-foreground mt-2 bg-muted/50 px-2 py-1 rounded">
                            หมายเหตุ: {r.admin_note}
                          </p>
                        )}
                      </div>
                      <MaintenanceStatusBadge status={r.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
