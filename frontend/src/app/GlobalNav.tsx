"use client";

import { usePathname, useRouter } from "next/navigation";
import { useProtocol } from "@/context/ProtocolContext";
import { Hexagon, ChevronRight, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function GlobalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useProtocol();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  let role = "";
  if (pathname.includes("/issuer")) role = "Issuer Console";
  else if (pathname.includes("/student")) role = "Identity Wallet";
  else if (pathname.includes("/verifier")) role = "Verification Monitor";

  return (
    <header className="w-full border-b border-slate-800/80 bg-[#111827]/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center shadow-inner border border-white/20">
              <Hexagon className="w-4 h-4 text-zinc-300 fill-zinc-500/20" strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-100 hidden sm:block group-hover:text-white transition-colors">
              ZK Identity Protocol
            </span>
          </Link>
          
          {role && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300 tracking-tight">
                  {role}
                </span>
              </div>
            </>
          )}
        </div>
        
        {/* Right: Network & Profile */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#0B0F17] border border-slate-800 rounded-full shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Localhost 8545</span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 transition-colors"
            >
              <User className="w-4 h-4 text-slate-300" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-200">Current Session</p>
                  <p className="text-[10px] text-slate-500 truncate">admin@zk-identity.network</p>
                </div>
                <div className="p-1">
                  <button className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" /> Preferences
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-slate-800 rounded-md flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
