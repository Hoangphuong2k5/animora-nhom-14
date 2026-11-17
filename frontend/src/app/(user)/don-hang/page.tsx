import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi | Animora - Hệ Sinh Thái Chăm Sóc Thú Cưng",
  description:
    "Theo dõi đơn hàng mua sắm và quản lý yêu cầu đổi trả, hoàn tiền tại Animora.",
};

export default function DonHangPage() {
  return <App initialPage="my-orders" />;
}
