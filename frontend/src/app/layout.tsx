import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter is a clean professional font suitable for government platforms
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OPCS eSupport | Office of the Prime Cabinet Secretary",
  description: "Centralized IT Support Platform — Republic of Kenya",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}