import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kê Đơn Thuốc Mới | Animora Expert",
  description: "Lập đơn thuốc mới cho ca khám thú y.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}