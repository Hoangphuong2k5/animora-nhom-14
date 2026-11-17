import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khách Hàng & Thú Cưng | Animora Expert",
  description: "Tra cứu khách hàng và hồ sơ thú cưng đang chăm sóc.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}