import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch Hẹn Chuyên Viên | Animora Expert",
  description: "Danh sách lịch hẹn phụ trách của bác sĩ và chuyên viên.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}