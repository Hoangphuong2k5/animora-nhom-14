"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/config.constant";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-(--surface-2) flex items-center justify-center text-4xl shadow-md mb-6">
        🐾
      </div>
      <h1 className="section-title text-4xl mb-3">404 - Không tìm thấy trang</h1>
      <p className="text-(--text-muted) max-w-md mb-8">
        Có vẻ như bé cưng này đã đi lạc! Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đến một góc ấm áp khác.
      </p>
      <Link
        href={ROUTES.HOME}
        className="btn-primary px-8 py-3.5 inline-flex items-center gap-2"
      >
        <span>Quay về trang chủ</span>
      </Link>
    </div>
  );
}
