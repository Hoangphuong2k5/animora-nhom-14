import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Lịch hẹn của tôi | Animora",
  description: "Theo dõi trạng thái lịch hẹn, tiến độ dịch vụ và lịch sử chăm sóc thú cưng.",
};

export default function MyBookingsPage() {
  return <App initialPage="my-bookings" />;
}