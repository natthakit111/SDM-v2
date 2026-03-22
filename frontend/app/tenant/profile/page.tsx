"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { authAPI } from "@/lib/api/auth.api";
import api from "@/lib/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Pencil,
  Send,
  LinkIcon,
  Unlink,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-context";

/* ── Telegram API helpers ── */
const telegramAPI = {
  getStatus: () => api.get("/telegram/status"),
  generateLink: () => api.post("/telegram/generate-link"),
  unlink: () => api.delete("/telegram/unlink"),
};

export default function TenantProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  /* ── Profile state ── */
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  /* ── Password state ── */
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  /* ── Telegram state ── */
  const [tgLinked, setTgLinked] = useState(false);
  const [tgChatId, setTgChatId] = useState<string | null>(null);
  const [tgDeepLink, setTgDeepLink] = useState<string | null>(null);
  const [tgLinkLoading, setTgLinkLoading] = useState(false);
  const [tgPolling, setTgPolling] = useState(false);
  const [tgUnlinkLoading, setTgUnlinkLoading] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Init ── */
  useEffect(() => {
    if (!user) return;
    const nameParts = (user.name || "").split(" ");
    setProfile({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    // load telegram status
    telegramAPI
      .getStatus()
      .then((r) => {
        setTgLinked(r.data?.data?.linked ?? false);
        setTgChatId(r.data?.data?.chat_id ?? null);
      })
      .catch(() => {});

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [user]);

  /* ── Password strength ── */
  const getStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(passwords.newPassword);
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-blue-500",
    "bg-green-500",
  ][strength];
  const strengthLabel = [
    "",
    "อ่อนมาก",
    "อ่อน",
    "ปานกลาง",
    "แข็งแรง",
    "แข็งแรงมาก",
  ][strength];

  /* ── Submit profile ── */
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    try {
      await authAPI.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
      });
      setProfileSuccess(true);
      toast.success("บันทึกข้อมูลสำเร็จ");
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Submit password ── */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน");
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword(
        passwords.currentPassword,
        passwords.newPassword,
      );
      setPasswordSuccess(true);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.message ?? "รหัสผ่านปัจจุบันไม่ถูกต้อง",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ── Generate Telegram link ── */
  const handleGenerateLink = async () => {
    setTgLinkLoading(true);
    try {
      const res = await telegramAPI.generateLink();
      const link = res.data?.data?.deepLink;
      setTgDeepLink(link);

      // Start polling ตรวจว่าเชื่อมแล้วหรือยัง (ทุก 3 วินาที นาน 10 นาที)
      setTgPolling(true);
      let attempts = 0;
      pollingRef.current = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await telegramAPI.getStatus();
          const linked = statusRes.data?.data?.linked;
          const chatId = statusRes.data?.data?.chat_id;
          if (linked) {
            setTgLinked(true);
            setTgChatId(chatId);
            setTgDeepLink(null);
            setTgPolling(false);
            clearInterval(pollingRef.current!);
            toast.success("เชื่อมต่อ Telegram สำเร็จ! 🎉");
          }
        } catch {}
        if (attempts >= 200) {
          // 10 นาที
          clearInterval(pollingRef.current!);
          setTgPolling(false);
        }
      }, 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setTgLinkLoading(false);
    }
  };

  /* ── Unlink Telegram ── */
  const handleUnlink = async () => {
    setTgUnlinkLoading(true);
    try {
      await telegramAPI.unlink();
      setTgLinked(false);
      setTgChatId(null);
      setTgDeepLink(null);
      if (pollingRef.current) clearInterval(pollingRef.current);
      setTgPolling(false);
      toast.success("ยกเลิกการเชื่อมต่อ Telegram แล้ว");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setTgUnlinkLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">โปรไฟล์</h1>
        <p className="text-muted-foreground mt-1">จัดการข้อมูลส่วนตัวของคุณ</p>
      </div>

      {/* Avatar card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold select-none">
              {(user?.name || user?.username || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold">
                {user?.name || user?.username}
              </p>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
              {user?.roomNumber && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                  ห้อง {user.roomNumber}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pencil className="h-5 w-5 text-primary" />
            ข้อมูลส่วนตัว
          </CardTitle>
          <CardDescription>แก้ไขชื่อ อีเมล และเบอร์โทรศัพท์</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit}>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="firstName">ชื่อ</FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="ชื่อจริง"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, firstName: e.target.value }))
                      }
                      disabled={profileLoading}
                      className="pl-9"
                    />
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">นามสกุล</FieldLabel>
                  <Input
                    id="lastName"
                    placeholder="นามสกุล"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, lastName: e.target.value }))
                    }
                    disabled={profileLoading}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="email">อีเมล</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, email: e.target.value }))
                    }
                    disabled={profileLoading}
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">เบอร์โทรศัพท์</FieldLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0xx-xxx-xxxx"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    disabled={profileLoading}
                    className="pl-9"
                  />
                </div>
              </Field>
              <Button
                type="submit"
                disabled={profileLoading}
                className="w-full sm:w-auto"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : profileSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    บันทึกแล้ว
                  </>
                ) : (
                  "บันทึกข้อมูล"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Telegram section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-[#2AABEE]" />
            การแจ้งเตือน Telegram
          </CardTitle>
          <CardDescription>
            เชื่อมต่อ Telegram เพื่อรับแจ้งเตือนบิล การชำระเงิน และข่าวสารหอพัก
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tgLinked ? (
            /* ── เชื่อมแล้ว ── */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    เชื่อมต่อแล้ว
                  </p>
                  {tgChatId && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Chat ID: {tgChatId}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                คุณจะได้รับแจ้งเตือนผ่าน Telegram สำหรับ: บิลใหม่,
                ยืนยันการชำระ, การแจ้งซ่อม และประกาศหอพัก
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlink}
                disabled={tgUnlinkLoading}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                {tgUnlinkLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังยกเลิก...
                  </>
                ) : (
                  <>
                    <Unlink className="mr-2 h-4 w-4" />
                    ยกเลิกการเชื่อมต่อ
                  </>
                )}
              </Button>
            </div>
          ) : tgDeepLink ? (
            /* ── รอ user กดลิงก์ ── */
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-3">
                <p className="text-sm font-medium">วิธีเชื่อมต่อ:</p>
                <ol className="text-sm text-muted-foreground space-y-1.5 list-none">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    กดปุ่ม "เปิด Telegram" ด้านล่าง
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    กด <strong>Start</strong> หรือ <strong>เริ่ม</strong> ใน
                    Telegram
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    กลับมาหน้านี้ — ระบบจะเชื่อมต่อให้อัตโนมัติ
                  </li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  asChild
                  className="flex-1 bg-[#2AABEE] hover:bg-[#2AABEE]/90"
                >
                  <a
                    href={tgDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    เปิด Telegram
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateLink}
                  disabled={tgLinkLoading}
                  title="สร้างลิงก์ใหม่"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {tgPolling && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  รอการเชื่อมต่อ... (ลิงก์หมดอายุใน 10 นาที)
                </div>
              )}
            </div>
          ) : (
            /* ── ยังไม่เชื่อม ── */
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm text-muted-foreground">
                  รับแจ้งเตือนผ่าน Telegram สำหรับ:
                </p>
                <ul className="text-sm space-y-1">
                  {[
                    "📄 บิลค่าเช่าใหม่",
                    "✅ ยืนยันการชำระเงิน",
                    "🔧 อัปเดตการแจ้งซ่อม",
                    "📢 ประกาศจากหอพัก",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={handleGenerateLink}
                disabled={tgLinkLoading}
                className="bg-[#2AABEE] hover:bg-[#2AABEE]/90 w-full sm:w-auto"
              >
                {tgLinkLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังสร้างลิงก์...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    เชื่อมต่อ Telegram
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            เปลี่ยนรหัสผ่าน
          </CardTitle>
          <CardDescription>ควรใช้รหัสผ่านที่คาดเดาได้ยาก</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword">
                  รหัสผ่านปัจจุบัน
                </FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    disabled={passwordLoading}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showCurrent ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="newPassword">รหัสผ่านใหม่</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwords.newPassword}
                    onChange={(e) => {
                      setPasswords((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }));
                      setPasswordError("");
                    }}
                    disabled={passwordLoading}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwords.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? strengthColor : "bg-muted"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ความแข็งแรง:{" "}
                      <span className="font-medium text-foreground">
                        {strengthLabel}
                      </span>
                    </p>
                  </div>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  ยืนยันรหัสผ่านใหม่
                </FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwords.confirmPassword}
                    onChange={(e) => {
                      setPasswords((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }));
                      setPasswordError("");
                    }}
                    disabled={passwordLoading}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwords.confirmPassword && (
                  <p
                    className={`text-xs mt-1 ${passwords.newPassword === passwords.confirmPassword ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                  >
                    {passwords.newPassword === passwords.confirmPassword
                      ? "✓ รหัสผ่านตรงกัน"
                      : "✗ รหัสผ่านไม่ตรงกัน"}
                  </p>
                )}
              </Field>
              {passwordError && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
              <Button
                type="submit"
                disabled={
                  passwordLoading ||
                  !passwords.currentPassword ||
                  !passwords.newPassword ||
                  !passwords.confirmPassword ||
                  passwords.newPassword !== passwords.confirmPassword
                }
                className="w-full sm:w-auto"
                variant="outline"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังเปลี่ยน...
                  </>
                ) : passwordSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    เปลี่ยนแล้ว
                  </>
                ) : (
                  "เปลี่ยนรหัสผ่าน"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
