import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Đăng nhập | Animora - Hệ Sinh Thái Chăm Sóc Thú Cưng",
  description:
    "Đăng nhập tài khoản Animora để nhận ưu đãi, quản lý lịch hẹn spa, khám thú y và hồ sơ thú cưng.",
};

export default function DangNhapPage() {
  return <App initialPage="login" />;
}

