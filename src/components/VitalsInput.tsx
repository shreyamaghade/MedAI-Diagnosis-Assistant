import React from 'react';
import { Activity, Thermometer, Heart, Wind } from 'lucide-react';
import { Vitals } from '../services/geminiService';

interface VitalsInputProps {
  vitals: Vitals;
  onVitalsChange: (vitals: Vitals) => void;
}

export const VitalsInput: React.FC<VitalsInputProps> = ({ vitals, onVitalsChange }) => {
  const handleChange = (field: keyof Vitals, value: string) => {
    onVitalsChange({ ...vitals, [field]: value });
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <Activity className="h-4 w-4 text-slate-400" />
        Patient Vitals (Optional)
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="h-3 w-3" />
            BP (Sys/Dia)
          </label>
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="120"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={vitals.systolic || ''}
              onChange={(e) => handleChange('systolic', e.target.value)}
            />
            <span className="text-slate-300">/</span>
            <input
              type="text"
              placeholder="80"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              value={vitals.diastolic || ''}
              onChange={(e) => handleChange('diastolic', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Heart className="h-3 w-3" />
            Heart Rate
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="72"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-10"
              value={vitals.heartRate || ''}
              onChange={(e) => handleChange('heartRate', e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">bpm</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Wind className="h-3 w-3" />
            SpO2
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="98"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-8"
              value={vitals.spO2 || ''}
              onChange={(e) => handleChange('spO2', e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">%</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Thermometer className="h-3 w-3" />
            Temp
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="36.6"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-8"
              value={vitals.temperature || ''}
              onChange={(e) => handleChange('temperature', e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};
