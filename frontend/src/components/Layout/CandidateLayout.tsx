import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { realtime, RealtimeEvent, eventLabel, eventIcon } from '../../services/realtimeService';
import {
  LayoutDashboard, Briefcase, FileText, Sparkles, Video,
  User, LogOut, Bell, Menu, X, ChevronDown, Bot, Wifi
} from 'lucide-react';
import { format } from 'date-fns';

const CandidateLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount, markNotificationRead, markAllNotificationsRead, getNotificationsByUser } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; icon: string } | null>(null);
  const [syncPulse, setSyncPulse] = useState(false);

  const nCount = user ? unreadCount(user.id) : 0;
  const userNotifs = user ? getNotificationsByUser(user.id).slice(0, 20) : [];

  const handleEvent = useCallback((evt: RealtimeEvent) => {
    if (evt.type === 'data_sync') return;
    if (evt.targetRole === 'candidate' || evt.targetRole === 'all') {
      setToast({ msg: `${eventIcon(evt.type)} ${eventLabel(evt.type)}`, icon: eventIcon(evt.type) });
      setSyncPulse(true);
      setTimeout(() => setToast(null), 3500);
      setTimeout(() => setSyncPulse(false), 1500);
    }
  }, []);

  useEffect(() => { const u = realtime.on('*', handleEvent); return u; }, [handleEvent]);

  const links = [
    { path: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/candidate/jobs', label: 'Find Jobs', icon: Briefcase },
    { path: '/candidate/applications', label: 'Applications', icon: FileText },
    { path: '/candidate/video-interview', label: 'Video Interview', icon: Video },
    { path: '/candidate/ai-tools', label: 'AI Tools', icon: Sparkles },
    { path: '/candidate/chat', label: 'AI Coach', icon: Bot },
    { path: '/candidate/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* logo */}
            <Link to="/candidate/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center"><Briefcase className="w-5 h-5 text-white" /></div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900 text-lg leading-none">RecruitAI</span>
                <span className="block text-[10px] text-indigo-600 font-semibold tracking-wider -mt-0.5">JOB PORTAL</span>
              </div>
            </Link>

            {/* desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map(l => {
                const Icon = l.icon;
                const active = location.pathname === l.path;
                return (
                  <Link key={l.path} to={l.path} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                    <Icon className="w-4 h-4" />{l.label}
                  </Link>
                );
              })}
            </nav>

            {/* right */}
            <div className="flex items-center gap-1.5">
              {/* sync indicator */}
              <div className={`hidden sm:flex items-center gap-1 text-[11px] mr-1 ${syncPulse ? 'text-emerald-500' : 'text-gray-400'} transition-colors`}>
                <Wifi className={`w-3.5 h-3.5 ${syncPulse ? 'animate-ping' : ''}`} />
                <span className="hidden md:inline">Live</span>
              </div>

              {/* notifications */}
              <div className="relative">
                <button onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }} className="relative p-2 rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {nCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">{nCount > 9 ? '9+' : nCount}</span>}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <span className="font-semibold text-gray-800">Notifications</span>
                      {nCount > 0 && <button onClick={() => user && markAllNotificationsRead(user.id)} className="text-xs text-indigo-600">Mark all read</button>}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y">
                      {userNotifs.length === 0 ? <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications</div> : userNotifs.map(n => (
                        <button key={n.id} onClick={() => markNotificationRead(n.id)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${!n.read ? 'bg-indigo-50/50' : ''}`}>
                          <p className="text-sm font-medium text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* profile */}
              <div className="relative">
                <button onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">{user?.name?.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border z-50 py-1">
                    <div className="px-4 py-3 border-b"><p className="text-sm font-semibold text-gray-900">{user?.name}</p><p className="text-xs text-gray-500">{user?.email}</p><span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">CANDIDATE</span></div>
                    <Link to="/candidate/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><User className="w-4 h-4" />My Profile</Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" />Sign Out</button>
                  </div>
                )}
              </div>

              <button onClick={() => setMobileMenuOpen(p => !p)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* mobile nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white px-4 py-3 space-y-1">
            {links.map(l => { const Icon = l.icon; const a = location.pathname === l.path; return (
              <Link key={l.path} to={l.path} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${a ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}><Icon className="w-5 h-5" />{l.label}</Link>
            ); })}
          </div>
        )}
      </header>

      {/* toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-white border border-emerald-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3" style={{ animation: 'slideInRight 0.3s ease' }}>
          <span className="text-lg">{toast.icon}</span>
          <span className="text-sm font-medium text-gray-800">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* page */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} RecruitAI — AI-Powered Recruitment</p>
          <div className="flex gap-5 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CandidateLayout;
