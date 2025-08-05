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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getUserForHeader();

  // lấy dữ liệu giỏ hàng của người dùng
  const cartResult = await getCart();
  const initialCart = cartResult.success ? cartResult.data : null;

  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider />
          <CartProvider initialCart={JSON.parse(JSON.stringify(initialCart))}>
            <ConditionalLayout
              header={<Header initialUserData={userData} />}
              footer={<Footer />}
            >
              <CompareProvider>
                <main className="min-h-screen">{children}</main>
              </CompareProvider>
            </ConditionalLayout>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
