import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra Cứu Lịch Làm Việc | Animora Admin",
  description: "Tra cứu lịch trực và phân ca chuyên viên Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}