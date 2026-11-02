import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReleaseRequest } from '../types';
import { formatINR, formatINRWords } from '../utils/fdrEngine';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  ShieldCheck,
  PlusCircle,
  FileText,
  Clock,
  X,
} from 'lucide-react';

export const ReleasesView: React.FC = () => {
  const {
    releases,
    fdrs,
    currentUser,
    submitReleaseRequest,
    updateReleaseStatus,
  } = useApp();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showScrutinyModal, setShowScrutinyModal] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<ReleaseRequest | null>(null);
  const [scrutinyRemarks, setScrutinyRemarks] = useState('');

  // Institution application fields
  const [selectedFdrId, setSelectedFdrId] = useState('');
  const [reason, setReason] = useState<'Course Closure' | 'Institution Closure' | 'Excess Deposit' | 'Tenure Completion'>('Tenure Completion');
  const [closureOrderNo, setClosureOrderNo] = useState('AICTE/WRO/REL/2026/0' + Math.floor(100 + Math.random() * 900));
  const [tenureCheck, setTenureCheck] = useState(true);
  const [zeroDuesCheck, setZeroDuesCheck] = useState(true);
  const [stateNocCheck, setStateNocCheck] = useState(true);
  const [ecApprovalCheck, setEcApprovalCheck] = useState(false);
  const [docName, setDocName] = useState('Statutory_Clearance_Pack.pdf');

  // Matured FDRs that could be requested for release
  const eligibleMaturedFdrs = fdrs.filter(
    (f) =>
      (f.lifecycleStatus === 'Matured' || f.lifecycleStatus === 'Active') &&
      (currentUser.role !== 'INSTITUTION' || f.institutionId === currentUser.institutionId)
  );

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFdrId) {
      alert('Please select an eligible FDR.');
      return;
    }
    const res = submitReleaseRequest(
      selectedFdrId,
      reason,
      closureOrderNo,
      {
        tenureCompleted: tenureCheck,
        zeroDuesCertificate: zeroDuesCheck,
        stateGovtNoc: stateNocCheck,
        aicteEcApproval: ecApprovalCheck,
      },
      docName
    );

    if (res.success) {
      alert('Release request submitted for Regional Office scrutiny.');
      setShowApplyModal(false);
    } else {
      alert(res.message);
    }
  };

  const handleUpdateStatus = (newStatus: 'Under Scrutiny' | 'Recommended' | 'Approved' | 'Rejected') => {
    if (!selectedRelease) return;
    if (!scrutinyRemarks) {
      alert('Officer scrutiny remarks are required under AICTE release bylaws.');
      return;
    }
    updateReleaseStatus(selectedRelease.id, newStatus, scrutinyRemarks);
    setShowScrutinyModal(false);
    setSelectedRelease(null);
    setScrutinyRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Security Deposit Release & Encashment Clearance
            </h1>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              APH 4-Point Clearance Protocol
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enforcing AICTE Approval Process Handbook (APH) 4-point clearance protocol before releasing statutory lien endorsements.
          </p>
        </div>

        {currentUser.role === 'INSTITUTION' && (
          <button
            onClick={() => {
              if (eligibleMaturedFdrs.length > 0) setSelectedFdrId(eligibleMaturedFdrs[0].id);
              setShowApplyModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for Deposit Release</span>
          </button>
        )}
      </div>

      {/* Mandatory Statutory Warning Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-3 shadow-xs">
        <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">AICTE Statutory Mandate (Rule 2.14):</strong>
          <p className="mt-0.5 leading-relaxed text-amber-800">
            "Maturity of an FDR does not automatically entitle an institution to release of deposit. Release is subject to verification of complete student batch passout, zero student or faculty fee refund disputes, State Govt Directorate NOC, and Executive Committee resolution."
          </p>
        </div>
      </div>

      {/* Releases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Deposit Release Claims & Clearance Dossiers
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{releases.length} Dossiers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Dossier ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">FDR Number & Amount</th>
                <th className="py-3 px-4">Release Ground</th>
                <th className="py-3 px-4">4-Point Clearance Checklist</th>
                <th className="py-3 px-4">Scrutiny Stage</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {releases.map((rel) => {
                const checks = rel.checklist;
                const passedCount = Object.values(checks).filter(Boolean).length;

                return (
                  <tr key={rel.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {rel.id}
                      <div className="text-[10px] text-slate-400 font-sans">
                        {new Date(rel.submittedAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{rel.institutionName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {rel.aictePermanentId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{rel.fdrNumber}</div>
                      <div className="text-[11px] text-emerald-700 font-mono font-bold">
                        {formatINR(rel.depositAmount)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">{rel.reason}</span>
                      <div className="text-[10px] text-slate-400 font-mono">Order: {rel.closureOrderNumber}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${checks.tenureCompleted ? 'bg-emerald-500' : 'bg-red-400'}`}
                          title="Tenure Fulfilled"
                        />
                        <span
                          className={`w-2 h-2 rounded-full ${checks.zeroDuesCertificate ? 'bg-emerald-500' : 'bg-red-400'}`}
                          title="Zero Dues Certificate"
                        />
                        <span
                          className={`w-2 h-2 rounded-full ${checks.stateGovtNoc ? 'bg-emerald-500' : 'bg-red-400'}`}
                          title="State Govt NOC"
                        />
                        <span
                          className={`w-2 h-2 rounded-full ${checks.aicteEcApproval ? 'bg-emerald-500' : 'bg-red-400'}`}
                          title="AICTE EC Approval"
                        />
                        <span className="text-[11px] font-mono text-slate-600 ml-1">
                          ({passedCount}/4 Cleared)
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{rel.supportingDocName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-medium px-2 py-0.2 rounded border ${
                          rel.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : rel.status === 'Recommended'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : rel.status === 'Rejected'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {rel.status}
                      </span>
                      {rel.approvalReferenceNo && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Ref: {rel.approvalReferenceNo}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {currentUser.role !== 'INSTITUTION' ? (
                        <button
                          onClick={() => {
                            setSelectedRelease(rel);
                            setScrutinyRemarks(rel.officerRemarks || '');
                            setShowScrutinyModal(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold cursor-pointer transition shadow-xs"
                        >
                          Scrutiny & Sign-off
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">View Dossier</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Release Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <span>Apply for Security Deposit Release</span>
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Deposit FDR to Release *
                </label>
                <select
                  value={selectedFdrId}
                  onChange={(e) => setSelectedFdrId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                >
                  {eligibleMaturedFdrs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fdrNumber} • {formatINR(f.depositAmount)} ({f.bankName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Statutory Grounds for Release *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Tenure Completion">Completion of Statutory Lock-in (10 Years)</option>
                  <option value="Course Closure">Approved Closure of Specific Course / Program</option>
                  <option value="Institution Closure">Formal Closure of Technical Institution</option>
                  <option value="Excess Deposit">Adjustment / Release of Excess Security Deposit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  AICTE / State Government Order Number *
                </label>
                <input
                  type="text"
                  value={closureOrderNo}
                  onChange={(e) => setClosureOrderNo(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              {/* Clearance Declaration Checklist */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Clearance Certificate Declarations:</span>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={tenureCheck}
                    onChange={(e) => setTenureCheck(e.target.checked)}
                    className="w-3.5 h-3.5"
                  />
                  <span>Full student tenure completed (No remaining batches)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={zeroDuesCheck}
                    onChange={(e) => setZeroDuesCheck(e.target.checked)}
                    className="w-3.5 h-3.5"
                  />
                  <span>Zero dues certificate (Salaries, student fees refunded)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={stateNocCheck}
                    onChange={(e) => setStateNocCheck(e.target.checked)}
                    className="w-3.5 h-3.5"
                  />
                  <span>State Directorate of Technical Education NOC obtained</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Upload Combined Clearance Dossier (PDF) *
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setDocName(e.target.files[0].name);
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                >
                  Submit Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scrutiny Modal */}
      {showScrutinyModal && selectedRelease && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 text-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <span>Release Scrutiny & Approval Sign-off</span>
            </h3>

            <p className="text-slate-600 mt-2">
              Dossier: <strong>{selectedRelease.id}</strong> • {selectedRelease.institutionName} •{' '}
              <strong className="text-emerald-700">{formatINR(selectedRelease.depositAmount)}</strong>
            </p>

            <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">4-Point Clearance Status:</span>
              <div className="text-[11px] space-y-0.5">
                <div>• Tenure Completed: {selectedRelease.checklist.tenureCompleted ? '✅ Passed' : '❌ Deficient'}</div>
                <div>• Zero Dues Certificate: {selectedRelease.checklist.zeroDuesCertificate ? '✅ Passed' : '❌ Deficient'}</div>
                <div>• State Govt NOC: {selectedRelease.checklist.stateGovtNoc ? '✅ Passed' : '❌ Deficient'}</div>
                <div>• AICTE EC Approval: {selectedRelease.checklist.aicteEcApproval ? '✅ Passed' : '⚠️ Pending Meeting Resolution'}</div>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <label className="block font-bold text-slate-700">Officer Scrutiny Remarks</label>
              <textarea
                value={scrutinyRemarks}
                onChange={(e) => setScrutinyRemarks(e.target.value)}
                placeholder="Enter remarks and statutory references..."
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleUpdateStatus('Rejected')}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold border border-red-300 cursor-pointer"
              >
                Reject Release
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowScrutinyModal(false)}
                  className="px-3 py-2 text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                {currentUser.role === 'OFFICER' ? (
                  <button
                    onClick={() => handleUpdateStatus('Recommended')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Recommend to Member Sec
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus('Approved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Grant Executive Release Sanction
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
