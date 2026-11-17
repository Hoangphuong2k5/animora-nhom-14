import type { Metadata } from "next";
import ManagerHeader from "@/components/manager/ManagerHeader";
import ManagerSidebar from "@/components/manager/ManagerSidebar";

export const metadata: Metadata = {
  title: "Animora Manager",
  description: "Hệ thống điều phối và vận hành toàn diện Animora Pet Care.",
};

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-portal-theme="slate"
      className="min-h-screen flex flex-col md:flex-row bg-[#FAF6F0] dark:bg-background text-zinc-900 dark:text-foreground selection:bg-indigo-600 selection:text-white transition-colors duration-200"
    >
      <ManagerSidebar />

      <div className="flex-1 flex flex-col min-w-0 md:pl-[72px]">
        <ManagerHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

