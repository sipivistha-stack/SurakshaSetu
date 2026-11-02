import React from 'react';
import { useApp } from '../context/AppContext';
import {
  formatINR,
  formatINRWords,
} from '../utils/fdrEngine';
import {
  Building2,
  FileSpreadsheet,
  Clock,
  ScanSearch,
  RefreshCw,
  FileCheck2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Download,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const DashboardAdmin: React.FC = () => {
  const {
    institutions,
    fdrs,
    renewals,
    releases,
    setCurrentView,
    setActiveFdrForVerification,
  } = useApp();

  const totalInstitutions = institutions.length;
  const totalFdrs = fdrs.length;
  const totalDepositValue = fdrs.reduce((acc, curr) => acc + (curr.depositAmount || 0), 0);
  const activeFdrs = fdrs.filter((f) => f.lifecycleStatus === 'Active').length;
  const pendingVerifications = fdrs.filter((f) => f.verificationStatus === 'Pending' || f.verificationStatus === 'Discrepancy').length;
  const expiringFdrs = fdrs.filter((f) => f.lifecycleStatus === 'Expiring Soon').length;
  const maturedFdrs = fdrs.filter((f) => f.lifecycleStatus === 'Matured').length;
  const pendingRenewals = renewals.filter((r) => r.status === 'Pending Review').length;
  const pendingReleases = releases.filter((r) => r.status === 'Submitted' || r.status === 'Under Scrutiny').length;

  // Regional breakdown
  const regions = ['Western', 'Northern', 'Southern', 'Eastern', 'Central', 'South-Western'] as const;
  const regionStats = regions.map((reg) => {
    const regFdrs = fdrs.filter((f) => f.region === reg);
    const amount = regFdrs.reduce((sum, f) => sum + (f.depositAmount || 0), 0);
    return { region: reg, count: regFdrs.length, amount };
  });
  const maxRegionAmount = Math.max(...regionStats.map((r) => r.amount), 1);

  // Bank breakdown
  const bankStats: Record<string, number> = {};
  fdrs.forEach((f) => {
    bankStats[f.bankName] = (bankStats[f.bankName] || 0) + f.depositAmount;
  });
  const sortedBanks = Object.entries(bankStats).sort((a, b) => b[1] - a[1]);
  const totalBankAmt = Object.values(bankStats).reduce((a, b) => a + b, 0) || 1;

  // Priority lists
  const criticalExpiring = fdrs.filter((f) => f.lifecycleStatus === 'Expiring Soon').slice(0, 4);
  const pendingReviewQueue = fdrs.filter((f) => f.verificationStatus === 'Pending' || f.verificationStatus === 'Discrepancy').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">National Security Deposit & FDR Overview</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time compliance monitoring across all approved technical institutions, bank lien assurances, and statutory maturity cycles.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('reports')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300/80 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Generate Reports</span>
          </button>
          <button
            onClick={() => setCurrentView('verification')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            <ScanSearch className="w-3.5 h-3.5 text-slate-200" />
            <span>Verification Desk</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Deposit Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-xs font-medium text-slate-500">
            Total Security Deposit Vault
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums tracking-tight">
            {formatINRWords(totalDepositValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{totalFdrs} Fixed Deposits</span>
            <span className="font-mono text-slate-700 tabular-nums">{formatINR(totalDepositValue)}</span>
          </div>
        </div>

        {/* Card 2: Institutions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-xs font-medium text-slate-500">
            Technical Institutions
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums tracking-tight">
            {totalInstitutions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 6 Regional Jurisdictions
          </div>
        </div>

        {/* Card 3: Pending Verification */}
        <div
          onClick={() => setCurrentView('verification')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Pending OCR Verification</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2 font-mono tabular-nums tracking-tight">
            {pendingVerifications}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Submissions requiring scrutiny
          </div>
        </div>

        {/* Card 4: Expiring Soon */}
        <div
          onClick={() => setCurrentView('maturity')}
          className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Expiring (&lt; 30 Days)</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-red-700 mt-2 font-mono tabular-nums tracking-tight">
            {expiringFdrs}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Notice Issued</span>
            <span className="font-mono">{maturedFdrs} Matured</span>
          </div>
        </div>
      </div>

      {/* Secondary Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Active Compliant FDRs</span>
            <div className="text-base font-bold text-slate-900 font-mono tabular-nums">{activeFdrs}</div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Pending Renewals</span>
            <div className="text-base font-bold text-blue-800 font-mono tabular-nums">{pendingRenewals}</div>
          </div>
          <RefreshCw className="w-4 h-4 text-blue-600" />
        </div>

        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Release Claims</span>
            <div className="text-base font-bold text-indigo-800 font-mono tabular-nums">{pendingReleases}</div>
          </div>
          <FileCheck2 className="w-4 h-4 text-indigo-600" />
        </div>

        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Matured (Unclaimed)</span>
            <div className="text-base font-bold text-purple-800 font-mono tabular-nums">{maturedFdrs}</div>
          </div>
          <Clock className="w-4 h-4 text-purple-600" />
        </div>
      </div>

      {/* Analytical Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Regional Distribution (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Regional Security Deposit Distribution</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Aggregate deposit values across AICTE Regional Jurisdictions</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">6 Regions</span>
          </div>

          <div className="space-y-3 pt-1">
            {regionStats.map((item) => {
              const percent = Math.round((item.amount / maxRegionAmount) * 100);
              return (
                <div key={item.region} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{item.region} Region</span>
                    <div className="space-x-3">
                      <span className="text-slate-400 text-[11px]">{item.count} FDRs</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">{formatINRWords(item.amount)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bank Concentration (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Scheduled Bank Concentration</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Security deposits in approved scheduled banks</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2.5 pt-1">
            {sortedBanks.map(([bank, amt]) => {
              const share = Math.round((amt / totalBankAmt) * 100);

              return (
                <div key={bank} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-800 truncate max-w-[170px]">{bank}</span>
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">{formatINRWords(amt)}</span>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums w-8 text-right">
                      {share}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Tables: Pending Verifications & Urgent Expiring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Scrutiny */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Pending OCR Verifications</h3>
            <button
              onClick={() => setCurrentView('verification')}
              className="text-xs text-blue-700 hover:text-blue-800 font-medium flex items-center cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingReviewQueue.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveFdrForVerification(item);
                  setCurrentView('verification');
                }}
                className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg transition cursor-pointer"
              >
                <div>
                  <div className="font-mono font-semibold text-slate-900">{item.fdrNumber}</div>
                  <div className="text-slate-500 text-[11px] truncate max-w-[220px]">{item.institutionName}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 tabular-nums">{formatINR(item.depositAmount)}</div>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                      item.verificationStatus === 'Discrepancy'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {item.verificationStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Critical Maturity Watchlist</h3>
            <button
              onClick={() => setCurrentView('maturity')}
              className="text-xs text-blue-700 hover:text-blue-800 font-medium flex items-center cursor-pointer"
            >
              <span>Maturity Desk</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {criticalExpiring.map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentView('maturity')}
                className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg transition cursor-pointer"
              >
                <div>
                  <div className="font-mono font-semibold text-slate-900">{item.fdrNumber}</div>
                  <div className="text-slate-500 text-[11px] truncate max-w-[220px]">{item.institutionName}</div>
                </div>
                <div className="text-right">
                  <div className="text-red-700 font-semibold font-mono tabular-nums">Due: {item.maturityDate}</div>
                  <span className="text-[10px] text-slate-500">
                    Notice Issued
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
