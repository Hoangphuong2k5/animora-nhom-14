"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface LowStockAlertBannerProps {
  readOnly?: boolean;
  lowStockCount: number;
  onCreateImportFromAlert: () => void;
}

/**
 * Banner cảnh báo khi có sản phẩm tồn kho dưới ngưỡng an toàn (< 5 đơn vị).
 */
export function LowStockAlertBanner({
  readOnly = false,
  lowStockCount,
  onCreateImportFromAlert,
}: LowStockAlertBannerProps) {
  if (lowStockCount <= 0) return null;

  return (
    <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold text-rose-900 dark:text-rose-200 block">
            Cảnh Báo Tồn Kho Dưới Ngưỡng An Toàn!
          </span>
          <p className="text-rose-700 dark:text-rose-300 mt-0.5">
            Có {lowStockCount} sản phẩm tồn kho &lt; 5 đơn vị. Cần tạo phiếu nhập từ nhà cung cấp ngay để tránh đứt gãy đơn hàng.
          </p>
        </div>
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={onCreateImportFromAlert}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs whitespace-nowrap cursor-pointer"
        >
          Tạo phiếu nhập kho
        </button>
      )}
    </div>
  );
}
