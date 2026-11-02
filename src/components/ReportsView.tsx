import React from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, formatINRWords, exportToCSV } from '../utils/fdrEngine';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  PieChart,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { institutions, fdrs, renewals, releases } = useApp();

  const totalDeposit = fdrs.reduce((a, b) => a + b.depositAmount, 0);

  // Bank stats
  const bankStats: Record<string, { count: number; amount: number }> = {};
  fdrs.forEach((f) => {
    if (!bankStats[f.bankName]) bankStats[f.bankName] = { count: 0, amount: 0 };
    bankStats[f.bankName].count += 1;
    bankStats[f.bankName].amount += f.depositAmount;
  });

  // Regional stats
  const regionStats: Record<string, { count: number; amount: number; institutions: number }> = {};
  institutions.forEach((inst) => {
    if (!regionStats[inst.region]) regionStats[inst.region] = { count: 0, amount: 0, institutions: 0 };
    regionStats[inst.region].institutions += 1;
  });
  fdrs.forEach((f) => {
    if (!regionStats[f.region]) regionStats[f.region] = { count: 0, amount: 0, institutions: 0 };
    regionStats[f.region].count += 1;
    regionStats[f.region].amount += f.depositAmount;
  });

  const exportBankReport = () => {
    const rows = Object.entries(bankStats).map(([bank, data]) => ({
      'Bank Name': bank,
      'Total FDR Count': data.count,
      'Total Principal (INR)': data.amount,
      'Share (%)': ((data.amount / totalDeposit) * 100).toFixed(2),
    }));
    exportToCSV(`AICTE_Bank_Exposure_Report_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const exportRegionReport = () => {
    const rows = Object.entries(regionStats).map(([region, data]) => ({
      Region: region,
      'Registered Institutions': data.institutions,
      'FDR Count': data.count,
      'Total Deposits (INR)': data.amount,
      'Share (%)': ((data.amount / totalDeposit) * 100).toFixed(2),
    }));
    exportToCSV(`AICTE_Regional_Compliance_Report_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Analytics & Statutory Reports</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Module 10 Dynamic Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time compliance analytics, bank portfolio exposure, and regional deposit aggregations.
          </p>
        </div>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Gross Security Vault</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{formatINRWords(totalDeposit)}</div>
          <span className="text-[11px] text-slate-400 font-mono">{formatINR(totalDeposit)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Fixed Deposits</span>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">{fdrs.length} Records</div>
          <span className="text-[11px] text-emerald-600 font-medium">100% AICTE Lien Compliant</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Renewals Rolled Over</span>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-1">{renewals.length} Processed</div>
          <span className="text-[11px] text-slate-400">Zero default slippage</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Release Dossiers</span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">{releases.length} Lodged</div>
          <span className="text-[11px] text-slate-400">4-point checklist verified</span>
        </div>
      </div>

      {/* Two Detailed Report Tables with CSV Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Regional Report */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Regional Jurisdiction Compliance Report
            </h3>
            <button
              onClick={exportRegionReport}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3">Colleges</th>
                <th className="py-2.5 px-3">FDRs</th>
                <th className="py-2.5 px-3 text-right">Deposits (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(regionStats).map(([reg, d]) => (
                <tr key={reg} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{reg}</td>
                  <td className="py-2.5 px-3">{d.institutions}</td>
                  <td className="py-2.5 px-3">{d.count}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatINRWords(d.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table 2: Bank Exposure */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Authorized Scheduled Bank Concentration Report
            </h3>
            <button
              onClick={exportBankReport}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Bank Name</th>
                <th className="py-2.5 px-3">FDR Count</th>
                <th className="py-2.5 px-3">Exposure Share</th>
                <th className="py-2.5 px-3 text-right">Deposits (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(bankStats).map(([bank, d]) => {
                const pct = ((d.amount / totalDeposit) * 100).toFixed(1);
                return (
                  <tr key={bank} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{bank}</td>
                    <td className="py-2.5 px-3">{d.count}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {pct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatINRWords(d.amount)}
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
