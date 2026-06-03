// User Types
export type UserRole = 'admin' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  avatar?: string;
}

// Job Types
export type JobStatus = 'active' | 'closed' | 'draft';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceMin: number;
  experienceMax: number;
  educationLevel: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  status: JobStatus;
  createdAt: string;
  deadline: string;
  applicationsCount: number;
}

// Resume & Candidate Types
export interface Education {
  degree: string;
  institution: string;
  year: number;
  gpa?: number;
}

export interface WorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export interface CandidateProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  education: Education[];
  experience: WorkExperience[];
  certifications: Certification[];
  projects: Project[];
  resumeFile?: string;
  resumeText?: string;
  createdAt: string;
  updatedAt: string;
}

// Application Types
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'hired' | 'rejected';

export interface AIScore {
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  certificationMatch: number;
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  status: ApplicationStatus;
  appliedAt: string;
  aiScore: AIScore;
  notes: string;
  resumeFile?: string;
}

// Interview Types
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';
export type InterviewResult = 'passed' | 'failed' | 'pending';

export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  scheduledAt: string;
  duration: number;
  type: 'phone' | 'video' | 'onsite';
  interviewers: string[];
  status: InterviewStatus;
  result: InterviewResult;
  feedback?: string;
  notes?: string;
}

// Analytics Types
export interface AnalyticsData {
  totalApplications: number;
  activeJobs: number;
  shortlistedCandidates: number;
  hiredCandidates: number;
  avgTimeToHire: number;
  applicationsByMonth: { month: string; count: number }[];
  applicationsByStatus: { status: string; count: number }[];
  topSkills: { skill: string; count: number }[];
  hiringFunnel: { stage: string; count: number }[];
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
