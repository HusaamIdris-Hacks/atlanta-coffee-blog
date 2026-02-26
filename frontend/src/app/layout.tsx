import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlanta Coffee Shops",
  description: "Discover coffee shops around Atlanta",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
