import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, formatINRWords } from '../utils/fdrEngine';
import {
  Building2,
  Search,
  MapPin,
  Mail,
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const InstitutionsView: React.FC = () => {
  const { institutions, fdrs, setCurrentView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('ALL');

  const filtered = institutions.filter((inst) => {
    const matchSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.aictePermanentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = filterRegion === 'ALL' || inst.region === filterRegion;
    return matchSearch && matchRegion;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Technical Institutions Directory</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-mono font-bold">
              {filtered.length} Institutions Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered technical colleges and universities with AICTE Permanent IDs and security deposit accounts.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Institution Name, AICTE Permanent ID, City..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full sm:w-56">
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
      </div>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((inst) => {
          const instFdrs = fdrs.filter((f) => f.institutionId === inst.id);
          const totalDeposit = instFdrs.reduce((a, b) => a + b.depositAmount, 0);

          return (
            <div
              key={inst.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-blue-300 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{inst.name}</h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      ID: {inst.aictePermanentId}
                    </span>
                    <span>•</span>
                    <span>{inst.type}</span>
                    <span>•</span>
                    <span>Est. {inst.establishedYear}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  {inst.status}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{inst.address}, {inst.city}, {inst.state} - {inst.pincode}</span>
                </div>
                <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{inst.email}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{inst.phone}</span>
                  </span>
                </div>
              </div>

              {/* Deposit Summary Box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Security Deposit Total</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{formatINRWords(totalDeposit)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Active FDRs</span>
                  <span className="font-mono font-bold text-blue-700">{instFdrs.length} Records</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
