import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Animora Admin - Bảng Điều Khiển Quản Trị Hệ Sinh Thái",
  description: "Hệ thống quản lý dịch vụ chăm sóc thú cưng Animora.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF6F0] dark:bg-background text-zinc-900 dark:text-foreground selection:bg-[#FF7F6B] selection:text-white transition-colors duration-200">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
