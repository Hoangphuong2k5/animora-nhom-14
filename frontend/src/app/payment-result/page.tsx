"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import {
  verifyVnpayReturnApi,
  type VnpayCallbackVerificationResult,
} from "@/services/animora/paymentApi";

export default function PaymentResultPage() {
  const [status, setStatus] = useState<"loading" | "success" | "duplicate" | "failed">(
    "loading"
  );
  const [message, setMessage] = useState("Đang xác thực kết quả thanh toán từ VNPAY...");
  const [result, setResult] = useState<VnpayCallbackVerificationResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    const qs = typeof window !== "undefined" ? window.location.search : "";
    if (!qs || !qs.includes("vnp_")) {
      queueMicrotask(() => {
        if (cancelled) return;
        setStatus("failed");
        setMessage("Thiếu thông tin giao dịch VNPAY trả về.");
      });
      return () => {
        cancelled = true;
      };
    }

    verifyVnpayReturnApi(qs)
      .then((res) => {
        if (cancelled) return;
        setResult(res);
        if (!res.isValid) {
          setStatus("failed");
          setMessage("Chữ ký phản hồi VNPAY không hợp lệ.");
        } else if (res.isDuplicate) {
          setStatus("duplicate");
          setMessage(
            "Giao dịch này đã được thanh toán trước đó. Hệ thống đã ghi nhận đối soát chống trừ tiền trùng."
          );
        } else if (res.isSuccess) {
          setStatus("success");
          setMessage("Thanh toán VNPAY thành công và đã đồng bộ trạng thái.");
        } else {
          setStatus("failed");
          setMessage("Giao dịch thanh toán VNPAY chưa hoàn tất hoặc đã bị hủy.");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("failed");
        setMessage(
          err instanceof Error
            ? err.message
            : "Không thể xác thực giao dịch thanh toán lúc này."
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-(--bg) text-(--text)">
      <div
        className="w-full max-w-md rounded-3xl border p-8 text-center space-y-5"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow)",
        }}
      >
        <div className="flex justify-center">
          {status === "loading" && (
            <Loader2 className="w-12 h-12 animate-spin text-[#FF7F6B]" />
          )}
          {status === "success" && (
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          )}
          {status === "duplicate" && (
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          )}
          {status === "failed" && <XCircle className="w-12 h-12 text-rose-600" />}
        </div>

        <h1 className="font-heading text-2xl font-extrabold" style={{ color: "var(--primary)" }}>
          {status === "loading"
            ? "Đang kiểm tra thanh toán"
            : status === "success"
            ? "Thanh toán thành công"
            : status === "duplicate"
            ? "Phát hiện giao dịch trùng"
            : "Thanh toán chưa hoàn tất"}
        </h1>

        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          {message}
        </p>

        {result?.payment && (
          <div
            className="rounded-2xl border p-4 text-left text-xs space-y-1.5"
            style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
          >
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Mã thanh toán:</span>
              <span className="font-bold">{result.payment.payment_code}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Số tiền:</span>
              <span className="font-bold">
                {Number(result.payment.amount || 0).toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Trạng thái:</span>
              <span className="font-bold">{result.payment.status}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/lich-hen"
            className="btn-primary flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Xem lịch hẹn</span>
          </Link>
          <Link
            href="/don-hang"
            className="btn-secondary flex-1 min-h-[44px] inline-flex items-center justify-center text-sm font-bold"
          >
            Xem đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
