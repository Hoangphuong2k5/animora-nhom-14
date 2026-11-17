import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "403 - Không Có Quyền Truy Cập | Animora",
  description: "Bạn không có quyền truy cập vào trang này.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}