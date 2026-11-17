import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Người Dùng & Phân Quyền | Animora Admin",
  description: "Quản lý tài khoản người dùng và phân quyền hệ thống Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}