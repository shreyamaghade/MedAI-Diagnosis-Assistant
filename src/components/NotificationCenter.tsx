import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  date: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  isOpen, 
  onClose 
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'diagnosis_complete':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'doctor_review':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-[2px]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
            className="absolute top-full right-0 mt-4 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-[70]"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 tracking-tight">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={onMarkAllAsRead}
                    className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider hover:text-emerald-700 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                    <Bell className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      layout
                      className={cn(
                        "p-4 flex gap-4 transition-colors relative group",
                        !notification.is_read ? "bg-emerald-50/30" : "hover:bg-slate-50"
                      )}
                    >
                      <div className="shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            "text-sm font-bold leading-tight",
                            !notification.is_read ? "text-slate-900" : "text-slate-600"
                          )}>
                            {notification.title}
                          </h4>
                          <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                            {new Date(notification.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {notification.message}
                        </p>
                        {!notification.is_read && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest pt-1 hover:text-emerald-700"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                      {!notification.is_read && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full" />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing your last 50 notifications
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
