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
import { RoomStatusBadge } from "@/components/common/status-badge";
import { Plus, Search, Pencil, Trash2, DoorOpen, Loader2 } from "lucide-react";
import { roomAPI } from "@/lib/api/room.api";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Room {
  room_id: number;
  room_number: string;
  floor: number;
  room_type: string;
  area_sqm: number | null;
  base_rent: number;
  status: "available" | "occupied" | "maintenance";
  description: string | null;
}

interface FormData {
  room_number: string;
  floor: string;
  room_type: string;
  base_rent: string;
  area_sqm: string;
  status: "available" | "occupied" | "maintenance";
  description: string;
}

const emptyForm: FormData = {
  room_number: "",
  floor: "1",
  room_type: "standard",
  base_rent: "",
  area_sqm: "",
  status: "available",
  description: "",
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);

// ── Component ──────────────────────────────────────────────────────────────────

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await roomAPI.getAll(
        statusFilter !== "all" ? { status: statusFilter } : undefined,
      );
      setRooms(res.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "โหลดข้อมูลห้องไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ── Filter search client-side ──────────────────────────────────────────────
  const filteredRooms = rooms.filter((r) =>
    r.room_number.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        room_number: formData.room_number,
        floor: parseInt(formData.floor),
        room_type: formData.room_type,
        base_rent: parseFloat(formData.base_rent),
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : undefined,
        status: formData.status,
        description: formData.description || undefined,
      };

      if (editingRoom) {
        await roomAPI.update(editingRoom.room_id, payload);
        toast.success("อัปเดตข้อมูลห้องเรียบร้อย");
      } else {
        await roomAPI.create(payload);
        toast.success("เพิ่มห้องใหม่เรียบร้อย");
      }
      resetForm();
      fetchRooms();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      floor: room.floor.toString(),
      room_type: room.room_type,
      base_rent: room.base_rent.toString(),
      area_sqm: room.area_sqm?.toString() ?? "",
      status: room.status,
      description: room.description ?? "",
    });
    setIsAddDialogOpen(true);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (room: Room) => {
    if (room.status === "occupied") {
      toast.error("ไม่สามารถลบห้องที่มีผู้เช่าอยู่ได้");
      return;
    }
    if (!confirm(`ต้องการลบห้อง ${room.room_number} หรือไม่?`)) return;
    try {
      await roomAPI.delete(room.room_id);
      toast.success("ลบห้องเรียบร้อย");
      fetchRooms();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "ลบไม่สำเร็จ");
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingRoom(null);
    setIsAddDialogOpen(false);
  };

  const set =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">จัดการห้องพัก</h1>
          <p className="text-muted-foreground">จัดการห้องพักทั้งหมดในระบบ</p>
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
              เพิ่มห้อง
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingRoom ? "แก้ไขห้อง" : "เพิ่มห้องใหม่"}
              </DialogTitle>
              <DialogDescription>
                {editingRoom
                  ? "แก้ไขข้อมูลห้องพัก"
                  : "กรอกข้อมูลเพื่อเพิ่มห้องใหม่"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="room_number">หมายเลขห้อง</FieldLabel>
                    <Input
                      id="room_number"
                      value={formData.room_number}
                      onChange={set("room_number")}
                      placeholder="เช่น 101"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>ชั้น</FieldLabel>
                    <Select
                      value={formData.floor}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, floor: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((f) => (
                          <SelectItem key={f} value={f.toString()}>
                            ชั้น {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>ประเภทห้อง</FieldLabel>
                    <Select
                      value={formData.room_type}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, room_type: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">ห้องมาตรฐาน</SelectItem>
                        <SelectItem value="deluxe">ห้องดีลักซ์</SelectItem>
                        <SelectItem value="suite">ห้องสวีท</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>สถานะ</FieldLabel>
                    <Select
                      value={formData.status}
                      onValueChange={(v) =>
                        setFormData((p) => ({
                          ...p,
                          status: v as FormData["status"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">ว่าง</SelectItem>
                        <SelectItem value="occupied">มีผู้เช่า</SelectItem>
                        <SelectItem value="maintenance">ซ่อมบำรุง</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="base_rent">
                      ค่าเช่า/เดือน (บาท)
                    </FieldLabel>
                    <Input
                      id="base_rent"
                      type="number"
                      value={formData.base_rent}
                      onChange={set("base_rent")}
                      placeholder="4500"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="area_sqm">พื้นที่ (ตร.ม.)</FieldLabel>
                    <Input
                      id="area_sqm"
                      type="number"
                      value={formData.area_sqm}
                      onChange={set("area_sqm")}
                      placeholder="28"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="description">หมายเหตุ</FieldLabel>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={set("description")}
                    placeholder="รายละเอียดเพิ่มเติม"
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
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingRoom ? "บันทึก" : "เพิ่มห้อง"}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="สถานะทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="available">ว่าง</SelectItem>
                <SelectItem value="occupied">มีผู้เช่า</SelectItem>
                <SelectItem value="maintenance">ซ่อมบำรุง</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            รายการห้องพัก
          </CardTitle>
          <CardDescription>ทั้งหมด {filteredRooms.length} ห้อง</CardDescription>
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
                  <TableHead>ชั้น</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>พื้นที่</TableHead>
                  <TableHead>ค่าเช่า</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.room_id}>
                    <TableCell className="font-medium">
                      {room.room_number}
                    </TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell>{room.room_type}</TableCell>
                    <TableCell>
                      {room.area_sqm ? `${room.area_sqm} ตร.ม.` : "-"}
                    </TableCell>
                    <TableCell>{formatCurrency(room.base_rent)}</TableCell>
                    <TableCell>
                      <RoomStatusBadge status={room.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(room)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(room)}
                          disabled={room.status === "occupied"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRooms.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      ไม่พบห้องพักที่ตรงกับการค้นหา
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
