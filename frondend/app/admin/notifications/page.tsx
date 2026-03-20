"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Trash2, Plus, Loader2, Send } from "lucide-react";
import { announcementAPI } from "@/lib/api/announcement.api";
import { telegramAPI } from "@/lib/api/telegram.api";
import { toast } from "sonner";

interface Announcement {
  announcement_id: number;
  title: string;
  content: string;
  target_audience: "all" | "admin" | "tenant";
  is_pinned: boolean;
  expires_at: string | null;
  published_by_name: string;
  created_at: string;
}

const typeColors: Record<string, string> = {
  all: "bg-blue-500/20 text-blue-400",
  tenant: "bg-green-500/20 text-green-400",
  admin: "bg-purple-500/20 text-purple-400",
};

const typeEmoji: Record<string, string> = {
  all: "📢",
  tenant: "🏠",
  admin: "🔧",
};

interface CreateForm {
  title: string;
  content: string;
  target_audience: string;
  is_pinned: boolean;
}

const emptyForm: CreateForm = {
  title: "",
  content: "",
  target_audience: "all",
  is_pinned: false,
};

export default function NotificationsPage() {
  const { t, language } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [telegramMsg, setTelegramMsg] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(language === "th" ? "th-TH" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await announcementAPI.getAll();
      setAnnouncements(res?.data ?? res ?? []);
    } catch {
      toast.error(t("common.noData"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error(t("common.noData"));
      return;
    }
    try {
      setSubmitting(true);
      await announcementAPI.create({
        title: form.title,
        content: form.content,
        target_audience: form.target_audience,
        is_pinned: form.is_pinned,
      });
      toast.success(t("announcements.create"));
      setCreateOpen(false);
      setForm(emptyForm);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t("common.noData"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("common.delete"))) return;
    try {
      await announcementAPI.delete(id);
      toast.success(t("common.delete"));
      fetchAnnouncements();
    } catch {
      toast.error(t("common.noData"));
    }
  };

  const handleSendTelegram = async () => {
    if (!telegramMsg.trim()) {
      toast.error(t("common.noData"));
      return;
    }
    try {
      setTelegramLoading(true);
      const res = await telegramAPI.sendBroadcast(telegramMsg);
      const data = res?.data ?? res;
      toast.success(
        `${t("common.submit")} (${data?.sent ?? 0}/${data?.total ?? 0})`,
      );
      setTelegramOpen(false);
      setTelegramMsg("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t("common.noData"));
    } finally {
      setTelegramLoading(false);
    }
  };

  const getAudienceLabel = (a: string) =>
    ({
      all: t("announcements.everyone"),
      tenant: t("announcements.tenantOnly"),
      admin: t("announcements.adminOnly"),
    })[a] ?? a;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("notifications.title")} / {t("announcements.title")}
          </h1>
          <p className="text-muted-foreground">
            {announcements.length} {t("announcements.title")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTelegramOpen(true)}>
            <Send className="w-4 h-4 mr-2" />
            Telegram
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("announcements.create")}
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {t("announcements.empty")}
                </p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((a) => (
              <div
                key={a.announcement_id}
                className="flex gap-4 p-4 rounded-lg border bg-card transition-all hover:bg-muted/30"
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${typeColors[a.target_audience] ?? typeColors.all}`}
                >
                  {typeEmoji[a.target_audience] ?? "📢"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="font-semibold">{a.title}</h3>
                    {a.is_pinned && (
                      <Badge variant="secondary" className="text-xs">
                        {t("announcements.pinned")}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {getAudienceLabel(a.target_audience)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {a.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {a.published_by_name ?? t("common.admin")} ·{" "}
                    {formatDate(a.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(a.announcement_id)}
                  className="text-destructive hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(o) => {
          if (!o) {
            setCreateOpen(false);
            setForm(emptyForm);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("announcements.create")}</DialogTitle>
            <DialogDescription>{t("announcements.subtitle")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t("announcements.audience")}
              </label>
              <Select
                value={form.target_audience}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, target_audience: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("announcements.everyone")}
                  </SelectItem>
                  <SelectItem value="tenant">
                    {t("announcements.tenantOnly")}
                  </SelectItem>
                  <SelectItem value="admin">
                    {t("announcements.adminOnly")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t("announcements.titleField")}
              </label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder={t("announcements.titleField")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t("announcements.content")}
              </label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder={t("announcements.content")}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button disabled={submitting} onClick={handleCreate}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {t("announcements.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Telegram Dialog */}
      <Dialog
        open={telegramOpen}
        onOpenChange={(o) => {
          if (!o) {
            setTelegramOpen(false);
            setTelegramMsg("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Telegram</DialogTitle>
            <DialogDescription>{t("notifications.title")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              {t("announcements.content")}
            </label>
            <Textarea
              value={telegramMsg}
              onChange={(e) => setTelegramMsg(e.target.value)}
              placeholder={t("announcements.content")}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTelegramOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button disabled={telegramLoading} onClick={handleSendTelegram}>
              {telegramLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {t("common.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
