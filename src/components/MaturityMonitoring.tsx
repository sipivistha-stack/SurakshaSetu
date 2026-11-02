import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateMaturityStatus, formatINR, formatINRWords } from '../utils/fdrEngine';
import {
  Clock,
  AlertTriangle,
  Bell,
  RefreshCw,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const MaturityMonitoring: React.FC = () => {
  const { fdrs, currentUser, setCurrentView, logAuditEvent } = useApp();

  const [filterUrgency, setFilterUrgency] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'MATURED'>('ALL');
  const [reminderSentMap, setReminderSentMap] = useState<Record<string, boolean>>({});

  // Compute maturity details for all relevant FDRs
  const relevantFdrs =
    currentUser.role === 'INSTITUTION'
      ? fdrs.filter((f) => f.institutionId === currentUser.institutionId)
      : fdrs;

  const analyzed = relevantFdrs
    .map((fdr) => {
      const mat = calculateMaturityStatus(fdr.maturityDate);
      return { ...fdr, maturityInfo: mat };
    })
    .sort((a, b) => a.maturityInfo.daysRemaining - b.maturityInfo.daysRemaining);

  const filtered = analyzed.filter((item) => {
    if (filterUrgency === 'CRITICAL') return item.maturityInfo.urgency === 'critical';
    if (filterUrgency === 'HIGH') return item.maturityInfo.urgency === 'high';
    if (filterUrgency === 'MEDIUM') return item.maturityInfo.urgency === 'medium';
    if (filterUrgency === 'MATURED') return item.maturityInfo.urgency === 'matured';
    return item.maturityInfo.urgency !== 'low'; // Show anything needing tracking by default
  });

  const handleSendReminder = (fdrNumber: string, instName: string) => {
    setReminderSentMap((prev) => ({ ...prev, [fdrNumber]: true }));
    logAuditEvent(
      'MATURITY_REMINDER_DISPATCHED',
      'Maturity Monitoring',
      `Dispatched automated renewal reminder notice to ${instName} for maturing FDR ${fdrNumber}`
    );
    alert(`Automated AICTE renewal reminder dispatched to authorized signatory of ${instName}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Automated Maturity & Expiry Monitoring Center
            </h1>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Automated 24h Cron Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic countdown calculated directly from maturity dates. Automatic renewal notifications for &lt;30d, &lt;15d, and &lt;7d horizons.
          </p>
        </div>

        {/* Clean Segmented Control Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80 text-xs">
          <button
            onClick={() => setFilterUrgency('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              filterUrgency === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Upcoming ({analyzed.filter((a) => a.maturityInfo.urgency !== 'low').length})
          </button>
          <button
            onClick={() => setFilterUrgency('CRITICAL')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              filterUrgency === 'CRITICAL' ? 'bg-white text-red-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            &lt; 7 Days ({analyzed.filter((a) => a.maturityInfo.urgency === 'critical').length})
          </button>
          <button
            onClick={() => setFilterUrgency('HIGH')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              filterUrgency === 'HIGH' ? 'bg-white text-orange-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            &lt; 15 Days ({analyzed.filter((a) => a.maturityInfo.urgency === 'high').length})
          </button>
          <button
            onClick={() => setFilterUrgency('MEDIUM')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              filterUrgency === 'MEDIUM' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            &lt; 30 Days ({analyzed.filter((a) => a.maturityInfo.urgency === 'medium').length})
          </button>
          <button
            onClick={() => setFilterUrgency('MATURED')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              filterUrgency === 'MATURED' ? 'bg-white text-purple-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matured ({analyzed.filter((a) => a.maturityInfo.urgency === 'matured').length})
          </button>
        </div>
      </div>

      {/* Expiry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
            No Fixed Deposits found in this urgency bracket.
          </div>
        ) : (
          filtered.map((item) => {
            const { maturityInfo } = item;
            const isReminderSent = reminderSentMap[item.fdrNumber];

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 flex flex-col justify-between hover:border-slate-300 transition space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-semibold text-slate-900 text-sm">{item.fdrNumber}</span>
                      <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                        {item.institutionName}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.2 rounded border ${maturityInfo.colorClass}`}
                    >
                      {maturityInfo.category}
                    </span>
                  </div>

                  <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Deposit Principal:</span>
                      <strong className="text-slate-900 font-mono">{formatINR(item.depositAmount)}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Bank & Branch:</span>
                      <span className="text-slate-700 truncate max-w-[150px]">{item.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Maturity Date:</span>
                      <span className="font-mono font-bold text-slate-800">{item.maturityDate}</span>
                    </div>
                  </div>

                  {/* Countdown Progress Visualizer */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Remaining Term:</span>
                      <span className="font-bold text-slate-800">
                        {maturityInfo.daysRemaining > 0
                          ? `${maturityInfo.daysRemaining} Calendar Days`
                          : `${Math.abs(maturityInfo.daysRemaining)} Days Past Maturity`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          maturityInfo.urgency === 'critical'
                            ? 'bg-red-600'
                            : maturityInfo.urgency === 'high'
                            ? 'bg-orange-500'
                            : maturityInfo.urgency === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-purple-600'
                        }`}
                        style={{
                          width: `${Math.max(5, Math.min(100, (maturityInfo.daysRemaining / 30) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {currentUser.role === 'INSTITUTION' ? (
                    <button
                      onClick={() => setCurrentView('renewals')}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Submit Replacement FDR</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSendReminder(item.fdrNumber, item.institutionName)}
                        disabled={isReminderSent}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition cursor-pointer ${
                          isReminderSent
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {isReminderSent ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Notice Sent</span>
                          </>
                        ) : (
                          <>
                            <Bell className="w-3.5 h-3.5 text-slate-500" />
                            <span>Send Auto-Notice</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setCurrentView('renewals')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center cursor-pointer"
                      >
                        <span>Renewals Desk</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
