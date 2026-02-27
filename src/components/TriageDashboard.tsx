import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, User, ChevronRight, Search, Filter } from 'lucide-react';
import { getTriageDashboard, DiagnosisRecord } from '../services/apiService';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const TriageDashboard: React.FC = () => {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getTriageDashboard()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  const filteredRecords = records.filter(r => 
    r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="py-12 text-center text-slate-500 font-medium">Loading triage data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Hospital Triage Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium">Prioritized patient requests based on AI urgency detection.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients or symptoms..."
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgency</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Summary</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map((record, idx) => {
                const isEmergency = record.urgency === 'Emergency';
                const isUrgent = record.urgency === 'Urgent';
                
                return (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className={cn(
                      "hover:bg-slate-50/50 transition-colors group",
                      isEmergency && "bg-red-50/30"
                    )}
                  >
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        isEmergency 
                          ? "bg-red-100 text-red-700 border-red-200" 
                          : isUrgent 
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      )}>
                        {isEmergency && <AlertTriangle className="h-3 w-3" />}
                        {record.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-900">{record.patient_name || 'Anonymous'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{record.patient_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 line-clamp-1 max-w-xs">{record.summary}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Clock className="h-3 w-3" />
                        {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredRecords.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Filter className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-medium">No triage records found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
