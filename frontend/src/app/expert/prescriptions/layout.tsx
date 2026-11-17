import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đơn Kê Lâm Sàng | Animora Expert",
  description: "Quản lý đơn thuốc và chỉ định lâm sàng cho thú cưng.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}