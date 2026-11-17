import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra Cứu Nhận Nuôi | Animora Admin",
  description: "Tra cứu hồ sơ nhận nuôi thú cưng Animora.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}