"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

export type VerificationState = "IDLE" | "PENDING" | "SUCCESS" | "FAILED";

export interface StudentCredential {
  name: string;
  degree: string;
  college: string;
  gpa: string;
  yearPassed: string;
}

export interface ZkpPolicy {
  field: string;
  operator: string;
  value: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  target: string;
  policy: string;
  status: string;
  txHash: string;
}

export interface IssuedCredential {
  id: string;
  name: string;
  degree: string;
  date: string;
  status: "Active" | "Revoked";
}

interface ProtocolContextType {
  studentCredential: StudentCredential | null;
  updateCredential: (cred: StudentCredential | null) => void;
  verificationState: VerificationState;
  setVerificationState: (state: VerificationState) => void;
  txHash: string | null;
  setTxHash: (hash: string | null) => void;
  blockNumber: number | null;
  setBlockNumber: (num: number | null) => void;
  policy: ZkpPolicy;
  setPolicy: (policy: ZkpPolicy) => void;
  resetVerification: () => void;
  auditLogs: AuditLog[];
  addAuditLog: (log: AuditLog) => void;
  issuedCredentials: IssuedCredential[];
  issueNewCredential: (cred: IssuedCredential) => void;
  revokeCredential: (id: string) => void;
  issueCompleteCredential: (student: StudentCredential, issued: IssuedCredential) => void;
  logout: () => void;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "ZKP_PROTOCOL_STATE";

export const ProtocolProvider = ({ children }: { children: ReactNode }) => {
  const [studentCredential, _setStudentCredential] = useState<StudentCredential | null>(null);
  const [verificationState, _setVerificationState] = useState<VerificationState>("IDLE");
  const [txHash, _setTxHash] = useState<string | null>(null);
  const [blockNumber, _setBlockNumber] = useState<number | null>(null);
  
  const [policy, _setPolicy] = useState<ZkpPolicy>({
    field: "Cumulative GPA",
    operator: ">=",
    value: "3.0"
  });

  const [auditLogs, _setAuditLogs] = useState<AuditLog[]>([]);
  const [issuedCredentials, _setIssuedCredentials] = useState<IssuedCredential[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync state to storage without creating circular dependencies
  useEffect(() => {
    if (!isInitialized) return; // Don't sync during initialization
    
    if (typeof window !== "undefined") {
      const stateObj = {
        studentCredential,
        verificationState,
        txHash,
        blockNumber,
        policy,
        auditLogs,
        issuedCredentials
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateObj));
      
      const channel = new BroadcastChannel("zk_protocol");
      channel.postMessage({ type: "SYNC_STATE", payload: stateObj });
      channel.close();
    }
  }, [studentCredential, verificationState, txHash, blockNumber, policy, auditLogs, issuedCredentials, isInitialized]);

  const updateCredential = useCallback((cred: StudentCredential | null) => {
    _setStudentCredential(cred);
  }, []);

  const setVerificationState = useCallback((state: VerificationState) => {
    _setVerificationState(state);
  }, []);

  const setTxHash = useCallback((hash: string | null) => {
    _setTxHash(hash);
  }, []);

  const setBlockNumber = useCallback((num: number | null) => {
    _setBlockNumber(num);
  }, []);

  const setPolicy = useCallback((newPolicy: ZkpPolicy) => {
    _setPolicy(newPolicy);
    _setVerificationState("IDLE");
    _setTxHash(null);
  }, []);

  const resetVerification = useCallback(() => {
    _setVerificationState("IDLE");
    _setTxHash(null);
  }, []);

  const addAuditLog = useCallback((log: AuditLog) => {
    _setAuditLogs(prev => [log, ...prev]);
  }, []);

  const issueNewCredential = useCallback((cred: IssuedCredential) => {
    _setIssuedCredentials(prev => [cred, ...prev]);
  }, []);

  const revokeCredential = useCallback((id: string) => {
    _setIssuedCredentials(prev => 
      prev.map(c => c.id === id ? { ...c, status: "Revoked" as const } : c)
    );
  }, []);

  const issueCompleteCredential = useCallback((student: StudentCredential, issued: IssuedCredential) => {
    _setStudentCredential(student);
    _setIssuedCredentials(prev => [issued, ...prev]);
    _setVerificationState("IDLE");
    _setTxHash(null);
  }, []);

  const logout = useCallback(() => {
    _setStudentCredential(null);
    _setVerificationState("IDLE");
    _setTxHash(null);
    _setBlockNumber(null);
  }, []);


  useEffect(() => {
    const loadStateFromStorage = () => {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          _setStudentCredential(parsed.studentCredential || null);
          _setVerificationState(parsed.verificationState || "IDLE");
          _setTxHash(parsed.txHash || null);
          _setBlockNumber(parsed.blockNumber || null);
          if (parsed.policy) _setPolicy(parsed.policy);
          _setAuditLogs(parsed.auditLogs || []);
          _setIssuedCredentials(parsed.issuedCredentials || []);
        } catch (e) {
          console.error("Failed to parse storage", e);
        }
      }
      setIsInitialized(true);
    };

    loadStateFromStorage();

    const channel = new BroadcastChannel("zk_protocol");
    channel.onmessage = (event) => {
      if (event.data && event.data.type === "SYNC_STATE") {
        const parsed = event.data.payload;
        if (parsed.studentCredential !== undefined) _setStudentCredential(parsed.studentCredential);
        if (parsed.verificationState !== undefined) _setVerificationState(parsed.verificationState);
        if (parsed.txHash !== undefined) _setTxHash(parsed.txHash);
        if (parsed.blockNumber !== undefined) _setBlockNumber(parsed.blockNumber);
        if (parsed.policy !== undefined) _setPolicy(parsed.policy);
        if (parsed.auditLogs !== undefined) _setAuditLogs(parsed.auditLogs);
        if (parsed.issuedCredentials !== undefined) _setIssuedCredentials(parsed.issuedCredentials);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        loadStateFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      channel.close();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (!isInitialized) return null;

  return (
    <ProtocolContext.Provider
      value={{
        studentCredential,
        updateCredential,
        verificationState,
        setVerificationState,
        txHash,
        setTxHash,
        blockNumber,
        setBlockNumber,
        policy,
        setPolicy,
        resetVerification,
        auditLogs,
        addAuditLog,
        issuedCredentials,
        issueNewCredential,
        revokeCredential,
        issueCompleteCredential,
        logout
      }}
    >
      {children}
    </ProtocolContext.Provider>
  );
};

export const useProtocol = () => {
  const context = useContext(ProtocolContext);
  if (!context) throw new Error("useProtocol must be used within a ProtocolProvider");
  return context;
};