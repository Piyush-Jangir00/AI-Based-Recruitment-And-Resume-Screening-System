import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import { CandidateProfile } from '../../types';
import { 
  generateAIResumeAnalysis, 
  generateInterviewQuestions,
  analyzeInterviewFeedback,
  detectDuplicateCandidates,
  InterviewQuestion
} from '../../services/advancedAIService';
import { 
  Sparkles, Brain, MessageSquare, Users, AlertTriangle,
  CheckCircle, XCircle, Copy, RefreshCw, Target,
  Clipboard, Zap
} from 'lucide-react';

const AIScreening: React.FC = () => {
  const { jobs, applications, candidates } = useData();
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [activeTab, setActiveTab] = useState('screening');
  const [generatedQuestions, setGeneratedQuestions] = useState<InterviewQuestion[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackAnalysis, setFeedbackAnalysis] = useState<ReturnType<typeof analyzeInterviewFeedback> | null>(null);
  const [duplicates, setDuplicates] = useState<ReturnType<typeof detectDuplicateCandidates>>([]);

  const activeJobs = jobs.filter(j => j.status === 'active');
  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);
  
  const jobCandidates = selectedJobId 
    ? applications.filter(a => a.jobId === selectedJobId).map(a => {
        const candidate = candidates.find(c => c.id === a.candidateId);
        return candidate;
      }).filter(Boolean) as CandidateProfile[]
    : [];

  const handleGenerateQuestions = () => {
    if (selectedCandidate && selectedJob) {
      const questions = generateInterviewQuestions(selectedCandidate, selectedJob, 8);
      setGeneratedQuestions(questions);
    }
  };

  const handleAnalyzeFeedback = () => {
    if (feedbackText.trim()) {
      const analysis = analyzeInterviewFeedback(feedbackText);
      setFeedbackAnalysis(analysis);
    }
  };

  const handleCheckDuplicates = () => {
    if (selectedCandidate) {
      const dups = detectDuplicateCandidates(selectedCandidate, candidates.filter(c => c.id !== selectedCandidate.id));
      setDuplicates(dups);
    }
  };

  const tabs = [
    { id: 'screening', label: 'AI Screening', icon: Brain },
    { id: 'questions', label: 'Interview Questions', icon: MessageSquare },
    { id: 'feedback', label: 'Feedback Analysis', icon: Clipboard },
    { id: 'duplicates', label: 'Duplicate Detection', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Sparkles className="w-7 h-7 mr-3 text-purple-600" />
          AI Screening Tools
        </h1>
        <p className="text-gray-600 mt-1">Advanced AI-powered recruitment analysis</p>
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

      {/* AI Screening Tab */}
      {activeTab === 'screening' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Select Candidate</h3>
            <div className="space-y-4">
              <Select
                label="Job Position"
                value={selectedJobId}
                onChange={(e) => { setSelectedJobId(e.target.value); setSelectedCandidateId(''); }}
                options={[
                  { value: '', label: 'Select a job...' },
                  ...activeJobs.map(job => ({ value: job.id, label: job.title }))
                ]}
              />
              
              {selectedJobId && (
                <Select
                  label="Candidate"
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  options={[
                    { value: '', label: 'Select a candidate...' },
                    ...jobCandidates.map(c => ({ value: c.id, label: c.name }))
                  ]}
                />
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">AI Resume Analysis</h3>
              <Badge variant="purple">
                <Zap className="w-3 h-3 mr-1" />
                LLM Analysis
              </Badge>
            </div>

            {selectedCandidate && selectedJob ? (() => {
              const analysis = generateAIResumeAnalysis(selectedCandidate, selectedJob);
              
              return (
                <div className="space-y-6">
                  {/* Recommendation Banner */}
                  <div className={`p-4 rounded-lg ${
                    analysis.hiringRecommendation === 'Strong Hire' ? 'bg-green-50 border border-green-200' :
                    analysis.hiringRecommendation === 'Hire' ? 'bg-blue-50 border border-blue-200' :
                    analysis.hiringRecommendation === 'Maybe' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
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
                        <p className="text-sm text-gray-600 mt-1">{analysis.overallAssessment}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{analysis.confidenceScore}%</div>
                        <p className="text-xs text-gray-500">Confidence</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-purple-500" />
                      AI Summary
                    </h4>
                    <p className="text-gray-700">{analysis.summary}</p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="flex items-start text-sm bg-green-50 p-2 rounded">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                        Weaknesses
                      </h4>
                      <ul className="space-y-2">
                        {analysis.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start text-sm bg-red-50 p-2 rounded">
                            <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Experience Analysis */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-700">{analysis.experienceAnalysis.totalYears}</div>
                      <p className="text-sm text-blue-600">Total Years</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-purple-700">{analysis.experienceAnalysis.seniorityLevel}</div>
                      <p className="text-sm text-purple-600">Seniority Level</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">{analysis.skillsAnalysis.matched.length}</div>
                      <p className="text-sm text-green-600">Skills Matched</p>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="text-center py-12 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-4" />
                <p>Select a job and candidate to analyze</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Interview Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Generate Interview Questions</h3>
              <div className="flex space-x-3">
                <Select
                  value={selectedJobId}
                  onChange={(e) => { setSelectedJobId(e.target.value); setSelectedCandidateId(''); }}
                  options={[
                    { value: '', label: 'Select job...' },
                    ...activeJobs.map(job => ({ value: job.id, label: job.title }))
                  ]}
                  className="w-48"
                />
                {selectedJobId && (
                  <Select
                    value={selectedCandidateId}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                    options={[
                      { value: '', label: 'Select candidate...' },
                      ...jobCandidates.map(c => ({ value: c.id, label: c.name }))
                    ]}
                    className="w-48"
                  />
                )}
                <Button 
                  onClick={handleGenerateQuestions}
                  disabled={!selectedCandidate || !selectedJob}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Generate
                </Button>
              </div>
            </div>

            {generatedQuestions.length > 0 ? (
              <div className="space-y-4">
                {generatedQuestions.map((q, index) => (
                  <div key={q.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-medium">
                          {index + 1}
                        </span>
                        <Badge variant={
                          q.category === 'technical' ? 'info' :
                          q.category === 'behavioral' ? 'purple' :
                          q.category === 'situational' ? 'warning' : 'default'
                        }>
                          {q.category}
                        </Badge>
                        <Badge variant={
                          q.difficulty === 'hard' ? 'danger' :
                          q.difficulty === 'medium' ? 'warning' : 'success'
                        } size="sm">
                          {q.difficulty}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">~{q.expectedDuration} min</span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{q.question}</h4>
                    
                    {q.followUp && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Follow-up: </span>
                        {q.followUp}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs text-gray-500">Evaluate:</span>
                      {q.evaluationCriteria.map((criteria, i) => (
                        <Badge key={i} variant="default" size="sm">{criteria}</Badge>
                      ))}
                    </div>

                    <div className="flex justify-end mt-3">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(q.question)}
                        icon={<Copy className="w-4 h-4" />}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <p>Generate customized interview questions based on candidate profile</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Feedback Analysis Tab */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Interview Feedback</h3>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={8}
              placeholder="Paste interview feedback notes here...

Example:
The candidate demonstrated strong technical skills in React and TypeScript. Good communication and problem-solving abilities. Some concerns about AWS experience - may need additional training. Overall a strong candidate who could contribute quickly."
            />
            <Button 
              onClick={handleAnalyzeFeedback}
              className="mt-4"
              disabled={!feedbackText.trim()}
              icon={<Brain className="w-4 h-4" />}
            >
              Analyze with AI
            </Button>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">AI Analysis</h3>
            
            {feedbackAnalysis ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  feedbackAnalysis.recommendation === 'Strong Hire' ? 'bg-green-50' :
                  feedbackAnalysis.recommendation === 'Hire' ? 'bg-blue-50' :
                  feedbackAnalysis.recommendation === 'Hold' ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={
                        feedbackAnalysis.recommendation === 'Strong Hire' ? 'success' :
                        feedbackAnalysis.recommendation === 'Hire' ? 'info' :
                        feedbackAnalysis.recommendation === 'Hold' ? 'warning' : 'danger'
                      }
                      size="md"
                    >
                      {feedbackAnalysis.recommendation}
                    </Badge>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="font-medium">{feedbackAnalysis.fitScore}% Fit</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600">{feedbackAnalysis.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                    {feedbackAnalysis.keyStrengths.map((s, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-600 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {s}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Improvements</h4>
                    {feedbackAnalysis.areasForImprovement.map((a, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-600 mb-1">
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                  <ul className="space-y-1">
                    {feedbackAnalysis.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs mr-2">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Clipboard className="w-12 h-12 mx-auto mb-4" />
                <p>Enter feedback to analyze</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Duplicate Detection Tab */}
      {activeTab === 'duplicates' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Duplicate Candidate Detection</h3>
            <div className="flex space-x-3">
              <Select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                options={[
                  { value: '', label: 'Select candidate...' },
                  ...candidates.map(c => ({ value: c.id, label: c.name }))
                ]}
                className="w-64"
              />
              <Button 
                onClick={handleCheckDuplicates}
                disabled={!selectedCandidateId}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Check Duplicates
              </Button>
            </div>
          </div>

          {duplicates.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="text-yellow-800">Found {duplicates.length} potential duplicate(s)</span>
              </div>

              {duplicates.map((dup, index) => {
                const dupCandidate = candidates.find(c => c.id === dup.candidateId);
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {dupCandidate?.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{dupCandidate?.name}</h4>
                          <p className="text-sm text-gray-500">{dupCandidate?.email}</p>
                        </div>
                      </div>
                      <Badge variant={dup.matchConfidence >= 70 ? 'danger' : 'warning'}>
                        {dup.matchConfidence}% Match
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Matched on:</span>
                      {dup.matchedFields.map((field, i) => (
                        <Badge key={i} variant="default" size="sm">{field}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : selectedCandidateId ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No duplicates found for this candidate</p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <p>Select a candidate to check for duplicates</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIScreening;
