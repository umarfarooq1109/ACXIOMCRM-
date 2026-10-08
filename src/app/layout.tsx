import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Acxiom CRM | Role-Based Customer Relationship Management",
  description: "Customers, pipeline and follow-ups in one place. Production-grade commercial CRM.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full bg-white text-slate-700 font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

