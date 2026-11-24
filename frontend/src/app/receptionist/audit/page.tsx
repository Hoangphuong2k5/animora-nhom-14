"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  FileSpreadsheet,
  FileText,
  History,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage } from "@/utils/cartLogic";
import { formatDateTimeDdMmYyyy } from "@/utils/dateFormat";
import {
  INITIAL_RECEPTIONIST_AUDIT_LOGS,
  type ManualRefundCompensationEntry,
  RECEPTIONIST_STORAGE_KEYS,
  RECEPTIONIST_SYNC_EVENT,
  type ReceptionistAuditLogEntry,
  type ServiceInvoiceRecord,
} from "@/data/receptionistOpsData";

export default function ReceptionistAuditAndInvoicesPage() {
  const [tab, setTab] = useState<"audit" | "invoices" | "ledgers">("audit");
  const [auditLogs, setAuditLogs] = useState<ReceptionistAuditLogEntry[]>(
    INITIAL_RECEPTIONIST_AUDIT_LOGS
  );
  const [invoices, setInvoices] = useState<ServiceInvoiceRecord[]>([]);
  const [ledgers, setLedgers] = useState<ManualRefundCompensationEntry[]>([]);

  useEffect(() => {
    const load = () => {
      setAuditLogs(
        safeGetStorage<ReceptionistAuditLogEntry[]>(
          RECEPTIONIST_STORAGE_KEYS.auditLogs,
          INITIAL_RECEPTIONIST_AUDIT_LOGS
        )
      );
      setInvoices(
        safeGetStorage<ServiceInvoiceRecord[]>(
          RECEPTIONIST_STORAGE_KEYS.invoices,
          []
        )
      );
      setLedgers(
        safeGetStorage<ManualRefundCompensationEntry[]>(
          RECEPTIONIST_STORAGE_KEYS.manualLedgers,
          []
        )
      );
    };

    load();
    window.addEventListener(RECEPTIONIST_SYNC_EVENT, load);
    return () => window.removeEventListener(RECEPTIONIST_SYNC_EVENT, load);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
          <FileSpreadsheet className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
          <span>Hóa Đơn Dịch Vụ, Hoàn/Bù Tiền &amp; Nhật Ký Audit Lễ Tân</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Mọi thao tác của Lễ tân (đặt giúp, check-in, dời 30p, hoàn tác không đến, điều chỉnh giá
          theo cân nặng, thu và hoàn/bù tiền) đều ghi rõ Ai làm, Lúc nào, Trước và Sau thay đổi.
        </p>
      </div>

      <div className="inline-flex flex-wrap items-center gap-1.5 bg-white dark:bg-card border border-zinc-200/80 dark:border-border p-1.5 rounded-2xl shadow-sm">
        {[
          {
            id: "audit" as const,
            label: `Audit Log Lễ tân (${auditLogs.length})`,
            icon: History,
          },
          {
            id: "invoices" as const,
            label: `Hóa đơn đã xuất (${invoices.length})`,
            icon: FileText,
          },
          {
            id: "ledgers" as const,
            label: `Phiếu Hoàn / Bù tiền thủ công (${ledgers.length})`,
            icon: ArrowRightLeft,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                tab === item.id
                  ? "bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-zinc-950 shadow-sm"
                  : "text-zinc-600 dark:text-muted-foreground hover:bg-zinc-100 dark:hover:bg-muted"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "audit" && (
        <div className="space-y-2.5">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF7F6B]/15 dark:text-[#FF7F6B]">
                    {log.actionLabel}
                  </span>
                  {log.targetCode && (
                    <span className="font-mono font-bold text-zinc-700 dark:text-foreground">
                      Mã: {log.targetCode}
                    </span>
                  )}
                </div>
                <span className="text-zinc-400">
                  Người làm: <strong className="text-zinc-700 dark:text-foreground">{log.actorName}</strong> •{" "}
                  {formatDateTimeDdMmYyyy(log.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    Trước thay đổi:
                  </span>
                  <span className="font-medium text-zinc-700 dark:text-foreground/90">
                    {log.beforeState}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                    Sau thay đổi:
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-foreground">
                    {log.afterState}
                  </span>
                </div>
              </div>

              {log.reason && (
                <div className="text-[11px] text-zinc-500">
                  Lý do / Ghi chú: <strong>{log.reason}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "invoices" && (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed text-center text-xs text-zinc-400">
              Chưa có hóa đơn nào được xuất trong phiên này. Hãy bấm &quot;Đã thu &amp; Xuất HĐ&quot; ở
              Bàn Quầy Tiếp Nhận.
            </div>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {inv.invoiceCode}
                    </span>
                    <span className="text-zinc-400">• Đơn: {inv.bookingCode}</span>
                  </div>
                  <div className="font-bold">
                    Khách: {inv.customerName} ({inv.customerPhone}) • Bé {inv.petName} (
                    {inv.serviceName})
                  </div>
                  <div className="text-zinc-500">
                    Thu ngân: {inv.issuedBy} • {formatDateTimeDdMmYyyy(inv.issuedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-emerald-600">
                    {inv.finalAmount.toLocaleString("vi-VN")}đ
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      toast.success(`Đã gửi lệnh in hóa đơn ${inv.invoiceCode}!`)
                    }
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-muted font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In lại</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "ledgers" && (
        <div className="space-y-3">
          {ledgers.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed text-center text-xs text-zinc-400">
              Chưa có phiếu hoàn hoặc thu bù tiền thủ công nào.
            </div>
          ) : (
            ledgers.map((l) => (
              <div
                key={l.id}
                className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{l.code}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.kind === "refund"
                          ? "bg-rose-500/10 text-rose-600"
                          : "bg-emerald-500/10 text-emerald-600"
                      }`}
                    >
                      {l.kind === "refund" ? "Hoàn tiền cho khách" : "Thu bù chênh lệch"}
                    </span>
                    <span className="text-zinc-400">• Kênh: {l.method.toUpperCase()}</span>
                  </div>
                  <div className="font-bold">
                    Khách: {l.customerName} ({l.customerPhone}) • Đơn: {l.bookingCode}
                  </div>
                  <div className="text-zinc-500">
                    Lý do: <strong>{l.reason}</strong> • Người làm: {l.processedBy}
                  </div>
                </div>
                <div className="text-sm font-extrabold">
                  {l.kind === "refund" ? "-" : "+"}
                  {l.amount.toLocaleString("vi-VN")}đ
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

