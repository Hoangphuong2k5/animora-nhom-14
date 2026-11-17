import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Khách Hàng | Animora Manager",
  description: "Quản lý danh sách khách hàng và trạng thái tài khoản.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}