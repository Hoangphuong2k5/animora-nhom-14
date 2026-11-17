import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Cửa Hàng & Kho | Animora Manager",
  description: "Quản lý sản phẩm, nhập kho, đơn hàng và đổi trả.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}