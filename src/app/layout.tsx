import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebGenie AI",
  description: "AI Digital Presence Intelligence Platform"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
