import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { getDiagnoses, DiagnosisRecord, User } from '../services/apiService';
import { motion } from 'motion/react';

interface DashboardViewProps {
  user: User;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user }) => {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiagnoses(user.id)
      .then(setRecords)
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <div className="py-12 text-center text-slate-500">Loading dashboard...</div>;

  // Simple analytics
  const allSymptoms = records.flatMap(r => JSON.parse(r.symptoms) as string[]);
  const symptomFrequency = allSymptoms.reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSymptoms = Object.entries(symptomFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Reports</p>
            <p className="text-3xl font-black text-slate-900">{records.length}</p>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Symptom</p>
            <p className="text-3xl font-black text-slate-900">{topSymptoms[0]?.[0] || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</p>
            <p className="text-3xl font-black text-slate-900">
              {records.length > 0 ? new Date(records[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Health Timeline</h3>
          <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {records.slice(0, 5).map((record, idx) => (
              <div key={record.id} className="relative">
                <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(record.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm font-bold text-slate-800">{record.summary}</p>
                </div>
              </div>
            ))}
            {records.length === 0 && <p className="text-slate-400 text-sm italic">No timeline data available yet.</p>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Symptom Frequency</h3>
          <div className="space-y-4">
            {topSymptoms.map(([symptom, count]) => (
              <div key={symptom} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">{symptom}</span>
                  <span className="text-slate-400">{count} times</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / records.length) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            ))}
            {topSymptoms.length === 0 && <p className="text-slate-400 text-sm italic">No symptom data available yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
