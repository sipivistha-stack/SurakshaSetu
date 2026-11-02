import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToCSV } from '../utils/fdrEngine';
import {
  History,
  ShieldCheck,
  Search,
  Download,
  Hash,
  Terminal,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const rows = filtered.map((l) => ({
      'Log ID': l.id,
      Timestamp: l.timestamp,
      'User Name': l.userName,
      Role: l.userRole,
      Action: l.action,
      Module: l.module,
      Details: l.details,
      'IP Address': l.ipAddress,
      'SHA-256 Integrity Checksum': l.checksum,
    }));
    exportToCSV(`AICTE_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Compliance & Audit Trail</h1>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
              Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident system activity log capturing authentication, OCR evaluations, status alterations, and cryptographic checksums.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Action, User, Module, or Details..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp & Event ID</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action & Module</th>
                <th className="py-3 px-4">Event Particulars</th>
                <th className="py-3 px-4">Origin IP</th>
                <th className="py-3 px-4">SHA-256 Checksum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/75 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-800">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.id}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 ${
                        log.userRole === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : log.userRole === 'OFFICER'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {log.userRole}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-800 text-[11px]">{log.action}</div>
                    <div className="text-[10px] text-slate-500">{log.module}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-700 max-w-xs">
                    <p className="line-clamp-2">{log.details}</p>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600">
                    {log.ipAddress}
                  </td>

                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                    <span className="truncate max-w-[120px] block" title={log.checksum}>
                      {log.checksum.slice(0, 16)}...
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
