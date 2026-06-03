import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';

import Button from '../../components/UI/Button';
import { 
  Briefcase, FileText, Calendar, Star, 
  ArrowRight, Clock, CheckCircle, XCircle, Bell,
  TrendingUp, Target, Zap
} from 'lucide-react';
import { format } from 'date-fns';

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobs, applications, interviews, getCandidateByUserId, getNotificationsByUser } = useData();

  const candidateProfile = user ? getCandidateByUserId(user.id) : null;
  const myApplications = candidateProfile 
    ? applications.filter(a => a.candidateId === candidateProfile.id)
    : [];
  const myInterviews = candidateProfile
    ? interviews.filter(i => i.candidateId === candidateProfile.id && i.status === 'scheduled')
    : [];
  const notifications = user ? getNotificationsByUser(user.id).filter(n => !n.read) : [];
  const activeJobs = jobs.filter(j => j.status === 'active');

  // Calculate profile completeness
  const profileFields = candidateProfile ? [
    candidateProfile.name,
    candidateProfile.email,
    candidateProfile.phone,
    candidateProfile.summary,
    candidateProfile.skills.length > 0,
    candidateProfile.education.length > 0,
    candidateProfile.experience.length > 0
  ] : [];
  const profileCompleteness = candidateProfile 
    ? Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)
    : 0;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'purple'; label: string }> = {
      pending: { variant: 'warning', label: 'Under Review' },
      reviewed: { variant: 'info', label: 'Reviewed' },
      shortlisted: { variant: 'purple', label: 'Shortlisted' },
      interview: { variant: 'info', label: 'Interview Scheduled' },
      hired: { variant: 'success', label: 'Hired!' },
      rejected: { variant: 'danger', label: 'Not Selected' }
    };
    const { variant, label } = config[status] || { variant: 'default' as 'info', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="mt-2 text-indigo-100">
              {myApplications.length > 0 
                ? `You have ${myApplications.length} active application(s)`
                : 'Start your job search today!'}
            </p>
          </div>
          <Link to="/candidate/jobs">
            <Button className="mt-4 md:mt-0 bg-white text-indigo-600 hover:bg-indigo-50">
              Find Jobs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Applications', value: myApplications.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Interviews', value: myInterviews.length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Open Jobs', value: activeJobs.length, icon: Briefcase, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Notifications', value: notifications.length, icon: Bell, color: 'text-orange-600', bg: 'bg-orange-100' }
        ].map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Interviews */}
          {myInterviews.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
                <Badge variant="purple">{myInterviews.length} scheduled</Badge>
              </div>
              <div className="space-y-4">
                {myInterviews.map(interview => (
                  <div key={interview.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{interview.jobTitle}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(interview.scheduledAt), 'EEEE, MMM d')} at {format(new Date(interview.scheduledAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="info">{interview.type}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Applications */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
              <Link to="/candidate/applications" className="text-indigo-600 text-sm hover:text-indigo-700 flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            {myApplications.length > 0 ? (
              <div className="space-y-4">
                {myApplications.slice(0, 4).map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{job?.title || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">
                            Applied {format(new Date(app.appliedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(app.status)}
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                          AI Score: {app.aiScore.overallScore}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No applications yet</p>
                <Link to="/candidate/jobs">
                  <Button variant="outline" size="sm" className="mt-3">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Recommended Jobs */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
              <Badge variant="purple">
                <Star className="w-3 h-3 mr-1" />
                AI Matched
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeJobs.slice(0, 4).map(job => (
                <Link key={job.id} to={`/candidate/jobs`} className="block">
                  <div className="p-4 border rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all">
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium text-indigo-600">
                        ${(job.salary.min / 1000).toFixed(0)}k - ${(job.salary.max / 1000).toFixed(0)}k
                      </span>
                      <Badge size="sm">{job.type}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Completeness */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Strength</h2>
            <div className="relative pt-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={profileCompleteness >= 80 ? '#10B981' : profileCompleteness >= 50 ? '#6366F1' : '#F59E0B'}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(profileCompleteness / 100) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{profileCompleteness}%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                {profileCompleteness < 100 
                  ? 'Complete your profile to increase visibility'
                  : 'Your profile is complete! 🎉'}
              </p>
              <Link to="/candidate/profile" className="block mt-4">
                <Button variant="outline" className="w-full">
                  {profileCompleteness < 100 ? 'Complete Profile' : 'Edit Profile'}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Application Status Summary */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h2>
            <div className="space-y-3">
              {[
                { status: 'pending', icon: Clock, label: 'Under Review', color: 'text-yellow-500' },
                { status: 'shortlisted', icon: Target, label: 'Shortlisted', color: 'text-purple-500' },
                { status: 'interview', icon: Calendar, label: 'Interview', color: 'text-blue-500' },
                { status: 'hired', icon: CheckCircle, label: 'Hired', color: 'text-green-500' },
                { status: 'rejected', icon: XCircle, label: 'Not Selected', color: 'text-red-500' }
              ].map(item => {
                const count = myApplications.filter(a => a.status === item.status).length;
                return (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <item.icon className={`w-5 h-5 ${item.color} mr-2`} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Pro Tip</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Complete your profile and add relevant skills to improve your AI match score for jobs.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
