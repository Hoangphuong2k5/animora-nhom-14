import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ Sơ Thú Cưng | Animora Admin",
  description: "Quản lý hồ sơ thú cưng trên toàn hệ thống Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}