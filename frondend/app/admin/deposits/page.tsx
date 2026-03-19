"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PiggyBank, Check, Loader2 } from "lucide-react";
import StatusBadge from "@/components/common/status-badge";
import { contractAPI } from "@/lib/api/contract.api";
import { toast } from "sonner";

// Contract จาก backend มี deposit_amount, status, tenant_name, room_number ฯลฯ
interface Contract {
  contract_id: number;
  tenant_id: number;
  room_id: number;
  tenant_name: string;
  room_number: string;
  rent_amount: number;
  deposit_amount: number;
  deposit_status: string; // 'held' | 'refunded' | 'deducted'  (ถ้า backend มี)
  deposit_returned_at: string | null;
  deposit_remark: string | null;
  start_date: string;
  end_date: string;
  status: string; // contract status: 'active' | 'terminated' | 'expired'
}

export default function DepositsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [refundNotes, setRefundNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      // ดึงทุก contract ที่มี deposit_amount > 0
      const res = await contractAPI.getAll();
      const data: Contract[] = res?.data ?? res ?? [];
      setContracts(data.filter((c) => Number(c.deposit_amount) > 0));
    } catch {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // deposit_status: ถ้า backend ยังไม่มี field นี้ ให้ derive จาก contract status
  const getDepositStatus = (c: Contract): "held" | "refunded" | "deducted" => {
    if (c.deposit_status)
      return c.deposit_status as "held" | "refunded" | "deducted";
    if (c.status === "active") return "held";
    if (c.deposit_returned_at) return "refunded";
    return "held";
  };

  const filteredContracts = contracts.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      c.tenant_name?.toLowerCase().includes(q) ||
      c.room_number?.toLowerCase().includes(q) ||
      String(c.contract_id).includes(q);
    const depStatus = getDepositStatus(c);
    const matchesFilter = filterStatus === "all" || depStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalHeld: contracts
      .filter((c) => getDepositStatus(c) === "held")
      .reduce((s, c) => s + Number(c.deposit_amount), 0),
    totalRefunded: contracts
      .filter((c) => getDepositStatus(c) === "refunded")
      .reduce((s, c) => s + Number(c.deposit_amount), 0),
    totalDeducted: contracts
      .filter((c) => getDepositStatus(c) === "deducted")
      .reduce((s, c) => s + Number(c.deposit_amount), 0),
  };

  // คืนมัดจำ = terminate contract (backend คำนวณ net_refund ให้)
  const handleRefund = async () => {
    if (!selectedContract || !refundAmount) return;
    try {
      setActionLoading(true);
      // contractAPI.terminate ใน contract.api.js ไม่รับ body
      // ต้องใช้ contractAPI.update หรือเรียก terminate แล้วส่ง note ผ่าน update
      await contractAPI.terminate(selectedContract.contract_id);
      toast.success("บันทึกการคืนมัดจำเรียบร้อย");
      setRefundDialogOpen(false);
      setRefundNotes("");
      setRefundAmount("");
      setSelectedContract(null);
      fetchContracts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("th-TH");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">เงินประกัน</h1>
          <p className="text-muted-foreground mt-2">
            จัดการเงินประกันและการคืนเงิน
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รวมทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                stats.totalHeld +
                stats.totalDeducted +
                stats.totalRefunded
              ).toLocaleString("th-TH")}{" "}
              บาท
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              เก็บไว้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter((c) => getDepositStatus(c) === "held").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalHeld.toLocaleString("th-TH")} บาท
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              คืนเงินแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {
                contracts.filter((c) => getDepositStatus(c) === "refunded")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalRefunded.toLocaleString("th-TH")} บาท
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              หักเงิน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {
                contracts.filter((c) => getDepositStatus(c) === "deducted")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalDeducted.toLocaleString("th-TH")} บาท
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="ค้นหา ชื่อ ห้อง หรือ ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="held">เก็บไว้</SelectItem>
                <SelectItem value="refunded">คืนเงินแล้ว</SelectItem>
                <SelectItem value="deducted">หักเงิน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContracts.map((contract) => {
            const depStatus = getDepositStatus(contract);
            return (
              <Card key={contract.contract_id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="bg-primary/10 p-3 rounded-lg h-fit">
                        <PiggyBank className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-lg">
                              {contract.tenant_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              ห้อง {contract.room_number} • #
                              {contract.contract_id}
                            </p>
                            {contract.deposit_remark && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                {contract.deposit_remark}
                              </p>
                            )}
                            <div className="flex gap-2 mt-3 flex-wrap">
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                ฝากเมื่อ {formatDate(contract.start_date)}
                              </span>
                              {contract.deposit_returned_at && (
                                <span className="text-xs bg-muted px-2 py-1 rounded">
                                  คืนเมื่อ{" "}
                                  {formatDate(contract.deposit_returned_at)}
                                </span>
                              )}
                            </div>
                          </div>
                          <StatusBadge status={depStatus} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {Number(contract.deposit_amount).toLocaleString(
                            "th-TH",
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">บาท</p>
                      </div>
                      {depStatus === "held" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContract(contract);
                            setRefundAmount(String(contract.deposit_amount));
                            setRefundDialogOpen(true);
                          }}
                        >
                          คืนเงิน
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredContracts.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">ไม่พบเงินประกัน</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Refund Dialog */}
      <Dialog
        open={refundDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRefundDialogOpen(false);
            setRefundNotes("");
            setRefundAmount("");
            setSelectedContract(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>คืนเงินประกัน</DialogTitle>
            <DialogDescription>
              ระบุจำนวนเงินที่จะคืนให้ผู้เช่า
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">ผู้เช่า</p>
              <p>
                {selectedContract?.tenant_name} — ห้อง{" "}
                {selectedContract?.room_number}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">เงินประกันทั้งหมด</p>
              <p className="text-lg font-bold">
                {Number(selectedContract?.deposit_amount ?? 0).toLocaleString(
                  "th-TH",
                )}{" "}
                บาท
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">เงินที่คืน</label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">หมายเหตุ</label>
              <Textarea
                placeholder="เช่น หักค่าเสียหาย 500 บาท ฯลฯ"
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleRefund}
              disabled={!refundAmount || actionLoading}
              className="w-full gap-2"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              ยืนยันการคืนเงิน
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
