import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch Làm Việc | Animora Expert",
  description: "Xem lịch làm việc giờ hành chính (08:00–17:00) và gửi yêu cầu nghỉ phép.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}