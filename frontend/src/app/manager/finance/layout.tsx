import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doanh Thu & Lương Thưởng | Animora Manager",
  description: "Theo dõi doanh thu, đối soát và lương thưởng nhân sự.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}