import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Stethoscope, 
  MessageSquare, 
  Activity, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Clock,
  MapPin
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, userName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-white/20"
          >
            {/* Header */}
            <div className="relative h-48 bg-emerald-600 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              </div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 text-center space-y-2"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                  <Sparkles className="text-white h-8 w-8" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Welcome to MedAI, {userName}!</h2>
                <p className="text-emerald-100 font-medium">Your intelligent health companion</p>
              </motion.div>
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 space-y-8 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  What is MedAI?
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  MedAI is an advanced AI-powered diagnostic support tool designed to help you understand your symptoms and provide preliminary health insights. It bridges the gap between your symptoms and professional medical consultation.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">How to use MedAI</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Stethoscope className="text-blue-600 h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">1. Input Symptoms</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Select symptoms, upload photos or medical docs, and enter your vitals for a complete profile.</p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="text-emerald-600 h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">2. Refine with AI</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Answer targeted follow-up questions to help the AI narrow down potential causes.</p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Activity className="text-purple-600 h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">3. Get Insights</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Receive a detailed report with possible conditions, urgency levels, and specialists.</p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Clock className="text-amber-600 h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">4. Track History</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">All your analyses are saved securely. Access them anytime in the History tab.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-900">Medical Disclaimer</p>
                  <p className="text-xs text-amber-800/70 leading-relaxed">
                    MedAI is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                Got it, let's start
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
