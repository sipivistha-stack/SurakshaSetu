import React from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, formatINRWords } from '../utils/fdrEngine';
import {
  ScanSearch,
  Building,
  RefreshCw,
  FileCheck2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const DashboardOfficer: React.FC = () => {
  const {
    currentUser,
    institutions,
    fdrs,
    renewals,
    releases,
    setCurrentView,
    setActiveFdrForVerification,
  } = useApp();

  const userRegion = currentUser.region || 'Western';

  // Filter items assigned to this officer's region
  const regionalInstitutions = institutions.filter((inst) => !currentUser.region || inst.region === userRegion);
  const regionalFdrs = fdrs.filter((f) => !currentUser.region || f.region === userRegion);

  const pendingVerification = regionalFdrs.filter(
    (f) => f.verificationStatus === 'Pending' || f.verificationStatus === 'Discrepancy'
  );
  const discrepancyCases = regionalFdrs.filter((f) => f.verificationStatus === 'Discrepancy');
  const regionalExpiring = regionalFdrs.filter(
    (f) => f.lifecycleStatus === 'Expiring Soon' || f.lifecycleStatus === 'Matured'
  );
  const regionalRenewals = renewals.filter((r) =>
    regionalInstitutions.some((inst) => inst.id === r.institutionId)
  );
  const regionalReleases = releases.filter((rel) =>
    regionalInstitutions.some((inst) => inst.id === rel.institutionId)
  );

  const totalRegionalDeposit = regionalFdrs.reduce((sum, f) => sum + f.depositAmount, 0);

  return (
    <div className="space-y-6">
      {/* Officer Welcome & Region Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Regional Officer Scrutiny Cockpit</h1>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {userRegion} Regional Jurisdiction
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{currentUser.name}</strong> · Authorized for document scrutiny, OCR validation, lien endorsement, and release recommendations.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('verification')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
        >
          <ScanSearch className="w-4 h-4" />
          <span>Launch OCR Verification Desk</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setCurrentView('verification')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Verifications</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <ScanSearch className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-blue-800 mt-2 font-mono">
            {pendingVerification.length}
          </div>
          <div className="text-[11px] text-blue-600 mt-1 flex items-center justify-between font-medium">
            <span>{discrepancyCases.length} Discrepancies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => setCurrentView('renewals')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Renewals Under Review</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-indigo-800 mt-2 font-mono">
            {regionalRenewals.filter((r) => r.status === 'Pending Review').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Replacement FDR checks</div>
        </div>

        <div
          onClick={() => setCurrentView('releases')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Release Scrutiny Claims</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2 font-mono">
            {regionalReleases.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">4-point checklist scrutiny</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Regional Deposit Vault</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
            {formatINRWords(totalRegionalDeposit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{regionalInstitutions.length} Institutions in region</div>
        </div>
      </div>

      {/* Main Two-Column Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Priority Scrutiny Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Priority Regional Verification Queue</h3>
              <p className="text-xs text-slate-500">Unverified FDR certificates awaiting OCR review and sign-off</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
              {pendingVerification.length} Submissions
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingVerification.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No pending FDRs awaiting verification in {userRegion} Region!
              </div>
            ) : (
              pendingVerification.map((fdr) => (
                <div
                  key={fdr.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-lg transition"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-xs">{fdr.fdrNumber}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          fdr.verificationStatus === 'Discrepancy'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {fdr.verificationStatus}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{fdr.institutionName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {fdr.bankName} • Branch: {fdr.branch}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 sm:text-right">
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {formatINR(fdr.depositAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400">Due: {fdr.maturityDate}</div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveFdrForVerification(fdr);
                        setCurrentView('verification');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition shadow-xs"
                    >
                      <span>Scrutinize</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Assigned Institutions in Region (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Institutions Under Jurisdiction</h3>
              <p className="text-xs text-slate-500">AICTE Permanent IDs in {userRegion} Region</p>
            </div>
            <Building className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {regionalInstitutions.map((inst) => {
              const instFdrs = fdrs.filter((f) => f.institutionId === inst.id);
              const depositSum = instFdrs.reduce((a, b) => a + b.depositAmount, 0);

              return (
                <div key={inst.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{inst.name}</span>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        ID: {inst.aictePermanentId} • {inst.city}, {inst.state}
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      {inst.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">{instFdrs.length} FDRs Filed</span>
                    <span className="font-mono font-bold text-slate-800">{formatINRWords(depositSum)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
