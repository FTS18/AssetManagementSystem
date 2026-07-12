import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AssetFlow — Enterprise Asset & Resource Management System",
  description: "A centralized ERP platform to track, allocate, audit, and maintain corporate assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={bricolage.variable}>
      <body className="min-h-screen antialiased" style={{ fontFamily: "var(--font-bricolage)" }}>
        {children}
      </body>
    </html>
  );
}
