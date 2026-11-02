import React from 'react';
import {
  Code2,
  FileCode,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  Terminal,
  Shield,
  FileText,
} from 'lucide-react';

export const TechDocsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              SIH26265 Solution Architecture & Technical Dossier
            </h1>
            <span className="text-xs bg-slate-900 text-white font-mono font-bold px-2 py-0.5 rounded">
              Python Flask + SQLite + OCR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete technical specification and dual-engine architecture for the Smart India Hackathon problem statement.
          </p>
        </div>
      </div>

      {/* Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-blue-700 font-bold">
            <Database className="w-4 h-4" />
            <span>1. Relational SQLite Schema</span>
          </div>
          <p className="text-slate-600">
            9 normalized SQLAlchemy models (User, Institution, FDRRecord, FDRDocument, Verification, Renewal, ReleaseRequest, Notification, AuditLog) with foreign keys and unique constraints.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-purple-700 font-bold">
            <Cpu className="w-4 h-4" />
            <span>2. Dual AI / OCR Pipeline</span>
          </div>
          <p className="text-slate-600">
            PyMuPDF for digital vector PDFs + Tesseract OCR / Pytesseract for scanned paper slips with regular expression extractors and pattern matching.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold">
            <Shield className="w-4 h-4" />
            <span>3. Anti-Fraud & Integrity</span>
          </div>
          <p className="text-slate-600">
            SHA-256 document hashing detects identical duplicate slips across institutions. Strict human officer review prevents blind automated approval.
          </p>
        </div>
      </div>

      {/* Code Repository Structure */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Standalone Python Flask Project Layout (Included in /SIH26265)</span>
        </h3>

        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
          <pre>{`SIH26265/
├── app.py                     # Flask application factory, CORS, session & error handling
├── config.py                  # Environment configurations, SQLite URI, upload limits
├── requirements.txt           # Flask, SQLAlchemy, Flask-Login, PyMuPDF, Pytesseract, Pillow
├── database/
│   ├── fdr_portal.db          # SQLite local relational database
│   └── seed_data.py           # Comprehensive seed script: 1 Admin, 2 ROs, 10 Inst, 30 FDRs
├── models/
│   ├── user.py                # User model with Werkzeug password hashing & RBAC
│   ├── institution.py         # AICTE Permanent ID, region, address, status
│   ├── fdr.py                 # FDRRecord (amount, issue/maturity, lien clause, statuses)
│   ├── verification.py        # OCR extractions, field-by-field diff matrix, officer remarks
│   ├── renewal.py             # Predecessor & successor FDR link (chain of custody)
│   ├── release.py             # 4-point statutory clearance checklist & EC approval
│   ├── notification.py        # In-app compliance & maturity notifications
│   └── audit.py               # Immutable audit log with SHA-256 checksums
├── routes/
│   ├── auth.py                # POST /api/auth/login, logout, me
│   ├── institutions.py        # GET/POST /api/institutions
│   ├── fdrs.py                # GET/POST/PUT /api/fdrs, /api/fdrs/expiring, statistics
│   ├── verification.py        # POST /api/verification/upload, /extract, /approve, /reject
│   ├── renewals.py            # GET/POST /api/renewals, approve
│   ├── releases.py            # GET/POST /api/releases, review, approve
│   └── reports.py             # GET /api/reports/summary, compliance, CSV
├── services/
│   ├── ocr_service.py         # PyMuPDF + Tesseract wrapper with regex data extractors
│   ├── hash_service.py        # SHA-256 duplicate document hash detection
│   └── maturity_service.py    # Remaining days calculation & auto-categorization
└── tests/
    └── test_fdr.py            # Automated test suite for lifecycle & discrepancy checks`}</pre>
        </div>
      </div>

      {/* How to Run Python Flask Backend */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-600" />
          <span>Python Flask Execution Guide for SIH Jury</span>
        </h3>

        <div className="space-y-2 text-slate-700">
          <p>
            To run the standalone Python Flask backend included with this project:
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
            <div># 1. Navigate to Python directory</div>
            <div>cd SIH26265</div>
            <div className="pt-1"># 2. Install dependencies</div>
            <div>pip install -r requirements.txt</div>
            <div className="pt-1"># 3. Seed database with hackathon dataset</div>
            <div>python database/seed_data.py</div>
            <div className="pt-1"># 4. Run Flask Server</div>
            <div>python app.py</div>
          </div>
        </div>
      </div>
    </div>
  );
};
