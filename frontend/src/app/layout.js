import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/top-nav";
import PatientsPage from "./patients/page";
import Footer from "@/components/Footer";

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
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased py-4 md:py-8 min-h-screen flex flex-col gap-4`} style={{
          backgroundImage: "url('/new-bg.png')",
          // backgroundSize: "cover",
          // backgroundPosition: "center",
        }}>
        <TopNav />
        <main className="flex-1 flex flex-col justify-center">{children}</main>
        <Footer/>
      </body>
    </html>
  );
}
