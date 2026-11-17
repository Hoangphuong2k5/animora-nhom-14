import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Hủy lịch hẹn | Animora - Hệ Sinh Thái Chăm Sóc Thú Cưng",
  description:
    "Xác nhận hủy lịch hẹn và xem thông tin hoàn tiền / phí hủy lịch tại Animora.",
};

export default function BookingCancelCodePage() {
  return <App initialPage="my-bookings" />;
}

