import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Select from '../../components/UI/Select';
import Modal from '../../components/UI/Modal';
import Progress from '../../components/UI/Progress';
import {
  InterviewSession,
  getInterviewSessions,
  getInterviewSessionsByJob
} from '../../services/interviewAssistantService';
import { 
  FileText, Calendar, Clock, User, Bot, 
  MessageSquare, Star, TrendingUp, Award,
  CheckCircle, XCircle, Target, Download
} from 'lucide-react';
import { format } from 'date-fns';

const InterviewTranscripts: React.FC = () => {
  const { jobs } = useData();
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  
  const allSessions = getInterviewSessions();
  
  const filteredSessions = selectedJobId === 'all'
    ? allSessions
    : getInterviewSessionsByJob(selectedJobId);
  
  const completedSessions = filteredSessions.filter(s => s.status === 'completed');

  

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 65) return 'bg-blue-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const exportTranscript = (session: InterviewSession) => {
    const content = session.messages.map(m => 
      `[${format(new Date(m.timestamp), 'h:mm a')}] ${m.role === 'assistant' ? 'AI Assistant' : session.candidateName}:\n${m.content}\n`
    ).join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-${session.candidateName.replace(' ', '_')}-${format(new Date(session.startedAt), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-7 h-7 mr-3 text-indigo-600" />
            AI Interview Transcripts
          </h1>
          <p className="text-gray-600 mt-1">Review AI-conducted candidate interviews</p>
        </div>
        <Select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          options={[
            { value: 'all', label: 'All Positions' },
            ...jobs.map(job => ({ value: job.id, label: job.title }))
          ]}
          className="w-64"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{filteredSessions.length}</p>
              <p className="text-sm text-blue-600">Total Interviews</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-700">{completedSessions.length}</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-purple-700">
                {completedSessions.filter(s => s.evaluation?.recommendation === 'Strong Hire' || s.evaluation?.recommendation === 'Hire').length}
              </p>
              <p className="text-sm text-purple-600">Recommended</p>
            </div>
          </div>
        </Card>
        <Card className="bg-indigo-50">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="text-2xl font-bold text-indigo-700">
                {completedSessions.length > 0 
                  ? Math.round(completedSessions.reduce((acc, s) => acc + (s.evaluation?.overallScore || 0), 0) / completedSessions.length)
                  : 0}%
              </p>
              <p className="text-sm text-indigo-600">Avg Score</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Interview List */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Sessions</h2>
        
        {filteredSessions.length > 0 ? (
          <div className="space-y-4">
            {filteredSessions.map(session => {
              
              return (
                <div 
                  key={session.id} 
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {session.candidateName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{session.candidateName}</h4>
                        <p className="text-sm text-gray-500">{session.jobTitle}</p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(session.startedAt), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {format(new Date(session.startedAt), 'h:mm a')}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {session.messages.length} messages
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={session.status === 'completed' ? 'success' : session.status === 'in-progress' ? 'warning' : 'danger'}>
                        {session.status}
                      </Badge>
                      
                      {session.evaluation && (
                        <div className="mt-2">
                          <div className={`text-2xl font-bold ${getScoreColor(session.evaluation.overallScore)}`}>
                            {session.evaluation.overallScore}%
                          </div>
                          <Badge 
                            variant={
                              session.evaluation.recommendation === 'Strong Hire' ? 'success' :
                              session.evaluation.recommendation === 'Hire' ? 'info' :
                              session.evaluation.recommendation === 'Maybe' ? 'warning' : 'danger'
                            }
                            size="sm"
                          >
                            {session.evaluation.recommendation}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {session.evaluation && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-5 gap-4">
                      {[
                        { label: 'Technical', score: session.evaluation.technicalSkills },
                        { label: 'Problem Solving', score: session.evaluation.problemSolving },
                        { label: 'Communication', score: session.evaluation.communication },
                        { label: 'Experience', score: session.evaluation.experience },
                        { label: 'Culture Fit', score: session.evaluation.culturalFit }
                      ].map((item, i) => (
                        <div key={i} className="text-center">
                          <div className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                            {item.score}%
                          </div>
                          <p className="text-xs text-gray-500">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Interview Transcripts</h3>
            <p className="text-gray-500 mt-1">AI interviews will appear here once candidates complete them</p>
          </div>
        )}
      </Card>

      {/* Transcript Modal */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title="Interview Transcript"
        size="xl"
      >
        {selectedSession && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                  {selectedSession.candidateName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedSession.candidateName}</h3>
                  <p className="text-gray-500">{selectedSession.jobTitle}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {format(new Date(selectedSession.startedAt), 'MMMM d, yyyy')} at {format(new Date(selectedSession.startedAt), 'h:mm a')}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportTranscript(selectedSession)}
                icon={<Download className="w-4 h-4" />}
              >
                Export
              </Button>
            </div>

            {/* Evaluation Summary */}
            {selectedSession.evaluation && (
              <div className={`rounded-lg p-4 ${getScoreBgColor(selectedSession.evaluation.overallScore)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Badge 
                      variant={
                        selectedSession.evaluation.recommendation === 'Strong Hire' ? 'success' :
                        selectedSession.evaluation.recommendation === 'Hire' ? 'info' :
                        selectedSession.evaluation.recommendation === 'Maybe' ? 'warning' : 'danger'
                      }
                      size="md"
                    >
                      {selectedSession.evaluation.recommendation}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">{selectedSession.evaluation.summary}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getScoreColor(selectedSession.evaluation.overallScore)}`}>
                      {selectedSession.evaluation.overallScore}%
                    </div>
                    <p className="text-sm text-gray-500">Overall Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {[
                    { label: 'Technical', score: selectedSession.evaluation.technicalSkills, icon: Target },
                    { label: 'Problem Solving', score: selectedSession.evaluation.problemSolving, icon: TrendingUp },
                    { label: 'Communication', score: selectedSession.evaluation.communication, icon: MessageSquare },
                    { label: 'Experience', score: selectedSession.evaluation.experience, icon: Award },
                    { label: 'Culture Fit', score: selectedSession.evaluation.culturalFit, icon: User }
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 text-center">
                      <item.icon className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                      <div className={`text-lg font-bold ${getScoreColor(item.score)}`}>{item.score}%</div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <Progress value={item.score} size="sm" className="mt-2" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-medium text-green-800 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {selectedSession.evaluation.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-green-700 flex items-center">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-800 mb-2 flex items-center">
                      <XCircle className="w-4 h-4 mr-2" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {selectedSession.evaluation.areasForImprovement.map((a, i) => (
                        <li key={i} className="text-sm text-red-700 flex items-center">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Transcript */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Full Transcript</h4>
              <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                {selectedSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'candidate' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'assistant' 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500' 
                        : 'bg-gray-200'
                    }`}>
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`max-w-[80%] ${message.role === 'candidate' ? 'text-right' : ''}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          {message.role === 'assistant' ? 'AI Assistant' : selectedSession.candidateName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(message.timestamp), 'h:mm a')}
                        </span>
                      </div>
                      <div className={`rounded-lg px-3 py-2 text-sm ${
                        message.role === 'assistant' 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-indigo-100 text-indigo-900'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedSession(null)}>
                Close
              </Button>
              <Button onClick={() => exportTranscript(selectedSession)}>
                Download Transcript
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InterviewTranscripts;
