import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { realtime, RealtimeEvent, eventLabel, eventIcon } from '../../services/realtimeService';
import {
  LayoutDashboard, Briefcase, Users, GitBranch, Brain, Calendar,
  BarChart3, Settings, LogOut, Bell, ChevronDown, X, Menu,
  FileText, Radio, Activity, Wifi
} from 'lucide-react';
import { format } from 'date-fns';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount, markNotificationRead, markAllNotificationsRead, getNotificationsByUser } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; icon: string } | null>(null);
  const [activityLog, setActivityLog] = useState<RealtimeEvent[]>([]);
  const [pulse, setPulse] = useState(false);

  const nCount = user ? unreadCount(user.id) : 0;
  const userNotifs = user ? getNotificationsByUser(user.id).slice(0, 20) : [];

  // Live event listener
  const handleEvent = useCallback((evt: RealtimeEvent) => {
    if (evt.type === 'data_sync') return; // silent
    if (evt.targetRole === 'admin' || evt.targetRole === 'all') {
      setActivityLog(prev => [evt, ...prev].slice(0, 60));
      setToast({ msg: `${eventIcon(evt.type)} ${eventLabel(evt.type)}`, icon: eventIcon(evt.type) });
      setPulse(true);
      setTimeout(() => setToast(null), 3500);
      setTimeout(() => setPulse(false), 1500);
    }
  }, []);

  useEffect(() => {
    // Seed activity from stored log
    setActivityLog(realtime.getActivityLog(40));
    const unsub = realtime.on('*', handleEvent);
    return unsub;
  }, [handleEvent]);

  const links = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/jobs', label: 'Job Postings', icon: Briefcase },
    { path: '/admin/candidates', label: 'Candidates', icon: Users },
    { path: '/admin/pipeline', label: 'Pipeline', icon: GitBranch },
    { path: '/admin/ai-screening', label: 'AI Screening', icon: Brain },
    { path: '/admin/interviews', label: 'Interviews', icon: Calendar },
    { path: '/admin/transcripts', label: 'Transcripts', icon: FileText },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={`hidden lg:flex flex-col ${sidebarOpen ? 'w-64' : 'w-[72px]'} bg-slate-900 transition-all duration-200 flex-shrink-0`}>
        <div className="flex items-center h-16 px-4 border-b border-slate-700">
          <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0"><Briefcase className="w-5 h-5 text-white" /></div>
          {sidebarOpen && <span className="ml-3 text-white font-bold text-lg truncate">RecruitAI</span>}
        </div>
        {sidebarOpen && <div className="px-4 pt-3 pb-1"><span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">HR Admin Panel</span></div>}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {links.map(l => {
            const Icon = l.icon;
            const active = location.pathname === l.path;
            return (
              <Link key={l.path} to={l.path} title={l.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{l.label}</span>}
              </Link>
            );
          })}
        </nav>
        {/* connection status */}
        <div className={`px-4 py-3 border-t border-slate-700 flex items-center gap-2 text-xs ${pulse ? 'text-emerald-300' : 'text-emerald-500'} transition-colors`}>
          <Wifi className={`w-3.5 h-3.5 ${pulse ? 'animate-ping' : ''}`} />
          {sidebarOpen && <span>Real-Time Connected</span>}
        </div>
        <button onClick={() => setSidebarOpen(p => !p)} className="p-3 border-t border-slate-700 text-slate-500 hover:text-white flex items-center justify-center">
          <ChevronDown className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
        </button>
      </aside>

      {/* mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-slate-900 flex flex-col z-50">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
              <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center"><Briefcase className="w-5 h-5 text-white" /></div><span className="text-white font-bold text-lg">RecruitAI</span></div>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
              {links.map(l => { const Icon = l.icon; const a = location.pathname === l.path; return (
                <Link key={l.path} to={l.path} onClick={() => setMobileSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${a ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Icon className="w-5 h-5" />{l.label}</Link>
              ); })}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* top bar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100"><Menu className="w-5 h-5 text-gray-600" /></button>
            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">{links.find(l => l.path === location.pathname)?.label || 'Admin'}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            {/* activity feed */}
            <button onClick={() => { setFeedOpen(p => !p); setNotifOpen(false); setProfileOpen(false); }}
              className={`relative p-2 rounded-lg hover:bg-gray-100 transition-colors ${feedOpen ? 'bg-gray-100' : ''}`}>
              <Activity className="w-5 h-5 text-gray-600" />
              {pulse && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />}
            </button>
            {/* notifications */}
            <button onClick={() => { setNotifOpen(p => !p); setFeedOpen(false); setProfileOpen(false); }} className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              {nCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">{nCount > 9 ? '9+' : nCount}</span>}
            </button>
            {/* profile */}
            <button onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); setFeedOpen(false); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">{user?.name?.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">{user?.name}</span>
            </button>
          </div>
        </header>

        {/* dropdowns */}
        {feedOpen && (
          <div className="absolute top-16 right-28 w-96 bg-white rounded-xl shadow-2xl border z-50 max-h-[70vh] flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <span className="font-semibold text-gray-800 flex items-center gap-2"><Radio className="w-4 h-4 text-emerald-500 animate-pulse" />Live Activity Feed</span>
              <span className="text-xs text-gray-400">{activityLog.length} events</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y max-h-96">
              {activityLog.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">No activity yet. Actions from either portal appear here in real-time.</div> : activityLog.filter(e => e.type !== 'data_sync').map(e => (
                <div key={e.id} className="px-4 py-3 hover:bg-gray-50 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0 mt-0.5">{eventIcon(e.type)}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{eventLabel(e.type)}</p>
                      {e.payload.candidateName ? <p className="text-xs text-gray-500 truncate">Candidate: {String(e.payload.candidateName)}</p> : null}
                      {e.payload.title ? <p className="text-xs text-gray-500 truncate">Job: {String(e.payload.title)}</p> : null}
                      <p className="text-[10px] text-gray-400 mt-0.5">{format(new Date(e.timestamp), 'h:mm:ss a')}</p>
                    </div>
                    <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${e.source === 'admin' ? 'bg-indigo-100 text-indigo-700' : e.source === 'candidate' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{e.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {notifOpen && (
          <div className="absolute top-16 right-16 w-80 bg-white rounded-xl shadow-2xl border z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-gray-800">Notifications</span>
              {nCount > 0 && <button onClick={() => user && markAllNotificationsRead(user.id)} className="text-xs text-indigo-600 hover:text-indigo-700">Mark all read</button>}
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
        {profileOpen && (
          <div className="absolute top-16 right-4 w-56 bg-white rounded-xl shadow-2xl border z-50 py-1">
            <div className="px-4 py-3 border-b"><p className="text-sm font-semibold text-gray-900">{user?.name}</p><p className="text-xs text-gray-500">{user?.email}</p><span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">ADMIN</span></div>
            <Link to="/admin/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Settings className="w-4 h-4" />Settings</Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" />Sign Out</button>
          </div>
        )}

        {/* toast */}
        {toast && (
          <div className="absolute top-20 right-6 z-40 bg-white border border-emerald-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3" style={{ animation: 'slideInRight 0.3s ease' }}>
            <span className="text-lg">{toast.icon}</span>
            <span className="text-sm font-medium text-gray-800">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* page */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
