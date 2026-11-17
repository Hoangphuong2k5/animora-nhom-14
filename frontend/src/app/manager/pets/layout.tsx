import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ Sơ Thú Cưng | Animora Manager",
  description: "Quản lý hồ sơ thú cưng và lịch sử chăm sóc.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}