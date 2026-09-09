import type { Metadata, Viewport } from "next";
import "./globals.css";
import SwRegister from "@/app/components/sw";
import HelpBot from "@/app/components/HelpBot";

export const metadata: Metadata = {
  title: "Kisan Carbon Hub | Earn money by saving the planet",
  description:
    "Farmers measure their land, trees and vehicles, earn carbon credits, and sell them on the digital marketplace. Your data stays private to your account.",
  applicationName: "Kisan Carbon Hub",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Kisan Carbon",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <SwRegister />
        <HelpBot />
      </body>
    </html>
  );
}