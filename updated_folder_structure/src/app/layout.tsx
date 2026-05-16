import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navigation from "@/components/layout/Navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibmPlexMono = IBM_Plex_Mono({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "AI Tutor Nexus",
  description: "AI-powered IELTS tutoring for ambitious students targeting prestigious universities",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexMono.variable} font-mono bg-background text-foreground`}>
        <Providers>
          <Navigation />
          <main className="ml-60 min-h-screen bg-background">{children}</main>
        </Providers>
      </body>
    </html>
  );
}