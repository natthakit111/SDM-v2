"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Download } from "lucide-react";
import { contractAPI } from "@/lib/api/contract.api";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-context";

interface Contract {
  contract_id: number;
  room_number: string;
  tenant_name: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  status: "active" | "expired" | "terminated";
  note: string | null;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const fmtCurrency = (n: number) => Number(n).toLocaleString("th-TH") + " บาท";

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "ใช้งานอยู่", color: "bg-green-500/20 text-green-500" },
  expired: { label: "หมดอายุ", color: "bg-red-500/10 text-red-500" },
  terminated: { label: "ยกเลิกแล้ว", color: "bg-muted text-muted-foreground" },
};

export default function TenantContractPage() {
  const { t } = useLanguage();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contractAPI
      .getMyContract()
      .then((r) => setContract(r.data ?? null))
      .catch(() => {
        /* ไม่มีสัญญาก็ไม่ error */
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    if (!contract) return;
    const text = [
      "สัญญาเช่าห้องพัก",
      "",
      `ชื่อผู้เช่า: ${contract.tenant_name}`,
      `ห้อง: ${contract.room_number}`,
      `วันเริ่มต้น: ${fmtDate(contract.start_date)}`,
      `วันสิ้นสุด: ${fmtDate(contract.end_date)}`,
      `ค่าเช่ารายเดือน: ${fmtCurrency(contract.rent_amount)}`,
      `เงินประกัน: ${fmtCurrency(contract.deposit_amount)}`,
      `สถานะ: ${statusConfig[contract.status]?.label ?? contract.status}`,
      contract.note ? `หมายเหตุ: ${contract.note}` : "",
    ].join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `contract_CNT${String(contract.contract_id).padStart(3, "0")}.txt`;
    a.click();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" /> กำลังโหลด...
      </div>
    );

  if (!contract)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">สัญญาเช่า</h1>
          <p className="text-muted-foreground mt-2">
            ดูและจัดการสัญญาเช่าของคุณ
          </p>
        </div>
        <Card>
          <CardContent className="pt-10 text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">ยังไม่มีสัญญาเช่า</p>
          </CardContent>
        </Card>
      </div>
    );

  const s = statusConfig[contract.status] ?? statusConfig.expired;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">สัญญาเช่า</h1>
        <p className="text-muted-foreground mt-2">ดูและจัดการสัญญาเช่าของคุณ</p>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>สัญญาปัจจุบัน</CardTitle>
              <CardDescription>
                CNT{String(contract.contract_id).padStart(3, "0")}
              </CardDescription>
            </div>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${s.color}`}
            >
              {s.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">ห้อง</p>
              <p className="text-2xl font-bold">{contract.room_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ค่าเช่ารายเดือน</p>
              <p className="text-2xl font-bold text-primary">
                {fmtCurrency(contract.rent_amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">วันเริ่มต้น</p>
              <p className="text-lg font-semibold">
                {fmtDate(contract.start_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">วันสิ้นสุด</p>
              <p className="text-lg font-semibold">
                {fmtDate(contract.end_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">เงินประกัน</p>
              <p className="text-lg font-semibold text-yellow-600">
                {fmtCurrency(contract.deposit_amount)}
              </p>
            </div>
            {contract.note && (
              <div>
                <p className="text-sm text-muted-foreground">หมายเหตุ</p>
                <p className="text-sm">{contract.note}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" /> ดาวน์โหลดสัญญา
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
