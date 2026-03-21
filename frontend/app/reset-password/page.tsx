"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  /* ── Password strength indicator ── */
  const getStrength = (pw: string) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabel = [
    "",
    "อ่อนมาก",
    "อ่อน",
    "ปานกลาง",
    "แข็งแรง",
    "แข็งแรงมาก",
  ][strength];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-blue-500",
    "bg-green-500",
  ][strength];

  /* ── No token in URL ── */
  if (!token) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="p-3 rounded-full bg-destructive/10">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="font-medium">ลิงก์ไม่ถูกต้อง</p>
        <p className="text-sm text-muted-foreground">
          ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง
        </p>
        <Button asChild className="mt-2 w-full">
          <Link href="/forgot-password">ขอลิงก์ใหม่</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    if (newPassword.length < 6) {
      setStatus("error");
      setMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await authAPI.resetPassword(token, newPassword);
      setStatus("success");
      setMessage(res.message || "เปลี่ยนรหัสผ่านสำเร็จ");

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      );
    }
  };

  if (status === "success") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="font-medium">เปลี่ยนรหัสผ่านสำเร็จ!</p>
          <p className="text-sm text-muted-foreground">
            กำลังพาคุณไปหน้าเข้าสู่ระบบ...
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">เข้าสู่ระบบเลย</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {/* New password */}
        <Field>
          <FieldLabel htmlFor="new-password">รหัสผ่านใหม่</FieldLabel>
          <div className="relative">
            <Input
              id="new-password"
              type={showNew ? "text" : "password"}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              required
              disabled={status === "loading"}
              className="pr-10"
              autoFocus
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

          {/* Strength bar */}
          {newPassword && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i <= strength ? strengthColor : "bg-muted"
                    }`}
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

        {/* Confirm password */}
        <Field>
          <FieldLabel htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</FieldLabel>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              required
              disabled={status === "loading"}
              className="pr-10"
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

          {/* Match indicator */}
          {confirmPassword && (
            <p
              className={`text-xs mt-1 ${
                newPassword === confirmPassword
                  ? "text-green-600 dark:text-green-400"
                  : "text-destructive"
              }`}
            >
              {newPassword === confirmPassword
                ? "✓ รหัสผ่านตรงกัน"
                : "✗ รหัสผ่านไม่ตรงกัน"}
            </p>
          )}
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
          disabled={
            status === "loading" ||
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword
          }
        >
          {status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            "ตั้งรหัสผ่านใหม่"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">ตั้งรหัสผ่านใหม่</CardTitle>
          <CardDescription>กรอกรหัสผ่านใหม่ที่ต้องการ</CardDescription>
        </CardHeader>

        <CardContent>
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
