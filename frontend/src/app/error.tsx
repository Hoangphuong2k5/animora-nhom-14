"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="max-w-md p-6 rounded-2xl border border-red-200 dark:border-red-950 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
          Đã xảy ra sự cố!
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {error.message || "Giao diện gặp lỗi ngoài ý muốn trong quá trình tải."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => reset()} className="cursor-pointer">
            Thử lại
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
