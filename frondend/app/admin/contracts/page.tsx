"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { FileText, Plus, Eye, XCircle, Loader2, Search } from "lucide-react";
import { contractAPI } from "@/lib/api/contract.api";
import { tenantAPI } from "@/lib/api/tenant.api";
import { roomAPI } from "@/lib/api/room.api";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Contract {
  contract_id: number;
  tenant_id: number;
  room_id: number;
  tenant_name: string;
  room_number: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  status: "active" | "expired" | "terminated";
  note: string | null;
}

interface FormData {
  tenant_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  rent_amount: string;
  deposit_amount: string;
  note: string;
}

const emptyForm: FormData = {
  tenant_id: "",
  room_id: "",
  start_date: "",
  end_date: "",
  rent_amount: "",
  deposit_amount: "",
  note: "",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-500",
  expired: "bg-red-500/10 text-red-500",
  terminated: "bg-muted text-muted-foreground",
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function ContractsPage() {
  const { t } = useLanguage();
  const formatCurrency = (n: number) =>
    n.toLocaleString("th-TH") + " " + t("contracts.baht");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  // ── Fetch contracts ───────────────────────────────────────────────────────
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== "all") params.status = filterStatus;
      const res = await contractAPI.getAll(params);
      setContracts(res.data ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t("contracts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  // ── Fetch tenants + available rooms for form ──────────────────────────────
  const fetchFormOptions = async () => {
    try {
      const [tRes, rRes] = await Promise.all([
        tenantAPI.getAll(),
        roomAPI.getAll({ status: "available" }),
      ]);
      setTenants(tRes.data ?? []);
      setAvailableRooms(rRes.data ?? []);
    } catch {
      /* ไม่ critical */
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);
  useEffect(() => {
    fetchFormOptions();
  }, []);

  // ── Filter client-side ────────────────────────────────────────────────────
  const filteredContracts = contracts.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.tenant_name?.toLowerCase().includes(q) ||
      c.room_number?.toLowerCase().includes(q) ||
      String(c.contract_id).includes(q)
    );
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalDeposit = contracts
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + Number(c.deposit_amount), 0);

  // ── Create contract ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contractAPI.create({
        tenant_id: parseInt(formData.tenant_id),
        room_id: parseInt(formData.room_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        rent_amount: formData.rent_amount
          ? parseFloat(formData.rent_amount)
          : undefined,
        deposit_amount: formData.deposit_amount
          ? parseFloat(formData.deposit_amount)
          : undefined,
        note: formData.note || undefined,
      });
      toast.success(t("contracts.createSuccess"));
      resetForm();
      fetchContracts();
      fetchFormOptions(); // refresh available rooms
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t("contracts.createError"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Terminate contract ────────────────────────────────────────────────────
  const handleTerminate = async (contract: Contract) => {
    if (
      !confirm(
        `${t("contracts.confirmTerminate")} ${contract.tenant_name} ${t("contracts.confirmTerminate2")} ${contract.room_number} ${t("contracts.confirmTerminate3")}`,
      )
    )
      return;
    try {
      const res = await contractAPI.terminate(contract.contract_id);
      toast.success(res.message ?? t("contracts.terminateSuccess"));
      setViewingContract(null);
      fetchContracts();
      fetchFormOptions();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? t("contracts.terminateError"),
      );
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setIsAddDialogOpen(false);
  };

  const set =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((p) => ({ ...p, [field]: e.target.value }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("contracts.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("contracts.subtitle")}
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
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t("contracts.new")}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("contracts.newTitle")}</DialogTitle>
              <DialogDescription>{t("contracts.newDesc")}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {/* ผู้เช่า */}
                <Field>
                  <FieldLabel>{t("contracts.tenant")}</FieldLabel>
                  <Select
                    value={formData.tenant_id}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, tenant_id: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("contracts.selectTenant")} />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((t) => (
                        <SelectItem
                          key={t.tenant_id}
                          value={String(t.tenant_id)}
                        >
                          {t.first_name} {t.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* ห้อง */}
                <Field>
                  <FieldLabel>{t("contracts.availableRoom")}</FieldLabel>
                  <Select
                    value={formData.room_id}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, room_id: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("contracts.selectRoom")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((r) => (
                        <SelectItem key={r.room_id} value={String(r.room_id)}>
                          {t("contracts.room")} {r.room_number} —{" "}
                          {r.base_rent?.toLocaleString("th-TH")}{" "}
                          {t("contracts.perMonth")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* วันที่ */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="start_date">
                      {t("contracts.startDate")}
                    </FieldLabel>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={set("start_date")}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="end_date">
                      {t("contracts.endDate")}
                    </FieldLabel>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={set("end_date")}
                      required
                    />
                  </Field>
                </div>

                {/* ค่าเช่า / เงินประกัน */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="rent_amount">
                      {t("contracts.rentAmountBaht")}
                    </FieldLabel>
                    <Input
                      id="rent_amount"
                      type="number"
                      value={formData.rent_amount}
                      onChange={set("rent_amount")}
                      placeholder={t("contracts.useRoomRent")}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="deposit_amount">
                      {t("contracts.depositBaht")}
                    </FieldLabel>
                    <Input
                      id="deposit_amount"
                      type="number"
                      value={formData.deposit_amount}
                      onChange={set("deposit_amount")}
                      placeholder="0"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="note">{t("common.note")}</FieldLabel>
                  <Input
                    id="note"
                    value={formData.note}
                    onChange={set("note")}
                    placeholder={t("contracts.noteExtra")}
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
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    submitting || !formData.tenant_id || !formData.room_id
                  }
                >
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("contracts.create")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("contracts.statsTotal")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("contracts.statsActive")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {contracts.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("contracts.statsExpiredOrTerminated")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {contracts.filter((c) => c.status !== "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("contracts.statsTotalDeposit")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDeposit.toLocaleString("th-TH")} {t("contracts.baht")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("contracts.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="active">
                  {t("status.active.label")}
                </SelectItem>
                <SelectItem value="expired">
                  {t("status.expired.label")}
                </SelectItem>
                <SelectItem value="terminated">
                  {t("status.terminated.label")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("common.loading")}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContracts.map((contract) => {
            const statusColor =
              statusColors[contract.status] ?? statusColors.expired;
            const statusKey = `status.${contract.status}.label` as string;
            return (
              <Card key={contract.contract_id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="bg-primary/10 p-3 rounded-lg h-fit">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-lg">
                              {contract.tenant_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {t("contracts.room")} {contract.room_number} • CNT
                              {String(contract.contract_id).padStart(3, "0")}
                            </p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {t("contracts.rentLabel")}{" "}
                                {Number(contract.rent_amount).toLocaleString(
                                  "th-TH",
                                )}{" "}
                                {t("contracts.baht")}
                              </span>
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {t("contracts.depositLabel")}{" "}
                                {Number(contract.deposit_amount).toLocaleString(
                                  "th-TH",
                                )}{" "}
                                {t("contracts.baht")}
                              </span>
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {formatDate(contract.start_date)} —{" "}
                                {formatDate(contract.end_date)}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${statusColor}`}
                          >
                            {t(statusKey)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setViewingContract(contract)}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {t("common.view")}
                        </span>
                      </Button>
                      {contract.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleTerminate(contract)}
                        >
                          <XCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {t("common.cancel")}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredContracts.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {t("contracts.notFound")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* View Dialog */}
      <Dialog
        open={!!viewingContract}
        onOpenChange={(open) => !open && setViewingContract(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("contracts.detailTitle")}</DialogTitle>
          </DialogHeader>
          {viewingContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {t("contracts.tenantName")}
                  </p>
                  <p className="font-medium">{viewingContract.tenant_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("contracts.room")}</p>
                  <p className="font-medium">{viewingContract.room_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("contracts.startDate")}
                  </p>
                  <p className="font-medium">
                    {formatDate(viewingContract.start_date)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("contracts.endDate")}
                  </p>
                  <p className="font-medium">
                    {formatDate(viewingContract.end_date)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("contracts.monthlyRent")}
                  </p>
                  <p className="font-medium">
                    {formatCurrency(Number(viewingContract.rent_amount))}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("contracts.deposit")}
                  </p>
                  <p className="font-medium">
                    {formatCurrency(Number(viewingContract.deposit_amount))}
                  </p>
                </div>
              </div>
              {viewingContract.note && (
                <div className="text-sm">
                  <p className="text-muted-foreground">{t("common.note")}</p>
                  <p>{viewingContract.note}</p>
                </div>
              )}
              {viewingContract.status === "active" && (
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => handleTerminate(viewingContract)}
                >
                  <XCircle className="w-4 h-4" />
                  {t("contracts.terminateAction")}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
