import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Star, ExternalLink, Loader2, Navigation } from 'lucide-react';
import { findSpecialists, SpecialistLocation } from '../services/geminiService';
import Markdown from 'react-markdown';

interface SpecialistFinderProps {
  specialistType: string;
  onClose: () => void;
}

export const SpecialistFinder: React.FC<SpecialistFinderProps> = ({ specialistType, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ text: string; locations: SpecialistLocation[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialists = async () => {
      setLoading(true);
      try {
        // Try to get geolocation
        let lat, lng;
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (geoErr) {
          console.warn("Geolocation failed or denied", geoErr);
        }

        const result = await findSpecialists(specialistType, lat, lng);
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to find nearby specialists. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, [specialistType]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-600 text-white">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Find a {specialistType}
            </h2>
            <p className="text-emerald-100 text-sm font-medium">Nearby clinics and specialists for your condition</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
              <p className="text-slate-500 font-bold animate-pulse">Searching Google Maps for specialists...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
              <p className="text-red-600 font-bold">{error}</p>
            </div>
          ) : (
            <>
              {data?.text && (
                <div className="prose prose-slate max-w-none prose-sm font-medium text-slate-600">
                  <Markdown>{data.text}</Markdown>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Navigation className="h-3 w-3" />
                  Recommended Locations
                </h3>
                {data?.locations.map((loc, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-emerald-500 transition-all group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{loc.name}</h4>
                        {loc.address && (
                          <p className="text-sm text-slate-500 flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            {loc.address}
                          </p>
                        )}
                        {loc.phone && (
                          <p className="text-sm text-slate-500 flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />
                            {loc.phone}
                          </p>
                        )}
                      </div>
                      <a
                        href={loc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
                        title="View on Google Maps"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                ))}
                {data?.locations.length === 0 && (
                  <p className="text-center py-10 text-slate-400 font-medium italic">
                    No specific locations found in the grounding data. Please refer to the summary above.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
