import { SessionProvider } from "next-auth/react";
import AuthProvider from "@/components/Auth/AuthProvider";
import ToastProvider from "@/components/ToastProvider";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import CompareProvider from "@/contexts/CompareContext";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getUserForHeader } from "@/lib/actions/user";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { getCart } from "@/lib/actions/cart";
import { CartProvider } from "@/app/cart/context/CartContext";
import AppProviders from "@/components/AppProvider";
import SiteHeader from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Madala - Cửa hàng thời trang và phụ kiện",
  description:
    "Madala - Điểm đến hoàn hảo cho thời trang và phụ kiện chất lượng cao",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="...">
        <AuthProvider>
          <ToastProvider />
          {/* AppProviders sẽ lo việc fetch cart và cung cấp context */}
          <AppProviders>
            <ConditionalLayout
              header={<SiteHeader />} // SiteHeader sẽ tự fetch data của nó
              footer={<Footer />}
            >
              <main className="min-h-screen">{children}</main>
            </ConditionalLayout>
          </AppProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
