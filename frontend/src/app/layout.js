import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/top-nav";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Arvi Patient Portal",
  description: "Patient Portal built with Next.js",
  icons: {
    icon: "/main_logo.png",
    shortcut: "/main_logo.png",
    apple: "/main_logo.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{
          backgroundImage: "url('/new-bg.png')",
          // backgroundSize: "cover",
          // backgroundPosition: "center",
        }}>
        {/* Page padding lives here, not on <body>: dropdowns reset the body's
            padding while open, which made the whole page jump */}
        <div className="py-4 md:py-6 short:py-2 min-h-screen flex flex-col gap-4 short:gap-2">
          <TopNav />
          <main className="flex-1 flex flex-col justify-center">{children}</main>
        </div>
        <Toaster position="top-right" richColors closeButton />
        {/* <Footer/> */}
      </body>
    </html>
  );
}
