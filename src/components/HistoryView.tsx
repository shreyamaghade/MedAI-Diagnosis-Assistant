import React, { useEffect, useState } from 'react';
import { Clock, ChevronRight, Calendar, Activity, ArrowRight, ClipboardList } from 'lucide-react';
import { getDiagnoses, DiagnosisRecord, User } from '../services/apiService';
import { motion } from 'motion/react';
import { Skeleton } from './Skeleton';

interface HistoryViewProps {
  user: User;
  onStartCheckup?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ user, onStartCheckup }) => {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiagnoses(user.id)
      .then(setRecords)
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) {
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Your Health History</h2>
        <div className="text-sm text-slate-500 font-medium">{records.length} records found</div>
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
            
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                whileTap={{ scale: 0.995 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {date}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{record.summary}</h3>
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
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
