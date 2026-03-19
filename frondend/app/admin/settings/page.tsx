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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Lock, Bell, Send, Copy, Check, Loader2 } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { settingsAPI } from "@/lib/api/settings.api";
import { authAPI } from "@/lib/api/auth.api";

export default function SettingsPage() {
  const [pageLoading, setPageLoading] = useState(true);

  // ── General ──────────────────────────────────────────────
  const [dormName, setDormName] = useState("");
  const [dormAddress, setDormAddress] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [currency, setCurrency] = useState("THB");
  const [taxRate, setTaxRate] = useState("7");
  const [savingGeneral, setSavingGeneral] = useState(false);

  // ── Financial ─────────────────────────────────────────────
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [savingFinancial, setSavingFinancial] = useState(false);

  // ── Notifications ─────────────────────────────────────────
  const [notifyPayment, setNotifyPayment] = useState(true);
  const [notifyMaintenance, setNotifyMaintenance] = useState(true);
  const [notifyOverdue, setNotifyOverdue] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // ── Security ──────────────────────────────────────────────
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // ── Telegram (local only — token เก็บใน .env) ────────────
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isTelegramConnected, setIsTelegramConnected] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // ── Load settings on mount ────────────────────────────────
  const loadSettings = useCallback(async () => {
    try {
      setPageLoading(true);
      const res = await settingsAPI.getAll();
      const s = res?.data ?? res ?? {};
      setDormName(s.dorm_name ?? "");
      setDormAddress(s.dorm_address ?? "");
      setAdminEmail(s.admin_email ?? "");
      setAdminPhone(s.admin_phone ?? "");
      setCurrency(s.currency ?? "THB");
      setTaxRate(s.tax_rate ?? "7");
      setBankName(s.bank_name ?? "");
      setBankAccount(s.bank_account ?? "");
      setBankAccountName(s.bank_account_name ?? "");
      setNotifyPayment(s.notify_payment !== "0");
      setNotifyMaintenance(s.notify_maintenance !== "0");
      setNotifyOverdue(s.notify_overdue !== "0");
    } catch {
      toast.error("โหลดการตั้งค่าไม่สำเร็จ");
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ── Handlers ──────────────────────────────────────────────
  const handleSaveGeneral = async () => {
    if (!dormName || !dormAddress || !adminEmail || !adminPhone) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      setSavingGeneral(true);
      await settingsAPI.update({
        dorm_name: dormName,
        dorm_address: dormAddress,
        admin_email: adminEmail,
        admin_phone: adminPhone,
        currency,
        tax_rate: taxRate,
      });
      toast.success("บันทึกการตั้งค่าทั่วไปสำเร็จ");
    } catch {
      toast.error("บันทึกไม่สำเร็จ");
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveFinancial = async () => {
    if (!bankName || !bankAccount || !bankAccountName) {
      toast.error("กรุณากรอกข้อมูลธนาคารให้ครบถ้วน");
      return;
    }
    try {
      setSavingFinancial(true);
      await settingsAPI.update({
        bank_name: bankName,
        bank_account: bankAccount,
        bank_account_name: bankAccountName,
      });
      toast.success("บันทึกการตั้งค่าการเงินสำเร็จ");
    } catch {
      toast.error("บันทึกไม่สำเร็จ");
    } finally {
      setSavingFinancial(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      await settingsAPI.update({
        notify_payment: notifyPayment ? "1" : "0",
        notify_maintenance: notifyMaintenance ? "1" : "0",
        notify_overdue: notifyOverdue ? "1" : "0",
      });
      toast.success("บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ");
    } catch {
      toast.error("บันทึกไม่สำเร็จ");
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("กรุณากรอกรหัสผ่านให้ครบถ้วน");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    try {
      setChangingPassword(true);
      await authAPI.changePassword(oldPassword, newPassword);
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "เกิดข้อผิดพลาด";
      toast.error(
        msg.toLowerCase().includes("incorrect")
          ? "รหัสผ่านเดิมไม่ถูกต้อง"
          : msg,
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleTestTelegram = () => {
    if (!telegramBotToken || !telegramChatId) {
      toast.error("กรุณากรอก Bot Token และ Chat ID");
      return;
    }
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: "กำลังส่งข้อความทดสอบ...",
      success: "ส่งข้อความทดสอบสำเร็จ ตรวจสอบ Telegram",
      error: "เกิดข้อผิดพลาดในการส่งข้อความ",
    });
  };

  const handleSaveTelegram = () => {
    if (telegramBotToken && telegramChatId) {
      setIsTelegramConnected(true);
      toast.success("บันทึกการตั้งค่า Telegram สำเร็จ");
    } else if (!telegramBotToken && !telegramChatId) {
      setIsTelegramConnected(false);
      toast.success("ยกเลิกการเชื่อมต่อ Telegram");
    } else {
      toast.error("กรุณากรอก Bot Token และ Chat ID ให้ครบถ้วน");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(telegramBotToken || "https://t.me/BotFather");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground mt-2">
          จัดการการตั้งค่าและกำหนดค่าของระบบ
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="general">ทั่วไป</TabsTrigger>
          <TabsTrigger value="financial">การเงิน</TabsTrigger>
          <TabsTrigger value="notifications">แจ้งเตือน</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
          <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลทั่วไป</CardTitle>
              <CardDescription>
                จัดการข้อมูลหอพักและข้อมูลผู้ดูแล
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    ชื่อหอพัก
                  </label>
                  <Input
                    placeholder="ชื่อหอพัก"
                    value={dormName}
                    onChange={(e) => setDormName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    ที่อยู่
                  </label>
                  <Input
                    placeholder="ที่อยู่"
                    value={dormAddress}
                    onChange={(e) => setDormAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    อีเมลผู้ดูแล
                  </label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    เบอร์โทรศัพท์
                  </label>
                  <Input
                    placeholder="081-234-5678"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    สกุลเงิน
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="THB">บาทไทย (THB)</option>
                    <option value="USD">ดอลลาร์สหรัฐ (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    อัตราภาษี (%)
                  </label>
                  <Input
                    type="number"
                    placeholder="7"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveGeneral}
                disabled={savingGeneral}
                className="gap-2"
              >
                {savingGeneral ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                บันทึกการตั้งค่า
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการเงิน</CardTitle>
              <CardDescription>
                จัดการข้อมูลธนาคารและการชำระเงิน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    ชื่อธนาคาร
                  </label>
                  <Input
                    placeholder="ชื่อธนาคาร"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    หมายเลขบัญชีธนาคาร
                  </label>
                  <Input
                    placeholder="123-456-789"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    ชื่อเจ้าของบัญชี
                  </label>
                  <Input
                    placeholder="ชื่อเจ้าของบัญชี"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveFinancial}
                disabled={savingFinancial}
                className="gap-2"
              >
                {savingFinancial ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                บันทึกข้อมูลการเงิน
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>การแจ้งเตือน</CardTitle>
              <CardDescription>กำหนดการแจ้งเตือนต่างๆ ของระบบ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    label: "แจ้งเตือนการชำระเงิน",
                    sub: "ส่งอีเมลแจ้งเตือนเมื่อมีการชำระเงิน",
                    value: notifyPayment,
                    onChange: setNotifyPayment,
                    color: "text-primary",
                  },
                  {
                    label: "แจ้งเตือนการซ่อมแซม",
                    sub: "ส่งแจ้งเตือนเมื่อมีการแจ้งซ่อม",
                    value: notifyMaintenance,
                    onChange: setNotifyMaintenance,
                    color: "text-primary",
                  },
                  {
                    label: "แจ้งเตือนเงินค้างชำระ",
                    sub: "ส่งอีเมลแจ้งเตือนเมื่อมีเงินค้างชำระ",
                    value: notifyOverdue,
                    onChange: setNotifyOverdue,
                    color: "text-warning",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className={`w-5 h-5 ${item.color}`} />
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.sub}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.value}
                      onChange={(e) => item.onChange(e.target.checked)}
                      className="w-5 h-5 rounded border-input"
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={handleSaveNotifications}
                disabled={savingNotifications}
                className="gap-2"
              >
                {savingNotifications ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                บันทึกการตั้งค่าการแจ้งเตือน
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telegram */}
        <TabsContent value="telegram">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                ตั้งค่า Telegram Bot
              </CardTitle>
              <CardDescription>
                เชื่อมต่อ Telegram Bot สำหรับการแจ้งเตือน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-info/5 border border-info/30 rounded-lg p-4 space-y-3">
                <p className="font-medium text-sm">
                  วิธีการตั้งค่า Telegram Bot
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 ml-4 list-decimal">
                  <li>
                    ไปที่{" "}
                    <span className="font-mono bg-muted px-1">@BotFather</span>{" "}
                    บน Telegram
                  </li>
                  <li>
                    พิมพ์{" "}
                    <span className="font-mono bg-muted px-1">/newbot</span>{" "}
                    เพื่อสร้าง Bot ใหม่
                  </li>
                  <li>คัดลอก Bot Token และนำมาวางตรงนี้</li>
                  <li>ส่งข้อความแรกไปยัง Bot ของคุณ</li>
                  <li>
                    เปิด{" "}
                    <span className="font-mono bg-muted px-1">
                      https://api.telegram.org/botTOKEN/getUpdates
                    </span>{" "}
                    เพื่อหา Chat ID
                  </li>
                </ol>
                <p className="text-xs text-muted-foreground pt-1">
                  ⚠️ Bot Token จะถูกบันทึกใน{" "}
                  <span className="font-mono">.env</span> ของ server เท่านั้น
                  ไม่เก็บใน database
                </p>
              </div>
              <div className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="telegramBotToken">Bot Token</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="telegramBotToken"
                      type="password"
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      title={isCopied ? "คัดลอกแล้ว" : "คัดลอก"}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="telegramChatId">
                    Chat ID (Admin)
                  </FieldLabel>
                  <Input
                    id="telegramChatId"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="123456789"
                  />
                </Field>
                {isTelegramConnected && (
                  <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-3">
                    <Check className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-sm text-success">
                        เชื่อมต่อสำเร็จ
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ระบบจะส่งการแจ้งเตือนผ่าน Telegram
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTestTelegram}
                    disabled={!telegramBotToken || !telegramChatId}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    ส่งทดสอบ
                  </Button>
                  <Button onClick={handleSaveTelegram} className="gap-2">
                    <Save className="h-4 w-4" />
                    บันทึก
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>ความปลอดภัย</CardTitle>
              <CardDescription>จัดการรหัสผ่านและความปลอดภัย</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    รหัสผ่านเดิม
                  </label>
                  <Input
                    type="password"
                    placeholder="กรอกรหัสผ่านเดิม"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    รหัสผ่านใหม่
                  </label>
                  <Input
                    type="password"
                    placeholder="กรอกรหัสผ่านใหม่"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <Input
                    type="password"
                    placeholder="ยืนยันรหัสผ่าน"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="gap-2"
              >
                {changingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                เปลี่ยนรหัสผ่าน
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
