import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản Lý Khách Hàng | Animora Admin",
  description: "Tra cứu và quản lý thông tin khách hàng Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}