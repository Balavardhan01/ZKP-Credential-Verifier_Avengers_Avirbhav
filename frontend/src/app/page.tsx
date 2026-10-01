"use client";

import { Building2, Wallet, ShieldCheck, ExternalLink, Network } from "lucide-react";
import Link from "next/link";

export default function DemoDirectory() {
  const portals = [
    {
      title: "University Registrar Portal",
      description: "Avirbhav University's private intranet for issuing cryptographically signed credentials.",
      icon: Building2,
      href: "/issuer"
    },
    {
      title: "Candidate Identity Vault",
      description: "A personal, high-security digital wallet installed on the user's local device.",
      icon: Wallet,
      href: "/student"
    },
    {
      title: "Enterprise HR Gateway",
      description: "A Fortune 500 B2B SaaS platform used by corporations to cryptographically verify candidates.",
      icon: ShieldCheck,
      href: "/verifier"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12 relative z-10">
      
      <div className="w-full flex items-center justify-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(99,102,241,0.1)]">
          <Network className="w-4 h-4" />
          Simulated Multi-Entity Environment
        </div>
      </div>

      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 drop-shadow-2xl mb-6">
          Zero-Knowledge Identity Demo
        </h1>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-left max-w-3xl mx-auto shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            Judges Note
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed font-light">
            In a real-world production environment, these three entities operate on entirely separate domains, servers, and networks. They do not share a unified login gateway. For this demonstration, we have centralized the routing. Please select an environment below to launch its respective, isolated application.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {portals.map((portal) => (
          <Link
            key={portal.title}
            href={portal.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300 group cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-5">
              <div className="inline-flex items-center justify-center p-3 rounded-xl bg-black/50 border border-white/5 shadow-inner">
                <portal.icon className="w-6 h-6 text-zinc-300" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{portal.title}</h2>
                <p className="text-sm text-zinc-400">{portal.description}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}