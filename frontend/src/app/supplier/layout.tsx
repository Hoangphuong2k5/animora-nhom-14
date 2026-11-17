import type { Metadata } from "next";
import SupplierHeader from "@/components/supplier/SupplierHeader";
import SupplierSidebar from "@/components/supplier/SupplierSidebar";

export const metadata: Metadata = {
  title: "Animora Supplier Portal",
  description: "Cổng đối tác Nhà cung cấp hàng hóa và thuốc thú y Animora.",
};

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-portal-theme="slate"
      className="min-h-screen flex flex-col md:flex-row bg-[#FAF6F0] dark:bg-background text-zinc-900 dark:text-foreground selection:bg-teal-600 selection:text-white transition-colors duration-200"
    >
      <SupplierSidebar />

      <div className="flex-1 flex flex-col min-w-0 md:pl-[72px]">
        <SupplierHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
