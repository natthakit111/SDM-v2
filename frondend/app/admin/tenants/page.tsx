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
import { TenantStatusBadge } from "@/components/common/status-badge";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/mock-data";
import { tenantAPI } from "@/lib/api/tenant.api";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

interface Tenant {
  tenant_id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  id_card_number: string;
  phone: string;
  email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  room_number: string | null;
  room_id: number | null;
  contract_status: string | null;
  is_active: boolean;
  created_at: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  id_card_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

const emptyForm: FormData = {
  first_name: "",
  last_name: "",
  username: "",
  password: "",
  email: "",
  phone: "",
  id_card_number: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // ── Fetch tenants from API ───────────────────────────────────────────────
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tenantAPI.getAll({ search: searchQuery || undefined });
      setTenants(res.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "โหลดข้อมูลผู้เช่าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchTenants, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchTenants]);

  // ── Filter by contract status (client-side) ──────────────────────────────
  const filteredTenants = tenants.filter((t) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return t.contract_status === "active";
    if (statusFilter === "no_contract") return !t.contract_status;
    return true;
  });

  // ── Submit: Create or Update ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTenant) {
        // Update: only allowed fields
        await tenantAPI.update(editingTenant.tenant_id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          email: formData.email,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
        });
        toast.success("อัปเดตข้อมูลผู้เช่าเรียบร้อย");
      } else {
        // Create: requires username + password
        await tenantAPI.create({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          password: formData.password,
          id_card_number: formData.id_card_number,
          phone: formData.phone,
          email: formData.email || undefined,
          emergency_contact_name: formData.emergency_contact_name || undefined,
          emergency_contact_phone:
            formData.emergency_contact_phone || undefined,
        });
        toast.success("เพิ่มผู้เช่าใหม่เรียบร้อย");
      }
      resetForm();
      fetchTenants(); // reload list
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      username: tenant.username,
      password: "",
      email: tenant.email ?? "",
      phone: tenant.phone,
      id_card_number: tenant.id_card_number,
      emergency_contact_name: tenant.emergency_contact_name ?? "",
      emergency_contact_phone: tenant.emergency_contact_phone ?? "",
    });
    setIsAddDialogOpen(true);
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (tenant: Tenant) => {
    if (tenant.contract_status === "active") {
      toast.error("ไม่สามารถลบผู้เช่าที่กำลังเช่าอยู่ได้");
      return;
    }
    if (
      !confirm(`ต้องการลบ "${tenant.first_name} ${tenant.last_name}" หรือไม่?`)
    )
      return;
    try {
      await tenantAPI.delete(tenant.tenant_id);
      toast.success("ลบผู้เช่าเรียบร้อย");
      fetchTenants();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "ลบไม่สำเร็จ");
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingTenant(null);
    setIsAddDialogOpen(false);
  };

  const set =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">จัดการผู้เช่า</h1>
          <p className="text-muted-foreground">จัดการข้อมูลผู้เช่าทั้งหมด</p>
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
              เพิ่มผู้เช่า
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTenant ? "แก้ไขผู้เช่า" : "เพิ่มผู้เช่าใหม่"}
              </DialogTitle>
              <DialogDescription>
                {editingTenant
                  ? "แก้ไขข้อมูลผู้เช่า"
                  : "กรอกข้อมูลเพื่อเพิ่มผู้เช่าใหม่"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {/* ชื่อ - นามสกุล */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="first_name">ชื่อ</FieldLabel>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={set("first_name")}
                      placeholder="สมชาย"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="last_name">นามสกุล</FieldLabel>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={set("last_name")}
                      placeholder="ใจดี"
                      required
                    />
                  </Field>
                </div>

                {/* อีเมล - เบอร์โทร */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="email">อีเมล</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={set("email")}
                      placeholder="email@example.com"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">เบอร์โทรศัพท์</FieldLabel>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={set("phone")}
                      placeholder="081-234-5678"
                      required
                    />
                  </Field>
                </div>

                {/* เลขบัตร */}
                <Field>
                  <FieldLabel htmlFor="id_card_number">
                    เลขบัตรประชาชน
                  </FieldLabel>
                  <Input
                    id="id_card_number"
                    value={formData.id_card_number}
                    onChange={set("id_card_number")}
                    placeholder="1-2345-67890-12-3"
                    required
                    disabled={!!editingTenant}
                  />
                </Field>

                {/* เบอร์ฉุกเฉิน */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="emergency_contact_name">
                      ชื่อผู้ติดต่อฉุกเฉิน
                    </FieldLabel>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={set("emergency_contact_name")}
                      placeholder="ชื่อผู้ติดต่อ"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="emergency_contact_phone">
                      เบอร์ติดต่อฉุกเฉิน
                    </FieldLabel>
                    <Input
                      id="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={set("emergency_contact_phone")}
                      placeholder="089-111-2222"
                    />
                  </Field>
                </div>

                {/* Username + Password (เฉพาะเพิ่มใหม่) */}
                {!editingTenant && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="username">
                        ชื่อผู้ใช้ (Login)
                      </FieldLabel>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={set("username")}
                        placeholder="somchai01"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="password">รหัสผ่าน</FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={set("password")}
                        placeholder="••••••••"
                        required
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
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingTenant ? "บันทึก" : "เพิ่มผู้เช่า"}
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
                placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร หรือเลขบัตร..."
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
                <SelectItem value="active">มีสัญญาเช่า</SelectItem>
                <SelectItem value="no_contract">ยังไม่มีสัญญา</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            รายการผู้เช่า
          </CardTitle>
          <CardDescription>ทั้งหมด {filteredTenants.length} คน</CardDescription>
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
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>ติดต่อ</TableHead>
                  <TableHead>ห้อง</TableHead>
                  <TableHead>สถานะสัญญา</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.tenant_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {tenant.first_name} {tenant.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tenant.id_card_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {tenant.phone}
                        </div>
                        {tenant.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {tenant.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenant.room_number ? (
                        <span className="font-medium">
                          {tenant.room_number}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <TenantStatusBadge
                        status={
                          tenant.contract_status === "active"
                            ? "active"
                            : "pending"
                        }
                      />
                    </TableCell>
                    <TableCell>{formatDate(tenant.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tenant)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tenant)}
                          disabled={tenant.contract_status === "active"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTenants.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      ไม่พบผู้เช่าที่ตรงกับการค้นหา
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
