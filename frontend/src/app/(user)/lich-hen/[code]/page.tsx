import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Chi tiết lịch hẹn | Animora - Hệ Sinh Thái Chăm Sóc Thú Cưng",
  description:
    "Xem chi tiết tiến trình lịch hẹn, đổi giờ hoặc hủy lịch hẹn chăm sóc thú cưng tại Animora.",
};

export default function BookingDetailCodePage() {
  return <App initialPage="my-bookings" />;
}

