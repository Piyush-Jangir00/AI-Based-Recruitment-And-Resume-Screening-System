import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Progress from '../../components/UI/Progress';
import { Application, ApplicationStatus } from '../../types';
import { 
  Search, Filter, Mail, Phone, MapPin, Download,
  Eye, CheckCircle, XCircle, Calendar, Star, 
  TrendingUp, Award, BookOpen, Briefcase, ChevronDown, ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';

const AdminCandidates: React.FC = () => {
  const { applications, updateApplication, jobs, candidates, addInterview, addNotification } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  // Interview scheduling form
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'video' as 'phone' | 'video' | 'onsite',
    interviewers: ''
  });

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesJob = jobFilter === 'all' || app.jobId === jobFilter;
      return matchesSearch && matchesStatus && matchesJob;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.aiScore.overallScore - a.aiScore.overallScore;
      if (sortBy === 'date') return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      return 0;
    });

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    updateApplication(appId, { status: newStatus });
    
    const app = applications.find(a => a.id === appId);
    if (app) {
      addNotification({
        userId: app.candidateId,
        title: 'Application Update',
        message: `Your application status has been updated to: ${newStatus}`,
        type: newStatus === 'rejected' ? 'warning' : 'success',
        read: false
      });
    }
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;

    const job = jobs.find(j => j.id === selectedApplication.jobId);
    const scheduledAt = new Date(`${interviewData.date}T${interviewData.time}`).toISOString();

    addInterview({
      applicationId: selectedApplication.id,
      candidateId: selectedApplication.candidateId,
      candidateName: selectedApplication.candidateName,
      jobId: selectedApplication.jobId,
      jobTitle: job?.title || 'Unknown',
      scheduledAt,
      duration: interviewData.duration,
      type: interviewData.type,
      interviewers: interviewData.interviewers.split(',').map(s => s.trim()),
      status: 'scheduled',
      result: 'pending'
    });

    handleStatusChange(selectedApplication.id, 'interview');
    setShowScheduleModal(false);
    setSelectedApplication(null);
    setInterviewData({
      date: '',
      time: '',
      duration: 60,
      type: 'video',
      interviewers: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default'; label: string }> = {
      pending: { variant: 'warning', label: 'Pending Review' },
      reviewed: { variant: 'info', label: 'Reviewed' },
      shortlisted: { variant: 'purple', label: 'Shortlisted' },
      interview: { variant: 'info', label: 'Interview' },
      hired: { variant: 'success', label: 'Hired' },
      rejected: { variant: 'danger', label: 'Rejected' }
    };
    const { variant, label } = config[status] || { variant: 'default', label: status };
    return <Badge variant={variant}>{label}</Badge>;
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <p className="text-gray-600 mt-1">Review and manage job applications</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'reviewed', label: 'Reviewed' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'interview', label: 'Interview' },
              { value: 'hired', label: 'Hired' },
              { value: 'rejected', label: 'Rejected' }
            ]}
          />
          <Select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Jobs' },
              ...jobs.map(job => ({ value: job.id, label: job.title }))
            ]}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'score', label: 'Sort by AI Score' },
              { value: 'date', label: 'Sort by Date' }
            ]}
          />
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', count: applications.length, color: 'bg-gray-100 text-gray-700' },
          { label: 'Pending', count: applications.filter(a => a.status === 'pending').length, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Shortlisted', count: applications.filter(a => a.status === 'shortlisted').length, color: 'bg-purple-100 text-purple-700' },
          { label: 'Interview', count: applications.filter(a => a.status === 'interview').length, color: 'bg-blue-100 text-blue-700' },
          { label: 'Hired', count: applications.filter(a => a.status === 'hired').length, color: 'bg-green-100 text-green-700' }
        ].map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-lg p-4 text-center`}>
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredApplications.map(app => {
          const job = jobs.find(j => j.id === app.jobId);
          const candidate = candidates.find(c => c.id === app.candidateId);
          const isExpanded = expandedCard === app.id;

          return (
            <Card key={app.id} className="overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Candidate Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {app.candidateName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.candidateName}</h3>
                    <p className="text-sm text-gray-500">{job?.title || 'Unknown Position'}</p>
                    <p className="text-xs text-gray-400 mt-1">Applied {format(new Date(app.appliedAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                {/* AI Score */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(app.aiScore.overallScore)}`}>
                      {app.aiScore.overallScore}%
                    </div>
                    <div className="text-xs text-gray-500">AI Score</div>
                  </div>
                  <Progress value={app.aiScore.overallScore} size="lg" className="w-24 hidden md:block" />
                </div>

                {/* Status & Actions */}
                <div className="flex items-center space-x-3">
                  {getStatusBadge(app.status)}
                  
                  <div className="flex items-center space-x-2">
                    {app.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleStatusChange(app.id, 'shortlisted')}
                          icon={<CheckCircle className="w-4 h-4" />}
                        >
                          Shortlist
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          icon={<XCircle className="w-4 h-4" />}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {app.status === 'shortlisted' && (
                      <Button 
                        size="sm"
                        onClick={() => { setSelectedApplication(app); setShowScheduleModal(true); }}
                        icon={<Calendar className="w-4 h-4" />}
                      >
                        Schedule
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setExpandedCard(isExpanded ? null : app.id)}
                      icon={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Contact Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {app.candidateEmail}
                        </div>
                        {candidate?.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {candidate.phone}
                          </div>
                        )}
                        {candidate?.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {candidate.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Score Breakdown */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        AI Score Breakdown
                      </h4>
                      <div className="space-y-3">
                        {[
                          { label: 'Skills Match', value: app.aiScore.skillMatch, icon: TrendingUp },
                          { label: 'Experience', value: app.aiScore.experienceMatch, icon: Briefcase },
                          { label: 'Education', value: app.aiScore.educationMatch, icon: BookOpen },
                          { label: 'Certifications', value: app.aiScore.certificationMatch, icon: Award }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <item.icon className="w-4 h-4 mr-2 text-gray-400" />
                              {item.label}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${getScoreColor(item.value)}`}>{item.value}%</span>
                              <Progress value={item.value} size="sm" className="w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills & Recommendations */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Skills Analysis</h4>
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Matched Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {app.aiScore.matchedSkills.map((skill, i) => (
                            <Badge key={i} variant="success" size="sm">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      {app.aiScore.missingSkills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Missing Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {app.aiScore.missingSkills.map((skill, i) => (
                              <Badge key={i} variant="danger" size="sm">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">AI Recommendations</p>
                        <ul className="space-y-1">
                          {app.aiScore.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-gray-600">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 space-x-3">
                    <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
                      Download Resume
                    </Button>
                    <Button variant="outline" size="sm" icon={<Eye className="w-4 h-4" />}>
                      View Full Profile
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <Card className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
        </Card>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => { setShowScheduleModal(false); setSelectedApplication(null); }}
        title="Schedule Interview"
        size="md"
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          {selectedApplication && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-gray-900">{selectedApplication.candidateName}</p>
              <p className="text-sm text-gray-500">
                {jobs.find(j => j.id === selectedApplication.jobId)?.title}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={interviewData.date}
              onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
              required
            />
            <Input
              label="Time"
              type="time"
              value={interviewData.time}
              onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Interview Type"
              value={interviewData.type}
              onChange={(e) => setInterviewData({ ...interviewData, type: e.target.value as any })}
              options={[
                { value: 'video', label: 'Video Call' },
                { value: 'phone', label: 'Phone' },
                { value: 'onsite', label: 'On-site' }
              ]}
            />
            <Select
              label="Duration"
              value={String(interviewData.duration)}
              onChange={(e) => setInterviewData({ ...interviewData, duration: parseInt(e.target.value) })}
              options={[
                { value: '30', label: '30 minutes' },
                { value: '45', label: '45 minutes' },
                { value: '60', label: '1 hour' },
                { value: '90', label: '1.5 hours' }
              ]}
            />
          </div>

          <Input
            label="Interviewers (comma-separated)"
            value={interviewData.interviewers}
            onChange={(e) => setInterviewData({ ...interviewData, interviewers: e.target.value })}
            placeholder="e.g. John Smith, Jane Doe"
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={<Calendar className="w-4 h-4" />}>
              Schedule Interview
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCandidates;
