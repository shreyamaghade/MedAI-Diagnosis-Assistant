import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, User, ChevronRight, Search, Filter, FileText } from 'lucide-react';
import { getTriageDashboard, DiagnosisRecord, User as UserType } from '../services/apiService';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Skeleton } from './Skeleton';

interface TriageDashboardProps {
  user: UserType;
}

export const TriageDashboard: React.FC<TriageDashboardProps> = ({ user }) => {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState('');
  const [urgency, setUrgency] = useState('');
  const [condition, setCondition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchRecords = () => {
    if (!user.token) return;
    setLoading(true);
    getTriageDashboard(user.token, { patientName, urgency, condition, startDate, endDate })
      .then(setRecords)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 300);
    return () => clearTimeout(timer);
  }, [user.token, patientName, urgency, condition, startDate, endDate]);

  if (loading && records.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-64 rounded-xl" />
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-6 py-4 border-b border-slate-50 last:border-0">
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Hospital Triage Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium">Prioritized patient requests based on AI urgency detection.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Patient Name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Condition/Summary..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="">All Urgencies</option>
            <option value="Routine">Routine</option>
            <option value="Urgent">Urgent</option>
            <option value="Emergency">Emergency</option>
          </select>

          <input
            type="date"
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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
              {records.map((record, idx) => {
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
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 line-clamp-1 max-w-xs">{record.summary}</p>
                        {record.files && JSON.parse(record.files).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {JSON.parse(record.files).map((file: any, i: number) => (
                              <a 
                                key={i}
                                href={file.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                              >
                                <FileText className="h-2.5 w-2.5" />
                                {file.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Clock className="h-3 w-3" />
                        {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <motion.button 
                        whileHover={{ scale: 1.1, backgroundColor: '#ecfdf5', borderColor: '#10b981', color: '#059669' }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 transition-all shadow-sm"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {records.length === 0 && (
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
