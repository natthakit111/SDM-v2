"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { authAPI } from "@/lib/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  Building2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await authAPI.forgotPassword(username.trim());
      setStatus("success");
      setMessage(res.message || "ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อยแล้ว");
    } catch (err: any) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">ลืมรหัสผ่าน</CardTitle>
          <CardDescription>
            กรอก Username เพื่อรับลิงก์รีเซ็ตรหัสผ่าน
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === "success" ? (
            /* ── Success state ── */
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {message}
                </p>
                <p className="text-xs text-muted-foreground">
                  ลิงก์จะหมดอายุใน{" "}
                  <span className="font-medium text-foreground">15 นาที</span>
                </p>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </Button>
            </div>
          ) : (
            /* ── Form state ── */
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">
                    ชื่อผู้ใช้ (Username)
                  </FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    placeholder="กรอก username ของคุณ"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={status === "loading"}
                    autoFocus
                  />
                </Field>

                {status === "error" && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={status === "loading" || !username.trim()}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังส่ง...
                    </>
                  ) : (
                    "ส่งลิงก์รีเซ็ตรหัสผ่าน"
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}

          {status !== "success" && (
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
