import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voucher & Khuyến Mãi | Animora Manager",
  description: "Tạo và quản lý chiến dịch mã giảm giá Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}