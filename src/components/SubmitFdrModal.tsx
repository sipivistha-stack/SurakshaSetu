import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  formatINR,
  formatINRWords,
  simulateDocumentOcr,
  calculateSha256,
} from '../utils/fdrEngine';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  X,
  FileCheck2,
} from 'lucide-react';

export const SubmitFdrModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, institutions, addFdr, setCurrentView } = useApp();

  const currentInstitution =
    institutions.find((i) => i.id === currentUser.institutionId) || institutions[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [fdrNumber, setFdrNumber] = useState('SBI-MUM-2026-' + Math.floor(10000 + Math.random() * 90000));
  const [bankName, setBankName] = useState('State Bank of India');
  const [branch, setBranch] = useState('Matunga West, Mumbai');
  const [ifscCode, setIfscCode] = useState('SBIN0000532');
  const [accountNumber, setAccountNumber] = useState('39485720' + Math.floor(1000 + Math.random() * 9000));
  const [depositAmount, setDepositAmount] = useState<number>(5000000);
  const [issueDate, setIssueDate] = useState('2026-10-15');
  const [maturityDate, setMaturityDate] = useState('2031-10-15');
  const [interestRate, setInterestRate] = useState<number>(7.1);
  const [beneficiary, setBeneficiary] = useState('Member Secretary, AICTE & Principal ' + currentInstitution.name);
  const [lienMarked, setLienMarked] = useState(true);
  const [lienDetails, setLienDetails] = useState('Exclusive statutory lien in favor of Member Secretary, AICTE New Delhi as per APH norms');

  // File Upload & OCR State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('SBI_FixedDeposit_Receipt_50L.pdf');
  const [documentHash, setDocumentHash] = useState<string>('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrResults, setOcrResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadedFileName(file.name);
    setIsProcessingOcr(true);
    setErrorMsg('');

    try {
      const hash = await calculateSha256(file);
      setDocumentHash(hash);

      // Simulate OCR engine extraction
      setTimeout(() => {
        const ocr = simulateDocumentOcr(file.name, {
          fdrNumber,
          bankName,
          branch,
          ifscCode,
          depositAmount,
          issueDate,
          maturityDate,
          beneficiary,
          lienMarked,
          institutionName: currentInstitution.name,
        });
        setOcrResults(ocr);
        setIsProcessingOcr(false);
      }, 1000);
    } catch {
      setIsProcessingOcr(false);
    }
  };

  const handleNextToStep2 = () => {
    if (!fdrNumber || !bankName || !ifscCode || !depositAmount) {
      setErrorMsg('Please complete all mandatory banking fields.');
      return;
    }
    setErrorMsg('');
    // Auto-run OCR on default or selected file if step 2 opens
    if (!ocrResults) {
      const ocr = simulateDocumentOcr(uploadedFileName, {
        fdrNumber,
        bankName,
        branch,
        ifscCode,
        depositAmount,
        issueDate,
        maturityDate,
        beneficiary,
        lienMarked,
        institutionName: currentInstitution.name,
      });
      setOcrResults(ocr);
    }
    setStep(2);
  };

  const handleSubmitFinal = () => {
    setErrorMsg('');
    const result = addFdr({
      fdrNumber,
      institutionId: currentInstitution.id,
      institutionName: currentInstitution.name,
      aictePermanentId: currentInstitution.aictePermanentId,
      region: currentInstitution.region,
      bankName,
      branch,
      ifscCode,
      accountNumber,
      depositAmount: Number(depositAmount),
      issueDate,
      maturityDate,
      interestRate: Number(interestRate),
      beneficiary,
      lienMarked,
      lienDetails,
      verificationStatus: 'Pending',
      lifecycleStatus: 'Submitted',
      documentName: uploadedFileName,
      documentHash,
      ocrConfidence: ocrResults?.extracted?.confidence || 95.5,
    });

    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }

    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold">New Security Deposit (FDR) Submission</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-mono">
                AICTE APH 2026-27
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Institution: {currentInstitution.name} (AICTE ID: {currentInstitution.aictePermanentId})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Bank & Deposit Particulars</span>
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Document Upload & AI OCR</span>
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Submission Receipt</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="bg-red-50/70 border border-red-200 p-3.5 rounded-xl text-xs text-red-800 flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    FDR Receipt Number *
                  </label>
                  <input
                    type="text"
                    value={fdrNumber}
                    onChange={(e) => setFdrNumber(e.target.value)}
                    placeholder="e.g. SBI-MUM-2026-90812"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Issuing Scheduled Bank *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  >
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bank Branch Name *
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Matunga West, Mumbai"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bank Branch IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0000532"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Deposit Amount (INR) *
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {formatINRWords(depositAmount)}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Term Deposit Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Issue *
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Maturity Date (Min 5 Years) *
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* Statutory Joint Lien Check */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="jointLienCheck"
                    checked={lienMarked}
                    onChange={(e) => setLienMarked(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="jointLienCheck" className="font-bold text-slate-800">
                    Joint Lien Clause Endorsed to Member Secretary, AICTE (Mandatory)
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 pl-6">
                  "Fixed Deposit Receipt is pledged and lien marked exclusively in favor of Member Secretary, AICTE New Delhi and cannot be prematurely liquidated without written NOC."
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs">
              {/* Upload Drag & Drop */}
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center transition bg-slate-50/50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">
                  Upload Scanned FDR Document (PDF / JPG / PNG)
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  AI-Powered OCR (PyMuPDF + Tesseract) extracts financial data and performs instant discrepancy cross-validation
                </p>

                <div className="mt-4 flex items-center justify-center">
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs transition">
                    Browse File
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">
                  Selected File: <strong className="text-slate-700">{uploadedFileName}</strong>
                </div>
              </div>

              {/* OCR Pre-Check Status */}
              {isProcessingOcr ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center space-y-2">
                  <Sparkles className="w-5 h-5 text-purple-600 mx-auto animate-spin" />
                  <p className="font-bold text-purple-900 text-xs">Extracting text & validating AICTE lien clause...</p>
                </div>
              ) : ocrResults ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Pre-Submission OCR Discrepancy Preview:</span>
                    <span className="text-[11px] text-purple-700 font-mono font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Confidence: {ocrResults.extracted.confidence.toFixed(1)}%
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase">
                        <tr>
                          <th className="p-2">Field</th>
                          <th className="p-2">Entered</th>
                          <th className="p-2">Extracted</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ocrResults.comparisons.map((c: any) => (
                          <tr key={c.field}>
                            <td className="p-2 font-medium">{c.label}</td>
                            <td className="p-2 text-slate-700 font-mono">{String(c.enteredValue)}</td>
                            <td className="p-2 font-mono">{String(c.extractedValue)}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  c.status === 'match'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Note: Your Regional Officer will verify these extracted values against the original scan before granting compliance clearance.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Fixed Deposit Receipt Successfully Lodged!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  FDR <strong>{fdrNumber}</strong> has been saved to the centralized database and routed to your Regional Verification Officer for formal scrutiny.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs max-w-md mx-auto space-y-1 font-mono">
                <div>AICTE Permanent ID: {currentInstitution.aictePermanentId}</div>
                <div>Principal Amount: {formatINR(depositAmount)}</div>
                <div>Scheduled Bank: {bankName}</div>
                <div>SHA-256 Hash: {documentHash.slice(0, 24)}...</div>
                <div>Status: <span className="text-amber-700 font-bold">Pending Regional Scrutiny</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleNextToStep2}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition shadow-xs"
              >
                <span>Continue to Document OCR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Back to Details
              </button>
              <button
                onClick={handleSubmitFinal}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition shadow-xs"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Submit to Regional Office</span>
              </button>
            </>
          )}

          {step === 3 && (
            <div className="w-full flex justify-end">
              <button
                onClick={() => {
                  onClose();
                  setCurrentView('fdrs');
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Done • View in FDR Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
