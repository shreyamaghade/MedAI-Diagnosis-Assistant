import React, { useEffect, useState } from 'react';
import { Clock, ChevronRight, Calendar, Activity } from 'lucide-react';
import { getDiagnoses, DiagnosisRecord, User } from '../services/apiService';
import { motion } from 'motion/react';

interface HistoryViewProps {
  user: User;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ user }) => {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiagnoses(user.id)
      .then(setRecords)
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <div className="py-12 text-center text-slate-500">Loading history...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Your Health History</h2>
        <div className="text-sm text-slate-500 font-medium">{records.length} records found</div>
      </div>

      {records.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8 text-slate-300" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-900">No history yet</p>
            <p className="text-slate-500 text-sm">Your diagnostic reports will appear here.</p>
          </div>
        </div>
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
