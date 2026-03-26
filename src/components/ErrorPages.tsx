import React from 'react';
import { motion } from 'motion/react';
import { Search, ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface ErrorPageProps {
  code: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  onBack?: () => void;
}

const ErrorPage = ({ code, title, message, icon, onBack }: ErrorPageProps) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full text-center space-y-8"
    >
      <div className="relative">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="w-24 h-24 bg-white rounded-3xl shadow-2xl border border-slate-100 flex items-center justify-center mx-auto"
        >
          {icon}
        </motion.div>
        <motion.span 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg"
        >
          {code}
        </motion.span>
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{title}</h1>
        <p className="text-lg text-slate-500 font-medium leading-relaxed">
          {message}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/'}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
        >
          <Home className="h-5 w-5" />
          Return to Dashboard
        </motion.button>
        {onBack && (
          <button 
            onClick={onBack}
            className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        )}
      </div>
      
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-8">
        MedAI Resilience System &copy; 2026
      </p>
    </motion.div>
  </div>
);

export const NotFoundPage = () => (
  <ErrorPage 
    code="404"
    title="Page Not Found"
    message="We couldn't find the page you're looking for. It might have been moved or deleted."
    icon={<Search className="h-10 w-10 text-slate-400" />}
    onBack={() => window.history.back()}
  />
);

export const ServerErrorPage = () => (
  <ErrorPage 
    code="500"
    title="Server Error"
    message="Our servers are experiencing a temporary issue. Please try again in a few moments."
    icon={<ShieldAlert className="h-10 w-10 text-red-500" />}
  />
);
