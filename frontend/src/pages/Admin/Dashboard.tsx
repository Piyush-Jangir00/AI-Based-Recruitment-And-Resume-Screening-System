import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Progress from '../../components/UI/Progress';
import { 
  Briefcase, Users, UserCheck, Calendar, TrendingUp, 
  ArrowUpRight, Clock, Star, ChevronRight 
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { jobs, applications, interviews, candidates } = useData();

  // Calculate statistics
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const totalApplications = applications.length;
  const shortlistedCandidates = applications.filter(a => a.status === 'shortlisted').length;
  const hiredCandidates = applications.filter(a => a.status === 'hired').length;
  const pendingReview = applications.filter(a => a.status === 'pending').length;
  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled').length;

  // Recent applications
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  // Top candidates by AI score
  const topCandidates = [...applications]
    .sort((a, b) => b.aiScore.overallScore - a.aiScore.overallScore)
    .slice(0, 5);

  const stats = [
    { 
      label: 'Active Jobs', 
      value: activeJobs, 
      icon: Briefcase, 
      color: 'bg-blue-500',
      change: '+2 this week'
    },
    { 
      label: 'Total Applications', 
      value: totalApplications, 
      icon: Users, 
      color: 'bg-purple-500',
      change: '+12 this week'
    },
    { 
      label: 'Shortlisted', 
      value: shortlistedCandidates, 
      icon: UserCheck, 
      color: 'bg-green-500',
      change: '+5 this week'
    },
    { 
      label: 'Hired', 
      value: hiredCandidates, 
      icon: Star, 
      color: 'bg-yellow-500',
      change: '+1 this month'
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
      pending: 'warning',
      reviewed: 'info',
      shortlisted: 'purple',
      interview: 'info',
      hired: 'success',
      rejected: 'danger'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your recruitment overview.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to="/admin/jobs"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Post New Job
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pending Review</h3>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{pendingReview}</div>
          <p className="text-sm text-gray-600 mt-1">Applications awaiting review</p>
          <Link to="/admin/candidates" className="text-indigo-600 text-sm mt-3 inline-flex items-center hover:text-indigo-700">
            Review now <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Upcoming Interviews</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{upcomingInterviews}</div>
          <p className="text-sm text-gray-600 mt-1">Interviews scheduled</p>
          <Link to="/admin/interviews" className="text-indigo-600 text-sm mt-3 inline-flex items-center hover:text-indigo-700">
            View calendar <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Talent Pool</h3>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{candidates.length}</div>
          <p className="text-sm text-gray-600 mt-1">Total candidates in database</p>
          <Link to="/admin/candidates" className="text-indigo-600 text-sm mt-3 inline-flex items-center hover:text-indigo-700">
            Browse all <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
            <Link to="/admin/candidates" className="text-indigo-600 text-sm hover:text-indigo-700 flex items-center">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentApplications.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                      {app.candidateName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{app.candidateName}</p>
                      <p className="text-sm text-gray-500">{job?.title || 'Unknown Position'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(app.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(app.appliedAt), 'MMM d')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top AI-Ranked Candidates */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Top AI-Ranked Candidates</h3>
            <Badge variant="purple">AI Powered</Badge>
          </div>
          <div className="space-y-4">
            {topCandidates.map((app, index) => {
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{app.candidateName}</p>
                      <p className="text-sm text-gray-500">{job?.title || 'Unknown Position'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">{app.aiScore.overallScore}%</p>
                      <p className="text-xs text-gray-500">AI Score</p>
                    </div>
                    <Progress value={app.aiScore.overallScore} size="sm" className="w-16" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Hiring Funnel */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-6">Hiring Funnel</h3>
        <div className="flex items-center justify-between space-x-4">
          {[
            { label: 'Applied', count: totalApplications, color: 'bg-blue-500' },
            { label: 'Reviewed', count: applications.filter(a => a.status === 'reviewed').length, color: 'bg-indigo-500' },
            { label: 'Shortlisted', count: shortlistedCandidates, color: 'bg-purple-500' },
            { label: 'Interview', count: applications.filter(a => a.status === 'interview').length, color: 'bg-pink-500' },
            { label: 'Hired', count: hiredCandidates, color: 'bg-green-500' },
          ].map((stage, index) => (
            <div key={index} className="flex-1 text-center">
              <div className={`h-24 ${stage.color} rounded-lg flex items-center justify-center mb-2`}
                style={{ 
                  clipPath: index === 0 ? 'polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)' : 
                            index === 4 ? 'polygon(10% 0, 100% 0, 100% 100%, 10% 100%, 0 50%)' :
                            'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)'
                }}>
                <span className="text-2xl font-bold text-white">{stage.count}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">{stage.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
