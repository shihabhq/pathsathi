import type { Metadata, Viewport } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const bangla = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali", "latin"],
});

export const metadata: Metadata = {
  title: "পথসাথী",
  description: "অন্ধ মানুষের জন্য বাংলা ভয়েস সঙ্গী (কনসেপ্ট ডেমো)",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "পথসাথী", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${bangla.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
