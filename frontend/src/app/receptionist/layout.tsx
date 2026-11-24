import type { Metadata } from "next";
import ReceptionistHeader from "@/components/receptionist/ReceptionistHeader";
import ReceptionistSidebar from "@/components/receptionist/ReceptionistSidebar";

export const metadata: Metadata = {
  title: "Animora Lễ Tân | Vận hành Quầy & Thu Ngân",
  description:
    "Cổng Lễ tân Animora v1.4: Tiếp nhận khách vãng lai, đặt lịch giúp, check-in, điều chỉnh giá theo cân thực tế và thu ngân.",
};

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-portal-theme="slate"
      className="min-h-screen flex flex-col md:flex-row bg-[#FAF6F0] dark:bg-background text-zinc-900 dark:text-foreground selection:bg-amber-600 selection:text-white transition-colors duration-200"
    >
      <ReceptionistSidebar />

      <div className="flex-1 flex flex-col min-w-0 md:pl-[72px]">
        <ReceptionistHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

