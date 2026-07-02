import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EvOLve Research Tag",
  description:
    "Faculty publications and research team management for Evolutionary Optimization, Learning and Adaptive Systems."
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
