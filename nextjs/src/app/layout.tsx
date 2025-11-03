import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CatfishBanner from "@/components/sections/CatfishBanner";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import AnimatedLayout from "@/components/layout/AnimatedLayout";
import Favicon from "@/app/favicon.ico";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Vaoluoi TV - Xem trực tiếp bóng đá",
  description: "Xem trực tiếp các trận đấu bóng đá hấp dẫn nhất, cập nhật tin tức và kết quả bóng đá mới nhất",
  icons: {
    icon: {
      url: Favicon.src
    },
    shortcut: {
      url: Favicon.src
    },
    apple: {
      url: Favicon.src
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        {/* Defer non-critical scripts */}
        <script 
          src="https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js" 
          defer
        ></script>
        {/* reCAPTCHA v3 - sẽ được load động khi cần */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark`}
      >
        <AuthProvider>
          <AnimatedLayout>
            <Header />
            {children}
            <Footer />
            <CatfishBanner />
            <ScrollToTop />
          </AnimatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
