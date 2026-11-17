import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra Cứu Đặt Lịch | Animora Admin",
  description: "Tra cứu lịch hẹn dịch vụ trên hệ thống Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}