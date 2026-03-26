import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Something went wrong</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    An unexpected error occurred in the application. Our team has been notified.
                  </p>
                  {this.state.error && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left">
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Error Details</p>
                      <p className="text-xs font-mono text-red-500 break-all">{this.state.error.message}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleReset}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="h-5 w-5" />
                  Reload Application
                </motion.button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full py-4 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <Home className="h-5 w-5" />
                  Return Home
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                MedAI Resilience System v1.0
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
