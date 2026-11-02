export type UserRole = 'ADMIN' | 'OFFICER' | 'INSTITUTION';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  institutionId?: string;
  region?: string;
  phone?: string;
  avatar?: string;
}

export interface Institution {
  id: string;
  aictePermanentId: string;
  name: string;
  type: 'Engineering' | 'Management' | 'Pharmacy' | 'Polytechnic' | 'Architecture';
  region: 'Northern' | 'Western' | 'Southern' | 'Eastern' | 'Central' | 'North-Western' | 'South-Western';
  state: string;
  city: string;
  address: string;
  pincode: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Under Review' | 'Notice Issued';
  establishedYear: number;
  totalDepositAmount: number;
  activeFdrCount: number;
}

export type FDRVerificationStatus = 'Pending' | 'Verified' | 'Discrepancy' | 'Query Raised' | 'Rejected';
export type FDRLifecycleStatus = 'Draft' | 'Submitted' | 'Active' | 'Expiring Soon' | 'Matured' | 'Renewal Pending' | 'Released';

export interface FDRRecord {
  id: string;
  fdrNumber: string;
  institutionId: string;
  institutionName: string;
  aictePermanentId: string;
  region: string;
  bankName: string;
  branch: string;
  ifscCode: string;
  accountNumber: string;
  depositAmount: number;
  issueDate: string; // YYYY-MM-DD
  maturityDate: string; // YYYY-MM-DD
  interestRate: number;
  beneficiary: string;
  lienMarked: boolean;
  lienDetails: string;
  verificationStatus: FDRVerificationStatus;
  lifecycleStatus: FDRLifecycleStatus;
  documentId?: string;
  documentName?: string;
  documentHash?: string;
  ocrConfidence?: number;
  officerRemarks?: string;
  queryMessage?: string;
  queryResponse?: string;
  linkedRenewalFdrId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OCRExtractedData {
  fdrNumber: string;
  bankName: string;
  branch: string;
  ifscCode: string;
  depositAmount: number;
  issueDate: string;
  maturityDate: string;
  beneficiary: string;
  lienMarked: boolean;
  confidence: number;
  rawText?: string;
}

export interface FieldComparison {
  field: string;
  label: string;
  enteredValue: string | number | boolean;
  extractedValue: string | number | boolean;
  status: 'match' | 'mismatch' | 'missing';
  remarks?: string;
}

export interface RenewalRecord {
  id: string;
  oldFdrId: string;
  oldFdrNumber: string;
  newFdrNumber: string;
  institutionId: string;
  institutionName: string;
  bankName: string;
  amount: number;
  oldMaturityDate: string;
  newMaturityDate: string;
  renewalDate: string;
  documentName: string;
  documentHash: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  officerRemarks?: string;
  createdAt: string;
}

export interface ReleaseRequest {
  id: string;
  fdrId: string;
  fdrNumber: string;
  institutionId: string;
  institutionName: string;
  aictePermanentId: string;
  depositAmount: number;
  reason: 'Course Closure' | 'Institution Closure' | 'Excess Deposit' | 'Tenure Completion';
  closureOrderNumber: string;
  checklist: {
    tenureCompleted: boolean;
    zeroDuesCertificate: boolean;
    stateGovtNoc: boolean;
    aicteEcApproval: boolean;
  };
  supportingDocName: string;
  status: 'Submitted' | 'Under Scrutiny' | 'Recommended' | 'Approved' | 'Rejected';
  officerRemarks?: string;
  approvalReferenceNo?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientRole?: UserRole;
  recipientInstitutionId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: string;
  read: boolean;
  linkAction?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  checksum: string;
}
