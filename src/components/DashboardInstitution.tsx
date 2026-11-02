import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, formatINRWords, calculateMaturityStatus } from '../utils/fdrEngine';
import {
  Building2,
  FilePlus,
  Clock,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileText,
  Send,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const DashboardInstitution: React.FC = () => {
  const {
    currentUser,
    institutions,
    fdrs,
    respondToQuery,
    setCurrentView,
  } = useApp();

  // Find user's institution (or default to VJTI inst-01)
  const currentInstitution =
    institutions.find((i) => i.id === currentUser.institutionId) || institutions[0];

  const myFdrs = fdrs.filter((f) => f.institutionId === currentInstitution.id);
  const totalDeposit = myFdrs.reduce((a, b) => a + b.depositAmount, 0);
  const verifiedCount = myFdrs.filter((f) => f.verificationStatus === 'Verified').length;
  const pendingCount = myFdrs.filter((f) => f.verificationStatus === 'Pending' || f.verificationStatus === 'Discrepancy').length;
  const queryCount = myFdrs.filter((f) => f.verificationStatus === 'Query Raised').length;

  const [activeQueryFdrId, setActiveQueryFdrId] = useState<string | null>(null);
  const [responseMsg, setResponseMsg] = useState('');

  const handleSendResponse = (fdrId: string) => {
    if (!responseMsg) {
      alert('Please enter your clarification message.');
      return;
    }
    respondToQuery(fdrId, responseMsg);
    setResponseMsg('');
    setActiveQueryFdrId(null);
    alert('Clarification and updated documents submitted to Regional Officer.');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{currentInstitution.name}</h1>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              AICTE Approved
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1 font-mono">
            <span>Permanent ID: <strong className="text-slate-800">{currentInstitution.aictePermanentId}</strong></span>
            <span>·</span>
            <span>{currentInstitution.region} Region</span>
            <span>·</span>
            <span className="font-sans">{currentInstitution.type}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('submit-fdr')}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>Submit New FDR</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Security Deposit Vault</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {formatINRWords(totalDeposit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{myFdrs.length} Total FDR Records</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Verified & Compliant</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-blue-700 mt-2 font-mono">
            {verifiedCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">100% Valid AICTE Joint Lien</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Officer Scrutiny</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2 font-mono">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Under OCR & regional review</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Action Required (Queries)</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2 font-mono">
            {queryCount}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Requires clarification response</div>
        </div>
      </div>

      {/* Action Required: Officer Queries Desk */}
      {queryCount > 0 && (
        <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Clarification Required by Regional Verification Officer</span>
          </div>
          <p className="text-xs text-amber-800">
            The Regional Office has raised formal queries regarding your FDR submission. Please provide necessary explanations or upload updated banker confirmation letters.
          </p>

          <div className="space-y-3 mt-2">
            {myFdrs
              .filter((f) => f.verificationStatus === 'Query Raised')
              .map((qFdr) => (
                <div key={qFdr.id} className="bg-white p-4 rounded-lg border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{qFdr.fdrNumber}</span>
                      <span className="text-slate-500 ml-2">({qFdr.bankName} - {formatINR(qFdr.depositAmount)})</span>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">
                      Action Required
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700">
                    <strong className="text-slate-900 block text-[11px] mb-0.5">Officer Query Notice:</strong>
                    {qFdr.queryMessage}
                  </div>

                  {activeQueryFdrId === qFdr.id ? (
                    <div className="space-y-2 pt-2">
                      <textarea
                        value={responseMsg}
                        onChange={(e) => setResponseMsg(e.target.value)}
                        placeholder="Type clarification response and banker endorsement details..."
                        rows={3}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setActiveQueryFdrId(null)}
                          className="px-3 py-1.5 text-xs text-slate-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendResponse(qFdr.id)}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Clarification</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setActiveQueryFdrId(qFdr.id)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs cursor-pointer"
                      >
                        Respond to Query
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Institution FDR Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Institution Fixed Deposit Ledger & Compliance Status
            </h3>
          </div>
          <button
            onClick={() => setCurrentView('submit-fdr')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center cursor-pointer"
          >
            <span>+ Submit Another FDR</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/75 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">FDR Number</th>
                <th className="py-3 px-4">Issuing Bank & Branch</th>
                <th className="py-3 px-4">Deposit Principal</th>
                <th className="py-3 px-4">Issue & Maturity</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myFdrs.map((item) => {
                const matInfo = calculateMaturityStatus(item.maturityDate);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{item.fdrNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{item.documentName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.bankName}</div>
                      <div className="text-[10px] text-slate-500">{item.branch} (IFSC: {item.ifscCode})</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{formatINR(item.depositAmount)}</div>
                      <div className="text-[10px] text-slate-500">{item.interestRate}% p.a.</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800">Matures: {item.maturityDate}</div>
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-semibold mt-0.5 ${matInfo.colorClass}`}>
                        {matInfo.daysRemaining > 0 ? `${matInfo.daysRemaining} days remaining` : 'Matured'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.verificationStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.verificationStatus === 'Discrepancy'
                            ? 'bg-red-100 text-red-800'
                            : item.verificationStatus === 'Query Raised'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.verificationStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {item.lifecycleStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
