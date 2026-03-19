"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Plus,
  Search,
  Gauge,
  Zap,
  Droplets,
  Pencil,
  Camera,
  CheckCircle,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";
import { meterAPI } from "@/lib/api/meter.api";
import { roomAPI } from "@/lib/api/room.api";
import { utilityRateAPI } from "@/lib/api/utilityRate.api";
import { toast } from "sonner";

const MONTHS = [
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

interface Room {
  room_id: number;
  room_number: string;
  status: string;
}

interface Reading {
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

// จัดกลุ่ม readings ตาม room+month+year
interface GroupedReading {
  key: string;
  room_id: number;
  room_number: string;
  reading_month: number;
  reading_year: number;
  electric: Reading | null;
  water: Reading | null;
}

const imgUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_API_URL ?? ""}/${path}`;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const now = new Date();

export default function MetersPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rates, setRates] = useState<{ electric: number; water: number }>({
    electric: 0,
    water: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingElectric, setEditingElectric] = useState<Reading | null>(null);
  const [editingWater, setEditingWater] = useState<Reading | null>(null);

  // Form
  const [roomId, setRoomId] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [elecPrev, setElecPrev] = useState("");
  const [elecCurr, setElecCurr] = useState("");
  const [waterPrev, setWaterPrev] = useState("");
  const [waterCurr, setWaterCurr] = useState("");

  // Images
  const [elecImage, setElecImage] = useState<File | null>(null);
  const [waterImage, setWaterImage] = useState<File | null>(null);
  const [elecPreview, setElecPreview] = useState<string | null>(null);
  const [waterPreview, setWaterPreview] = useState<string | null>(null);
  const elecRef = useRef<HTMLInputElement>(null);
  const waterRef = useRef<HTMLInputElement>(null);

  // Photo view dialog
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<GroupedReading | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [readRes, roomRes, rateRes] = await Promise.all([
        meterAPI.getAll(),
        roomAPI.getAll({ status: "occupied" }),
        utilityRateAPI.getCurrent(),
      ]);
      setReadings(readRes?.data ?? readRes ?? []);
      setRooms(roomRes?.data ?? roomRes ?? []);
      const rd = rateRes?.data ?? rateRes ?? {};
      setRates({
        electric: Number(rd.electric?.rate_per_unit ?? 0),
        water: Number(rd.water?.rate_per_unit ?? 0),
      });
    } catch {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // จัดกลุ่ม readings
  const grouped: GroupedReading[] = (() => {
    const map = new Map<string, GroupedReading>();
    readings.forEach((r) => {
      const key = `${r.room_id}-${r.reading_month}-${r.reading_year}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          room_id: r.room_id,
          room_number: r.room_number,
          reading_month: r.reading_month,
          reading_year: r.reading_year,
          electric: null,
          water: null,
        });
      }
      const g = map.get(key)!;
      if (r.meter_type === "electric") g.electric = r;
      else g.water = r;
    });
    return Array.from(map.values());
  })();

  const filtered = grouped.filter((g) => {
    const matchSearch = g.room_number
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchMonth =
      monthFilter === "all" || String(g.reading_month) === monthFilter;
    return matchSearch && matchMonth;
  });

  // Auto-fill previous unit เมื่อเลือกห้อง
  const handleRoomChange = async (rid: string) => {
    setRoomId(rid);
    setElecPrev("");
    setWaterPrev("");
    if (!rid) return;
    try {
      const [elec, water] = await Promise.all([
        meterAPI.getPreviousReading(rid).catch(() => null),
        // getPreviousReading ใช้ query ?type=
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/meters/rooms/${rid}/previous?type=water`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )
          .then((r) => r.json())
          .catch(() => null),
      ]);
      const elecData = elec?.data ?? elec;
      const waterData = water?.data ?? water;
      if (elecData?.previous_unit !== undefined)
        setElecPrev(String(elecData.previous_unit));
      if (waterData?.previous_unit !== undefined)
        setWaterPrev(String(waterData.previous_unit));
    } catch {}
  };

  const handleElecImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setElecImage(f);
    setElecPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleWaterImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setWaterImage(f);
    setWaterPreview(f ? URL.createObjectURL(f) : null);
  };

  const resetDialog = () => {
    setRoomId("");
    setMonth(String(now.getMonth() + 1));
    setYear(String(now.getFullYear()));
    setElecPrev("");
    setElecCurr("");
    setWaterPrev("");
    setWaterCurr("");
    setElecImage(null);
    setWaterImage(null);
    setElecPreview(null);
    setWaterPreview(null);
    setEditingElectric(null);
    setEditingWater(null);
    setDialogOpen(false);
  };

  const openEdit = (g: GroupedReading) => {
    setEditingElectric(g.electric);
    setEditingWater(g.water);
    setRoomId(String(g.room_id));
    setMonth(String(g.reading_month));
    setYear(String(g.reading_year));
    setElecPrev(String(g.electric?.previous_unit ?? ""));
    setElecCurr(String(g.electric?.current_unit ?? ""));
    setWaterPrev(String(g.water?.previous_unit ?? ""));
    setWaterCurr(String(g.water?.current_unit ?? ""));
    // แสดงรูปเดิม
    setElecPreview(imgUrl(g.electric?.image_path ?? null));
    setWaterPreview(imgUrl(g.water?.image_path ?? null));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!roomId) {
      toast.error("กรุณาเลือกห้อง");
      return;
    }
    if (!elecCurr && !waterCurr) {
      toast.error("กรุณากรอกค่ามิเตอร์อย่างน้อย 1 ประเภท");
      return;
    }

    const isEditing = !!(editingElectric || editingWater);
    const errors: string[] = [];

    if (elecCurr && Number(elecCurr) < Number(elecPrev))
      errors.push("ไฟฟ้า: ค่าปัจจุบันต้องมากกว่าก่อนหน้า");
    if (waterCurr && Number(waterCurr) < Number(waterPrev))
      errors.push("น้ำ: ค่าปัจจุบันต้องมากกว่าก่อนหน้า");
    if (errors.length) {
      toast.error(errors.join(" | "));
      return;
    }

    try {
      setSubmitting(true);

      // บันทึกไฟฟ้า
      if (elecCurr) {
        const data = {
          room_id: roomId,
          meter_type: "electric",
          reading_month: month,
          reading_year: year,
          current_unit: elecCurr,
        };
        if (editingElectric) {
          await meterAPI.update(
            editingElectric.reading_id,
            { current_unit: elecCurr },
            elecImage || undefined,
          );
        } else {
          await meterAPI.create(data, elecImage || undefined);
        }
      }

      // บันทึกน้ำ
      if (waterCurr) {
        const data = {
          room_id: roomId,
          meter_type: "water",
          reading_month: month,
          reading_year: year,
          current_unit: waterCurr,
        };
        if (editingWater) {
          await meterAPI.update(
            editingWater.reading_id,
            { current_unit: waterCurr },
            waterImage || undefined,
          );
        } else {
          await meterAPI.create(data, waterImage || undefined);
        }
      }

      toast.success(
        isEditing ? "อัปเดตมิเตอร์เรียบร้อย" : "บันทึกมิเตอร์เรียบร้อย",
      );
      resetDialog();
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const years = Array.from({ length: 3 }, (_, i) =>
    String(now.getFullYear() - i + 1),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">บันทึกมิเตอร์</h1>
          <p className="text-muted-foreground">
            บันทึกค่ามิเตอร์ไฟฟ้าและน้ำประปา
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          บันทึกมิเตอร์
        </Button>
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
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="เดือนทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">เดือนทั้งหมด</SelectItem>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
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
          <CardDescription>ทั้งหมด {filtered.length} รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ห้อง</TableHead>
                  <TableHead>เดือน/ปี</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      ไฟฟ้า (หน่วย)
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      น้ำ (หน่วย)
                    </div>
                  </TableHead>
                  <TableHead>บันทึกเมื่อ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((g) => (
                  <TableRow key={g.key}>
                    <TableCell className="font-medium">
                      {g.room_number}
                    </TableCell>
                    <TableCell>
                      {MONTHS[g.reading_month - 1]} {g.reading_year}
                    </TableCell>
                    <TableCell className="text-center">
                      {g.electric ? (
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <span className="text-muted-foreground">
                            {g.electric.previous_unit}
                          </span>
                          {" → "}
                          <span>{g.electric.current_unit}</span>
                          <span className="text-primary font-medium ml-1">
                            ({g.electric.units_used})
                          </span>
                          {/* ✅ badge รูป */}
                          {g.electric.image_path && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {g.water ? (
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <span className="text-muted-foreground">
                            {g.water.previous_unit}
                          </span>
                          {" → "}
                          <span>{g.water.current_unit}</span>
                          <span className="text-primary font-medium ml-1">
                            ({g.water.units_used})
                          </span>
                          {g.water.image_path && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(
                        g.electric?.recorded_at ?? g.water?.recorded_at ?? "",
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="ดูรูปภาพ"
                          onClick={() => {
                            setViewingGroup(g);
                            setPhotoDialogOpen(true);
                          }}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(g)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      ไม่พบรายการมิเตอร์
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) resetDialog();
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingElectric || editingWater
                ? "แก้ไขมิเตอร์"
                : "บันทึกมิเตอร์ใหม่"}
            </DialogTitle>
            <DialogDescription>
              กรอกค่ามิเตอร์ไฟฟ้าและน้ำประปา
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* Room / Month / Year */}
            <div className="grid grid-cols-3 gap-4">
              <Field className="col-span-1">
                <FieldLabel>ห้อง</FieldLabel>
                <Select
                  value={roomId}
                  onValueChange={handleRoomChange}
                  disabled={!!(editingElectric || editingWater)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกห้อง" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
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
                  value={month}
                  onValueChange={setMonth}
                  disabled={!!(editingElectric || editingWater)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
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
                  value={year}
                  onValueChange={setYear}
                  disabled={!!(editingElectric || editingWater)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Electricity */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-yellow-500" />
                มิเตอร์ไฟฟ้า
                <span className="text-muted-foreground ml-auto text-xs">
                  (อัตรา {rates.electric} บาท/หน่วย)
                </span>
                {(elecImage || elecPreview) && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>เลขก่อนหน้า</FieldLabel>
                  <Input
                    type="number"
                    value={elecPrev}
                    onChange={(e) => setElecPrev(e.target.value)}
                    placeholder="0"
                  />
                </Field>
                <Field>
                  <FieldLabel>เลขปัจจุบัน</FieldLabel>
                  <Input
                    type="number"
                    value={elecCurr}
                    onChange={(e) => setElecCurr(e.target.value)}
                    placeholder="0"
                  />
                </Field>
              </div>
              {/* รูปมิเตอร์ไฟ */}
              <div className="space-y-2">
                <FieldLabel>รูปมิเตอร์ไฟฟ้า (ไม่บังคับ)</FieldLabel>
                <input
                  ref={elecRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleElecImage}
                />
                {elecPreview ? (
                  <div className="relative">
                    <img
                      src={elecPreview}
                      alt="มิเตอร์ไฟ"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setElecImage(null);
                        setElecPreview(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => elecRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    อัปโหลดรูปมิเตอร์ไฟฟ้า
                  </Button>
                )}
              </div>
            </div>

            {/* Water */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Droplets className="h-4 w-4 text-blue-500" />
                มิเตอร์น้ำ
                <span className="text-muted-foreground ml-auto text-xs">
                  (อัตรา {rates.water} บาท/หน่วย)
                </span>
                {(waterImage || waterPreview) && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>เลขก่อนหน้า</FieldLabel>
                  <Input
                    type="number"
                    value={waterPrev}
                    onChange={(e) => setWaterPrev(e.target.value)}
                    placeholder="0"
                  />
                </Field>
                <Field>
                  <FieldLabel>เลขปัจจุบัน</FieldLabel>
                  <Input
                    type="number"
                    value={waterCurr}
                    onChange={(e) => setWaterCurr(e.target.value)}
                    placeholder="0"
                  />
                </Field>
              </div>
              {/* รูปมิเตอร์น้ำ */}
              <div className="space-y-2">
                <FieldLabel>รูปมิเตอร์น้ำ (ไม่บังคับ)</FieldLabel>
                <input
                  ref={waterRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleWaterImage}
                />
                {waterPreview ? (
                  <div className="relative">
                    <img
                      src={waterPreview}
                      alt="มิเตอร์น้ำ"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setWaterImage(null);
                        setWaterPreview(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => waterRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    อัปโหลดรูปมิเตอร์น้ำ
                  </Button>
                )}
              </div>
            </div>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={resetDialog}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingElectric || editingWater ? "บันทึก" : "บันทึกมิเตอร์"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo View Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              รูปมิเตอร์ห้อง {viewingGroup?.room_number} —{" "}
              {viewingGroup && MONTHS[viewingGroup.reading_month - 1]}{" "}
              {viewingGroup?.reading_year}
            </DialogTitle>
          </DialogHeader>
          {viewingGroup && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  มิเตอร์ไฟฟ้า
                </div>
                {viewingGroup.electric?.image_path ? (
                  <img
                    src={imgUrl(viewingGroup.electric.image_path) ?? ""}
                    alt="มิเตอร์ไฟ"
                    className="w-full rounded-lg object-contain max-h-64 bg-muted"
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">ไม่มีรูป</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  มิเตอร์น้ำ
                </div>
                {viewingGroup.water?.image_path ? (
                  <img
                    src={imgUrl(viewingGroup.water.image_path) ?? ""}
                    alt="มิเตอร์น้ำ"
                    className="w-full rounded-lg object-contain max-h-64 bg-muted"
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">ไม่มีรูป</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
