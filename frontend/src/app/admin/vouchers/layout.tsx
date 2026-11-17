import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra Cứu Voucher | Animora Admin",
  description: "Tra cứu mã giảm giá và chương trình khuyến mãi Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}