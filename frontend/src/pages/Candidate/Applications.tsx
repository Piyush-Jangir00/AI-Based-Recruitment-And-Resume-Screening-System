import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Select from '../../components/UI/Select';
import Modal from '../../components/UI/Modal';
import Progress from '../../components/UI/Progress';
import { Application } from '../../types';
import { 
  Briefcase, Clock, CheckCircle, XCircle, Calendar, 
  Star, Zap, ChevronRight, TrendingUp, Award, BookOpen,
  Target, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

const CandidateApplications: React.FC = () => {
  const { user } = useAuth();
  const { jobs, applications, interviews, getCandidateByUserId } = useData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const candidateProfile = user ? getCandidateByUserId(user.id) : null;
  const myApplications = candidateProfile 
    ? applications.filter(a => a.candidateId === candidateProfile.id)
    : [];

  const filteredApplications = myApplications.filter(app => 
    statusFilter === 'all' || app.status === statusFilter
  );

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { 
      variant: 'success' | 'warning' | 'danger' | 'info' | 'purple'; 
      label: string;
      icon: React.ElementType;
      color: string;
    }> = {
      pending: { variant: 'warning', label: 'Under Review', icon: Clock, color: 'text-yellow-500' },
      reviewed: { variant: 'info', label: 'Reviewed', icon: CheckCircle, color: 'text-blue-500' },
      shortlisted: { variant: 'purple', label: 'Shortlisted', icon: Star, color: 'text-purple-500' },
      interview: { variant: 'info', label: 'Interview Scheduled', icon: Calendar, color: 'text-blue-500' },
      hired: { variant: 'success', label: 'Hired!', icon: CheckCircle, color: 'text-green-500' },
      rejected: { variant: 'danger', label: 'Not Selected', icon: XCircle, color: 'text-red-500' }
    };
    return configs[status] || { variant: 'default' as 'info', label: status, icon: Clock, color: 'text-gray-500' };
  };

  const getInterviewForApplication = (appId: string) => {
    return interviews.find(i => i.applicationId === appId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track and manage your job applications</p>
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Applications' },
            { value: 'pending', label: 'Under Review' },
            { value: 'shortlisted', label: 'Shortlisted' },
            { value: 'interview', label: 'Interview' },
            { value: 'hired', label: 'Hired' },
            { value: 'rejected', label: 'Not Selected' }
          ]}
          className="w-48"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', count: myApplications.length, color: 'bg-gray-100 text-gray-700' },
          { label: 'Under Review', count: myApplications.filter(a => a.status === 'pending').length, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Shortlisted', count: myApplications.filter(a => a.status === 'shortlisted').length, color: 'bg-purple-100 text-purple-700' },
          { label: 'Interview', count: myApplications.filter(a => a.status === 'interview').length, color: 'bg-blue-100 text-blue-700' },
          { label: 'Hired', count: myApplications.filter(a => a.status === 'hired').length, color: 'bg-green-100 text-green-700' }
        ].map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-lg p-4 text-center`}>
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            const interview = getInterviewForApplication(app.id);
            const statusConfig = getStatusConfig(app.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={app.id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Job Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{job?.title || 'Unknown Position'}</h3>
                      <p className="text-sm text-gray-500">{job?.department} • {job?.location}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Applied {format(new Date(app.appliedAt), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Status & Score */}
                  <div className="flex items-center space-x-6">
                    {/* AI Score */}
                    <div className="text-center">
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className={`text-xl font-bold ${getScoreColor(app.aiScore.overallScore)}`}>
                          {app.aiScore.overallScore}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Match Score</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                      icon={<ChevronRight className="w-4 h-4" />}
                    >
                      Details
                    </Button>
                  </div>
                </div>

                {/* Interview Info if scheduled */}
                {interview && interview.status === 'scheduled' && (
                  <div className="mt-4 pt-4 border-t bg-blue-50 -mx-6 -mb-6 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Interview Scheduled</p>
                          <p className="text-sm text-blue-700">
                            {format(new Date(interview.scheduledAt), 'EEEE, MMMM d')} at {format(new Date(interview.scheduledAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="info">{interview.type} call</Badge>
                    </div>
                  </div>
                )}

                {/* Hired celebration */}
                {app.status === 'hired' && (
                  <div className="mt-4 pt-4 border-t bg-green-50 -mx-6 -mb-6 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        🎉
                      </div>
                      <div>
                        <p className="font-medium text-green-900">Congratulations!</p>
                        <p className="text-sm text-green-700">
                          You've been selected for this position. Expect to hear from HR soon.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
            <p className="text-gray-500 mt-1">Start applying to jobs to see them here</p>
            <Button className="mt-4" onClick={() => window.location.href = '/candidate/jobs'}>
              Browse Jobs
            </Button>
          </Card>
        )}
      </div>

      {/* Application Details Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Details"
        size="lg"
      >
        {selectedApp && (() => {
          const job = jobs.find(j => j.id === selectedApp.jobId);
          const statusConfig = getStatusConfig(selectedApp.status);
          
          return (
            <div className="space-y-6">
              {/* Job Header */}
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{job?.title}</h3>
                  <p className="text-gray-500">{job?.department} • {job?.location}</p>
                </div>
                <Badge variant={statusConfig.variant} size="md">{statusConfig.label}</Badge>
              </div>

              {/* AI Score Breakdown */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                    AI Match Analysis
                  </h4>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedApp.aiScore.overallScore)}`}>
                    {selectedApp.aiScore.overallScore}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Skills Match', value: selectedApp.aiScore.skillMatch, icon: Target },
                    { label: 'Experience', value: selectedApp.aiScore.experienceMatch, icon: TrendingUp },
                    { label: 'Education', value: selectedApp.aiScore.educationMatch, icon: BookOpen },
                    { label: 'Certifications', value: selectedApp.aiScore.certificationMatch, icon: Award }
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <item.icon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{item.label}</span>
                        </div>
                        <span className={`font-bold ${getScoreColor(item.value)}`}>{item.value}%</span>
                      </div>
                      <Progress value={item.value} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Matched Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.aiScore.matchedSkills.map((skill, i) => (
                      <Badge key={i} variant="success" size="sm">{skill}</Badge>
                    ))}
                    {selectedApp.aiScore.matchedSkills.length === 0 && (
                      <p className="text-sm text-gray-500">No skills matched</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                    Skills to Develop
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.aiScore.missingSkills.map((skill, i) => (
                      <Badge key={i} variant="warning" size="sm">{skill}</Badge>
                    ))}
                    {selectedApp.aiScore.missingSkills.length === 0 && (
                      <p className="text-sm text-gray-500">All skills matched!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">AI Insights</h4>
                <ul className="space-y-2">
                  {selectedApp.aiScore.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Application Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                    <span className="text-gray-600">Applied on {format(new Date(selectedApp.appliedAt), 'MMMM d, yyyy')}</span>
                  </div>
                  {selectedApp.status !== 'pending' && (
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3" />
                      <span className="text-gray-600">Application reviewed by HR</span>
                    </div>
                  )}
                  {['shortlisted', 'interview', 'hired'].includes(selectedApp.status) && (
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3" />
                      <span className="text-gray-600">Shortlisted for interview</span>
                    </div>
                  )}
                  {selectedApp.status === 'hired' && (
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                      <span className="text-gray-600 font-medium">🎉 Offer extended!</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default CandidateApplications;
