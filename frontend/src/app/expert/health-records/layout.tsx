import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ Sơ Sức Khỏe | Animora Expert",
  description: "Quản lý bệnh án và hồ sơ sức khỏe thú cưng.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}