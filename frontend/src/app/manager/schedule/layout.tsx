import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xếp Ca & Duyệt Lịch | Animora Manager",
  description: "Điều phối ca làm việc và duyệt yêu cầu nghỉ phép / đổi ca.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}