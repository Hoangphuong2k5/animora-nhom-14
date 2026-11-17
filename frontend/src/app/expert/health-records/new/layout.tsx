import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo Hồ Sơ Sức Khỏe | Animora Expert",
  description: "Tạo mới hồ sơ khám và theo dõi sức khỏe thú cưng.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}