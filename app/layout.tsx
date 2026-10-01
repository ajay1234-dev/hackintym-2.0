import type { Metadata, Viewport } from "next";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "HackinTym'26 2.0 — Authoritative 30-Hour Live Hackathon Dashboard",
  description:
    "Official live leaderboard, real-time authoritative 30-hour countdown timer, top podium rankings, and score tracker for the HackinTym'26 2.0 Intra-College Hackathon.",
  keywords: [
    "HackinTym'26 2.0",
    "HackinTym",
    "Hackathon",
    "Live Leaderboard",
    "Intra-College Hackathon",
    "Competition Dashboard",
    "Real-time Scores",
  ],
  authors: [{ name: "HackinTym'26 2.0 Technical Organizing Committee" }],
};

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen relative selection:bg-rose-500/30 selection:text-white antialiased">
        {/* Soft Organic Ambient Backdrop Lighting */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px]" />
          <div
            className="absolute top-1/4 -right-48 w-[650px] h-[650px] bg-cyan-600/10 rounded-full blur-[160px]"
          />
          <div className="absolute bottom-10 left-1/3 w-[550px] h-[550px] bg-purple-600/10 rounded-full blur-[150px]" />
        </div>

        {/* Main Application Container */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
