import type { Metadata } from "next";
import RescueHeader from "@/components/rescue/RescueHeader";
import RescueSidebar from "@/components/rescue/RescueSidebar";

export const metadata: Metadata = {
  title: "Animora Rescue Portal",
  description: "Cổng đối tác Trạm cứu hộ thú cưng liên kết Animora.",
};

export default function RescueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-portal-theme="slate"
      className="min-h-screen flex flex-col md:flex-row bg-[#FAF6F0] dark:bg-background text-zinc-900 dark:text-foreground selection:bg-rose-600 selection:text-white transition-colors duration-200"
    >
      <RescueSidebar />

      <div className="flex-1 flex flex-col min-w-0 md:pl-[72px]">
        <RescueHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
