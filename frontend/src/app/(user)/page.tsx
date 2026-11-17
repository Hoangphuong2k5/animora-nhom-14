import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Trang chủ | Animora - Hệ Sinh Thái Chăm Sóc Thú Cưng",
  description: "Dịch vụ spa, khách sạn, khám sức khỏe, nhận nuôi và cửa hàng vật phẩm cao cấp dành cho chó mèo.",
};

export default function HomePage() {
  return <App initialPage="home" />;
}