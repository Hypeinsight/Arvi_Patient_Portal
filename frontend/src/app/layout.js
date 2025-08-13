import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/top-nav";
import PatientsPage from "./patients/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ARVI Patient Portal",
  description: "Patient Portal built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{
          backgroundImage: "url('/new-bg.png')",
        }}>
        <TopNav />
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
