import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase, Brain, Users, Zap, BarChart3, Shield,
  ArrowRight, CheckCircle, Star, Video, Bot,
  ExternalLink, Wifi, MonitorSmartphone
} from 'lucide-react';

/**
 * Landing page. Provides two big buttons that open Admin and Candidate
 * portals in **separate browser tabs** with auto-login via URL params.
 */
const Landing: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // If already authenticated in this tab, redirect to the correct portal
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} replace />;
  }

  const openPortal = (role: 'admin' | 'candidate') => {
    const creds = role === 'admin'
      ? { e: 'admin@recruitai.com', p: 'admin123' }
      : { e: 'john@example.com', p: 'password123' };
    // Open a new browser tab with login params — the Login page reads them
    window.open(`/login?email=${encodeURIComponent(creds.e)}&password=${encodeURIComponent(creds.p)}&auto=1`, '_blank');
  };

  const features = [
    { icon: Brain, title: 'AI Resume Screening', desc: 'Automated NLP scoring & candidate ranking in real-time.', color: 'bg-purple-100 text-purple-600' },
    { icon: Zap, title: 'Instant Match Scoring', desc: '0-100 % compatibility scores update across both portals instantly.', color: 'bg-yellow-100 text-yellow-600' },
    { icon: Video, title: 'Video AI Interviews', desc: 'Webcam + Speech-to-Text powered adaptive interviews.', color: 'bg-blue-100 text-blue-600' },
    { icon: BarChart3, title: 'Live Analytics', desc: 'Hiring funnel, skill demand, and real-time dashboards.', color: 'bg-green-100 text-green-600' },
    { icon: Bot, title: 'AI Career Coach', desc: 'Chatbot for resume tips, interview prep, and job matching.', color: 'bg-indigo-100 text-indigo-600' },
    { icon: Shield, title: 'Separate Portals', desc: 'Admin HR panel & Candidate portal synced via BroadcastChannel.', color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── nav ── */}
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center"><Briefcase className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl text-gray-900">RecruitAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Sign In</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
            <Wifi className="w-4 h-4" /> Real-Time Synced Admin + Candidate Portals
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Hire Smarter with<br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI-Driven Recruitment</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Open the <strong>Admin HR Panel</strong> and the <strong>Candidate Job Portal</strong> in
            two separate browser tabs — every action syncs instantly between them.
          </p>

          {/* ★ Big CTA buttons ★ */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openPortal('admin')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
            >
              <MonitorSmartphone className="w-5 h-5" />
              Open Admin Panel
              <ExternalLink className="w-4 h-4 opacity-60" />
            </button>
            <button
              onClick={() => openPortal('candidate')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
            >
              <Users className="w-5 h-5" />
              Open Candidate Portal
              <ExternalLink className="w-4 h-4 opacity-60" />
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Each button opens a <strong>new tab</strong> with a demo account auto-logged-in.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" />No sign-up needed</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" />Cross-tab real-time sync</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" />25+ job listings across 7 departments</span>
          </div>
        </div>
      </section>

      {/* ── how it works ── */}
      <section className="border-y bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How Real-Time Sync Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { s: '1', t: 'Open Both Tabs', d: 'Click the two buttons above to open Admin & Candidate in separate browser tabs.' },
              { s: '2', t: 'Perform Actions', d: 'Apply for a job in the Candidate tab, or shortlist someone in the Admin tab.' },
              { s: '3', t: 'Watch Instant Sync', d: 'Switch to the other tab — data is already updated. No refresh needed.' },
            ].map(x => (
              <div key={x.s} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold mb-4">{x.s}</div>
                <h3 className="font-semibold text-gray-900">{x.t}</h3>
                <p className="mt-2 text-sm text-gray-600">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── features ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Platform Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => { const Icon = f.icon; return (
            <div key={i} className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}><Icon className="w-6 h-6" /></div>
              <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ); })}
        </div>
      </section>

      {/* ── demo creds ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-10 lg:p-16 text-center text-white">
          <Star className="w-10 h-10 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-3xl font-bold">Demo Credentials</h2>
          <p className="mt-3 text-indigo-100 max-w-md mx-auto">Or sign in manually from the login page.</p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="font-semibold text-sm">👨‍💼 Admin / HR</p>
              <p className="text-xs text-indigo-200 mt-1">admin@recruitai.com</p>
              <p className="text-xs text-indigo-200">admin123</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="font-semibold text-sm">👩‍💻 Candidate</p>
              <p className="text-xs text-indigo-200 mt-1">john@example.com</p>
              <p className="text-xs text-indigo-200">password123</p>
            </div>
          </div>
          <Link to="/login" className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all">
            Manual Login <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Briefcase className="w-4 h-4 text-white" /></div><span className="font-bold text-gray-900">RecruitAI</span></div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} RecruitAI — AI-Powered Recruitment & Resume Screening</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
