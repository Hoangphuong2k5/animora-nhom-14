import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đánh Giá Từ Khách Hàng | Animora Expert",
  description: "Theo dõi phản hồi và đánh giá chất lượng phục vụ.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}