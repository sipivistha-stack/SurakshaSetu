import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FDRRecord } from '../types';
import {
  formatINR,
  formatINRWords,
  calculateMaturityStatus,
  exportToCSV,
} from '../utils/fdrEngine';
import {
  Search,
  Filter,
  Download,
  Eye,
  FileCheck2,
  ScanSearch,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  X,
  ShieldCheck,
} from 'lucide-react';

export const FdrRegister: React.FC = () => {
  const {
    fdrs,
    currentUser,
    setCurrentView,
    setActiveFdrForVerification,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterBank, setFilterBank] = useState('ALL');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<FDRRecord | null>(null);

  // If user is institution, restrict to their institution
  const relevantFdrs =
    currentUser.role === 'INSTITUTION'
      ? fdrs.filter((f) => f.institutionId === currentUser.institutionId)
      : fdrs;

  const filtered = relevantFdrs.filter((fdr) => {
    const matchSearch =
      fdr.fdrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fdr.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fdr.aictePermanentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fdr.bankName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRegion = filterRegion === 'ALL' || fdr.region === filterRegion;
    const matchStatus =
      filterStatus === 'ALL' ||
      fdr.verificationStatus === filterStatus ||
      fdr.lifecycleStatus === filterStatus;
    const matchBank = filterBank === 'ALL' || fdr.bankName === filterBank;

    return matchSearch && matchRegion && matchStatus && matchBank;
  });

  const handleExportCSV = () => {
    const rows = filtered.map((f) => ({
      'FDR Number': f.fdrNumber,
      'Institution Name': f.institutionName,
      'AICTE Permanent ID': f.aictePermanentId,
      Region: f.region,
      Bank: f.bankName,
      Branch: f.branch,
      'IFSC Code': f.ifscCode,
      'Deposit Amount (INR)': f.depositAmount,
      'Issue Date': f.issueDate,
      'Maturity Date': f.maturityDate,
      'Verification Status': f.verificationStatus,
      'Lifecycle Status': f.lifecycleStatus,
      'Lien Marked': f.lienMarked ? 'YES' : 'NO',
      'Document Hash': f.documentHash || '',
    }));
    exportToCSV(`AICTE_FDR_Register_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentUser.role === 'INSTITUTION' ? 'My Fixed Deposit Register' : 'Centralized FDR Master Register'}
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
              {filtered.length} Records Loaded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete statutory repository of institutional security deposits, bank accounts, and lien endorsements.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export Register to CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by FDR No, Institution, Bank..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="ALL">All Regions (All India)</option>
              <option value="Western">Western Region</option>
              <option value="Northern">Northern Region</option>
              <option value="Southern">Southern Region</option>
              <option value="Eastern">Eastern Region</option>
              <option value="Central">Central Region</option>
              <option value="South-Western">South-Western Region</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="ALL">All Verification / Lifecycle Statuses</option>
              <option value="Pending">Pending Scrutiny</option>
              <option value="Verified">Verified & Valid</option>
              <option value="Discrepancy">Discrepancy Detected</option>
              <option value="Query Raised">Query Raised</option>
              <option value="Active">Active Valid</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Matured">Matured</option>
              <option value="Renewal Pending">Renewal Pending</option>
              <option value="Released">Released</option>
            </select>
          </div>

          {/* Bank Filter */}
          <div>
            <select
              value={filterBank}
              onChange={(e) => setFilterBank(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="ALL">All Scheduled Banks</option>
              <option value="State Bank of India">State Bank of India</option>
              <option value="Punjab National Bank">Punjab National Bank</option>
              <option value="Bank of Baroda">Bank of Baroda</option>
              <option value="Canara Bank">Canara Bank</option>
              <option value="HDFC Bank">HDFC Bank</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">FDR Particulars</th>
                <th className="py-3 px-4">Institution & Region</th>
                <th className="py-3 px-4">Bank & Branch</th>
                <th className="py-3 px-4">Principal Amount</th>
                <th className="py-3 px-4">Maturity / Expiry</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Lifecycle</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No FDR records match the specified search and filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const matInfo = calculateMaturityStatus(item.maturityDate);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/75 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-semibold text-slate-900">{item.fdrNumber}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{item.documentName}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 truncate max-w-[200px]">
                          {item.institutionName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {item.aictePermanentId} · {item.region}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{item.bankName}</div>
                        <div className="text-[10px] text-slate-500">{item.branch}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 tabular-nums">{formatINR(item.depositAmount)}</div>
                        <div className="text-[10px] text-slate-500 font-mono tabular-nums">{item.interestRate}% interest</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-mono tabular-nums">{item.maturityDate}</div>
                        <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-medium mt-0.5 border ${matInfo.colorClass}`}>
                          {matInfo.daysRemaining > 0 ? `${matInfo.daysRemaining}d remaining` : 'Matured'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[10px] font-medium px-2 py-0.2 rounded border ${
                            item.verificationStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : item.verificationStatus === 'Discrepancy'
                              ? 'bg-red-50 text-red-800 border-red-200 font-semibold'
                              : item.verificationStatus === 'Query Raised'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : item.verificationStatus === 'Rejected'
                              ? 'bg-slate-100 text-slate-800 border-slate-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {item.verificationStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-slate-600">
                          {item.lifecycleStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setSelectedRecordForDetail(item)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded transition cursor-pointer"
                          title="View Complete Particulars & Certificate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {currentUser.role !== 'INSTITUTION' && (
                          <button
                            onClick={() => {
                              setActiveFdrForVerification(item);
                              setCurrentView('verification');
                            }}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition cursor-pointer"
                            title="Inspect in OCR Verification Desk"
                          >
                            <ScanSearch className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Printable Certificate Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">AICTE Statutory Fixed Deposit Record</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
                  title="Print Certificate"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedRecordForDetail(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3">
                <div className="text-center pb-3 border-b border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    All India Council for Technical Education
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    Security Deposit Compliance Receipt
                  </h2>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Certificate Reference: AICTE/FDR/{selectedRecordForDetail.id.toUpperCase()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Institution</span>
                    <strong className="text-slate-800">{selectedRecordForDetail.institutionName}</strong>
                    <div className="text-slate-500 text-[11px]">AICTE ID: {selectedRecordForDetail.aictePermanentId}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Regional Office</span>
                    <strong className="text-slate-800">{selectedRecordForDetail.region} Region</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">FDR Number</span>
                    <strong className="text-slate-800 font-mono">{selectedRecordForDetail.fdrNumber}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Deposit Principal</span>
                    <strong className="text-emerald-700 font-mono text-sm">
                      {formatINR(selectedRecordForDetail.depositAmount)}
                    </strong>
                    <div className="text-slate-500 text-[10px]">({formatINRWords(selectedRecordForDetail.depositAmount)})</div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Scheduled Bank</span>
                    <strong className="text-slate-800">{selectedRecordForDetail.bankName}</strong>
                    <div className="text-slate-500 text-[10px]">Branch: {selectedRecordForDetail.branch}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Tenure & Maturity</span>
                    <strong className="text-slate-800">{selectedRecordForDetail.issueDate} to {selectedRecordForDetail.maturityDate}</strong>
                    <div className="text-slate-500 text-[10px]">Interest: {selectedRecordForDetail.interestRate}% p.a.</div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">Lien Details:</span>
                  <p className="text-slate-700 text-[11px] mt-0.5">{selectedRecordForDetail.lienDetails}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <div>
                    <span>Verification: </span>
                    <strong className="text-slate-800">{selectedRecordForDetail.verificationStatus}</strong>
                  </div>
                  <div className="font-mono text-slate-400 text-[10px]">
                    SHA-256: {selectedRecordForDetail.documentHash?.slice(0, 24)}...
                  </div>
                </div>
              </div>

              {selectedRecordForDetail.officerRemarks && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-slate-800">
                  <strong className="text-blue-900 block text-[11px]">Officer Scrutiny Remarks:</strong>
                  <p className="mt-0.5">{selectedRecordForDetail.officerRemarks}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
