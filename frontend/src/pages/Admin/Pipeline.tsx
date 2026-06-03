import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Select from '../../components/UI/Select';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import KanbanBoard from '../../components/Kanban/KanbanBoard';
import CandidateComparison from '../../components/Comparison/CandidateComparison';
import SkillRadarChart from '../../components/Charts/SkillRadarChart';
import { Application } from '../../types';
import { generateAIResumeAnalysis } from '../../services/advancedAIService';
import { 
  LayoutGrid, GitBranch, Users, Filter,
  Sparkles, TrendingUp, Award, Briefcase, CheckCircle, XCircle
} from 'lucide-react';

const Pipeline: React.FC = () => {
  const { jobs, applications, candidates } = useData();
  const [viewMode, setViewMode] = useState<'kanban' | 'comparison'>('kanban');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const activeJobs = jobs.filter(j => j.status === 'active');
  
  const filteredApplications = selectedJob === 'all' 
    ? applications 
    : applications.filter(a => a.jobId === selectedJob);

  const currentJob = selectedJob !== 'all' ? jobs.find(j => j.id === selectedJob) : null;

  const handleViewCandidate = (app: Application) => {
    setSelectedApp(app);
    setShowAnalysis(true);
  };

  const getCandidate = (candidateId: string) => {
    return candidates.find(c => c.id === candidateId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <GitBranch className="w-7 h-7 mr-3 text-indigo-600" />
            Recruitment Pipeline
          </h1>
          <p className="text-gray-600 mt-1">Drag and drop candidates through your hiring stages</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            options={[
              { value: 'all', label: 'All Jobs' },
              ...activeJobs.map(job => ({ value: job.id, label: job.title }))
            ]}
            className="w-48"
          />
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'kanban' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'comparison' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
              }`}
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { status: 'pending', label: 'New', count: filteredApplications.filter(a => a.status === 'pending').length, color: 'bg-yellow-100 text-yellow-700' },
          { status: 'reviewed', label: 'Reviewed', count: filteredApplications.filter(a => a.status === 'reviewed').length, color: 'bg-blue-100 text-blue-700' },
          { status: 'shortlisted', label: 'Shortlisted', count: filteredApplications.filter(a => a.status === 'shortlisted').length, color: 'bg-purple-100 text-purple-700' },
          { status: 'interview', label: 'Interview', count: filteredApplications.filter(a => a.status === 'interview').length, color: 'bg-indigo-100 text-indigo-700' },
          { status: 'hired', label: 'Hired', count: filteredApplications.filter(a => a.status === 'hired').length, color: 'bg-green-100 text-green-700' },
          { status: 'rejected', label: 'Rejected', count: filteredApplications.filter(a => a.status === 'rejected').length, color: 'bg-red-100 text-red-700' }
        ].map(stat => (
          <div key={stat.status} className={`${stat.color} rounded-lg p-3 text-center`}>
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <Card padding="sm">
        {viewMode === 'kanban' ? (
          <div className="p-4">
            <KanbanBoard 
              applications={filteredApplications}
              onViewCandidate={handleViewCandidate}
            />
          </div>
        ) : (
          <div className="p-4">
            {currentJob ? (
              <CandidateComparison
                applications={filteredApplications}
                candidates={candidates}
                job={currentJob}
              />
            ) : (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Select a Job</h3>
                <p className="text-gray-500 mt-1">Choose a specific job to compare candidates</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* AI Analysis Modal */}
      <Modal
        isOpen={showAnalysis}
        onClose={() => { setShowAnalysis(false); setSelectedApp(null); }}
        title="AI Candidate Analysis"
        size="xl"
      >
        {selectedApp && (() => {
          const candidate = getCandidate(selectedApp.candidateId);
          const job = jobs.find(j => j.id === selectedApp.jobId);
          
          if (!candidate || !job) return null;
          
          const analysis = generateAIResumeAnalysis(candidate, job);

          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-gray-500">{job.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={
                      analysis.hiringRecommendation === 'Strong Hire' ? 'success' :
                      analysis.hiringRecommendation === 'Hire' ? 'info' :
                      analysis.hiringRecommendation === 'Maybe' ? 'warning' : 'danger'
                    }
                    size="md"
                  >
                    {analysis.hiringRecommendation}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    Confidence: {analysis.confidenceScore}%
                  </p>
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">AI Summary</h4>
                    <p className="text-gray-700">{analysis.summary}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths & Weaknesses */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-600 bg-green-50 p-2 rounded">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-600 bg-red-50 p-2 rounded">
                          <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Skill Radar Chart */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Skill Analysis</h4>
                  <SkillRadarChart candidate={candidate} job={job} />
                </div>
              </div>

              {/* Skills Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Matched Skills ({analysis.skillsAnalysis.matched.length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {analysis.skillsAnalysis.matched.map((skill, i) => (
                      <Badge key={i} variant="success" size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h5 className="font-medium text-red-900 mb-2 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Missing Skills ({analysis.skillsAnalysis.missing.length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {analysis.skillsAnalysis.missing.map((skill, i) => (
                      <Badge key={i} variant="danger" size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    Additional Skills ({analysis.skillsAnalysis.additional.length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {analysis.skillsAnalysis.additional.map((skill, i) => (
                      <Badge key={i} variant="info" size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experience & Education */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Experience Analysis
                  </h5>
                  <div className="space-y-1 text-sm">
                    <p>Total: <span className="font-medium">{analysis.experienceAnalysis.totalYears} years</span></p>
                    <p>Relevant: <span className="font-medium">{analysis.experienceAnalysis.relevantYears} years</span></p>
                    <p>Level: <span className="font-medium">{analysis.experienceAnalysis.seniorityLevel}</span></p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Education Analysis
                  </h5>
                  <div className="space-y-1 text-sm">
                    <p>Level: <span className="font-medium">{analysis.educationAnalysis.level}</span></p>
                    <p>Relevance: <span className="font-medium">{analysis.educationAnalysis.relevance}</span></p>
                    <p>Score: <span className="font-medium">{Math.round(analysis.educationAnalysis.score)}%</span></p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAnalysis(false)}>
                  Close
                </Button>
                <Button>
                  Schedule Interview
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default Pipeline;
