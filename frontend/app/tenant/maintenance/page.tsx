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
import { Plus, CheckCircle, Loader2, Wrench } from "lucide-react";
import { maintenanceAPI } from "@/lib/api/maintenance.api";
import { useLanguage } from "@/context/language-context";
import { toast } from "sonner";

interface Request {
  request_id: number;
  category: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: string;
  created_at: string;
  admin_note: string | null;
}

export default function TenantMaintenancePage() {
  const { t, language } = useLanguage();
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

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(language === "th" ? "th-TH" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const fetchRequests = () => {
    maintenanceAPI
      .getMyRequests()
      .then((r) => setRequests(r.data ?? []))
      .catch((err) => {
        // 404 = ยังไม่มีรายการ (user ใหม่) — ไม่ต้อง toast
        if (err?.response?.status !== 404) {
          toast.error(t("maintenance.loadError"));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async () => {
    if (!formData.category || formData.description.length < 10) {
      toast.error(t("settings.errorFillAll"));
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
      toast.error(err?.response?.data?.message ?? t("maintenance.updateError"));
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: "ซ่อมแซม", label: language === "th" ? "ซ่อมแซม" : "Repair" },
    {
      value: "ทำความสะอาด",
      label: language === "th" ? "ทำความสะอาด" : "Cleaning",
    },
    { value: "ไฟฟ้า", label: language === "th" ? "ไฟฟ้า" : "Electrical" },
    { value: "ประปา", label: language === "th" ? "ประปา" : "Plumbing" },
    { value: "อื่นๆ", label: language === "th" ? "อื่นๆ" : "Other" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("tenant.maintenance.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("tenant.maintenance.subtitle")}
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
              {t("tenant.maintenance.new")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("tenant.maintenance.title")}</DialogTitle>
              <DialogDescription>
                {t("tenant.maintenance.subtitle")}
              </DialogDescription>
            </DialogHeader>

            {done ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="font-medium">{t("tenant.maintenance.success")}</p>
              </div>
            ) : (
              <FieldGroup>
                <Field>
                  <FieldLabel>{t("maintenance.colCategory")}</FieldLabel>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, category: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("maintenance.colCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>{t("maintenance.description")}</FieldLabel>
                  <Textarea
                    placeholder={t("maintenance.description")}
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
                  <FieldLabel>{t("maintenance.colPriority")}</FieldLabel>
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
                      <SelectItem value="low">{t("priority.low")}</SelectItem>
                      <SelectItem value="medium">
                        {t("priority.medium")}
                      </SelectItem>
                      <SelectItem value="high">{t("priority.high")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>
                    {t("meters.image")} ({t("common.note")})
                  </FieldLabel>
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
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("common.submit")}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t("common.all"), value: requests.length, color: "" },
          {
            label: t("status.in_progress"),
            value: requests.filter((r) => r.status === "in_progress").length,
            color: "text-blue-500",
          },
          {
            label: t("status.resolved"),
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

      <Card>
        <CardHeader>
          <CardTitle>{t("maintenance.listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("common.loading")}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="font-medium text-muted-foreground">
                {t("empty.noMaintenance")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("empty.noMaintenanceDesc")}
              </p>
            </div>
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
                            {t("maintenance.adminNote")}: {r.admin_note}
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
