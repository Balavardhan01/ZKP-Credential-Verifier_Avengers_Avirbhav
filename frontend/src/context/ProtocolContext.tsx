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

  const syncToStorage = useCallback((
    newCred: StudentCredential | null, 
    newState: VerificationState, 
    newHash: string | null, 
    newBlock: number | null,
    newPolicy: ZkpPolicy,
    newLogs: AuditLog[],
    newIssued: IssuedCredential[]
  ) => {
    if (typeof window !== "undefined") {
      const stateObj = {
        studentCredential: newCred,
        verificationState: newState,
        txHash: newHash,
        blockNumber: newBlock,
        policy: newPolicy,
        auditLogs: newLogs,
        issuedCredentials: newIssued
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateObj));
      
      const channel = new BroadcastChannel("zk_protocol");
      channel.postMessage({ type: "SYNC_STATE", payload: stateObj });
      channel.close();
    }
  }, []);

  const updateCredential = (cred: StudentCredential | null) => {
    _setStudentCredential(cred);
    syncToStorage(cred, verificationState, txHash, blockNumber, policy, auditLogs, issuedCredentials);
  };

  const setVerificationState = (state: VerificationState) => {
    _setVerificationState(state);
    syncToStorage(studentCredential, state, txHash, blockNumber, policy, auditLogs, issuedCredentials);
  };

  const setTxHash = (hash: string | null) => {
    _setTxHash(hash);
    syncToStorage(studentCredential, verificationState, hash, blockNumber, policy, auditLogs, issuedCredentials);
  };

  const setBlockNumber = (num: number | null) => {
    _setBlockNumber(num);
    syncToStorage(studentCredential, verificationState, txHash, num, policy, auditLogs, issuedCredentials);
  };

  // Crucial: Changing the policy resets the verification state across all tabs
  const setPolicy = (newPolicy: ZkpPolicy) => {
    _setPolicy(newPolicy);
    _setVerificationState("IDLE");
    _setTxHash(null);
    syncToStorage(studentCredential, "IDLE", null, blockNumber, newPolicy, auditLogs, issuedCredentials);
  };

  const resetVerification = () => {
    _setVerificationState("IDLE");
    _setTxHash(null);
    syncToStorage(studentCredential, "IDLE", null, blockNumber, policy, auditLogs, issuedCredentials);
  };

  const addAuditLog = (log: AuditLog) => {
    const updatedLogs = [log, ...auditLogs];
    _setAuditLogs(updatedLogs);
    syncToStorage(studentCredential, verificationState, txHash, blockNumber, policy, updatedLogs, issuedCredentials);
  };

  const issueNewCredential = (cred: IssuedCredential) => {
    const updatedIssued = [cred, ...issuedCredentials];
    _setIssuedCredentials(updatedIssued);
    syncToStorage(studentCredential, verificationState, txHash, blockNumber, policy, auditLogs, updatedIssued);
  };

  const revokeCredential = (id: string) => {
    const updatedIssued = issuedCredentials.map(c => c.id === id ? { ...c, status: "Revoked" as const } : c);
    _setIssuedCredentials(updatedIssued);
    syncToStorage(studentCredential, verificationState, txHash, blockNumber, policy, auditLogs, updatedIssued);
  };

const issueCompleteCredential = (student: StudentCredential, issued: IssuedCredential) => {
    _setStudentCredential(student);
    const updatedIssued = [issued, ...issuedCredentials];
    _setIssuedCredentials(updatedIssued);
    
    // FIX: Automatically reset verification state to IDLE when new identity is issued.
    // This forces the Student to manually click "Generate Proof" again.
    _setVerificationState("IDLE");
    _setTxHash(null);
    
    syncToStorage(student, "IDLE", null, blockNumber, policy, auditLogs, updatedIssued);
  };
  const logout = () => {
    _setStudentCredential(null);
    _setVerificationState("IDLE");
    _setTxHash(null);
    _setBlockNumber(null);
    syncToStorage(null, "IDLE", null, null, policy, auditLogs, issuedCredentials);
  };

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
      } else {
        syncToStorage(null, "IDLE", null, null, policy, [], []);
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