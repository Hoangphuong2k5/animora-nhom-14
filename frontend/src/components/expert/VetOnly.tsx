"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useExpert } from "./ExpertProvider";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

interface VetOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component hiển thị nội dung CHỈ DÀNH CHO BÁC SĨ THÚ Y (expertType === 'vet').
 * Nếu là chuyên viên thường (groomer, trainer), nội dung sẽ bị ẩn hoàn toàn
 * hoặc hiển thị fallback (nếu có).
 */
export function VetOnly({ children, fallback = null }: VetOnlyProps) {
  const { isVet } = useExpert();
  if (!isVet) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * Route Guard cấp Client: bảo vệ các trang chỉ bác sĩ được phép vào (như /expert/prescriptions).
 * Chuyển hướng về /expert kèm thông báo nếu không phải Bác sĩ thú y.
 */
export function VetRouteGuard({ children }: { children: React.ReactNode }) {
  const { isVet } = useExpert();
  const router = useRouter();
  const pathname = usePathname();
  const isMedicineBox = pathname?.startsWith("/expert/medicine-box") ?? false;
  const featureLabel = isMedicineBox
    ? "Tủ thuốc cá nhân (Medicine Box)"
    : "Kê đơn thuốc điện tử";
  const deniedKey = isMedicineBox ? "medicine-box" : "rx";

  useEffect(() => {
    if (!isVet) {
      toast.error(
        `Chức năng ${featureLabel} chỉ dành riêng cho Bác sĩ thú y đã xác thực chứng chỉ hành nghề!`
      );
      router.replace(`/expert?denied=${deniedKey}`);
    }
  }, [isVet, router, featureLabel, deniedKey]);

  if (!isVet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-heading font-bold text-zinc-900 dark:text-foreground">
          Quyền truy cập bị từ chối
        </h2>
        <p className="text-sm text-zinc-500 max-w-md">
          Chức năng {featureLabel} chỉ mở cho tài khoản Bác sĩ thú y có chứng chỉ hành nghề hợp lệ.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

