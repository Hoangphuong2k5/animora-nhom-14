import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Đặt lịch hẹn | Animora",
  description: "Đặt lịch khám thú y, spa grooming và lưu trú nhanh chóng cùng chuyên viên Animora.",
};

export default function BookingPage() {
  return <App initialPage="booking" />;
}