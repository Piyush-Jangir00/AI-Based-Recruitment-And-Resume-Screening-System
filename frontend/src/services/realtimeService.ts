/**
 * RecruitAI Real-Time Event Bus
 * 
 * Provides cross-tab synchronisation so Admin and Candidate
 * dashboards opened in **separate browser tabs** stay in sync.
 * 
 * Two transport layers:
 *  1. BroadcastChannel — instant, same-origin cross-tab messaging
 *  2. localStorage polling — fallback for browsers without BroadcastChannel
 *     and to catch writes that happen in the same tab (e.g. after page reload)
 */

export type RealtimeEventType =
  | 'new_application'
  | 'application_status_updated'
  | 'resume_uploaded'
  | 'interview_scheduled'
  | 'interview_joined'
  | 'interview_completed'
  | 'job_posted'
  | 'job_updated'
  | 'job_deleted'
  | 'candidate_registered'
  | 'candidate_profile_updated'
  | 'ai_score_generated'
  | 'ai_feedback_generated'
  | 'candidate_shortlisted'
  | 'candidate_rejected'
  | 'candidate_hired'
  | 'notification'
  | 'data_sync';

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  payload: Record<string, unknown>;
  timestamp: string;
  source: 'admin' | 'candidate' | 'system';
  targetRole?: 'admin' | 'candidate' | 'all';
}

type Listener = (event: RealtimeEvent) => void;

class RealtimeService {
  private listeners = new Map<string, Set<Listener>>();
  private globalListeners = new Set<Listener>();
  private channel: BroadcastChannel | null = null;

  constructor() {
    // 1. BroadcastChannel
    try {
      this.channel = new BroadcastChannel('recruitai_sync');
      this.channel.onmessage = (msg: MessageEvent<RealtimeEvent>) => {
        this.dispatch(msg.data);
      };
    } catch { /* fallback below */ }

    // 2. storage event fires when *another* tab writes to localStorage
    window.addEventListener('storage', (e) => {
      if (e.key && ['jobs','applications','candidates','interviews','notifications'].includes(e.key)) {
        // Trigger a generic data_sync so the DataContext re-reads
        this.dispatch({
          id: `sync-${Date.now()}`,
          type: 'data_sync',
          payload: { key: e.key },
          timestamp: new Date().toISOString(),
          source: 'system',
          targetRole: 'all',
        });
      }
    });
  }

  on(type: RealtimeEventType | '*', listener: Listener): () => void {
    if (type === '*') {
      this.globalListeners.add(listener);
      return () => { this.globalListeners.delete(listener); };
    }
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
    return () => { this.listeners.get(type)?.delete(listener); };
  }

  emit(
    type: RealtimeEventType,
    payload: Record<string, unknown>,
    source: RealtimeEvent['source'] = 'system',
    targetRole: RealtimeEvent['targetRole'] = 'all',
  ) {
    const event: RealtimeEvent = {
      id: `e-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      source,
      targetRole,
    };

    // persist activity log (used by live feed widgets)
    try {
      const log: RealtimeEvent[] = JSON.parse(localStorage.getItem('rt_log') || '[]');
      log.unshift(event);
      if (log.length > 80) log.length = 80;
      localStorage.setItem('rt_log', JSON.stringify(log));
    } catch { /* quota */ }

    // local dispatch
    this.dispatch(event);

    // broadcast to other tabs
    try { this.channel?.postMessage(event); } catch { /* */ }
  }

  private dispatch(event: RealtimeEvent) {
    this.listeners.get(event.type)?.forEach(fn => { try { fn(event); } catch { /* */ } });
    this.globalListeners.forEach(fn => { try { fn(event); } catch { /* */ } });
  }

  getActivityLog(limit = 30): RealtimeEvent[] {
    try {
      return (JSON.parse(localStorage.getItem('rt_log') || '[]') as RealtimeEvent[]).slice(0, limit);
    } catch { return []; }
  }

  destroy() {
    this.channel?.close();
    this.listeners.clear();
    this.globalListeners.clear();
  }
}

export const realtime = new RealtimeService();

/* ── helpers ────────────────────────────────── */
export const eventLabel = (t: RealtimeEventType): string => ({
  new_application:             'New Application Received',
  application_status_updated:  'Application Status Updated',
  resume_uploaded:             'Resume Uploaded',
  interview_scheduled:         'Interview Scheduled',
  interview_joined:            'Candidate Joined Interview',
  interview_completed:         'Interview Completed',
  job_posted:                  'New Job Posted',
  job_updated:                 'Job Updated',
  job_deleted:                 'Job Removed',
  candidate_registered:        'New Candidate Registered',
  candidate_profile_updated:   'Candidate Profile Updated',
  ai_score_generated:          'AI Score Generated',
  ai_feedback_generated:       'AI Feedback Ready',
  candidate_shortlisted:       'Candidate Shortlisted',
  candidate_rejected:          'Candidate Rejected',
  candidate_hired:             'Candidate Hired 🎉',
  notification:                'Notification',
  data_sync:                   'Data Synchronised',
})[t] || t;

export const eventIcon = (t: RealtimeEventType): string => ({
  new_application: '📩', application_status_updated: '🔄',
  resume_uploaded: '📄', interview_scheduled: '📅',
  interview_joined: '🟢', interview_completed: '✅',
  job_posted: '📢', job_updated: '✏️', job_deleted: '🗑️',
  candidate_registered: '👤', candidate_profile_updated: '📝',
  ai_score_generated: '🤖', ai_feedback_generated: '💡',
  candidate_shortlisted: '⭐', candidate_rejected: '❌',
  candidate_hired: '🎉', notification: '🔔', data_sync: '🔄',
})[t] || '📌';
