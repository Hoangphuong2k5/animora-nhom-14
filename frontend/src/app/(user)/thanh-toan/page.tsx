import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Thanh toán | Animora",
  description: "Hoàn tất thông tin giao hàng và thanh toán đơn hàng Animora.",
};

export default function CheckoutPage() {
  return <App initialPage="checkout" />;
}