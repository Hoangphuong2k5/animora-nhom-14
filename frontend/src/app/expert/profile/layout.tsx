import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ Sơ Chuyên Viên | Animora Expert",
  description: "Quản lý thông tin cá nhân và chứng chỉ hành nghề.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}