import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Hồ sơ thú cưng | Animora",
  description: "Quản lý sổ tiêm phòng, hồ sơ sức khỏe và nhật ký chăm sóc của thú cưng.",
};

export default function PetProfilesPage() {
  return <App initialPage="pet-profiles" />;
}