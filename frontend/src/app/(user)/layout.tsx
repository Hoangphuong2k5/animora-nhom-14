import { AdminUserRouteGuard } from "@/components/shared/AdminUserRouteGuard";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative w-full">
      <AdminUserRouteGuard />
      {children}
    </div>
  );
}
