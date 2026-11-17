import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cấu Hình Hệ Thống | Animora Admin",
  description: "Thiết lập cấu hình vận hành hệ sinh thái Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}