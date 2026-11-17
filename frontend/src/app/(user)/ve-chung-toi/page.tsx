import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Về chúng tôi | Animora",
  description: "Tìm hiểu câu chuyện, đội ngũ bác sĩ thú y và chuyên viên chăm sóc thú cưng tận tâm tại Animora.",
};

export default function AboutPage() {
  return <App initialPage="about" />;
}