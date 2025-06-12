import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Navbar } from "@/components/Navbar/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brap HQ",
  description:
    "Join the swarm and explore the Big Brap ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-white"}>
        <ThirdwebProvider>
          <Navbar />
          <div className="pt-24">
            {/* Add top padding to avoid overlap with fixed navbar */}
            {children}
          </div>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
