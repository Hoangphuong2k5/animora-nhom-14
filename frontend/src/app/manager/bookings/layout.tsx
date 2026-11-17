import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều Phối Đặt Lịch | Animora Manager",
  description: "Điều phối ca hẹn, xác nhận và theo dõi tiến trình dịch vụ Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}