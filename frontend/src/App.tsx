import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/UI/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Layouts
import AdminLayout from './components/Layout/AdminLayout';
import CandidateLayout from './components/Layout/CandidateLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Landing from './pages/Landing';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminJobs from './pages/Admin/Jobs';
import AdminCandidates from './pages/Admin/Candidates';
import AdminInterviews from './pages/Admin/Interviews';
import AdminAnalytics from './pages/Admin/Analytics';
import AdminSettings from './pages/Admin/Settings';
import AdminPipeline from './pages/Admin/Pipeline';
import AdminAIScreening from './pages/Admin/AIScreening';
import AdminInterviewTranscripts from './pages/Admin/InterviewTranscripts';

// Candidate Pages
import CandidateDashboard from './pages/Candidate/Dashboard';
import CandidateJobs from './pages/Candidate/Jobs';
import CandidateApplications from './pages/Candidate/Applications';
import CandidateProfile from './pages/Candidate/Profile';
import CandidateChat from './pages/Candidate/Chat';
import CandidateAITools from './pages/Candidate/AITools';
import CandidateAIInterview from './pages/Candidate/AIInterview';
import CandidateVideoInterview from './pages/Candidate/VideoInterview';

/* ── Route guards ───────────────────────────────────────── */
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'admin' | 'candidate';
}> = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} replace />;
  }
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} replace />;
  return <>{children}</>;
};

/* ── Routes ─────────────────────────────────────────────── */
function AppRoutes() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Landing />} />

      {/* Auth */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* ═══ ADMIN PORTAL ═══ */}
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="candidates" element={<AdminCandidates />} />
        <Route path="pipeline" element={<AdminPipeline />} />
        <Route path="ai-screening" element={<AdminAIScreening />} />
        <Route path="interviews" element={<AdminInterviews />} />
        <Route path="transcripts" element={<AdminInterviewTranscripts />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* ═══ CANDIDATE PORTAL ═══ */}
      <Route
        path="/candidate"
        element={<ProtectedRoute allowedRole="candidate"><CandidateLayout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="jobs" element={<CandidateJobs />} />
        <Route path="applications" element={<CandidateApplications />} />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="chat" element={<CandidateChat />} />
        <Route path="ai-tools" element={<CandidateAITools />} />
        <Route path="interview" element={<CandidateAIInterview />} />
        <Route path="video-interview" element={<CandidateVideoInterview />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* ── App ─────────────────────────────────────────────────── */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
