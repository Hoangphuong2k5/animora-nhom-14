import Link from "next/link";
import { CONFIG, ROUTES } from "@/constants/config.constant";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <Link
        href={ROUTES.HOME}
        className="mb-6 text-2xl font-black tracking-tight"
      >
        {CONFIG.APP_NAME}
      </Link>
      <div className="w-full max-w-md p-8 rounded-2xl border bg-white dark:bg-zinc-900 shadow-xs">
        {children}
      </div>
    </div>
  );
}
