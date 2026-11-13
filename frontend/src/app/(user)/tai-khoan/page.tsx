import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Tài khoản | Animora - Hệ Sinh Thái Chăm Sóc Thú Cưng",
  description:
    "Quản lý thông tin tài khoản, sổ địa chỉ nhận hàng và bảo mật tài khoản Animora.",
};

export default function TaiKhoanPage() {
  return <App initialPage="account" />;
}

