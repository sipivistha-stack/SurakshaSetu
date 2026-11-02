import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ScanSearch,
  Clock,
  RefreshCw,
  FileCheck,
  Building,
  BarChart3,
  History,
  PlusCircle,
  MessageSquareWarning,
  Code2,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string | null;
  section?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { currentUser, currentView, setCurrentView, fdrs, renewals, releases } = useApp();

  const pendingVerificationCount = fdrs.filter(
    (f) => f.verificationStatus === 'Pending' || f.verificationStatus === 'Discrepancy'
  ).length;

  const expiringCount = fdrs.filter(
    (f) => f.lifecycleStatus === 'Expiring Soon' || f.lifecycleStatus === 'Matured'
  ).length;

  const pendingRenewalCount = renewals.filter((r) => r.status === 'Pending Review').length;
  const pendingReleaseCount = releases.filter((r) => r.status === 'Submitted' || r.status === 'Under Scrutiny').length;

  const queryCount = fdrs.filter(
    (f) => f.verificationStatus === 'Query Raised' && (currentUser.role !== 'INSTITUTION' || f.institutionId === currentUser.institutionId)
  ).length;

  const getNavItems = (): NavItem[] => {
    if (currentUser.role === 'INSTITUTION') {
      return [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'submit-fdr', label: 'Submit New FDR', icon: PlusCircle, highlight: true },
        { id: 'fdrs', label: 'My FDR Register', icon: FileSpreadsheet },
        { id: 'queries', label: 'Officer Queries', icon: MessageSquareWarning, badge: queryCount > 0 ? queryCount : null },
        { id: 'maturity', label: 'Maturity Schedule', icon: Clock },
        { id: 'renewals', label: 'FDR Renewals', icon: RefreshCw },
        { id: 'releases', label: 'Deposit Release', icon: FileCheck },
        { id: 'institutions', label: 'Institution Profile', icon: Building },
      ];
    }

    if (currentUser.role === 'OFFICER') {
      return [
        { id: 'dashboard', label: 'Regional Overview', icon: LayoutDashboard },
        { id: 'verification', label: 'OCR Verification Desk', icon: ScanSearch, badge: pendingVerificationCount },
        { id: 'fdrs', label: 'Regional FDR Register', icon: FileSpreadsheet },
        { id: 'maturity', label: 'Maturity Monitoring', icon: Clock, badge: expiringCount },
        { id: 'renewals', label: 'Renewal Scrutiny', icon: RefreshCw, badge: pendingRenewalCount },
        { id: 'releases', label: 'Release Scrutiny', icon: FileCheck, badge: pendingReleaseCount },
        { id: 'queries', label: 'Dispatched Queries', icon: MessageSquareWarning, badge: queryCount > 0 ? queryCount : null },
        { id: 'institutions', label: 'Assigned Colleges', icon: Building },
        { id: 'reports', label: 'Regional Reports', icon: BarChart3 },
      ];
    }

    // AICTE Admin
    return [
      { id: 'dashboard', label: 'National Overview', icon: LayoutDashboard },
      { id: 'fdrs', label: 'Global FDR Register', icon: FileSpreadsheet },
      { id: 'verification', label: 'OCR Verification Desk', icon: ScanSearch, badge: pendingVerificationCount },
      { id: 'maturity', label: 'Maturity & Expiry', icon: Clock, badge: expiringCount },
      { id: 'renewals', label: 'Renewal Management', icon: RefreshCw, badge: pendingRenewalCount },
      { id: 'releases', label: 'Release Sanctions', icon: FileCheck, badge: pendingReleaseCount },
      { id: 'institutions', label: 'Colleges Directory', icon: Building },
      { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
      { id: 'audit', label: 'Audit Trail & Integrity', icon: History },
      { id: 'tech-docs', label: 'SIH26265 Architecture', icon: Code2 },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 shrink-0 min-h-[calc(100vh-6.5rem)] flex flex-col justify-between border-r border-slate-800">
      <div className="py-4">
        {/* User Context Strip */}
        <div className="px-4 mb-4">
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Active Context
            </div>
            <div className="text-xs font-semibold text-white mt-1 truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {currentUser.role === 'ADMIN' ? 'Headquarters (New Delhi)' : currentUser.role === 'OFFICER' ? `${currentUser.region} Regional Office` : 'Institutional Signatory'}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : item.highlight
                    ? 'text-emerald-400 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quiet Government Footer */}
      <div className="p-4 border-t border-slate-800/60 text-[11px] text-slate-500">
        <p className="font-medium text-slate-400">AICTE Security Portal</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Statutory Compliance Platform</p>
      </div>
    </aside>
  );
};
