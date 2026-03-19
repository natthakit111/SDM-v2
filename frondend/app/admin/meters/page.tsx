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
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  Plus,
  Search,
  Gauge,
  Zap,
  Droplets,
  Pencil,
  Loader2,
} from "lucide-react";
import { meterAPI } from "@/lib/api/meter.api";
import { roomAPI } from "@/lib/api/room.api";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MeterReading {
  reading_id: number;
  room_id: number;
  room_number: string;
  meter_type: "electric" | "water";
  reading_month: number;
  reading_year: number;
  previous_unit: number;
  current_unit: number;
  units_used: number;
  rate_per_unit: number;
  image_path: string | null;
  recorded_at: string;
}

interface Room {
  room_id: number;
  room_number: string;
}

interface FormData {
  room_id: string;
  month: string;
  year: string;
  // ไฟ
  elec_current: string;
  elec_prev: string; // auto-filled จาก API
  // น้ำ
  water_current: string;
  water_prev: string; // auto-filled จาก API
  // รูป (optional)
  elec_image: File | null;
  water_image: File | null;
}

const emptyForm: FormData = {
  room_id: "",
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
  elec_current: "",
  elec_prev: "0",
  water_current: "",
  water_prev: "0",
  elec_image: null,
  water_image: null,
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

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ── Component ──────────────────────────────────────────────────────────────────

export default function MetersPage() {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [occupiedRooms, setOccupiedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<MeterReading | null>(
    null,
  );
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [loadingPrev, setLoadingPrev] = useState(false);

  // ── Fetch readings ────────────────────────────────────────────────────────
  const fetchReadings = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== "all") params.meter_type = typeFilter;
      const res = await meterAPI.getAll(params);
      setReadings(res.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "โหลดข้อมูลมิเตอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  useEffect(() => {
    roomAPI
      .getAll({ status: "occupied" })
      .then((r) => setOccupiedRooms(r.data ?? []))
      .catch(() => {});
  }, []);

  // ── Auto-fill previous units เมื่อเลือกห้อง ──────────────────────────────
  const handleRoomChange = async (roomId: string) => {
    setFormData((p) => ({
      ...p,
      room_id: roomId,
      elec_prev: "0",
      water_prev: "0",
    }));
    if (!roomId) return;
    setLoadingPrev(true);
    try {
      const [elec, water] = await Promise.all([
        meterAPI
          .getPreviousReading(roomId)
          .then((r) => r.data?.previous_unit ?? 0),
        meterAPI
          .getPreviousReading(roomId + "?type=water")
          .then((r) => r.data?.previous_unit ?? 0)
          .catch(() => 0),
      ]);
      // Note: getPreviousReading ต้องส่ง type query — ใช้ getAll แทน
      const [eRes, wRes] = await Promise.all([
        meterAPI.getAll({ room_id: roomId, meter_type: "electric" }),
        meterAPI.getAll({ room_id: roomId, meter_type: "water" }),
      ]);
      const eReadings = eRes.data ?? [];
      const wReadings = wRes.data ?? [];
      const latestE = eReadings[0]?.current_unit ?? 0;
      const latestW = wReadings[0]?.current_unit ?? 0;
      setFormData((p) => ({
        ...p,
        room_id: roomId,
        elec_prev: String(latestE),
        water_prev: String(latestW),
      }));
    } catch {
      setFormData((p) => ({ ...p, room_id: roomId }));
    } finally {
      setLoadingPrev(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredReadings = readings.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = r.room_number?.toLowerCase().includes(q);
    const matchMonth =
      monthFilter === "all" || String(r.reading_month) === monthFilter;
    return matchSearch && matchMonth;
  });

  // ── Submit: สร้าง 2 records (ไฟ + น้ำ) หรือ update 1 record ────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingReading) {
        // Update mode: แก้แค่ record เดียว
        const isElec = editingReading.meter_type === "electric";
        const currentVal = isElec
          ? formData.elec_current
          : formData.water_current;
        const imageFile = isElec ? formData.elec_image : formData.water_image;
        await meterAPI.update(
          editingReading.reading_id,
          { current_unit: currentVal },
          imageFile ?? undefined,
        );
        toast.success("อัปเดตมิเตอร์เรียบร้อย");
      } else {
        // Create mode: ส่ง 2 records
        const base = {
          room_id: formData.room_id,
          reading_month: formData.month,
          reading_year: formData.year,
        };
        await Promise.all([
          meterAPI.create(
            {
              ...base,
              meter_type: "electric",
              current_unit: formData.elec_current,
            },
            formData.elec_image ?? undefined,
          ),
          meterAPI.create(
            {
              ...base,
              meter_type: "water",
              current_unit: formData.water_current,
            },
            formData.water_image ?? undefined,
          ),
        ]);
        toast.success("บันทึกมิเตอร์เรียบร้อย");
      }
      resetForm();
      fetchReadings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "บันทึกมิเตอร์ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (reading: MeterReading) => {
    setEditingReading(reading);
    const isElec = reading.meter_type === "electric";
    setFormData((p) => ({
      ...p,
      room_id: String(reading.room_id),
      month: String(reading.reading_month),
      year: String(reading.reading_year),
      elec_current: isElec ? String(reading.current_unit) : p.elec_current,
      elec_prev: isElec ? String(reading.previous_unit) : p.elec_prev,
      water_current: !isElec ? String(reading.current_unit) : p.water_current,
      water_prev: !isElec ? String(reading.previous_unit) : p.water_prev,
    }));
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingReading(null);
    setIsAddDialogOpen(false);
  };

  const set =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((p) => ({ ...p, [field]: e.target.value }));

  const currentYear = new Date().getFullYear();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">บันทึกมิเตอร์</h1>
          <p className="text-muted-foreground">
            บันทึกค่ามิเตอร์ไฟฟ้าและน้ำประปา
          </p>
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
              บันทึกมิเตอร์
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingReading ? "แก้ไขมิเตอร์" : "บันทึกมิเตอร์ใหม่"}
              </DialogTitle>
              <DialogDescription>
                {editingReading
                  ? "แก้ไขค่ามิเตอร์"
                  : "กรอกค่ามิเตอร์ไฟฟ้าและน้ำ (บันทึกพร้อมกัน)"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {/* ห้อง / เดือน / ปี */}
                <div className="grid grid-cols-3 gap-3">
                  <Field>
                    <FieldLabel>ห้อง</FieldLabel>
                    <Select
                      value={formData.room_id}
                      onValueChange={handleRoomChange}
                      disabled={!!editingReading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก" />
                      </SelectTrigger>
                      <SelectContent>
                        {occupiedRooms.map((r) => (
                          <SelectItem key={r.room_id} value={String(r.room_id)}>
                            {r.room_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>เดือน</FieldLabel>
                    <Select
                      value={formData.month}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, month: v }))
                      }
                      disabled={!!editingReading}
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
                      disabled={!!editingReading}
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

                {loadingPrev && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    กำลังโหลดค่าก่อนหน้า...
                  </div>
                )}

                {/* ไฟฟ้า */}
                {(!editingReading ||
                  editingReading.meter_type === "electric") && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      มิเตอร์ไฟฟ้า
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="elec_prev">เลขก่อนหน้า</FieldLabel>
                        <Input
                          id="elec_prev"
                          type="number"
                          value={formData.elec_prev}
                          onChange={set("elec_prev")}
                          placeholder="0"
                          readOnly={!editingReading}
                          className={!editingReading ? "bg-muted" : ""}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="elec_current">
                          เลขปัจจุบัน *
                        </FieldLabel>
                        <Input
                          id="elec_current"
                          type="number"
                          value={formData.elec_current}
                          onChange={set("elec_current")}
                          placeholder="0"
                          required
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel>รูปมิเตอร์ไฟ (ไม่บังคับ)</FieldLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            elec_image: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                    </Field>
                  </div>
                )}

                {/* น้ำ */}
                {(!editingReading || editingReading.meter_type === "water") && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      มิเตอร์น้ำ
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="water_prev">
                          เลขก่อนหน้า
                        </FieldLabel>
                        <Input
                          id="water_prev"
                          type="number"
                          value={formData.water_prev}
                          onChange={set("water_prev")}
                          placeholder="0"
                          readOnly={!editingReading}
                          className={!editingReading ? "bg-muted" : ""}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="water_current">
                          เลขปัจจุบัน *
                        </FieldLabel>
                        <Input
                          id="water_current"
                          type="number"
                          value={formData.water_current}
                          onChange={set("water_current")}
                          placeholder="0"
                          required={!editingReading}
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel>รูปมิเตอร์น้ำ (ไม่บังคับ)</FieldLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            water_image: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                    </Field>
                  </div>
                )}
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
                  {editingReading ? "บันทึก" : "บันทึกมิเตอร์"}
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
                placeholder="ค้นหาหมายเลขห้อง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="เดือนทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">เดือนทั้งหมด</SelectItem>
                {MONTHS.slice(1).map((m, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                <SelectItem value="electric">ไฟฟ้า</SelectItem>
                <SelectItem value="water">น้ำ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            รายการมิเตอร์
          </CardTitle>
          <CardDescription>
            ทั้งหมด {filteredReadings.length} รายการ
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
                  <TableHead>ประเภท</TableHead>
                  <TableHead>เดือน/ปี</TableHead>
                  <TableHead className="text-center">
                    ก่อนหน้า → ปัจจุบัน (ใช้)
                  </TableHead>
                  <TableHead className="text-right">อัตรา</TableHead>
                  <TableHead>บันทึกเมื่อ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReadings.map((r) => (
                  <TableRow key={r.reading_id}>
                    <TableCell className="font-medium">
                      {r.room_number}
                    </TableCell>
                    <TableCell>
                      {r.meter_type === "electric" ? (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Zap className="h-3 w-3" />
                          ไฟฟ้า
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-500">
                          <Droplets className="h-3 w-3" />
                          น้ำ
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {MONTHS[r.reading_month]} {r.reading_year}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      <span className="text-muted-foreground">
                        {r.previous_unit}
                      </span>
                      {" → "}
                      <span>{r.current_unit}</span>
                      <span className="text-primary ml-2 font-medium">
                        ({r.units_used})
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {r.rate_per_unit} บาท
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(r.recorded_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(r)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReadings.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      ไม่พบรายการมิเตอร์ที่ตรงกับการค้นหา
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
