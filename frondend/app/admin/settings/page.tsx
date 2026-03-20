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
import { Save, Bell, Send, Copy, Check, Loader2 } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { settingsAPI } from "@/lib/api/settings.api";
import { telegramAPI } from "@/lib/api/telegram.api";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";

export default function SettingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);

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

  // ── Telegram ──────────────────────────────────────────────
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isTelegramConnected, setIsTelegramConnected] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [linkingTelegram, setLinkingTelegram] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "";

  // ── Load settings on mount ────────────────────────────────
  const loadSettings = useCallback(async () => {
    try {
      setPageLoading(true);
      const res = await settingsAPI.getAll();
      const s = res?.data ?? res ?? {};
      setBankName(s.bank_name ?? "");
      setBankAccount(s.bank_account ?? "");
      setBankAccountName(s.bank_account_name ?? "");
      setNotifyPayment(s.notify_payment !== "0");
      setNotifyMaintenance(s.notify_maintenance !== "0");
      setNotifyOverdue(s.notify_overdue !== "0");
    } catch {
      toast.error(t("settings.loadError"));
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    // ตรวจสอบสถานะ Telegram จาก user context
    if (user?.telegramId) {
      setIsTelegramConnected(true);
      setTelegramChatId(String(user.telegramId));
    }
  }, [loadSettings, user]);

  // ── Handlers ──────────────────────────────────────────────
  const handleSaveFinancial = async () => {
    if (!bankName || !bankAccount || !bankAccountName) {
      toast.error(t("settings.errorFillBank"));
      return;
    }
    try {
      setSavingFinancial(true);
      await settingsAPI.update({
        bank_name: bankName,
        bank_account: bankAccount,
        bank_account_name: bankAccountName,
      });
      toast.success(t("settings.financialSaveSuccess"));
    } catch {
      toast.error(t("settings.saveError"));
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
      toast.success(t("settings.notifySaveSuccess"));
    } catch {
      toast.error(t("settings.saveError"));
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleLinkTelegram = async () => {
    if (!telegramChatId.trim()) {
      toast.error(t("settings.tgChatIdRequired"));
      return;
    }
    try {
      setLinkingTelegram(true);
      await telegramAPI.linkAdmin(telegramChatId);
      setIsTelegramConnected(true);
      toast.success(t("settings.telegramConnected"));
    } catch {
      toast.error(t("settings.saveError"));
    } finally {
      setLinkingTelegram(false);
    }
  };

  const handleUnlinkTelegram = async () => {
    if (!confirm(t("settings.telegramUnlinkConfirm"))) return;
    try {
      await telegramAPI.unlinkAdmin();
      setIsTelegramConnected(false);
      setTelegramChatId("");
      toast.success(t("settings.telegramDisconnected"));
    } catch {
      toast.error(t("settings.saveError"));
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) {
      toast.error(t("settings.telegramBroadcastRequired"));
      return;
    }
    try {
      setBroadcasting(true);
      const res = await telegramAPI.broadcast(broadcastMsg);
      const count = res?.data?.sent ?? 0;
      toast.success(
        t("settings.telegramBroadcastSuccess").replace("{n}", count),
      );
      setBroadcastMsg("");
    } catch {
      toast.error(t("settings.telegramBroadcastError"));
    } finally {
      setBroadcasting(false);
    }
  };

  const copyBotLink = () => {
    navigator.clipboard.writeText(`https://t.me/${botUsername}`);
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
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="financial">
            {t("settings.tabFinancial")}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            {t("settings.tabNotifications")}
          </TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
        </TabsList>

        {/* Financial */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.financialTitle")}</CardTitle>
              <CardDescription>{t("settings.financialDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {t("settings.bankName")}
                  </label>
                  <Input
                    placeholder={t("settings.bankName")}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {t("settings.bankAccount")}
                  </label>
                  <Input
                    placeholder="123-456-789"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {t("settings.bankAccountName")}
                  </label>
                  <Input
                    placeholder={t("settings.bankAccountName")}
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
                {t("settings.saveFinancial")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifyTitle")}</CardTitle>
              <CardDescription>{t("settings.notifyDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    labelKey: "settings.notifyPayment",
                    subKey: "settings.notifyPaymentSub",
                    value: notifyPayment,
                    onChange: setNotifyPayment,
                    color: "text-primary",
                  },
                  {
                    labelKey: "settings.notifyMaintenance",
                    subKey: "settings.notifyMaintenanceSub",
                    value: notifyMaintenance,
                    onChange: setNotifyMaintenance,
                    color: "text-primary",
                  },
                  {
                    labelKey: "settings.notifyOverdue",
                    subKey: "settings.notifyOverdueSub",
                    value: notifyOverdue,
                    onChange: setNotifyOverdue,
                    color: "text-warning",
                  },
                ].map((item) => (
                  <div
                    key={item.labelKey}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className={`w-5 h-5 ${item.color}`} />
                      <div>
                        <p className="font-medium">{t(item.labelKey)}</p>
                        <p className="text-sm text-muted-foreground">
                          {t(item.subKey)}
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
                {t("settings.saveNotifications")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telegram */}
        <TabsContent value="telegram" className="space-y-4">
          {/* Step 1: Setup Bot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                {t("settings.telegramStep1Title")}
              </CardTitle>
              <CardDescription>
                {t("settings.telegramStep1Desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                1. {t("settings.tgInstruct1")}{" "}
                <span className="font-mono bg-muted px-1 rounded text-foreground">
                  @BotFather
                </span>{" "}
                {t("settings.tgInstruct1b")}
              </p>
              <p>
                2. {t("settings.tgInstruct2")}{" "}
                <span className="font-mono bg-muted px-1 rounded text-foreground">
                  /newbot
                </span>
              </p>
              <p>3. {t("settings.tgInstruct3")}</p>
              <p>
                4. {t("settings.tgInstruct4")}{" "}
                <span className="font-mono bg-muted px-1 rounded text-foreground">
                  TELEGRAM_BOT_TOKEN=xxx
                </span>
              </p>

              {botUsername && (
                <div className="flex items-center gap-2 pt-2">
                  <span>{t("settings.tgBotUsername")}:</span>
                  <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground">
                    @{botUsername}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={copyBotLink}
                  >
                    {isCopied ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Link Admin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </span>
                {t("settings.telegramStep2Title")}
              </CardTitle>
              <CardDescription>
                {t("settings.telegramStep2Desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isTelegramConnected ? (
                <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-sm text-success">
                        {t("settings.telegramConnected")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chat ID: {telegramChatId}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlinkTelegram}
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    {t("settings.telegramUnlink")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{t("settings.tgLinkHowTo")}</p>
                    <p>
                      1. {t("settings.tgLinkStep1")}{" "}
                      {botUsername && (
                        <span className="font-mono bg-muted px-1 rounded text-foreground">
                          @{botUsername}
                        </span>
                      )}
                    </p>
                    <p>
                      2. {t("settings.tgLinkStep2")}{" "}
                      <span className="font-mono bg-muted px-1 rounded text-foreground">
                        /start {user?.username}
                      </span>
                    </p>
                    <p>
                      3. {t("settings.tgLinkStep3")}{" "}
                      <span className="font-mono bg-muted px-1 rounded text-foreground">
                        @userinfobot
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("settings.tgChatIdPlaceholder")}
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                    />
                    <Button
                      onClick={handleLinkTelegram}
                      disabled={linkingTelegram}
                      className="gap-2 shrink-0"
                    >
                      {linkingTelegram ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {t("settings.telegramLink")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Tenant Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </span>
                {t("settings.telegramStep3Title")}
              </CardTitle>
              <CardDescription>
                {t("settings.telegramStep3Desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>
                1. {t("settings.tgTenantStep1")}{" "}
                {botUsername && (
                  <span className="font-mono bg-muted px-1 rounded text-foreground">
                    @{botUsername}
                  </span>
                )}
              </p>
              <p>
                2. {t("settings.tgTenantStep2")}{" "}
                <span className="font-mono bg-muted px-1 rounded text-foreground">
                  /start [username]
                </span>{" "}
                {t("settings.tgTenantStep2b")}
              </p>
              <p>3. {t("settings.tgTenantStep3")}</p>
            </CardContent>
          </Card>

          {/* Broadcast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4" />
                {t("settings.telegramBroadcastTitle")}
              </CardTitle>
              <CardDescription>
                {t("settings.telegramBroadcastDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t("settings.telegramBroadcastPlaceholder")}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
              />
              <Button
                onClick={handleBroadcast}
                disabled={broadcasting}
                className="gap-2"
              >
                {broadcasting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {t("settings.telegramBroadcastSend")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
