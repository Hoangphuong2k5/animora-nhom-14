import type { Metadata } from "next";
import { ExpertProvider } from "@/components/expert/ExpertProvider";
import { ExpertSidebar } from "@/components/expert/ExpertSidebar";
import { ExpertHeader } from "@/components/expert/ExpertHeader";

export const metadata: Metadata = {
  title: "Animora Expert - Cổng Làm Việc Chuyên Viên & Bác Sĩ",
  description: "Cổng thông tin nghiệp vụ lâm sàng và dịch vụ chăm sóc thú cưng Animora.",
};

export default function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ExpertProvider>
      <div className="min-h-screen relative flex flex-col md:flex-row bg-[#FAF6F0] dark:bg-background text-zinc-900 dark:text-foreground selection:bg-[#FF7F6B] selection:text-white transition-colors duration-200">
        {/* Họa tiết dấu chân mờ nằm dưới mọi thẻ nội dung, không bắt sự kiện chuột, chỉ lộ ở vùng lề ngoài */}
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden opacity-[0.045] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 24px 24px, #6B1F2E 2.5px, transparent 3px), radial-gradient(circle at 18px 16px, #6B1F2E 1.5px, transparent 2px), radial-gradient(circle at 24px 14px, #6B1F2E 1.5px, transparent 2px), radial-gradient(circle at 30px 16px, #6B1F2E 1.5px, transparent 2px)",
            backgroundSize: "96px 96px",
          }}
        />

        <ExpertSidebar />

        <div className="flex-1 flex flex-col min-w-0 md:pl-64 relative">
          <ExpertHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 relative">
            {children}
          </main>
        </div>
      </div>
    </ExpertProvider>
  );
}

