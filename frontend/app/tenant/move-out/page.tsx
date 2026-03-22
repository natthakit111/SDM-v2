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
import { useLanguage } from "@/context/language-context";
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

export default function MoveOutPage() {
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<MoveOutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ moveOutDate: "", reason: "" });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(language === "th" ? "th-TH" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const statusConfig = {
    pending: {
      label: t("status.pending"),
      icon: Clock,
      color: "text-yellow-500",
    },
    approved: {
      label: t("status.approved"),
      icon: CheckCircle,
      color: "text-green-500",
    },
    rejected: {
      label: t("status.rejected"),
      icon: XCircle,
      color: "text-destructive",
    },
  };

  const fetchRequests = () => {
    moveOutAPI
      .getAll()
      .then((r) => setRequests(r.data ?? []))
      .catch((err) => {
        if (err?.response?.status !== 404) {
          toast.error(t("moveout.loadError"));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const hasPending = requests.some((r) => r.status === "pending");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.moveOutDate || !formData.reason) {
      toast.error(t("settings.errorFillAll"));
      return;
    }
    const daysNotice = Math.ceil(
      (new Date(formData.moveOutDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysNotice < 30) {
      toast.error(t("moveout.notice30"));
      return;
    }
    setSubmitting(true);
    try {
      await moveOutAPI.create({
        move_out_date: formData.moveOutDate,
        reason: formData.reason,
      });
      toast.success(t("common.confirm"));
      setFormData({ moveOutDate: "", reason: "" });
      setIsDialogOpen(false);
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t("moveout.rejectError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("tenant.moveout.title")}</h1>
          <p className="text-muted-foreground">
            {t("tenant.moveout.subtitle")}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={hasPending}>
              <Plus className="h-4 w-4" />
              {hasPending
                ? t("tenant.moveout.hasPending")
                : t("moveout.request")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                {t("moveout.request")}
              </DialogTitle>
              <DialogDescription>{t("moveout.notice30")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">{t("moveout.notice30")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("moveout.fine")}
                    </p>
                  </div>
                </div>
                <Field>
                  <FieldLabel htmlFor="moveOutDate">
                    {t("moveout.moveOutDate")}
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
                  <FieldLabel htmlFor="reason">
                    {t("moveout.reason")}
                  </FieldLabel>
                  <Textarea
                    id="reason"
                    placeholder={t("moveout.reason")}
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
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("common.submit")}
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
            label: t("status.pending"),
            value: requests.filter((r) => r.status === "pending").length,
            color: "text-yellow-500",
          },
          {
            label: t("status.approved"),
            value: requests.filter((r) => r.status === "approved").length,
            color: "text-green-500",
          },
          {
            label: t("status.rejected"),
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
            {t("moveout.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("common.loading")}
            </div>
          ) : requests.length === 0 ? (
            // ✅ Empty state สำหรับ tenant ใหม่
            <div className="text-center py-12">
              <LogOut className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="font-medium text-muted-foreground">
                {t("empty.noMoveOut")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("empty.noMoveOutDesc")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.created")}</TableHead>
                  <TableHead>{t("moveout.moveOutDate")}</TableHead>
                  <TableHead>{t("moveout.reason")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.note")}</TableHead>
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
            {t("common.note")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">{t("moveout.notice30")}</span>
          </p>
          <p>
            <span className="font-medium">{t("moveout.fine")}</span>
          </p>
          <p>
            <span className="font-medium">{t("moveout.refund")}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
