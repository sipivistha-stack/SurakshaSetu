import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FDRRecord } from '../types';
import {
  simulateDocumentOcr,
  formatINR,
  formatINRWords,
  calculateMaturityStatus,
  checkDuplicateFdr,
} from '../utils/fdrEngine';
import {
  FileCheck2,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  ShieldAlert,
  Search,
  Eye,
  Send,
  Upload,
  Hash,
  Scale,
  Sparkles,
  Building2,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const VerificationDesk: React.FC = () => {
  const {
    fdrs,
    updateFdrVerification,
    activeFdrForVerification,
    setActiveFdrForVerification,
    currentUser,
  } = useApp();

  // Filter pending, discrepancy, or query items
  const queue = fdrs.filter(
    (f) =>
      f.verificationStatus === 'Pending' ||
      f.verificationStatus === 'Discrepancy' ||
      f.verificationStatus === 'Query Raised'
  );

  const [selectedFdr, setSelectedFdr] = useState<FDRRecord>(() => {
    return activeFdrForVerification || queue[0] || fdrs[0];
  });

  const [remarks, setRemarks] = useState('');
  const [queryText, setQueryText] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'rawText'>('preview');
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  // Generate real-time OCR extraction & comparison
  const ocrResult = simulateDocumentOcr(selectedFdr.documentName || 'fdr_document.pdf', selectedFdr);

  // Check for duplicates
  const dupCheck = checkDuplicateFdr(
    selectedFdr.fdrNumber,
    selectedFdr.bankName,
    selectedFdr.documentHash || '',
    fdrs,
    selectedFdr.id
  );

  const hasDiscrepancy = ocrResult.comparisons.some((c) => c.status === 'mismatch');
  const maturityInfo = calculateMaturityStatus(selectedFdr.maturityDate);

  const handleApprove = () => {
    if (!remarks) {
      if (!window.confirm('No remarks entered. Do you want to approve with default officer clearance?')) {
        return;
      }
    }
    updateFdrVerification(
      selectedFdr.id,
      'Verified',
      remarks || 'Document and bank parameters verified with OCR cross-matching. Statutory AICTE joint lien confirmed.'
    );
    setRemarks('');
  };

  const handleReject = () => {
    if (!remarks) {
      alert('Officer rejection remarks are mandatory under AICTE compliance guidelines.');
      return;
    }
    updateFdrVerification(selectedFdr.id, 'Rejected', remarks);
    setShowRejectModal(false);
    setRemarks('');
  };

  const handleRaiseQuery = () => {
    if (!queryText) {
      alert('Please specify the clarification message for the institution.');
      return;
    }
    updateFdrVerification(
      selectedFdr.id,
      'Query Raised',
      remarks || 'Query issued for institution clarification',
      queryText
    );
    setShowQueryModal(false);
    setQueryText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Clean Government Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">OCR Document Verification Desk</h1>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              PyMuPDF & Tesseract Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side automated comparison of institution-entered metadata against uploaded bank security deposit slips.
          </p>
        </div>

        {/* Counter Info */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700">
            Pending Review: <span className="font-semibold text-slate-900 tabular-nums">{queue.length}</span>
          </div>
          <div className="bg-red-50/70 border border-red-200/80 px-3 py-1.5 rounded-lg text-red-800">
            Discrepancies: <span className="font-semibold tabular-nums">{queue.filter((q) => q.verificationStatus === 'Discrepancy').length}</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Verification Queue List (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Awaiting Scrutiny
              </span>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {queue.length} Records
              </span>
            </div>

            <div className="space-y-1.5 max-h-[700px] overflow-y-auto pr-1">
              {queue.map((item) => {
                const isSelected = selectedFdr.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedFdr(item);
                      setActiveFdrForVerification(item);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition text-xs cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/20'
                        : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono font-bold text-slate-900 truncate max-w-[170px]">
                        {item.fdrNumber}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                          item.verificationStatus === 'Discrepancy'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : item.verificationStatus === 'Query Raised'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.verificationStatus}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium truncate mt-1">
                      {item.institutionName}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                      <span>{item.bankName}</span>
                      <span className="font-semibold text-slate-900 font-mono tabular-nums">{formatINRWords(item.depositAmount)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle & Right: Side-by-Side Comparison Workspace (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Anti-Fraud Alert Banner if duplicate found (Subtle hairline border, NO border-l-4) */}
          {dupCheck.isDuplicate && (
            <div className="bg-red-50/70 border border-red-200 p-4 rounded-xl shadow-xs flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-900">
                  Critical Anti-Fraud Alert: Potential Duplicate Submission
                </h4>
                <p className="text-xs text-red-800 mt-0.5 leading-relaxed">{dupCheck.reason}</p>
              </div>
            </div>
          )}

          {/* Institution Header Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-slate-900">{selectedFdr.institutionName}</span>
                  <span className="text-xs text-slate-500 font-mono">
                    ({selectedFdr.aictePermanentId})
                  </span>
                  <span className="text-xs text-slate-500">· {selectedFdr.region} Region</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 font-mono">
                  <span>FDR No: <strong className="text-slate-800">{selectedFdr.fdrNumber}</strong></span>
                  <span>·</span>
                  <span>Bank: <strong className="text-slate-800 font-sans">{selectedFdr.bankName}</strong></span>
                  <span>·</span>
                  <span>Branch: <strong className="text-slate-800 font-sans">{selectedFdr.branch}</strong></span>
                </div>
              </div>

              {/* OCR Confidence Badge */}
              <div className="flex items-center space-x-3 text-right">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">OCR Confidence</div>
                  <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                    {ocrResult.extracted.confidence.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Document Hash Integrity Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-100 font-mono">
              <div className="flex items-center space-x-2">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>SHA-256 Checksum:</span>
                <span className="text-slate-800 truncate max-w-[280px]">
                  {selectedFdr.documentHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-700 font-sans font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Integrity Verified</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side: Document Scan Preview vs OCR Field Matrix */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left: Document Visual Preview & Text Viewer (5 cols) */}
            <div className="xl:col-span-5 space-y-3">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-medium truncate">{selectedFdr.documentName}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-slate-800 rounded p-0.5 shrink-0">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                        activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Certificate
                    </button>
                    <button
                      onClick={() => setActiveTab('rawText')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                        activeTab === 'rawText' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      OCR Stream
                    </button>
                  </div>
                </div>

                {activeTab === 'preview' ? (
                  /* Realistic Bank Security FDR Certificate with Guilloche Pattern */
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="fdr-security-pattern border border-amber-900/20 p-5 rounded-lg shadow-sm relative font-sans">
                      {/* Bank Header */}
                      <div className="text-center border-b border-amber-900/15 pb-2.5">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                          COMMERCIAL SCHEDULED BANK · TERM DEPOSIT ADVICE
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5 uppercase tracking-wide">
                          {selectedFdr.bankName}
                        </h3>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          Branch: {selectedFdr.branch} · IFSC: <span className="font-mono">{selectedFdr.ifscCode}</span>
                        </p>
                      </div>

                      {/* Certificate Body */}
                      <div className="mt-3.5 space-y-2.5 text-xs text-slate-800">
                        <div
                          className={`p-1.5 rounded transition ${
                            highlightedField === 'fdrNumber' ? 'bg-amber-100/80 ring-1 ring-amber-400' : ''
                          }`}
                        >
                          <span className="text-[10px] text-slate-500 block uppercase font-medium">FDR / Receipt No:</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {ocrResult.extracted.fdrNumber}
                          </span>
                        </div>

                        <div
                          className={`p-1.5 rounded transition ${
                            highlightedField === 'depositAmount' ? 'bg-amber-100/80 ring-1 ring-amber-400' : ''
                          }`}
                        >
                          <span className="text-[10px] text-slate-500 block uppercase font-medium">Principal Amount:</span>
                          <div className="font-bold text-slate-900 text-base font-mono tabular-nums">
                            {formatINR(ocrResult.extracted.depositAmount)}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            (Rupees {formatINRWords(ocrResult.extracted.depositAmount)} Only)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed border-amber-900/15 font-mono">
                          <div
                            className={`p-1 rounded ${
                              highlightedField === 'issueDate' ? 'bg-amber-100/80 ring-1 ring-amber-400' : ''
                            }`}
                          >
                            <span className="text-[10px] text-slate-500 block font-sans">Date of Issue:</span>
                            <span className="font-semibold text-slate-800">{ocrResult.extracted.issueDate}</span>
                          </div>
                          <div
                            className={`p-1 rounded ${
                              highlightedField === 'maturityDate' ? 'bg-amber-100/80 ring-1 ring-amber-400' : ''
                            }`}
                          >
                            <span className="text-[10px] text-slate-500 block font-sans">Maturity Date:</span>
                            <span className="font-semibold text-slate-800">{ocrResult.extracted.maturityDate}</span>
                          </div>
                        </div>

                        <div
                          className={`p-2 rounded mt-2 border border-slate-200 bg-white/80 ${
                            highlightedField === 'lienMarked' ? 'bg-amber-100/80 ring-1 ring-amber-400' : ''
                          }`}
                        >
                          <span className="text-[10px] font-bold text-slate-700 uppercase block">
                            Special AICTE Lien Endorsement Clause:
                          </span>
                          <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                            {ocrResult.extracted.lienMarked ? (
                              <span className="text-slate-800">
                                "Lien marked in favor of Member Secretary, AICTE, New Delhi. No premature encashment or loan permitted without written AICTE clearance."
                              </span>
                            ) : (
                              <span className="text-red-700 font-semibold">
                                [WARNING: No statutory joint lien clause recorded on this deposit slip]
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Official Stamp Box */}
                      <div className="mt-4 pt-3 border-t border-amber-900/15 flex items-center justify-between text-[10px] text-slate-500">
                        <div>
                          <span>Branch Code: <strong className="font-mono">0532</strong></span>
                        </div>
                        <div className="text-right">
                          <span className="border-b border-slate-400 px-3 pb-0.5 font-serif italic text-blue-900 font-bold">
                            Branch Manager
                          </span>
                          <span className="block text-[9px] text-slate-400 mt-0.5">Authorized Signatory</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Raw OCR Extracted Text Stream */
                  <div className="p-3 bg-slate-950 font-mono text-emerald-400 text-[11px] max-h-96 overflow-y-auto leading-relaxed">
                    <pre className="whitespace-pre-wrap">{ocrResult.extracted.rawText}</pre>
                  </div>
                )}
              </div>

              {/* Institution Remarks / Query History */}
              {selectedFdr.queryMessage && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
                  <span className="font-bold text-amber-900 flex items-center">
                    <AlertOctagon className="w-3.5 h-3.5 mr-1 text-amber-700" /> Raised Query:
                  </span>
                  <p className="text-amber-800">{selectedFdr.queryMessage}</p>
                  {selectedFdr.queryResponse ? (
                    <div className="mt-2 pt-2 border-t border-amber-200/80">
                      <span className="font-bold text-slate-900">Institution Clarification:</span>
                      <p className="text-slate-800 mt-0.5">{selectedFdr.queryResponse}</p>
                    </div>
                  ) : (
                    <p className="text-amber-600 italic text-[11px] mt-1">Awaiting response from institution</p>
                  )}
                </div>
              )}
            </div>

            {/* Right: Side-by-Side Comparison Matrix (7 cols) */}
            <div className="xl:col-span-7 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-blue-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Field Cross-Verification Matrix
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    <span>Hover field to inspect</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/75 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Field</th>
                        <th className="py-2.5 px-3">Entered</th>
                        <th className="py-2.5 px-3">OCR Extracted</th>
                        <th className="py-2.5 px-3">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ocrResult.comparisons.map((comp) => {
                        return (
                          <tr
                            key={comp.field}
                            onMouseEnter={() => setHighlightedField(comp.field)}
                            onMouseLeave={() => setHighlightedField(null)}
                            className={`transition hover:bg-slate-50/80 ${
                              comp.status === 'mismatch' ? 'bg-red-50/30' : ''
                            }`}
                          >
                            <td className="py-3 px-3 font-semibold text-slate-800">
                              {comp.label}
                            </td>

                            <td className="py-3 px-3 font-mono text-slate-700 tabular-nums">
                              {String(comp.enteredValue)}
                            </td>

                            <td className="py-3 px-3 font-mono tabular-nums">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  comp.status === 'match'
                                    ? 'text-slate-900 bg-slate-100 font-medium'
                                    : comp.status === 'mismatch'
                                    ? 'bg-red-50 text-red-900 border border-red-200 font-bold'
                                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                                }`}
                              >
                                {String(comp.extractedValue)}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-1.5">
                                {comp.status === 'match' && (
                                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center">
                                    <Check className="w-3.5 h-3.5 mr-1" /> Matched
                                  </span>
                                )}
                                {comp.status === 'mismatch' && (
                                  <span className="text-[11px] font-semibold text-red-700 flex items-center">
                                    <XCircle className="w-3.5 h-3.5 mr-1" /> Mismatch Detected
                                  </span>
                                )}
                                {comp.status === 'missing' && (
                                  <span className="text-[11px] font-semibold text-amber-700 flex items-center">
                                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Missing
                                  </span>
                                )}
                              </div>
                              <span className="block text-[10px] text-slate-500 mt-0.5">
                                {comp.remarks}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Regulatory Note (Hairline border, NO border-l-4) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 flex items-start space-x-2.5">
                <Scale className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-slate-900">AICTE Regulatory Notice:</strong>
                  <span className="text-slate-600 ml-1">
                    OCR extraction assists in automated discrepancy detection. Final statutory clearance requires formal verification officer sign-off.
                  </span>
                </div>
              </div>

              {/* Officer Decision Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Verification Officer Scrutiny Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks regarding FDR legitimacy, lien verification, and compliance notes..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  rows={2}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowQueryModal(true)}
                      className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Raise Query</span>
                    </button>

                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject FDR</span>
                    </button>
                  </div>

                  <button
                    onClick={handleApprove}
                    disabled={dupCheck.isDuplicate}
                    className={`px-5 py-2 rounded-lg text-white text-xs font-semibold flex items-center space-x-2 transition shadow-xs cursor-pointer ${
                      dupCheck.isDuplicate
                        ? 'bg-slate-400 cursor-not-allowed'
                        : hasDiscrepancy
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{hasDiscrepancy ? 'Approve with Discrepancy Note' : 'Approve & Mark Verified'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Query Modal */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>Raise Query to Institution</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              FDR No: <strong>{selectedFdr.fdrNumber}</strong> · {selectedFdr.institutionName}
            </p>

            <div className="mt-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Specify Clarification Required
              </label>
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                rows={4}
                placeholder="E.g., Bank seal is smudged, joint lien clause is missing, or deposit amount differs from intake requirements..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-5 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowQueryModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseQuery}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Query</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-red-900 flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Confirm FDR Rejection</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              This will tag FDR <strong>{selectedFdr.fdrNumber}</strong> as Rejected in the National Register.
            </p>

            <div className="mt-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Ground of Rejection
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                placeholder="State the non-compliance reasons (e.g. invalid bank, unilateral withdrawal clause, non-existent branch, tampered certificate)..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="mt-5 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
