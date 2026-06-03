import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Job, CandidateProfile, Application, Interview, Notification } from '../types';
import { initialJobs, initialCandidates, initialApplications, initialInterviews, initialNotifications } from '../data/mockData';
import { expandedJobs } from '../data/expandedJobs';
import { realtime } from '../services/realtimeService';

/* ── public API ─────────────────────────────────────── */
interface Ctx {
  jobs: Job[];
  addJob: (j: Omit<Job, 'id' | 'createdAt' | 'applicationsCount'>) => void;
  updateJob: (id: string, u: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  getJobById: (id: string) => Job | undefined;
  candidates: CandidateProfile[];
  addCandidate: (c: Omit<CandidateProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCandidate: (id: string, u: Partial<CandidateProfile>) => void;
  getCandidateByUserId: (uid: string) => CandidateProfile | undefined;
  getCandidateById: (id: string) => CandidateProfile | undefined;
  applications: Application[];
  addApplication: (a: Omit<Application, 'id' | 'appliedAt'>) => void;
  updateApplication: (id: string, u: Partial<Application>) => void;
  getApplicationsByCandidate: (cid: string) => Application[];
  getApplicationsByJob: (jid: string) => Application[];
  interviews: Interview[];
  addInterview: (i: Omit<Interview, 'id'>) => void;
  updateInterview: (id: string, u: Partial<Interview>) => void;
  getInterviewsByCandidate: (cid: string) => Interview[];
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (uid: string) => void;
  getNotificationsByUser: (uid: string) => Notification[];
  unreadCount: (uid: string) => number;
}

const DataContext = createContext<Ctx | undefined>(undefined);

/* ── seed data ──────────────────────────────────────── */
const seed = (): Job[] => {
  const all = [...initialJobs];
  expandedJobs.forEach((j, i) => all.push({ ...j, id: `ej-${i}`, createdAt: new Date().toISOString(), applicationsCount: Math.floor(Math.random() * 40) + 5 }));
  return all;
};

/* ── helpers: read / write localStorage ─────────────── */
const read = <T,>(key: string, fallback: T): T => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
};
const write = <T,>(key: string, data: T) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
};

/* ── provider ───────────────────────────────────────── */
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs]               = useState<Job[]>(() => read('jobs', seed()));
  const [candidates, setCandidates]   = useState<CandidateProfile[]>(() => read('candidates', initialCandidates));
  const [applications, setApplications] = useState<Application[]>(() => read('applications', initialApplications));
  const [interviews, setInterviews]   = useState<Interview[]>(() => read('interviews', initialInterviews));
  const [notifications, setNotifications] = useState<Notification[]>(() => read('notifications', initialNotifications));

  /* ── persist on every change ── */
  const firstRender = useRef(true);
  useEffect(() => { if (!firstRender.current) write('jobs', jobs); }, [jobs]);
  useEffect(() => { if (!firstRender.current) write('candidates', candidates); }, [candidates]);
  useEffect(() => { if (!firstRender.current) write('applications', applications); }, [applications]);
  useEffect(() => { if (!firstRender.current) write('interviews', interviews); }, [interviews]);
  useEffect(() => { if (!firstRender.current) write('notifications', notifications); }, [notifications]);
  useEffect(() => { firstRender.current = false; }, []);

  /* ── cross-tab sync: re-read localStorage whenever another tab
       writes (fires via BroadcastChannel or `storage` event) ── */
  useEffect(() => {
    const reload = () => {
      setJobs(read('jobs', seed()));
      setCandidates(read('candidates', initialCandidates));
      setApplications(read('applications', initialApplications));
      setInterviews(read('interviews', initialInterviews));
      setNotifications(read('notifications', initialNotifications));
    };

    // BroadcastChannel events raised by our realtime service
    const unsub = realtime.on('data_sync', reload);

    // native `storage` event already triggers data_sync inside realtimeService,
    // but we also add a direct listener as a safety net
    const onStorage = (e: StorageEvent) => {
      if (e.key && ['jobs','applications','candidates','interviews','notifications'].includes(e.key)) reload();
    };
    window.addEventListener('storage', onStorage);

    return () => { unsub(); window.removeEventListener('storage', onStorage); };
  }, []);

  /* ── Jobs ── */
  const addJob = useCallback((j: Omit<Job, 'id' | 'createdAt' | 'applicationsCount'>) => {
    const nj: Job = { ...j, id: `job-${Date.now()}`, createdAt: new Date().toISOString(), applicationsCount: 0 };
    setJobs(p => { const n = [...p, nj]; write('jobs', n); return n; });
    realtime.emit('job_posted', { jobId: nj.id, title: nj.title, department: nj.department }, 'admin', 'all');
  }, []);
  const updateJob = useCallback((id: string, u: Partial<Job>) => {
    setJobs(p => { const n = p.map(j => j.id === id ? { ...j, ...u } : j); write('jobs', n); return n; });
    realtime.emit('job_updated', { jobId: id }, 'admin', 'all');
  }, []);
  const deleteJob = useCallback((id: string) => {
    setJobs(p => { const n = p.filter(j => j.id !== id); write('jobs', n); return n; });
    realtime.emit('job_deleted', { jobId: id }, 'admin', 'all');
  }, []);
  const getJobById = useCallback((id: string) => jobs.find(j => j.id === id), [jobs]);

  /* ── Candidates ── */
  const addCandidate = useCallback((c: Omit<CandidateProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nc: CandidateProfile = { ...c, id: `profile-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setCandidates(p => { const n = [...p, nc]; write('candidates', n); return n; });
    realtime.emit('candidate_registered', { candidateId: nc.id, name: nc.name }, 'candidate', 'admin');
  }, []);
  const updateCandidate = useCallback((id: string, u: Partial<CandidateProfile>) => {
    setCandidates(p => { const n = p.map(c => c.id === id ? { ...c, ...u, updatedAt: new Date().toISOString() } : c); write('candidates', n); return n; });
    realtime.emit('candidate_profile_updated', { candidateId: id }, 'candidate', 'admin');
  }, []);
  const getCandidateByUserId = useCallback((uid: string) => candidates.find(c => c.userId === uid), [candidates]);
  const getCandidateById = useCallback((id: string) => candidates.find(c => c.id === id), [candidates]);

  /* ── Applications ── */
  const addApplication = useCallback((a: Omit<Application, 'id' | 'appliedAt'>) => {
    const na: Application = { ...a, id: `app-${Date.now()}`, appliedAt: new Date().toISOString() };
    setApplications(p => { const n = [...p, na]; write('applications', n); return n; });
    setJobs(p => { const n = p.map(j => j.id === a.jobId ? { ...j, applicationsCount: j.applicationsCount + 1 } : j); write('jobs', n); return n; });
    realtime.emit('new_application', { applicationId: na.id, candidateName: na.candidateName, jobId: na.jobId, score: na.aiScore?.overallScore }, 'candidate', 'admin');
    realtime.emit('ai_score_generated', { applicationId: na.id, score: na.aiScore?.overallScore, candidateName: na.candidateName }, 'system', 'admin');
  }, []);
  const updateApplication = useCallback((id: string, u: Partial<Application>) => {
    setApplications(p => { const n = p.map(a => a.id === id ? { ...a, ...u } : a); write('applications', n); return n; });
    const m: Record<string, 'candidate_shortlisted' | 'candidate_rejected' | 'candidate_hired' | 'application_status_updated'> =
      { shortlisted: 'candidate_shortlisted', rejected: 'candidate_rejected', hired: 'candidate_hired' };
    realtime.emit((u.status && m[u.status]) || 'application_status_updated', { applicationId: id, ...u }, 'admin', 'all');
  }, []);
  const getApplicationsByCandidate = useCallback((cid: string) => applications.filter(a => a.candidateId === cid), [applications]);
  const getApplicationsByJob = useCallback((jid: string) => applications.filter(a => a.jobId === jid), [applications]);

  /* ── Interviews ── */
  const addInterview = useCallback((i: Omit<Interview, 'id'>) => {
    const ni: Interview = { ...i, id: `iv-${Date.now()}` };
    setInterviews(p => { const n = [...p, ni]; write('interviews', n); return n; });
    realtime.emit('interview_scheduled', { interviewId: ni.id, candidateName: ni.candidateName, jobTitle: ni.jobTitle }, 'admin', 'all');
  }, []);
  const updateInterview = useCallback((id: string, u: Partial<Interview>) => {
    setInterviews(p => { const n = p.map(x => x.id === id ? { ...x, ...u } : x); write('interviews', n); return n; });
    if (u.status === 'completed') realtime.emit('interview_completed', { interviewId: id }, 'admin', 'all');
  }, []);
  const getInterviewsByCandidate = useCallback((cid: string) => interviews.filter(i => i.candidateId === cid), [interviews]);

  /* ── Notifications ── */
  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt'>) => {
    const nn: Notification = { ...n, id: `n-${Date.now()}-${Math.random().toString(36).slice(2,5)}`, createdAt: new Date().toISOString() };
    setNotifications(p => { const x = [nn, ...p]; write('notifications', x); return x; });
    realtime.emit('notification', { ...nn }, 'system', n.userId?.startsWith('admin') ? 'admin' : 'candidate');
  }, []);
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(p => { const n = p.map(x => x.id === id ? { ...x, read: true } : x); write('notifications', n); return n; });
  }, []);
  const markAllNotificationsRead = useCallback((uid: string) => {
    setNotifications(p => { const n = p.map(x => x.userId === uid ? { ...x, read: true } : x); write('notifications', n); return n; });
  }, []);
  const getNotificationsByUser = useCallback((uid: string) => notifications.filter(n => n.userId === uid), [notifications]);
  const unreadCount = useCallback((uid: string) => notifications.filter(n => n.userId === uid && !n.read).length, [notifications]);

  return (
    <DataContext.Provider value={{
      jobs, addJob, updateJob, deleteJob, getJobById,
      candidates, addCandidate, updateCandidate, getCandidateByUserId, getCandidateById,
      applications, addApplication, updateApplication, getApplicationsByCandidate, getApplicationsByJob,
      interviews, addInterview, updateInterview, getInterviewsByCandidate,
      notifications, addNotification, markNotificationRead, markAllNotificationsRead, getNotificationsByUser, unreadCount,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): Ctx => {
  const c = useContext(DataContext);
  if (!c) throw new Error('useData must be inside DataProvider');
  return c;
};
