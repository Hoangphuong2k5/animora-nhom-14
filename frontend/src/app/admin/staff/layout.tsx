import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra Cứu Chuyên Viên & Nhân Sự | Animora Admin",
  description: "Tra cứu hồ sơ chuyên viên và nhân sự Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}