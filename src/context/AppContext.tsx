import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Institution,
  FDRRecord,
  RenewalRecord,
  ReleaseRequest,
  NotificationItem,
  AuditLogItem,
  UserRole,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_INSTITUTIONS,
  INITIAL_FDRS,
  INITIAL_RENEWALS,
  INITIAL_RELEASES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { calculateMaturityStatus, checkDuplicateFdr } from '../utils/fdrEngine';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  institutions: Institution[];
  fdrs: FDRRecord[];
  renewals: RenewalRecord[];
  releases: ReleaseRequest[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  currentView: string;
  setCurrentView: (view: string) => void;
  activeFdrForVerification: FDRRecord | null;
  setActiveFdrForVerification: (fdr: FDRRecord | null) => void;
  // Actions
  addFdr: (fdrData: Omit<FDRRecord, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message: string; fdrId?: string };
  updateFdrVerification: (fdrId: string, status: 'Verified' | 'Rejected' | 'Query Raised', remarks: string, queryMessage?: string) => void;
  respondToQuery: (fdrId: string, responseText: string) => void;
  submitRenewal: (oldFdrId: string, newFdrNumber: string, amount: number, newMaturityDate: string, docName: string) => { success: boolean; message: string };
  approveRenewal: (renewalId: string, remarks: string) => void;
  submitReleaseRequest: (fdrId: string, reason: any, closureOrder: string, checklist: any, docName: string) => { success: boolean; message: string };
  updateReleaseStatus: (releaseId: string, status: 'Under Scrutiny' | 'Recommended' | 'Approved' | 'Rejected', remarks: string) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  logAuditEvent: (action: string, module: string, details: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  FDRS: 'aicte_fdrs_v1',
  INSTITUTIONS: 'aicte_institutions_v1',
  RENEWALS: 'aicte_renewals_v1',
  RELEASES: 'aicte_releases_v1',
  NOTIFICATIONS: 'aicte_notifications_v1',
  AUDIT_LOGS: 'aicte_audit_logs_v1',
  USER_ID: 'aicte_current_user_id_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const found = INITIAL_USERS.find((u) => u.id === savedUserId);
    return found || INITIAL_USERS[0]; // Default to AICTE Admin
  });

  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    return saved ? JSON.parse(saved) : INITIAL_INSTITUTIONS;
  });

  const [fdrs, setFdrs] = useState<FDRRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FDRS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_FDRS;
      }
    }
    return INITIAL_FDRS;
  });

  const [renewals, setRenewals] = useState<RenewalRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RENEWALS);
    return saved ? JSON.parse(saved) : INITIAL_RENEWALS;
  });

  const [releases, setReleases] = useState<ReleaseRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RELEASES);
    return saved ? JSON.parse(saved) : INITIAL_RELEASES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeFdrForVerification, setActiveFdrForVerification] = useState<FDRRecord | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FDRS, JSON.stringify(fdrs));
  }, [fdrs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RENEWALS, JSON.stringify(renewals));
  }, [renewals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RELEASES, JSON.stringify(releases));
  }, [releases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ID, currentUser.id);
  }, [currentUser]);

  // Recalculate lifecycle status dynamically based on maturity dates on mount
  useEffect(() => {
    setFdrs((prev) =>
      prev.map((item) => {
        if (item.verificationStatus === 'Verified' && item.lifecycleStatus !== 'Released') {
          const maturity = calculateMaturityStatus(item.maturityDate);
          if (maturity.category === 'Matured') {
            return { ...item, lifecycleStatus: 'Matured' };
          } else if (maturity.category.startsWith('Expiring')) {
            return { ...item, lifecycleStatus: 'Expiring Soon' };
          } else {
            return { ...item, lifecycleStatus: 'Active' };
          }
        }
        return item;
      })
    );
  }, []);

  const logAuditEvent = (action: string, module: string, details: string) => {
    const newLog: AuditLogItem = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      details,
      ipAddress: '164.100.128.' + Math.floor(10 + Math.random() * 80),
      checksum: 'sha256-' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addFdr = (fdrData: Omit<FDRRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Duplicate check
    const dupCheck = checkDuplicateFdr(
      fdrData.fdrNumber,
      fdrData.bankName,
      fdrData.documentHash || '',
      fdrs
    );

    if (dupCheck.isDuplicate) {
      return { success: false, message: dupCheck.reason || 'Duplicate record detected' };
    }

    const now = new Date().toISOString();
    const newId = 'fdr-' + Date.now().toString().slice(-6);
    const newFdr: FDRRecord = {
      ...fdrData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    setFdrs((prev) => [newFdr, ...prev]);

    // Add audit log
    logAuditEvent('FDR_CREATED', 'FDR Management', `Created new FDR record ${newFdr.fdrNumber} for institution ${newFdr.institutionName}`);

    // Create notification for Regional Officer
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      recipientRole: 'OFFICER',
      title: 'New FDR Submitted for Scrutiny',
      message: `${newFdr.institutionName} submitted FDR ${newFdr.fdrNumber} (INR ${newFdr.depositAmount.toLocaleString()})`,
      type: 'info',
      timestamp: now,
      read: false,
      linkAction: 'verification',
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true, message: 'FDR submitted successfully and routed to Regional Office for scrutiny.', fdrId: newId };
  };

  const updateFdrVerification = (
    fdrId: string,
    status: 'Verified' | 'Rejected' | 'Query Raised',
    remarks: string,
    queryMessage?: string
  ) => {
    setFdrs((prev) =>
      prev.map((fdr) => {
        if (fdr.id === fdrId) {
          let lifecycle = fdr.lifecycleStatus;
          if (status === 'Verified') {
            const mat = calculateMaturityStatus(fdr.maturityDate);
            lifecycle = mat.category === 'Matured' ? 'Matured' : mat.category.startsWith('Expiring') ? 'Expiring Soon' : 'Active';
          }
          return {
            ...fdr,
            verificationStatus: status,
            lifecycleStatus: lifecycle,
            officerRemarks: remarks,
            queryMessage: queryMessage || fdr.queryMessage,
            updatedAt: new Date().toISOString(),
          };
        }
        return fdr;
      })
    );

    const targetFdr = fdrs.find((f) => f.id === fdrId);
    logAuditEvent(
      `FDR_VERIFY_${status.toUpperCase().replace(/\s/g, '_')}`,
      'Verification Desk',
      `FDR ${targetFdr?.fdrNumber || fdrId} marked as ${status}. Remarks: ${remarks}`
    );

    // Notify institution
    if (targetFdr) {
      const notif: NotificationItem = {
        id: 'notif-' + Date.now(),
        recipientRole: 'INSTITUTION',
        recipientInstitutionId: targetFdr.institutionId,
        title: `FDR Status Update: ${status}`,
        message: `FDR ${targetFdr.fdrNumber}: ${remarks}`,
        type: status === 'Verified' ? 'success' : status === 'Rejected' ? 'alert' : 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        linkAction: status === 'Query Raised' ? 'queries' : 'fdrs',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const respondToQuery = (fdrId: string, responseText: string) => {
    setFdrs((prev) =>
      prev.map((f) => {
        if (f.id === fdrId) {
          return {
            ...f,
            queryResponse: responseText,
            verificationStatus: 'Pending',
            updatedAt: new Date().toISOString(),
          };
        }
        return f;
      })
    );

    const targetFdr = fdrs.find((f) => f.id === fdrId);
    logAuditEvent('QUERY_RESPONDED', 'Verification Desk', `Institution responded to query on FDR ${targetFdr?.fdrNumber || fdrId}`);

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      recipientRole: 'OFFICER',
      title: 'Query Clarification Submitted',
      message: `${targetFdr?.institutionName} submitted clarification for FDR ${targetFdr?.fdrNumber}`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      linkAction: 'verification',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const submitRenewal = (
    oldFdrId: string,
    newFdrNumber: string,
    amount: number,
    newMaturityDate: string,
    docName: string
  ) => {
    const oldFdr = fdrs.find((f) => f.id === oldFdrId);
    if (!oldFdr) return { success: false, message: 'Maturing FDR not found' };

    const renewalId = 'rnw-' + Date.now().toString().slice(-5);
    const now = new Date().toISOString();

    const newRenewal: RenewalRecord = {
      id: renewalId,
      oldFdrId,
      oldFdrNumber: oldFdr.fdrNumber,
      newFdrNumber,
      institutionId: oldFdr.institutionId,
      institutionName: oldFdr.institutionName,
      bankName: oldFdr.bankName,
      amount,
      oldMaturityDate: oldFdr.maturityDate,
      newMaturityDate,
      renewalDate: now.slice(0, 10),
      documentName: docName,
      documentHash: 'rnw-hash-' + Math.random().toString(36).slice(2, 10),
      status: 'Pending Review',
      createdAt: now,
    };

    setRenewals((prev) => [newRenewal, ...prev]);

    // Mark old FDR as renewal pending
    setFdrs((prev) =>
      prev.map((f) => (f.id === oldFdrId ? { ...f, lifecycleStatus: 'Renewal Pending', updatedAt: now } : f))
    );

    logAuditEvent('RENEWAL_SUBMITTED', 'Renewals', `Renewal application logged for ${oldFdr.fdrNumber} -> ${newFdrNumber}`);

    return { success: true, message: 'Renewal application submitted for officer scrutiny.' };
  };

  const approveRenewal = (renewalId: string, remarks: string) => {
    const renewal = renewals.find((r) => r.id === renewalId);
    if (!renewal) return;

    setRenewals((prev) =>
      prev.map((r) => (r.id === renewalId ? { ...r, status: 'Approved', officerRemarks: remarks } : r))
    );

    // Update old FDR to matured/replaced and create new active FDR
    setFdrs((prev) => {
      const oldFdr = prev.find((f) => f.id === renewal.oldFdrId);
      const updated = prev.map((f) => {
        if (f.id === renewal.oldFdrId) {
          return {
            ...f,
            lifecycleStatus: 'Matured' as const,
            officerRemarks: `Renewed into FDR ${renewal.newFdrNumber}`,
            updatedAt: new Date().toISOString(),
          };
        }
        return f;
      });

      if (oldFdr) {
        const replacementFdr: FDRRecord = {
          ...oldFdr,
          id: 'fdr-' + Date.now().toString().slice(-6),
          fdrNumber: renewal.newFdrNumber,
          issueDate: new Date().toISOString().slice(0, 10),
          maturityDate: renewal.newMaturityDate,
          depositAmount: renewal.amount,
          verificationStatus: 'Verified',
          lifecycleStatus: 'Active',
          officerRemarks: `Auto-created via renewal of ${oldFdr.fdrNumber}. Approved by ${currentUser.name}.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [replacementFdr, ...updated];
      }
      return updated;
    });

    logAuditEvent('RENEWAL_APPROVED', 'Renewals', `Approved renewal ${renewal.newFdrNumber} for ${renewal.institutionName}`);
  };

  const submitReleaseRequest = (
    fdrId: string,
    reason: any,
    closureOrder: string,
    checklist: any,
    docName: string
  ) => {
    const fdr = fdrs.find((f) => f.id === fdrId);
    if (!fdr) return { success: false, message: 'FDR not found' };

    const newRelease: ReleaseRequest = {
      id: 'rel-' + Date.now().toString().slice(-5),
      fdrId,
      fdrNumber: fdr.fdrNumber,
      institutionId: fdr.institutionId,
      institutionName: fdr.institutionName,
      aictePermanentId: fdr.aictePermanentId,
      depositAmount: fdr.depositAmount,
      reason,
      closureOrderNumber: closureOrder,
      checklist,
      supportingDocName: docName,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
    };

    setReleases((prev) => [newRelease, ...prev]);
    logAuditEvent('RELEASE_REQUEST_SUBMITTED', 'Release Management', `Release request filed for FDR ${fdr.fdrNumber} (INR ${fdr.depositAmount})`);

    return { success: true, message: 'Security Deposit Release application submitted for Regional Office scrutiny.' };
  };

  const updateReleaseStatus = (
    releaseId: string,
    status: 'Under Scrutiny' | 'Recommended' | 'Approved' | 'Rejected',
    remarks: string
  ) => {
    setReleases((prev) =>
      prev.map((r) => {
        if (r.id === releaseId) {
          return {
            ...r,
            status,
            officerRemarks: remarks,
            reviewedAt: new Date().toISOString(),
            approvalReferenceNo: status === 'Approved' ? 'AICTE/FIN/REL/' + Math.floor(1000 + Math.random() * 9000) : r.approvalReferenceNo,
          };
        }
        return r;
      })
    );

    const rel = releases.find((r) => r.id === releaseId);
    if (status === 'Approved' && rel) {
      // Mark FDR as released
      setFdrs((prev) =>
        prev.map((f) => (f.id === rel.fdrId ? { ...f, lifecycleStatus: 'Released', verificationStatus: 'Verified', updatedAt: new Date().toISOString() } : f))
      );
    }

    logAuditEvent(`RELEASE_${status.toUpperCase()}`, 'Release Management', `Release request ${rel?.fdrNumber} set to ${status}. Remarks: ${remarks}`);
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetAllData = () => {
    setFdrs(INITIAL_FDRS);
    setInstitutions(INITIAL_INSTITUTIONS);
    setRenewals(INITIAL_RENEWALS);
    setReleases(INITIAL_RELEASES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.FDRS);
    localStorage.removeItem(STORAGE_KEYS.INSTITUTIONS);
    localStorage.removeItem(STORAGE_KEYS.RENEWALS);
    localStorage.removeItem(STORAGE_KEYS.RELEASES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    logAuditEvent('RESET_SYSTEM_DATA', 'System', 'Demo dataset restored to clean hackathon baseline');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: INITIAL_USERS,
        institutions,
        fdrs,
        renewals,
        releases,
        notifications,
        auditLogs,
        currentView,
        setCurrentView,
        activeFdrForVerification,
        setActiveFdrForVerification,
        addFdr,
        updateFdrVerification,
        respondToQuery,
        submitRenewal,
        approveRenewal,
        submitReleaseRequest,
        updateReleaseStatus,
        markNotificationRead,
        markAllNotificationsRead,
        logAuditEvent,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
