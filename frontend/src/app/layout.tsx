import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProtocolProvider } from "@/context/ProtocolContext";
import { Toaster } from "sonner";
import GlobalNav from "./GlobalNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Avengers Institutional Hub",
  description: "Aceternity UI Level ZKP Verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased dark ${inter.className}`}>
      <body className="min-h-full flex flex-col bg-black text-slate-200 font-sans selection:bg-indigo-900/50 relative overflow-x-hidden">
        
        {/* Massive Ambient Light Orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        <ProtocolProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <GlobalNav />
            <main className="flex-1 flex flex-col max-w-[1280px] w-full mx-auto px-6 py-10">
              {children}
            </main>
          </div>
          <Toaster 
            theme="dark" 
            position="bottom-right"
            toastOptions={{
              className: 'bg-black/80 backdrop-blur-2xl border border-white/10 text-white font-sans text-sm rounded-xl shadow-2xl'
            }} 
          />
        </ProtocolProvider>
      </body>
    </html>
  );
}
