import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RenewalRecord, FDRRecord } from '../types';
import { formatINR, formatINRWords } from '../utils/fdrEngine';
import {
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';

export const RenewalsView: React.FC = () => {
  const {
    renewals,
    fdrs,
    currentUser,
    submitRenewal,
    approveRenewal,
  } = useApp();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRenewalForApproval, setSelectedRenewalForApproval] = useState<RenewalRecord | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  // Application form fields
  const [selectedOldFdrId, setSelectedOldFdrId] = useState('');
  const [newFdrNumber, setNewFdrNumber] = useState('SBI-RNW-2026-' + Math.floor(10000 + Math.random() * 90000));
  const [newAmount, setNewAmount] = useState<number>(5000000);
  const [newMaturityDate, setNewMaturityDate] = useState('2031-10-15');
  const [renewalDocName, setRenewalDocName] = useState('Replacement_FDR_Receipt.pdf');

  // Maturing or matured FDRs eligible for renewal
  const eligibleOldFdrs = fdrs.filter(
    (f) =>
      (f.lifecycleStatus === 'Expiring Soon' || f.lifecycleStatus === 'Matured' || f.lifecycleStatus === 'Active') &&
      (currentUser.role !== 'INSTITUTION' || f.institutionId === currentUser.institutionId)
  );

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOldFdrId || !newFdrNumber || !newAmount || !newMaturityDate) {
      alert('Please select the maturing FDR and complete replacement details.');
      return;
    }
    const res = submitRenewal(selectedOldFdrId, newFdrNumber, newAmount, newMaturityDate, renewalDocName);
    if (res.success) {
      alert('FDR Renewal application submitted for officer scrutiny.');
      setShowApplyModal(false);
    } else {
      alert(res.message);
    }
  };

  const handleConfirmApproval = () => {
    if (!selectedRenewalForApproval) return;
    approveRenewal(selectedRenewalForApproval.id, approvalRemarks || 'Renewal verified and replacement FDR activated.');
    setShowApprovalModal(false);
    setSelectedRenewalForApproval(null);
    setApprovalRemarks('');
    alert('Renewal approved! Replacement FDR has been created and activated in the master register.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">FDR Renewal & Replacement Management</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              Module 7 Chain of Custody
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking rollover of maturing deposits, linking predecessor and successor FDR certificates, and officer scrutiny.
          </p>
        </div>

        {currentUser.role === 'INSTITUTION' && (
          <button
            onClick={() => {
              if (eligibleOldFdrs.length > 0) setSelectedOldFdrId(eligibleOldFdrs[0].id);
              setShowApplyModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for FDR Renewal</span>
          </button>
        )}
      </div>

      {/* Renewals Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Renewal & Replacement Records
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">{renewals.length} Applications</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Predecessor (Old) FDR</th>
                <th className="py-3 px-4">Replacement (New) FDR</th>
                <th className="py-3 px-4">Principal Amount</th>
                <th className="py-3 px-4">Tenure Extension</th>
                <th className="py-3 px-4">Scrutiny Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {renewals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{r.institutionName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">App ID: {r.id}</div>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="font-bold text-slate-700">{r.oldFdrNumber}</div>
                    <div className="text-[10px] text-slate-400 font-sans">Matured: {r.oldMaturityDate}</div>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="font-bold text-blue-700 flex items-center space-x-1">
                      <LinkIcon className="w-3 h-3 text-blue-500" />
                      <span>{r.newFdrNumber}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">{r.documentName}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    {formatINR(r.amount)}
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-800">New Maturity: <strong className="font-mono tabular-nums">{r.newMaturityDate}</strong></div>
                    <div className="text-[10px] text-slate-500">Filed on: {r.renewalDate}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.2 rounded border ${
                        r.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : r.status === 'Rejected'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {r.status}
                    </span>
                    {r.officerRemarks && (
                      <span className="block text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                        {r.officerRemarks}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {currentUser.role !== 'INSTITUTION' && r.status === 'Pending Review' ? (
                      <button
                        onClick={() => {
                          setSelectedRenewalForApproval(r);
                          setShowApprovalModal(true);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold cursor-pointer transition shadow-xs"
                      >
                        Scrutinize & Approve
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Renewal Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <span>Submit Replacement FDR for Maturing Deposit</span>
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Maturing / Matured Predecessor FDR *
                </label>
                <select
                  value={selectedOldFdrId}
                  onChange={(e) => {
                    setSelectedOldFdrId(e.target.value);
                    const chosen = fdrs.find((f) => f.id === e.target.value);
                    if (chosen) setNewAmount(chosen.depositAmount);
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                >
                  {eligibleOldFdrs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fdrNumber} • {formatINR(f.depositAmount)} (Matures: {f.maturityDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Replacement FDR Number *
                </label>
                <input
                  type="text"
                  value={newFdrNumber}
                  onChange={(e) => setNewFdrNumber(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs"
                  placeholder="e.g. SBI-RNW-2026-90812"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Renewal Amount (INR) *
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New Maturity Date (Min 5 Yrs) *
                  </label>
                  <input
                    type="date"
                    value={newMaturityDate}
                    onChange={(e) => setNewMaturityDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Upload Replacement Certificate / Bank Confirmation (PDF) *
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setRenewalDocName(e.target.files[0].name);
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRenewalForApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Officer Scrutiny & Endorsement</span>
            </h3>

            <p className="text-slate-600 mt-2">
              Approve replacement of <strong>{selectedRenewalForApproval.oldFdrNumber}</strong> with successor FDR{' '}
              <strong>{selectedRenewalForApproval.newFdrNumber}</strong> ({formatINR(selectedRenewalForApproval.amount)}).
            </p>

            <div className="mt-4 space-y-1">
              <label className="block font-bold text-slate-700">Verification Officer Remarks</label>
              <textarea
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="Enter endorsement details: bank seal verified, 5-year lock-in active..."
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
              >
                Approve & Activate New FDR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
