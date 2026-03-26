import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight, Stethoscope, Clock, User, Activity, ExternalLink, CheckCircle2, XCircle, BarChart3, MapPin, Video } from 'lucide-react';
import { DiagnosisResult } from '../services/geminiService';
import { verifyDiagnosis, getConfidenceStats } from '../services/apiService';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DiagnosisCardProps {
  result: DiagnosisResult;
  isDoctorView: boolean;
  onDeepDive: (condition: string) => void;
  onFindSpecialist: (specialistType: string) => void;
  onTelehealth: (condition: string) => void;
  diagnosisId?: number | null;
  doctorId?: number;
  doctorToken?: string;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ result, isDoctorView, onDeepDive, onFindSpecialist, onTelehealth, diagnosisId, doctorId, doctorToken }) => {
  const [verified, setVerified] = useState<'Agree' | 'Correct' | null>(null);
  const [confidence, setConfidence] = useState<{ total: number; score: number } | null>(null);

  useEffect(() => {
    getConfidenceStats(doctorToken).then(stats => {
      const stat = stats.find(s => s.condition_name === result.condition);
      if (stat && stat.total_reviews > 0) {
        setConfidence({
          total: stat.total_reviews,
          score: Math.round((stat.agreements / stat.total_reviews) * 100)
        });
      }
    });
  }, [result.condition, verified]);

  const handleVerify = async (feedback: 'Agree' | 'Correct') => {
    if (!diagnosisId || !doctorToken) return;
    try {
      await verifyDiagnosis(doctorToken, diagnosisId, result.condition, feedback);
      setVerified(feedback);
    } catch (err) {
      console.error(err);
    }
  };

  const urgencyColors = {
    Routine: "bg-blue-50 text-blue-700 border-blue-100",
    Urgent: "bg-amber-50 text-amber-700 border-amber-100",
    Emergency: "bg-red-50 text-red-700 border-red-100"
  };

  const probabilityColors = {
    High: "text-emerald-600",
    Medium: "text-amber-600",
    Low: "text-slate-500"
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">{result.condition}</h3>
            {confidence && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500" title={`Based on ${confidence.total} professional reviews`}>
                <BarChart3 className="h-3 w-3" />
                {confidence.score}% CONFIDENCE
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("text-sm font-semibold", probabilityColors[result.probability])}>
              {result.probability} Probability
            </span>
            <span className="text-slate-300">•</span>
            <span className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border", urgencyColors[result.urgency])}>
              {result.urgency}
            </span>
          </div>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">
          <Stethoscope className="h-6 w-6 text-slate-400" />
        </div>
      </div>

      <p className="text-slate-600 leading-relaxed">
        {result.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Activity className="h-3 w-3" />
            Key Indicators
          </div>
          <ul className="space-y-1">
            {result.commonSymptoms.map((s, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                <div className="h-1 w-1 bg-slate-300 rounded-full" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <User className="h-3 w-3" />
            Recommended Specialist
          </div>
          <p className="text-sm font-medium text-slate-700">{result.recommendedSpecialist}</p>
        </div>
      </div>

      <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {result.sources.map((source, i) => (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {source.title}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFindSpecialist(result.recommendedSpecialist)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-all group shrink-0"
          >
            <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <MapPin className="h-4 w-4" />
            </motion.div>
            Find Specialist
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTelehealth(result.condition)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all group shrink-0 shadow-lg shadow-blue-600/20"
          >
            <Video className="h-4 w-4 animate-pulse" />
            Consult Now
          </motion.button>
          {isDoctorView && diagnosisId && (
            <div className="flex items-center gap-2 mr-2 pr-4 border-r border-slate-100">
              {verified ? (
                <span className={cn(
                  "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg",
                  verified === 'Agree' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  {verified === 'Agree' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {verified === 'Agree' ? "Agreed" : "Corrected"}
                </span>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVerify('Agree')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Agree
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVerify('Correct')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Correct
                  </motion.button>
                </>
              )}
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDeepDive(result.condition)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all group shrink-0"
          >
            Explore Deep-Dive
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>

      {isDoctorView && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              Clinical Insights (Professional)
            </h4>
            <p className="text-sm text-slate-700 font-mono leading-relaxed">
              {result.professionalInsights}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
