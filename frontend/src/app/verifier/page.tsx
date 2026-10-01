"use client";

import { useProtocol } from "@/context/ProtocolContext";
import { QRCodeSVG } from "qrcode.react";
import { 
  Copy, ShieldCheck, Cpu, Settings2, History, ExternalLink, 
  CheckCircle2, KeyRound, Building, Search, 
  Activity, FileCheck, Layers, Scan, XCircle, RotateCcw, Download
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

export default function EnterpriseHRPlatform() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [matrixData, setMatrixData] = useState<string[]>([]);

  const { 
    verificationState, 
    resetVerification,
    txHash, 
    policy, 
    setPolicy, 
    auditLogs, 
    addAuditLog 
  } = useProtocol();

  const isIdle = verificationState === "IDLE";
  const isPending = verificationState === "PENDING";
  const isSuccess = verificationState === "SUCCESS";
  const isFailed = verificationState === "FAILED";

  const qrPayload = "https://identity.avengers.network/request/7f38a193";
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (isPending) {
      const interval = setInterval(() => {
        const hex = () => Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
        setMatrixData(prev => [`0x${hex()}${hex()}... == 0x${hex()}${hex()}...`, ...prev].slice(0, 8));
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isPending]);

  // Unified Audit Logging: Captures both SUCCESS and REJECTION accurately
  useEffect(() => {
    if (hasLoggedRef.current) return;

    if (isSuccess) {
      // Fallback in case txHash hasn't arrived across the BroadcastChannel yet
      const finalHash = txHash || `0x${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}...`;
      
      const alreadyLogged = auditLogs.some(log => log.txHash === finalHash && log.status === "Verified");
      if (!alreadyLogged) {
        addAuditLog({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          target: "0x71C...4f9", 
          policy: `${policy.field} ${policy.operator} ${policy.value}`,
          status: "Verified",
          txHash: finalHash
        });
      }
      hasLoggedRef.current = true;
    } else if (isFailed) {
      addAuditLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        target: "0x71C...4f9", 
        policy: `${policy.field} ${policy.operator} ${policy.value}`,
        status: "Rejected",
        txHash: "N/A"
      });
      hasLoggedRef.current = true;
    }
  }, [isSuccess, isFailed, txHash, policy, auditLogs, addAuditLog]);

  useEffect(() => {
    if (isIdle) hasLoggedRef.current = false;
  }, [isIdle]);

  const handleLogin = async () => {
    setIsAuthenticating(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsAuthenticated(true);
    toast.success("Authenticated via Enterprise SSO");
  };

  const copyTx = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Transaction hash copied");
  };

  const downloadReceipt = () => {
    const receipt = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation", "ZeroKnowledgeProof"],
      verifier: "Enterprise HR Portal",
      timestamp: new Date().toISOString(),
      circuit: "Groth16 BN128",
      policyEvaluated: `${policy.field} ${policy.operator} ${policy.value}`,
      result: isSuccess ? "TRUE" : "FALSE",
      transactionHash: txHash || "N/A"
    };
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zkp-receipt-${txHash?.substring(0,8) || "failed"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cryptographic Receipt Downloaded");
  };

  const isNumeric = !isNaN(Number(policy.value)) && policy.value.trim() !== "";
  const displayVal = isNumeric ? policy.value : `"${policy.value}"`;

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#050505] relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pointer-events-none" />
        <div className="w-full max-w-md bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Building className="w-8 h-8 text-indigo-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Zero-Knowledge Gateway</h1>
            <p className="text-sm text-slate-500">Enterprise HR & Compliance Portal</p>
          </div>
          <button onClick={handleLogin} disabled={isAuthenticating} className="w-full bg-white text-black font-bold hover:bg-indigo-50 transition-all py-4 rounded-xl text-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02]">
            {isAuthenticating ? <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><KeyRound className="w-5 h-5" /> Login via Okta SSO</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-slate-300 font-sans overflow-hidden selection:bg-indigo-500/30">
      <div className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col justify-between shrink-0 relative z-20">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                <Building className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-bold text-xs tracking-widest text-white uppercase">Verifier Hub</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 text-white text-sm font-medium border border-white/5">
              <Activity className="w-4 h-4 text-indigo-400" /> Live SIEM
            </a>
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative p-8">
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <header className="flex items-center justify-between border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Compliance Monitor</h1>
              <p className="text-sm text-slate-500 mt-1 font-mono flex items-center gap-2">
                Listening for incoming cryptographic proofs... 
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-bold tracking-widest">ERC-4337 Paymaster Active</span>
              </p>
            </div>
            <button 
              onClick={() => resetVerification()} 
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset / New Request
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Total Verified</p>
                <h3 className="text-3xl font-light text-white">1,204</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <FileCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Avg Verify Time</p>
                <h3 className="text-3xl font-light text-white">1.2s</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Active Policies</p>
                <h3 className="text-3xl font-light text-white">4</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl flex flex-col h-[440px]">
              <h2 className="text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2 mb-8">
                <Settings2 className="w-4 h-4 text-indigo-500" /> Active Verification Policy
              </h2>
              
              <div className="flex-1 flex flex-col gap-5">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">Attribute</label>
                    <select 
                      value={policy.field} 
                      onChange={(e) => setPolicy({ ...policy, field: e.target.value })} 
                      className="w-full bg-black border border-white/10 rounded-lg px-2 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none shadow-inner"
                    >
                      <option value="Cumulative GPA">Cumulative GPA</option>
                      <option value="Degree Program">Degree Program</option>
                      <option value="College">College</option>
                      <option value="Year Passed">Year Passed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">Operator</label>
                    <select 
                      value={policy.operator} 
                      onChange={(e) => setPolicy({ ...policy, operator: e.target.value })} 
                      className="w-full bg-black border border-white/10 rounded-lg px-2 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none shadow-inner text-center font-mono"
                    >
                      <option value=">=">{">="}</option>
                      <option value="<=">{"<="}</option>
                      <option value="==">{"=="}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">Threshold</label>
                    <input 
                      type="text" 
                      value={policy.value} 
                      onChange={(e) => setPolicy({ ...policy, value: e.target.value })} 
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 shadow-inner font-mono" 
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-auto">
                  <div className="p-4 rounded-xl bg-black border border-white/5 font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto shadow-inner">
                    <span className="text-slate-600">{"{"}</span><br/>
                    &nbsp;&nbsp;<span className="text-purple-400">credentialSubject&quot;</span>: {"{"} <br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">{`"${policy.field}"`}</span>: {"{"} <br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">{`"$${policy.operator === '>=' ? 'gte' : policy.operator === '<=' ? 'lte' : 'eq'}"`}</span>: <span className="text-amber-400">{displayVal}</span> <br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{"}"} <br/>
                    &nbsp;&nbsp;{"}"} <br/>
                    <span className="text-slate-600">{"}"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl h-[440px] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-emerald-500/5 opacity-50 pointer-events-none" />
              
              {isIdle && (
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="p-5 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] border border-slate-200 mb-8 transform transition-transform duration-500 group-hover:scale-105">
                    <QRCodeSVG value={qrPayload} size={160} level="M" includeMargin={false} fgColor="#000000" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight mb-2">Awaiting Payload</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-[280px]">
                    Waiting for proof satisfying <span className="text-indigo-400 font-mono">{policy.field} {policy.operator} {policy.value}</span>.
                  </p>
                </div>
              )}

              {isPending && (
                <div className="flex flex-col w-full h-full p-8 relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                      <Scan className="w-5 h-5 text-indigo-500 animate-pulse" />
                      Evaluating Cryptographic Proof
                    </h3>
                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
                  </div>
                  
                  <div className="flex-1 bg-black/80 rounded-xl border border-white/10 p-4 font-mono text-[10px] text-indigo-400/70 overflow-hidden flex flex-col-reverse shadow-inner relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
                    {matrixData.map((line, i) => (
                      <div key={i} className="whitespace-nowrap opacity-80 animate-in fade-in slide-in-from-bottom-2">{line}</div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between items-center px-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Curve: BN128</span>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Running Pairing Checks...</span>
                  </div>
                </div>
              )}

              {isSuccess && (
                <div className="w-full flex flex-col animate-in zoom-in-95 duration-500 h-full justify-center p-8 relative z-10">
                  <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
                  
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-[bounce_1s_ease-in-out_1]">
                      <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight mb-1">Proof Validated</h3>
                    <p className="text-xs text-emerald-400/80 font-mono">Candidate meets requirements.</p>
                  </div>

                  <div className="w-full mx-auto space-y-3 max-w-sm">
                    <div className="bg-black border border-emerald-500/30 rounded-xl p-3.5 shadow-inner flex justify-between items-center relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      <span className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-2">Circuit Output</span>
                      <span className="text-lg font-mono text-emerald-400 font-bold">TRUE</span>
                    </div>
                    <div className="bg-black border border-white/5 rounded-xl p-3.5 shadow-inner">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Transaction Hash</span>
                        <button onClick={() => txHash && copyTx(txHash)} className="text-slate-500 hover:text-white transition-colors"><Copy className="w-4 h-4"/></button>
                      </div>
                      <div className="text-xs font-mono text-indigo-300 truncate bg-white/5 p-2 rounded">{txHash || "0x..."}</div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={downloadReceipt} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center gap-2">
                        <Download className="w-3.5 h-3.5" /> Receipt
                      </button>
                      <button onClick={() => resetVerification()} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-colors">
                        Reset Monitor
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isFailed && (
                <div className="w-full flex flex-col animate-in zoom-in-95 duration-500 h-full justify-center p-8 relative z-10">
                  <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
                  
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-[pulse_1s_ease-in-out_infinite]">
                      <XCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight mb-1">Proof Rejected</h3>
                    <p className="text-xs text-red-400/80 font-mono">Candidate did not meet policy constraints.</p>
                  </div>

                  <div className="w-full mx-auto space-y-3 max-w-sm">
                    <div className="bg-black border border-red-500/30 rounded-xl p-3.5 shadow-inner flex justify-between items-center relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                      <span className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-2">Circuit Output</span>
                      <span className="text-lg font-mono text-red-400 font-bold">FALSE</span>
                    </div>
                    <button onClick={() => resetVerification()} className="w-full py-3 mt-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-colors">
                      Reset Monitor
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl overflow-hidden mt-8">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/50">
              <h2 className="text-xs font-bold text-slate-300 tracking-widest uppercase flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" /> Immutable On-Chain Ledger
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-black/80 border-b border-white/5 text-slate-500">
                    <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Target Identifier</th>
                    <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Policy Checked</th>
                    <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center text-slate-600 font-medium">
                        Awaiting network events...
                      </td>
                    </tr>
                  )}
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-5 text-slate-400 font-mono text-xs whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-slate-300 font-mono text-xs">
                        {log.target}
                      </td>
                      <td className="px-8 py-5">
                        <div className="inline-flex px-2.5 py-1.5 rounded bg-black border border-white/10 text-slate-300 font-mono text-[10px]">
                          {log.policy}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {log.status === "Verified" ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified
                          </div>
                        ) : log.status === "Rejected" ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                            <XCircle className="w-3 h-3" /> Rejected
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs font-bold uppercase">{log.status}</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => copyTx(log.txHash)} 
                          disabled={log.txHash === "N/A"}
                          className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${log.txHash === "N/A" ? 'text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
                          title={log.txHash === "N/A" ? "No TxHash (Rejected)" : "View on Explorer"}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
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
  );
}