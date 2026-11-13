import type { Metadata } from "next";
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
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('animora_theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col relative overflow-x-hidden selection:bg-(--coral) selection:text-white">
        <AppProviders>
          <div className="isolate min-h-screen flex flex-col relative overflow-x-hidden">
            <ColorBleedBackground lang="vi" />
            <ClientVisualEffects />
            <main className="flex-1 relative">{children}</main>
            <DevRoleSwitcher />
            <Toaster richColors position="top-right" duration={2500} />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
