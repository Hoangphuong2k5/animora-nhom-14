import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Nhận nuôi thú cưng | Animora",
  description: "Kết nối yêu thương và tìm mái ấm mới cho các bé chó mèo đang được chăm sóc.",
};

export default function AdoptPage() {
  return <App initialPage="adopt" />;
}