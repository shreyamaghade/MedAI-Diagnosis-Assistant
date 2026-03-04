import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pill, Home, MessageSquare, Loader2 } from 'lucide-react';
import { ConditionDeepDive } from '../services/geminiService';

interface DeepDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  condition: string;
  data: ConditionDeepDive | null;
  loading: boolean;
}

export const DeepDiveModal: React.FC<DeepDiveModalProps> = ({ isOpen, onClose, condition, data, loading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{condition}</h2>
                <p className="text-sm text-slate-500 font-medium">Detailed Condition Deep-Dive</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-slate-400" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                  <p className="text-slate-500 font-medium italic">Consulting medical database...</p>
                </div>
              ) : data ? (
                <>
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Pill className="h-5 w-5 text-blue-600" />
                      </div>
                      Standard Treatments
                    </h3>
                    <ul className="grid grid-cols-1 gap-3">
                      {data.treatments.map((item, i) => (
                        <li key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed">
                          <div className="h-1.5 w-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <Home className="h-5 w-5 text-emerald-600" />
                      </div>
                      Lifestyle & Home Care
                    </h3>
                    <ul className="grid grid-cols-1 gap-3">
                      {data.lifestyleAdjustments.map((item, i) => (
                        <li key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed">
                          <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      Questions for your Doctor
                    </h3>
                    <ul className="grid grid-cols-1 gap-3">
                      {data.questionsForDoctor.map((item, i) => (
                        <li key={i} className="flex gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-sm text-purple-900 font-medium leading-relaxed italic">
                          "{item}"
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              ) : null}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-medium">
                This information is for educational purposes only and does not constitute medical advice.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
