import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Đổi ngày & giờ hẹn | Animora - Hệ Sinh Thái Chăm Sóc Thú Cưng",
  description:
    "Đổi sang ngày và khung giờ hẹn chăm sóc thú cưng mới tại Animora.",
};

export default function BookingRescheduleCodePage() {
  return <App initialPage="my-bookings" />;
}

