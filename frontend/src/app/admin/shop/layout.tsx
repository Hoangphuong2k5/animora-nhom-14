import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra Cứu Cửa Hàng | Animora Admin",
  description: "Tra cứu sản phẩm, tồn kho và đơn hàng cửa hàng Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}