"use client";

import { useState, useEffect, useCallback } from "react";
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

const formatDate = (d: string) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Telegram broadcast
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [telegramMsg, setTelegramMsg] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await announcementAPI.getAll();
      setAnnouncements(res?.data ?? res ?? []);
    } catch {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("กรุณากรอกชื่อและเนื้อหา");
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
      toast.success("สร้างประกาศเรียบร้อย");
      setCreateOpen(false);
      setForm(emptyForm);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบประกาศนี้?")) return;
    try {
      await announcementAPI.delete(id);
      toast.success("ลบประกาศแล้ว");
      fetchAnnouncements();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleSendTelegram = async () => {
    if (!telegramMsg.trim()) {
      toast.error("กรุณาพิมพ์ข้อความ");
      return;
    }
    try {
      setTelegramLoading(true);
      const res = await telegramAPI.sendBroadcast(telegramMsg);
      const data = res?.data ?? res;
      toast.success(
        `ส่งข้อความเรียบร้อย (${data?.sent ?? 0}/${data?.total ?? 0} คน)`,
      );
      setTelegramOpen(false);
      setTelegramMsg("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "ส่งไม่สำเร็จ");
    } finally {
      setTelegramLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            แจ้งเตือน / ประกาศ
          </h1>
          <p className="text-muted-foreground">
            {announcements.length} ประกาศทั้งหมด
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTelegramOpen(true)}>
            <Send className="w-4 h-4 mr-2" />
            ส่ง Telegram
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            สร้างประกาศ
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
                <p className="text-muted-foreground text-center">
                  ยังไม่มีประกาศ
                </p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((a) => (
              <div
                key={a.announcement_id}
                className="flex gap-4 p-4 rounded-lg border bg-card transition-all hover:bg-muted/30"
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${typeColors[a.target_audience] ?? typeColors.all}`}
                >
                  {typeEmoji[a.target_audience] ?? "📢"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    {a.is_pinned && (
                      <Badge variant="secondary" className="text-xs">
                        ปักหมุด
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {a.target_audience === "all"
                        ? "ทุกคน"
                        : a.target_audience === "tenant"
                          ? "ผู้เช่า"
                          : "แอดมิน"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {a.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    โดย {a.published_by_name ?? "ผู้ดูแล"} ·{" "}
                    {formatDate(a.created_at)}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(a.announcement_id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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
            <DialogTitle>สร้างประกาศใหม่</DialogTitle>
            <DialogDescription>
              ประกาศจะแสดงให้ผู้เช่าเห็นทันที
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">กลุ่มเป้าหมาย</label>
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
                  <SelectItem value="all">ทุกคน</SelectItem>
                  <SelectItem value="tenant">ผู้เช่าเท่านั้น</SelectItem>
                  <SelectItem value="admin">แอดมินเท่านั้น</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">ชื่อประกาศ</label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="เช่น แจ้งปิดน้ำชั่วคราว"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">เนื้อหา</label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="รายละเอียดประกาศ..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              ยกเลิก
            </Button>
            <Button disabled={submitting} onClick={handleCreate}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              สร้างประกาศ
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
            <DialogTitle>ส่งข้อความ Telegram</DialogTitle>
            <DialogDescription>
              ส่งข้อความหาผู้เช่าทุกคนที่เชื่อมต่อ Telegram ไว้
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <label className="text-sm font-medium">ข้อความ</label>
            <Textarea
              value={telegramMsg}
              onChange={(e) => setTelegramMsg(e.target.value)}
              placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTelegramOpen(false)}>
              ยกเลิก
            </Button>
            <Button disabled={telegramLoading} onClick={handleSendTelegram}>
              {telegramLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              ส่งข้อความ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
