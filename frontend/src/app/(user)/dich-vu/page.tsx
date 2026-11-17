import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Dịch vụ chăm sóc | Animora",
  description: "Khám tổng quát, spa grooming, khách sạn thú cưng và các gói chăm sóc chuyên sâu tại Animora.",
};

export default function ServicesPage() {
  return <App initialPage="services" />;
}