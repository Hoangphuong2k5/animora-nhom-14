import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nhân Sự & Duyệt Hồ Sơ | Animora Manager",
  description: "Quản lý đội ngũ nhân sự và duyệt chứng chỉ chuyên viên.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}