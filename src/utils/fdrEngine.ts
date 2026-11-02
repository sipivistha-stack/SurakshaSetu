import { FDRRecord, FieldComparison, OCRExtractedData } from '../types';

// Anchor date for hackathon demonstration context
export const REFERENCE_DATE = new Date('2026-11-01T00:00:00Z');

export interface MaturityStatusInfo {
  daysRemaining: number;
  category: 'Active' | 'Expiring within 30 days' | 'Expiring within 15 days' | 'Expiring within 7 days' | 'Matured';
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  urgency: 'low' | 'medium' | 'high' | 'critical' | 'matured';
}

export function calculateMaturityStatus(maturityDateStr: string): MaturityStatusInfo {
  const maturityDate = new Date(maturityDateStr);
  const now = REFERENCE_DATE;
  const diffTime = maturityDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      daysRemaining,
      category: 'Matured',
      colorClass: 'text-purple-700 bg-purple-50 border-purple-200',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      urgency: 'matured',
    };
  } else if (daysRemaining <= 7) {
    return {
      daysRemaining,
      category: 'Expiring within 7 days',
      colorClass: 'text-red-700 bg-red-50 border-red-200',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-800',
      urgency: 'critical',
    };
  } else if (daysRemaining <= 15) {
    return {
      daysRemaining,
      category: 'Expiring within 15 days',
      colorClass: 'text-orange-700 bg-orange-50 border-orange-200',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
      urgency: 'high',
    };
  } else if (daysRemaining <= 30) {
    return {
      daysRemaining,
      category: 'Expiring within 30 days',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      urgency: 'medium',
    };
  } else {
    return {
      daysRemaining,
      category: 'Active',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      urgency: 'low',
    };
  }
}

export function formatINR(val: number): string {
  if (isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatINRWords(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Crore`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return formatINR(val);
}

// Generate simple pseudo-hash for files if real crypto API isn't supplied
export async function calculateSha256(file: File | string): Promise<string> {
  if (typeof file === 'string') {
    let hash = 0;
    for (let i = 0; i < file.length; i++) {
      hash = (hash << 5) - hash + file.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0') + '48c1092837482910a';
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return 'sha256-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Perform side-by-side comparison between entered data and OCR extracted data
export function compareOcrFields(entered: Partial<FDRRecord>, extracted: OCRExtractedData): FieldComparison[] {
  const comparisons: FieldComparison[] = [];

  // 1. FDR Number
  const normEnteredNum = (entered.fdrNumber || '').trim().replace(/[-\s]/g, '').toUpperCase();
  const normExtractedNum = (extracted.fdrNumber || '').trim().replace(/[-\s]/g, '').toUpperCase();
  comparisons.push({
    field: 'fdrNumber',
    label: 'FDR / Deposit Number',
    enteredValue: entered.fdrNumber || '—',
    extractedValue: extracted.fdrNumber || '—',
    status:
      !extracted.fdrNumber
        ? 'missing'
        : normEnteredNum === normExtractedNum
        ? 'match'
        : 'mismatch',
    remarks: normEnteredNum === normExtractedNum ? 'Matched precisely with bank slip' : 'Discrepancy in receipt number characters',
  });

  // 2. Bank Name
  const normEnteredBank = (entered.bankName || '').toLowerCase().replace(/[^a-z]/g, '');
  const normExtractedBank = (extracted.bankName || '').toLowerCase().replace(/[^a-z]/g, '');
  const bankMatches = normEnteredBank.includes(normExtractedBank) || normExtractedBank.includes(normEnteredBank);
  comparisons.push({
    field: 'bankName',
    label: 'Issuing Bank Name',
    enteredValue: entered.bankName || '—',
    extractedValue: extracted.bankName || '—',
    status: !extracted.bankName ? 'missing' : bankMatches ? 'match' : 'mismatch',
    remarks: bankMatches ? 'Bank entity confirmed' : 'Issuing bank differs from declaration',
  });

  // 3. Deposit Amount
  const enteredAmt = Number(entered.depositAmount || 0);
  const extractedAmt = Number(extracted.depositAmount || 0);
  const amtMatch = Math.abs(enteredAmt - extractedAmt) < 1;
  comparisons.push({
    field: 'depositAmount',
    label: 'Deposit Principal Amount (INR)',
    enteredValue: formatINR(enteredAmt),
    extractedValue: formatINR(extractedAmt),
    status: extractedAmt <= 0 ? 'missing' : amtMatch ? 'match' : 'mismatch',
    remarks: amtMatch ? 'Exact financial value certified' : `Declared amount exceeds bank certificate by ${formatINR(Math.abs(enteredAmt - extractedAmt))}`,
  });

  // 4. Issue Date
  const enteredIssue = entered.issueDate || '';
  const extractedIssue = extracted.issueDate || '';
  comparisons.push({
    field: 'issueDate',
    label: 'Date of Issue',
    enteredValue: enteredIssue || '—',
    extractedValue: extractedIssue || '—',
    status: !extractedIssue ? 'missing' : enteredIssue === extractedIssue ? 'match' : 'mismatch',
    remarks: enteredIssue === extractedIssue ? 'Date confirmed' : 'Issue date discrepancy',
  });

  // 5. Maturity Date
  const enteredMat = entered.maturityDate || '';
  const extractedMat = extracted.maturityDate || '';
  comparisons.push({
    field: 'maturityDate',
    label: 'Maturity / Expiry Date',
    enteredValue: enteredMat || '—',
    extractedValue: extractedMat || '—',
    status: !extractedMat ? 'missing' : enteredMat === extractedMat ? 'match' : 'mismatch',
    remarks: enteredMat === extractedMat ? 'Tenure term matches schedule' : 'Maturity date differs',
  });

  // 6. Beneficiary & AICTE Joint Lien
  const hasLienInText = extracted.lienMarked;
  comparisons.push({
    field: 'lienMarked',
    label: 'AICTE Joint Lien Clause',
    enteredValue: entered.lienMarked ? 'Declared with AICTE Lien' : 'No Lien Declared',
    extractedValue: hasLienInText ? 'Verified "In favor of Member Secretary, AICTE"' : 'No AICTE Lien Stamp Found',
    status: hasLienInText ? 'match' : 'mismatch',
    remarks: hasLienInText ? 'Statutory joint lien endorsement valid' : 'Lien stamp missing or ambiguous; rejection ground',
  });

  return comparisons;
}

// Simulate AI-powered OCR extraction with intelligent rules
export function simulateDocumentOcr(
  fileName: string,
  enteredData: Partial<FDRRecord>
): { extracted: OCRExtractedData; comparisons: FieldComparison[] } {
  const lowerName = fileName.toLowerCase();

  // If the uploaded file name hints at discrepancy (e.g. for testing discrepancy detection)
  const isDiscrepancyTest = lowerName.includes('discrepancy') || lowerName.includes('mismatch');
  const isMissingLienTest = lowerName.includes('nolien') || lowerName.includes('unverified');

  let extractedAmount = enteredData.depositAmount || 5000000;
  if (isDiscrepancyTest) {
    // Intentionally inject amount discrepancy
    extractedAmount = Math.max(1000000, extractedAmount - 1500000);
  }

  const extracted: OCRExtractedData = {
    fdrNumber: enteredData.fdrNumber || 'FDR-SBI-' + Math.floor(100000 + Math.random() * 900000),
    bankName: enteredData.bankName || 'State Bank of India',
    branch: enteredData.branch || 'Main Branch, Institutional Area',
    ifscCode: enteredData.ifscCode || 'SBIN0001048',
    depositAmount: extractedAmount,
    issueDate: enteredData.issueDate || '2026-10-01',
    maturityDate: isDiscrepancyTest ? '2029-10-01' : enteredData.maturityDate || '2031-10-01',
    beneficiary: isMissingLienTest ? 'Principal / Trust Alone' : 'Member Secretary, AICTE and ' + (enteredData.institutionName || 'Principal'),
    lienMarked: !isMissingLienTest,
    confidence: isDiscrepancyTest ? 88.4 : Math.min(99.4, 94.0 + Math.random() * 5.0),
    rawText: `BANK FIXED DEPOSIT RECEIPT / TERM DEPOSIT ADVICE
Bank: ${enteredData.bankName || 'STATE BANK OF INDIA'}
Branch: ${enteredData.branch || 'CAMPUS BRANCH'} | IFSC: ${enteredData.ifscCode || 'SBIN0001048'}
Receipt No: ${enteredData.fdrNumber || 'FDR-MUM-90812'}
Principal Amount: INR ${extractedAmount.toLocaleString('en-IN')}
(Rupees ${formatINRWords(extractedAmount)} Only)
Date of Deposit: ${enteredData.issueDate || '2026-10-01'}
Due Date / Maturity: ${isDiscrepancyTest ? '2029-10-01' : enteredData.maturityDate || '2031-10-01'}
Beneficiary: ${isMissingLienTest ? 'Principal, Trust Account' : 'Joint Account: Member Secretary, AICTE New Delhi & Institution'}
SPECIAL CONDITION / LIEN: ${isMissingLienTest ? 'NO LIEN RECORDED' : 'Under lien to All India Council for Technical Education (AICTE). No premature encashment or loan permitted without written NOC from Member Secretary, AICTE.'}
Authorized Officer Signature & Seal: [VERIFIED DIGITAL STAMP]`,
  };

  const comparisons = compareOcrFields(enteredData, extracted);
  return { extracted, comparisons };
}

// Duplicate detection
export function checkDuplicateFdr(
  fdrNumber: string,
  bankName: string,
  documentHash: string,
  records: FDRRecord[],
  currentId?: string
): { isDuplicate: boolean; reason?: string; conflictingRecord?: FDRRecord } {
  const normNum = fdrNumber.trim().toLowerCase();
  const normBank = bankName.trim().toLowerCase();

  for (const rec of records) {
    if (currentId && rec.id === currentId) continue;

    // Check duplicate FDR number in same or different bank
    if (rec.fdrNumber.trim().toLowerCase() === normNum) {
      return {
        isDuplicate: true,
        reason: `Duplicate FDR Number detected! Record already exists for institution "${rec.institutionName}" (AICTE ID: ${rec.aictePermanentId}).`,
        conflictingRecord: rec,
      };
    }

    // Check duplicate document SHA-256 hash
    if (documentHash && rec.documentHash && rec.documentHash === documentHash) {
      return {
        isDuplicate: true,
        reason: `Document SHA-256 Hash Collision! Identical document file was previously submitted for FDR "${rec.fdrNumber}". Anti-tamper violation.`,
        conflictingRecord: rec,
      };
    }
  }

  return { isDuplicate: false };
}

// CSV Exporter
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : String(row[k]);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
