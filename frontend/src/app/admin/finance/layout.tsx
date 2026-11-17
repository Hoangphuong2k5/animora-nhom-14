import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra Cứu Doanh Thu | Animora Admin",
  description: "Tra cứu báo cáo doanh thu và chỉ số tài chính Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}