import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hộp Thuốc Bác Sĩ | Animora Expert",
  description:
    "Theo dõi số lượng thuốc trên kệ, tồn kho dược phẩm và gửi yêu cầu thêm hoặc xóa thuốc tới Quản lý.",
};

export default function SegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

