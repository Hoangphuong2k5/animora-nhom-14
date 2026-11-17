import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Giỏ hàng | Animora",
  description: "Xem lại sản phẩm và chuẩn bị thanh toán đơn hàng thú cưng tại Animora.",
};

export default function CartPage() {
  return <App initialPage="cart" />;
}