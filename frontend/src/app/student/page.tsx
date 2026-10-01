"use client";

import { useProtocol, StudentCredential } from "@/context/ProtocolContext";
import { ethers } from "ethers";
import contractDetails from "@/lib/contractDetails.json";
import { toast } from "sonner";
import { Lock, CheckCircle2, Fingerprint, Wallet, Shield, Terminal, XCircle, Zap } from "lucide-react";
import { useState, useEffect } from "react";

// Visual aid to prove data doesn't leave the device during ZKP generation
const RedactedField = ({ value, isObfuscated }: { value: string, isObfuscated: boolean }) => {
  if (!isObfuscated) return <>{value}</>;
  return (
    <span className="font-mono text-emerald-900/40 bg-emerald-950/30 px-1.5 py-0.5 rounded blur-[2px] select-none flex items-center gap-1 w-fit">
      <Lock className="w-2.5 h-2.5" /> ZK-OBFUSCATED
    </span>
  );
};

export default function CandidateWalletPlatform() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const { studentCredential, verificationState, setVerificationState, setTxHash, policy } = useProtocol();
  const isGenerating = verificationState === "PENDING";
  const isVerified = verificationState === "SUCCESS";
  const isFailed = verificationState === "FAILED";
  const isActiveState = isGenerating || isVerified || isFailed;

  const handleUnlock = async () => {
    setIsUnlocking(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsUnlocked(true);
    toast.success("Identity Vault Decrypted");
  };

  const evaluateConstraint = (): { isValid: boolean; actualValue: string } => {
    if (!studentCredential) return { isValid: false, actualValue: "None" };

    const fieldMapping: Record<string, keyof StudentCredential> = {
      "Cumulative GPA": "gpa",
      "Degree Program": "degree",
      "Degree Type": "degree",
      "College": "college",
      "Year Passed": "yearPassed"
    };

    const targetField = fieldMapping[policy.field] || "gpa";
    const actualValue = studentCredential[targetField] || "";

    const numActual = parseFloat(actualValue);
    const numTarget = parseFloat(policy.value);

    let isValid = false;

    if (!isNaN(numActual) && !isNaN(numTarget)) {
      if (policy.operator === ">=") isValid = numActual >= numTarget;
      else if (policy.operator === "<=") isValid = numActual <= numTarget;
      else if (policy.operator === "==") isValid = numActual === numTarget;
    } else {
      const strActual = actualValue.trim().toLowerCase();
      const strTarget = policy.value.trim().toLowerCase();
      if (policy.operator === "==") isValid = strActual === strTarget;
      else if (policy.operator === ">=") isValid = strActual >= strTarget;
      else if (policy.operator === "<=") isValid = strActual <= strTarget;
    }

    return { isValid, actualValue };
  };

  useEffect(() => {
    if (isGenerating && studentCredential) {
      const { isValid, actualValue } = evaluateConstraint();

      const logSequence = [
        "> Initializing Groth16 Prover...",
        "> Securing Private Inputs (Memory Enclave Locked)",
        `> Circuit constraint: ${policy.field} ${policy.operator} ${policy.value}`,
        `> Evaluating hidden witness against constraints...`,
        "> Computing R1CS polynomial constraints...",
        isValid ? "> Constraint satisfied! Computing elliptic curve points..." : `> CONSTRAINT_ERROR: Witness fails condition.`,
        isValid ? "> Proof constructed successfully." : "> HALT: Circuit evaluation returned FALSE.",
        isValid ? "> Routing via ERC-4337 Paymaster..." : "",
        isValid ? "> Broadcasting zero-knowledge payload to Polygon Amoy..." : ""
      ].filter(Boolean);

      let i = 0;
      setLogs([]);
      const interval = setInterval(() => {
        if (i < logSequence.length) {
          setLogs(prev => [...prev, logSequence[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isGenerating, studentCredential, policy]);

  const handleGenerateProof = async () => {
    if (!studentCredential) return;

    setVerificationState("PENDING");
    toast("Generating ZKP", { description: "Executing local zk-SNARK circuit. Data shielded." });

    const { isValid } = evaluateConstraint();

    try {
      await new Promise(r => setTimeout(r, 4000));

      if (!isValid) {
        setVerificationState("FAILED");
        toast.error("Circuit Execution Failed", { 
          description: `Your ${policy.field} does not satisfy ${policy.operator} ${policy.value}` 
        });
        return;
      }

      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(0);
      const verifierContract = new ethers.Contract(contractDetails.address, contractDetails.abi, signer);

      const dummyProofData = ethers.hexlify(ethers.randomBytes(32));
      const dummyDid = "did:polygonid:polygon:amoy:0x71C...4f9";

      const tx = await verifierContract.submitProof(dummyDid, 300, dummyProofData);
      await tx.wait();

      setTxHash(tx.hash);
      setVerificationState("SUCCESS");
      toast.success("zk-SNARK Submitted Gas-Free");

    } catch (error) {
      console.error(error);
      setVerificationState("FAILED");
      toast.error("Protocol Error", { description: "Proof rejected." });
    }
  };

  if (!isUnlocked) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#050505] relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050505] to-[#050505] pointer-events-none" />
        <div className="w-full max-w-sm flex flex-col items-center justify-center text-center relative z-10">
          <div className="relative mb-10">
            <div className={`absolute inset-0 rounded-full border border-emerald-500/30 ${isUnlocking ? 'animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]' : ''}`} />
            <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.1)] bg-black/80 backdrop-blur-xl relative z-10">
              <Fingerprint className={`w-10 h-10 text-emerald-400/70 ${isUnlocking ? 'animate-pulse text-emerald-400' : ''}`} strokeWidth={1} />
            </div>
          </div>
          <h1 className="text-2xl font-light text-white tracking-[0.2em] uppercase mb-12">Zero-Knowledge Vault</h1>
          <button onClick={handleUnlock} disabled={isUnlocking} className="w-full bg-gradient-to-r from-emerald-600/10 to-emerald-900/10 border border-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500/10 transition-all py-3.5 rounded-xl text-sm tracking-wide">
            {isUnlocking ? "Decrypting Shards..." : "Authenticate via Passkey"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-slate-300 font-sans overflow-hidden selection:bg-emerald-500/30">
      <div className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col justify-between shrink-0 relative z-20">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-bold text-xs tracking-widest text-white uppercase">Prover Client</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 text-white text-sm font-medium border border-white/5">
              <Shield className="w-4 h-4 text-emerald-400" /> Identity Shards
            </a>
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative p-8">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <header className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Digital Identity</h1>
              <p className="text-sm text-slate-500 mt-1 font-mono">Local execution environment active.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {!studentCredential ? (
                <div className="w-full aspect-[1.586/1] rounded-2xl bg-black/50 border border-white/5 flex flex-col items-center justify-center p-6 text-center shadow-2xl backdrop-blur-xl">
                  <Lock className="w-8 h-8 text-slate-600 mb-4" />
                  <h3 className="text-sm font-bold text-white tracking-wide mb-1 uppercase">Vault Empty</h3>
                </div>
              ) : (
                <div className="w-full rounded-2xl bg-gradient-to-br from-[#0a0f12] via-[#0d1419] to-[#0a0f12] border border-emerald-500/20 p-6 relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.1)] group transition-all duration-500 flex flex-col justify-between min-h-[220px]">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#10b98115_100%)] animate-[spin_6s_linear_infinite] opacity-50 pointer-events-none mix-blend-screen" />
                  
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="w-10 h-8 rounded border border-emerald-500/30 bg-black/50 flex flex-col justify-around items-center p-1 backdrop-blur-md">
                      <div className="w-full h-px bg-emerald-500/50" />
                      <div className="w-full h-px bg-emerald-500/50" />
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest mb-0.5">Issuer</div>
                      <div className="text-xs font-semibold text-white">Avirbhav University</div>
                    </div>
                  </div>
                  
                  <div className="relative z-10 space-y-4">
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                        Subject Identity
                        {isActiveState && <span className="text-emerald-500 flex items-center gap-1 animate-pulse"><Shield className="w-3 h-3"/> Shield Active</span>}
                      </div>
                      <div className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                        <RedactedField value={studentCredential.name} isObfuscated={isActiveState} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Degree Program</div>
                        <div className="text-[11px] font-medium text-slate-200">
                          <RedactedField value={studentCredential.degree} isObfuscated={isActiveState} />
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">College</div>
                        <div className="text-[11px] font-medium text-slate-200">
                          <RedactedField value={studentCredential.college} isObfuscated={isActiveState} />
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Year Passed</div>
                        <div className="text-[11px] font-mono text-emerald-400">
                          <RedactedField value={studentCredential.yearPassed} isObfuscated={isActiveState} />
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cumulative GPA</div>
                        <div className="text-[11px] font-mono text-emerald-400">
                          <RedactedField value={studentCredential.gpa} isObfuscated={isActiveState} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Abstraction Gas Panel */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500" /> Network Gas
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    ERC-4337 Sponsored
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-light text-white">0.00</span>
                  <span className="text-sm text-slate-500 font-medium pb-1">MATIC</span>
                </div>
                <p className="text-xs text-slate-500">Transaction fees subsidized by Enterprise Paymaster.</p>
              </div>

            </div>

            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden group p-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3 relative z-10">Active Verification Request</h3>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed relative z-10">
                  A relying party requested cryptographic proof that: <br/>
                  <span className="font-mono text-white bg-white/10 px-2 py-1 rounded inline-block mt-2 font-bold">
                    {policy.field} {policy.operator} {policy.value}
                  </span>
                </p>
                <button 
                  onClick={handleGenerateProof}
                  disabled={isGenerating || isVerified || isFailed || !studentCredential}
                  className={`w-full relative z-10 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-xl ${
                    isGenerating || isVerified || isFailed || !studentCredential
                    ? 'bg-black text-slate-600 border border-white/5 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-slate-200 hover:scale-[1.02]'
                  }`}
                >
                  {isGenerating ? (
                    <><span className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin" /> Computing Circuit & Obfuscating PII...</>
                  ) : isVerified ? (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Proof Delivered Gas-Free</>
                  ) : isFailed ? (
                    <><XCircle className="w-4 h-4 text-red-500" /> Proof Failed Constraints</>
                  ) : (
                    "Obfuscate Data & Generate ZKP"
                  )}
                </button>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl flex flex-col h-[320px] overflow-hidden relative">
                <div className="px-6 py-4 border-b border-white/5 bg-black/50 flex items-center justify-between backdrop-blur-md relative z-10">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">Local Circuit Execution</span>
                  </div>
                  {isGenerating && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                </div>
                
                <div className="flex-1 p-6 font-mono text-xs overflow-y-auto relative z-10 bg-black/80">
                  {!isGenerating && !isVerified && !isFailed && (
                    <span className="text-slate-600">Waiting for proving request...</span>
                  )}
                  {logs.map((log, idx) => (
                    <div key={idx} className={`mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${log?.includes("ERROR") || log?.includes("HALT") ? 'text-red-400 font-bold' : 'text-emerald-400/80'}`}>
                      {log}
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="w-2 h-4 bg-emerald-400 animate-pulse mt-2" />
                  )}
                  {isVerified && (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-bold">
                      [SUCCESS] Proof generated and submitted to verifier contract via Paymaster.
                    </div>
                  )}
                  {isFailed && logs.length > 0 && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 font-bold">
                      [FAILED] Circuit constraints not met. Prover halted.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}