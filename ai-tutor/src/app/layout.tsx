import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Providers } from "@/components/Providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI Tutor - Nexus Study Abroad",
  description: "AI-powered IELTS tutoring for ambitious students targeting prestigious universities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-mono bg-background text-foreground`}>
        <Providers>
          <Navigation />
          <main className="ml-60 min-h-screen bg-background">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}