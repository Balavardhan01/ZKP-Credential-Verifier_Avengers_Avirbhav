"use client";

import { usePathname, useRouter } from "next/navigation";
import { useProtocol } from "@/context/ProtocolContext";
import { LogOut, ShieldCheck } from "lucide-react";

export default function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useProtocol();

  if (pathname === "/") return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  let role = "";
  if (pathname.includes("/issuer")) role = "University Admin";
  else if (pathname.includes("/student")) role = "Candidate (Wallet)";
  else if (pathname.includes("/verifier")) role = "HR Verifier";

  return (
    <header className="border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-100 font-semibold tracking-widest text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          AVENGERS ZKP <span className="text-zinc-600 mx-2">/</span> <span className="text-emerald-500 font-mono text-xs uppercase bg-emerald-950/30 px-2 py-1 rounded">{role}</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          SIGN OUT
        </button>
      </div>
    </header>
  );
}
