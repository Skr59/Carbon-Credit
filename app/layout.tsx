import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apex Estates | Property Post Maker & Carbon Credit Calculator",
  description:
    "Generate property post creatives and calculate carbon credits using Google satellite imagery. AI-powered real-estate and environmental tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
