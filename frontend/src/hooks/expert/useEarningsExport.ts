"use client";

import { useState } from "react";
import { ExpertProfile, PayrollMonth } from "@/types/expert.type";
import { toast } from "sonner";

export function useEarningsExport(
  profile: ExpertProfile,
  currentPayroll: PayrollMonth,
  netEarnings: number
) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPayslip = () => {
    setIsExporting(true);
    try {
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Phiếu Lương Animora - ${currentPayroll.month}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #6B1F2E; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #6B1F2E; }
            .title { font-size: 18px; font-weight: bold; margin-top: 8px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
            .total { font-size: 16px; font-weight: 900; color: #6B1F2E; border-top: 2px solid #e5e7eb; margin-top: 15px; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Animora Pet Care</div>
            <div class="title">BẢNG KÊ THU NHẬP & HOA HỒNG DỊCH VỤ - THÁNG ${currentPayroll.month}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Chuyên viên: <strong>${profile.fullName}</strong> (${profile.expertType === "vet" ? "Bác sĩ thú y" : "Chuyên viên spa"})</div>
          </div>
          <div class="row"><span>Lương cơ bản cố định:</span><span>${currentPayroll.baseSalary.toLocaleString("vi-VN")} VND</span></div>
          <div class="row"><span>Hoa hồng dịch vụ (${profile.commissionRate * 100}%):</span><span>${currentPayroll.commission.toLocaleString("vi-VN")} VND</span></div>
          <div class="row"><span>Thưởng đánh giá 5 sao (${currentPayroll.avgRating}★):</span><span>${currentPayroll.ratingBonus.toLocaleString("vi-VN")} VND</span></div>
          <div class="row"><span>Các khoản giảm trừ / BH:</span><span>-${currentPayroll.deductions.toLocaleString("vi-VN")} VND</span></div>
          <div class="row total"><span>TỔNG THỰC NHẬN:</span><span>${netEarnings.toLocaleString("vi-VN")} VND</span></div>
          <div style="margin-top: 30px; font-size: 11px; color: #6b7280;">Trạng thái: ${currentPayroll.status === "paid" ? "Đã chi trả chuyển khoản" : "Tạm tính"} • Ngày in: ${new Date().toLocaleDateString("vi-VN")}</div>
        </body>
        </html>
      `;

      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PhieuLuong_Animora_${currentPayroll.month}_${profile.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Đã xuất phiếu lương thành công!");
    } catch {
      toast.error("Không thể xuất phiếu lương.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    handleExportPayslip,
    isExporting,
  };
}

