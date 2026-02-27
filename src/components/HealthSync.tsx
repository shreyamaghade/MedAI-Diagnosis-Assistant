import React, { useState } from 'react';
import { Heart, Moon, Footprints, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { fetchHealthData, HealthData } from '../services/healthService';
import { cn } from '../lib/utils';

interface HealthSyncProps {
  onDataSynced: (data: HealthData) => void;
  syncedData: HealthData | null;
}

export const HealthSync: React.FC<HealthSyncProps> = ({ onDataSynced, syncedData }) => {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const data = await fetchHealthData();
      onDataSynced(data);
    } catch (err) {
      console.error("Health sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Health App Integration</h3>
            <p className="text-xs text-slate-500 font-medium">Sync with Apple Health or Google Fit</p>
          </div>
          <button
            onClick={handleSync}
            disabled={loading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              syncedData 
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-100"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : syncedData ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {loading ? "Syncing..." : syncedData ? "Re-sync Data" : "Sync Health Data"}
          </button>
        </div>

        {syncedData ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Heart className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Heart Rate</span>
              </div>
              <p className="text-xl font-black text-slate-900">{syncedData.avgHeartRate} <span className="text-xs font-medium text-slate-400">bpm</span></p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-purple-600">
                <Moon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sleep</span>
              </div>
              <p className="text-xl font-black text-slate-900">{syncedData.avgSleepHours} <span className="text-xs font-medium text-slate-400">hrs</span></p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <Footprints className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Steps</span>
              </div>
              <p className="text-xl font-black text-slate-900">{syncedData.avgSteps}</p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-slate-400 italic">No health data synced yet. Syncing provides AI with lifestyle context.</p>
          </div>
        )}
      </div>
      
      {syncedData && (
        <div className="bg-emerald-50 px-6 py-3 border-t border-emerald-100 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">
            Context synced for last 7 days
          </p>
        </div>
      )}
    </div>
  );
};
