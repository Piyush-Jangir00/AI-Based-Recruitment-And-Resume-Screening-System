import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Select from '../../components/UI/Select';
import {
  generateCoverLetter,
  generateResumeImprovements,
  generateMockInterview,
  getPersonalizedJobRecommendations
} from '../../services/advancedAIService';
import { 
  Sparkles, FileText, MessageSquare, Target, 
  Briefcase, Copy, CheckCircle, Lightbulb,
  AlertCircle, Zap, BookOpen, Star
} from 'lucide-react';

const AITools: React.FC = () => {
  const { user } = useAuth();
  const { jobs, applications, getCandidateByUserId } = useData();
  const [activeTab, setActiveTab] = useState('resume');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  

  const candidateProfile = user ? getCandidateByUserId(user.id) : null;
  const activeJobs = jobs.filter(j => j.status === 'active');
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const resumeImprovements = candidateProfile 
    ? generateResumeImprovements(candidateProfile, selectedJob)
    : [];

  const jobRecommendations = candidateProfile
    ? getPersonalizedJobRecommendations(candidateProfile, jobs, applications)
    : [];

  const mockInterview = selectedJob && candidateProfile
    ? generateMockInterview(selectedJob, candidateProfile.skills)
    : null;

  const handleGenerateCoverLetter = () => {
    if (!candidateProfile || !selectedJob) return;
    
    setGenerating(true);
    setTimeout(() => {
      const letter = generateCoverLetter(candidateProfile, selectedJob);
      setCoverLetter(letter);
      setGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'resume', label: 'Resume Analysis', icon: FileText },
    { id: 'cover', label: 'Cover Letter', icon: MessageSquare },
    { id: 'recommendations', label: 'Job Match', icon: Target },
    { id: 'interview', label: 'Interview Prep', icon: BookOpen }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Sparkles className="w-7 h-7 mr-3 text-purple-600" />
          AI Career Tools
        </h1>
        <p className="text-gray-600 mt-1">Powered by AI to boost your job search</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Resume Analysis Tab */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Resume Improvement Suggestions</h2>
                <Badge variant="purple">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Analysis
                </Badge>
              </div>

              {candidateProfile ? (
                <div className="space-y-4">
                  {resumeImprovements.map((improvement, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(improvement.priority)}`}>
                            {improvement.priority}
                          </span>
                          <Badge variant="default" size="sm" className="ml-2">
                            {improvement.category}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                        <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                        {improvement.issue}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{improvement.suggestion}</p>
                      {improvement.example && (
                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                          <span className="font-medium">Example: </span>
                          {improvement.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Complete your profile to get AI suggestions</p>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Tips
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <span>Use action verbs to start bullet points</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <span>Quantify achievements with numbers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <span>Match keywords from job descriptions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <span>Keep formatting ATS-friendly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <span>Update regularly with new skills</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* Cover Letter Tab */}
      {activeTab === 'cover' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Cover Letter</h2>
            <div className="space-y-4">
              <Select
                label="Select Job"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                options={[
                  { value: '', label: 'Choose a job...' },
                  ...activeJobs.map(job => ({ value: job.id, label: job.title }))
                ]}
              />

              <Button
                onClick={handleGenerateCoverLetter}
                loading={generating}
                disabled={!selectedJobId || !candidateProfile}
                icon={<Sparkles className="w-4 h-4" />}
                className="w-full"
              >
                Generate with AI
              </Button>

              {!candidateProfile && (
                <p className="text-sm text-orange-600 text-center">
                  Complete your profile first to generate cover letters
                </p>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Generated Cover Letter</h2>
              {coverLetter && (
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleCopy}
                    icon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              )}
            </div>
            
            {coverLetter ? (
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {coverLetter}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <p>Select a job and generate your cover letter</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Job Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Personalized Job Matches</h2>
            <Badge variant="purple">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>

          {jobRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobRecommendations.map(({ job, matchScore, reasons }) => (
                <Card key={job.id} hover>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {matchScore >= 80 && <Star className="w-5 h-5 text-yellow-400 mr-1" />}
                      <span className={`text-lg font-bold ${
                        matchScore >= 80 ? 'text-green-600' :
                        matchScore >= 60 ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        {matchScore}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {reasons.map((reason, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {reason}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-gray-500">
                      ${(job.salary.min / 1000).toFixed(0)}k - ${(job.salary.max / 1000).toFixed(0)}k
                    </span>
                    <Button size="sm">View & Apply</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Complete your profile to get personalized recommendations</p>
            </Card>
          )}
        </div>
      )}

      {/* Interview Prep Tab */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Interview Preparation</h2>
              <Select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                options={[
                  { value: '', label: 'Select a job...' },
                  ...activeJobs.map(job => ({ value: job.id, label: job.title }))
                ]}
                className="w-48"
              />
            </div>

            {mockInterview && selectedJob ? (
              <div className="space-y-6">
                {/* Preparation Tips */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-3">📋 Preparation Checklist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mockInterview.preparationTips.map((tip, i) => (
                      <div key={i} className="flex items-center text-sm text-blue-800">
                        <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Questions */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">🎯 Practice Questions</h3>
                  <div className="space-y-4">
                    {mockInterview.questions.map((q, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="info">{q.category}</Badge>
                          <span className="text-sm text-gray-500">~{q.tips.length} tips</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-3">{q.question}</h4>
                        
                        <div className="space-y-2 mb-3">
                          <p className="text-sm text-gray-500 font-medium">Tips:</p>
                          {q.tips.map((tip, i) => (
                            <div key={i} className="flex items-start text-sm text-gray-600">
                              <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                              {tip}
                            </div>
                          ))}
                        </div>

                        <details className="text-sm">
                          <summary className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium">
                            View sample answer
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded text-gray-700">
                            {q.sampleAnswer}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company Research */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-3">🔍 Research Checklist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mockInterview.companyResearch.map((item, i) => (
                      <div key={i} className="flex items-center text-sm text-purple-800">
                        <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a job to get personalized interview questions</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default AITools;
