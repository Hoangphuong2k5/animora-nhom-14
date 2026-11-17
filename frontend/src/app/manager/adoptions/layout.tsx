import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Nhận Nuôi | Animora Manager",
  description: "Quản lý danh sách bé thú cưng và duyệt hồ sơ nhận nuôi.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}