import React, { useState } from 'react';
import { Mail, User as UserIcon, ArrowRight, HeartPulse, Lock, Eye, EyeOff } from 'lucide-react';
import { login, register, guestLogin, User } from '../services/apiService';
import { motion, AnimatePresence } from 'motion/react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    performAuth(email, password, name);
  };

  const performAuth = async (emailToUse: string, passwordToUse: string, nameToUse?: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = isRegistering 
        ? await register(emailToUse, passwordToUse, nameToUse || '')
        : await login(emailToUse, passwordToUse);
      onLogin(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsRegistering(false);
    setEmail('demo@example.com');
    setPassword('password123');
    performAuth('demo@example.com', 'password123');
  };

  const handleGuestAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await guestLogin();
      onLogin(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Guest access failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/reset-demo", { method: "POST" });
      if (!response.ok) throw new Error("Failed to reset demo user");
      setError("Demo user has been reset. You can now use Demo Login.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8 md:p-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 mx-auto">
              <HeartPulse className="text-white h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-slate-500 font-medium">
                {isRegistering ? "Join MedAI to track your health" : "Sign in to access your health journey"}
              </p>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isRegistering && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required={isRegistering}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={!loading && email && password ? { scale: 1.01 } : {}}
              whileTap={!loading && email && password ? { scale: 0.99 } : {}}
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none mt-4"
            >
              {loading ? "Processing..." : (isRegistering ? "Create Account" : "Sign In")}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </motion.button>
          </form>

          <div className="text-center space-y-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors block w-full"
            >
              {isRegistering ? "Already have an account? Sign In" : "New to MedAI? Create an account"}
            </motion.button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Or try demo</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDemoLogin}
                className="py-3 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                Demo Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGuestAccess}
                className="py-3 px-4 bg-white text-emerald-600 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Guest Access
              </motion.button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResetDemo}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors block w-full"
            >
              Trouble logging in? Reset Demo Account
            </motion.button>
          </div>
        </div>
        
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Secure Health Data Storage • Encrypted Passwords
          </p>
        </div>
      </motion.div>
    </div>
  );
};
