import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Building2,
  FileCheck2,
  AlertTriangle,
  Clock,
  Shield,
  Search,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetAllData,
    setCurrentView,
    fdrs,
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Official Government of India Sovereign Top Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-7 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="font-medium tracking-wide">भारत सरकार</span>
            <span className="text-slate-600">|</span>
            <span className="tracking-wide">Government of India</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-slate-400 hidden sm:inline">शिक्षा मंत्रालय · Ministry of Education</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
            <span className="font-mono text-slate-400">Ref Date: 01 Nov 2026</span>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => {
                if (window.confirm('Reset all demo data back to clean SIH26265 hackathon baseline?')) {
                  resetAllData();
                }
              }}
              className="text-slate-400 hover:text-white transition flex items-center space-x-1 cursor-pointer"
              title="Reset Database to Default Baseline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Government Portal Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left Brand Identity with AICTE Emblem */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-lg bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">AICTE</span>
                <span className="text-xs text-slate-400 hidden sm:inline">|</span>
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline tracking-tight">
                  All India Council for Technical Education
                </span>
              </div>
              <p className="text-[12px] text-slate-600 font-medium tracking-tight">
                National Fixed Deposit & Security Deposit Regulatory Portal
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Quick Context / Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-2.5 bg-slate-50 hover:bg-slate-100/90 text-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-200/90 text-xs transition cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                title="Switch User Role for Evaluation"
              >
                <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-slate-900 text-xs leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {currentUser.role === 'ADMIN' ? 'Apex Admin' : currentUser.role === 'OFFICER' ? `${currentUser.region} Officer` : 'Institution Head'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div
                  className="absolute right-0 mt-2 w-84 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setShowRoleDropdown(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">Switch User Role</p>
                    <p className="text-[11px] text-slate-500">Test specific dashboards, permissions, and actions</p>
                  </div>
                  <div className="py-1">
                    {availableUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowRoleDropdown(false);
                          setCurrentView('dashboard');
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                          currentUser.id === u.id ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-900">{u.name}</span>
                            <span className="text-[10px] text-slate-400">·</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {u.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-[260px] mt-0.5">
                            {u.designation}
                          </p>
                        </div>
                        {currentUser.id === u.id && <span className="text-blue-700 text-xs font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifDropdown && (
                <div
                  className="absolute right-0 mt-2 w-92 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setShowNotifDropdown(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Notifications</p>
                      <p className="text-[11px] text-slate-500">{unreadCount} unread notices</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-blue-700 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.linkAction) setCurrentView(notif.linkAction);
                            setShowNotifDropdown(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition flex items-start space-x-3 ${
                            !notif.read ? 'bg-slate-50/70' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            {notif.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                            {notif.type === 'warning' && <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                            {notif.type === 'info' && <FileCheck2 className="w-4 h-4 text-blue-500 shrink-0" />}
                            {notif.type === 'success' && <Shield className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 truncate">{notif.title}</span>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                {new Date(notif.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
