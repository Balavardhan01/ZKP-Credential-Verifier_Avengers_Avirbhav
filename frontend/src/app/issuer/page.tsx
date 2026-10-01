"use client";

import { useState } from "react";
import { useProtocol } from "@/context/ProtocolContext";
import { toast } from "sonner";
import { 
  CheckCircle2, ShieldAlert, FileBadge2, XCircle, University, Lock, 
  LayoutDashboard, Database, FileSpreadsheet, Settings, UploadCloud,
  MoreHorizontal
} from "lucide-react";

export default function UniversityPlatform() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { issueCompleteCredential, issuedCredentials, revokeCredential } = useProtocol();

  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [college, setCollege] = useState("");
  const [gpa, setGpa] = useState("");
  const [yearPassed, setYearPassed] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsAuthenticated(true);
    toast.success("Authenticated via Institutional SSO");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !degree || !gpa || !college || !yearPassed) return;

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));

    issueCompleteCredential(
      { name, degree, college, gpa, yearPassed },
      {
        id: `did:polygonid:amoy:0x${Math.floor(Math.random()*16777215).toString(16)}...`,
        name,
        degree,
        date: new Date().toISOString(),
        status: "Active"
      }
    );
    
    toast.success("Credential Successfully Signed", {
      description: "JSON-LD payload has been generated and securely stored.",
    });

    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setName("");
      setDegree("");
      setCollege("");
      setGpa("");
      setYearPassed("");
      setIsSuccess(false);
    }, 3000);
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    await new Promise(r => setTimeout(r, 1500));
    revokeCredential(id);
    setRevokingId(null);
    toast.error("Credential Revoked", {
      description: "Cryptographic signature invalidated on-chain."
    });
  };

  const mockStudents = [
    { id: "did:polygonid:amoy:0x8F9...1a2", name: "Elena Rostova", degree: "Ph.D. Quantum Physics", date: new Date(Date.now() - 1000*60*60*24*12).toISOString(), status: "Active" },
    { id: "did:polygonid:amoy:0x3C4...9b1", name: "Marcus Chen", degree: "B.S. Computer Science", date: new Date(Date.now() - 1000*60*60*24*45).toISOString(), status: "Active" },
    { id: "did:polygonid:amoy:0x7A1...4f2", name: "Sarah Jenkins", degree: "M.A. Literature", date: new Date(Date.now() - 1000*60*60*24*90).toISOString(), status: "Revoked" },
  ];

  const allCredentials = [...issuedCredentials, ...mockStudents];

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#09090b] relative z-10">
        <div className="absolute inset-0 bg-slate-900/20 blur-[150px] pointer-events-none rounded-full max-w-2xl mx-auto" />
        
        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl relative">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center mb-4 shadow-inner">
              <University className="w-7 h-7 text-slate-300" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Avirbhav University</h1>
            <p className="text-sm text-slate-400">Registrar Portal Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Institutional Email</label>
              <input type="email" required defaultValue="admin@avirbhav.edu" className="w-full bg-black/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-slate-400 transition-all shadow-inner" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Password</label>
              <input type="password" required defaultValue="********" className="w-full bg-black/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-slate-400 transition-all shadow-inner" />
            </div>
            <button type="submit" disabled={isAuthenticating} className="w-full mt-2 bg-slate-200 text-black font-semibold hover:bg-white transition-colors py-3 rounded-lg text-sm flex items-center justify-center gap-2">
              {isAuthenticating ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#09090b] text-slate-300 font-sans overflow-hidden">
      <div className="w-64 border-r border-white/10 bg-[#09090b] flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
                <University className="w-4 h-4 text-slate-300" />
              </div>
              <span className="font-bold text-sm tracking-wide text-white">Avirbhav Admin</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
              <Database className="w-4 h-4" /> Schemas
            </a>
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-slate-900/10 blur-[150px] pointer-events-none rounded-b-full" />
        
        <div className="p-8 max-w-7xl mx-auto space-y-6 relative z-10">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Credential Issuance</h1>
            <p className="text-sm text-slate-500 mt-1">Generate and sign cryptographically secure identity payloads.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <h2 className="text-sm font-semibold text-white tracking-wide mb-6 uppercase flex items-center gap-2">
                <FileBadge2 className="w-4 h-4 text-slate-400" /> Manual Issuance
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5 block">Candidate Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-slate-500 shadow-inner" placeholder="e.g. Elena Rostova" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5 block">College/Institution</label>
                    <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-slate-500 shadow-inner" placeholder="Engineering Dept" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5 block">Degree Program</label>
                    <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-slate-500 shadow-inner" placeholder="B.S. Computer Science" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5 block">Cumulative GPA</label>
                    <input type="number" step="0.01" value={gpa} onChange={(e) => setGpa(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-slate-500 shadow-inner" placeholder="4.0" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5 block">Year Passed</label>
                    <input type="number" value={yearPassed} onChange={(e) => setYearPassed(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-slate-500 shadow-inner" placeholder="2024" />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || isSuccess || !name || !degree || !gpa || !college || !yearPassed}
                  className="w-full bg-slate-200 text-black font-semibold hover:bg-white transition-colors disabled:bg-white/5 disabled:text-slate-500 disabled:border disabled:border-white/10 py-3 rounded-lg text-sm flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? "Signing..." : isSuccess ? <><CheckCircle2 className="w-4 h-4 text-emerald-600"/> Issued</> : "Sign & Generate Payload"}
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col">
              <h2 className="text-sm font-semibold text-white tracking-wide mb-6 uppercase flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" /> Revocation Registry
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-black/40 border-b border-white/10 text-slate-400">
                      <th className="px-4 py-3 font-medium text-xs">Name</th>
                      <th className="px-4 py-3 font-medium text-xs">Program</th>
                      <th className="px-4 py-3 font-medium text-xs">Status</th>
                      <th className="px-4 py-3 font-medium text-xs text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allCredentials.map((cred) => (
                      <tr key={cred.id}>
                        <td className="px-4 py-3 text-slate-200 text-xs font-medium">{cred.name}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{cred.degree}</td>
                        <td className="px-4 py-3">
                          {cred.status === "Active" ? (
                            <span className="text-emerald-400 text-[10px] font-bold uppercase">Active</span>
                          ) : (
                            <span className="text-red-400 text-[10px] font-bold uppercase">Revoked</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {cred.status === "Active" && (
                            <button onClick={() => handleRevoke(cred.id)} className="text-red-400 text-xs hover:text-red-300">Revoke</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}