import React from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Settings, 
  LogOut, 
  Activity, 
  Calendar, 
  FileText,
  ChevronRight,
  Bell,
  Lock,
  CreditCard
} from 'lucide-react';
import { User } from '../services/apiService';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  const stats = [
    { label: 'Total Scans', value: '12', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Reports', value: '5', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Member Since', value: 'Mar 2026', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const menuItems = [
    { label: 'Personal Information', icon: UserIcon, description: 'Update your name and contact details' },
    { label: 'Security & Password', icon: Lock, description: 'Change your password and secure your account' },
    { label: 'Notifications', icon: Bell, description: 'Manage your alert preferences' },
    { label: 'Billing & Subscription', icon: CreditCard, description: 'View your plan and payment history' },
    { label: 'Connected Devices', icon: Activity, description: 'Manage your health sync integrations' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
            <UserIcon className="h-16 w-16 text-emerald-600" />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 font-medium">Verified Account</span>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
              >
                Edit Profile
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLogout}
                className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-default"
          >
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Settings Menu */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-slate-400" />
          <h2 className="font-bold text-slate-900">Account Settings</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {menuItems.map((item, idx) => (
            <motion.button 
              whileHover={{ backgroundColor: '#f8fafc' }}
              whileTap={{ scale: 0.998 }}
              key={idx}
              className="w-full p-6 flex items-center justify-between transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white transition-all">
                  <item.icon className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 transform group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center space-y-2 pb-8">
        <p className="text-slate-400 text-sm">MedAI Version 2.4.0 (Stable)</p>
        <p className="text-slate-300 text-xs">Last login: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};
