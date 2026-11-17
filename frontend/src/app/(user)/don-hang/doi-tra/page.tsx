import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Đổi trả & Hoàn hàng | Animora - Hệ Sinh Thái Chăm Sóc Thú Cưng",
  description:
    "Gửi yêu cầu đổi trả sản phẩm, hoàn hàng và hoàn tiền nhanh chóng tại Animora.",
};

export default function DoiTraDonHangPage() {
  return <App initialPage="my-orders" />;
}

