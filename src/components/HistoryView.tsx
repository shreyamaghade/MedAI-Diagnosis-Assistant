import React, { useEffect, useState } from 'react';
import { Clock, ChevronRight, Calendar, Activity, ArrowRight, ClipboardList, Search, Trash2, FileText } from 'lucide-react';
import { getDiagnoses, DiagnosisRecord, User, deleteDiagnosis } from '../services/apiService';
import { motion } from 'motion/react';
import { Skeleton } from './Skeleton';

interface HistoryViewProps {
  user: User;
  onStartCheckup?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ user, onStartCheckup }) => {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [urgency, setUrgency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchRecords = () => {
    if (!user.token) return;
    setLoading(true);
    getDiagnoses(user.token, { search, urgency, startDate, endDate })
      .then(setRecords)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!user.token) return;
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    
    try {
      await deleteDiagnosis(user.token, id);
      setRecords(records.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete record", err);
      alert("Failed to delete record. Please try again.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 300);
    return () => clearTimeout(timer);
  }, [user.token, search, urgency, startDate, endDate]);

  if (loading && records.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-5 w-14 rounded" />
                  </div>
                </div>
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Your Health History</h2>
        <div className="text-sm text-slate-500 font-medium">{records.length} records found</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search symptoms..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          <div className="flex items-center gap-2">
            <input
              type="date"
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
          
          <div className="relative">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="h-12 w-12 text-emerald-500" />
            </div>
            
            <div className="max-w-sm mx-auto space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Your Health Journey Starts Here</h3>
              <p className="text-slate-500">
                You haven't performed any AI diagnostic checks yet. Start your first check-up to begin tracking your health history.
              </p>
            </div>

            <div className="pt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartCheckup}
                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
              >
                Start New Check-up
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {records.map((record, idx) => {
            const symptoms = JSON.parse(record.symptoms) as string[];
            const date = new Date(record.date).toLocaleDateString(undefined, { 
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            });
            const files = JSON.parse(record.files || '[]') as any[];
            
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                whileTap={{ scale: 0.995 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 transition-all group cursor-pointer relative"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Calendar className="h-3 w-3" />
                        {date}
                      </div>
                      <button 
                        onClick={(e) => handleDelete(e, record.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{record.summary}</h3>
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                          {s}
                        </span>
                      ))}
                    </div>
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {files.map((file, i) => (
                          <a 
                            key={i}
                            href={file.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="h-3 w-3" />
                            {file.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors self-center">
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
