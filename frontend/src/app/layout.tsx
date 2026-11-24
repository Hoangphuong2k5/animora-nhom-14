import type { Metadata } from "next";
import { Suspense } from "react";
import { Baloo_2, Nunito } from "next/font/google";
import { AppProviders } from "@/components/AnimoraProviders";
import { ColorBleedBackground } from "@/components/pet/ColorBleedBackground";
import { ClientVisualEffects } from "@/components/pet/ClientVisualEffects";
import { DevRoleSwitcher } from "@/components/dev/DevRoleSwitcher";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const baloo2 = Baloo_2({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Animora - Hệ Sinh Thái Chăm Sóc Thú Cưng Tận Tâm",
  description:
    "Dịch vụ spa, khách sạn, khám sức khỏe, nhận nuôi và cửa hàng vật phẩm cao cấp dành cho chó mèo.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${baloo2.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preload"
          href="/assets/images/animora_pet_logo_1793179870995.jpg"
          as="image"
        />
        <link
          rel="preload"
          href="/assets/aistudio/cute_dog_transparent.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <script>
          {`try {
  var t = localStorage.getItem('animora_theme');
  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
  var isPortal =
    window.location.pathname.startsWith('/admin') ||
    window.location.pathname.startsWith('/manager') ||
    window.location.pathname.startsWith('/expert') ||
    window.location.pathname.startsWith('/staff') ||
    window.location.pathname.startsWith('/doctor');
  if (!isPortal) {
    var e = localStorage.getItem('animora_effects_enabled');
    var p = localStorage.getItem('animora_performance_mode');
    if (e === 'false' || p === 'true') {
      document.documentElement.setAttribute('data-effects', 'disabled');
    }
  }
} catch (e) {}`}
        </script>
      </head>
      <body className="min-h-full flex flex-col relative overflow-x-hidden selection:bg-[var(--coral)] selection:text-white">
        <AppProviders>
          <div className="isolate min-h-screen flex flex-col relative overflow-x-hidden">
            <Suspense fallback={null}>
              <ColorBleedBackground lang="vi" />
              <main className="flex-1 relative z-10">{children}</main>
              <ClientVisualEffects />
            </Suspense>
            <DevRoleSwitcher />
            <Toaster richColors position="top-right" duration={2500} />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
