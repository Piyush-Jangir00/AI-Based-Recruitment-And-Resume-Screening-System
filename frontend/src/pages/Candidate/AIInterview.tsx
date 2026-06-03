import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Select from '../../components/UI/Select';
import Modal from '../../components/UI/Modal';
import {
  InterviewSession,
  InterviewMessage,
  generateInterviewSteps,
  getInterviewQuestion,
  generateFollowUp,
  evaluateInterview,
  saveInterviewSession,
  getInterviewSessionsByCandidate
} from '../../services/interviewAssistantService';
import { 
  Video, Send, Bot, User, Clock, 
  CheckCircle, AlertCircle, Play, History,
  MessageSquare, Sparkles, Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const AIInterview: React.FC = () => {
  const { user } = useAuth();
  const { jobs, applications, getCandidateByUserId, updateApplication } = useData();
  
  const [selectedJobId, setSelectedJobId] = useState('');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [interviewSteps, setInterviewSteps] = useState<string[]>([]);
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const candidateProfile = user ? getCandidateByUserId(user.id) : null;
  const myApplications = candidateProfile 
    ? applications.filter(a => a.candidateId === candidateProfile.id)
    : [];
  
  // Get jobs where candidate has applied and been shortlisted for interview
  const eligibleJobs = jobs.filter(job => 
    myApplications.some(app => 
      app.jobId === job.id && 
      ['shortlisted', 'interview'].includes(app.status)
    )
  );
  
  const previousSessions = candidateProfile 
    ? getInterviewSessionsByCandidate(candidateProfile.id)
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const startInterview = () => {
    if (!selectedJobId || !candidateProfile) return;
    
    const job = jobs.find(j => j.id === selectedJobId);
    if (!job) return;
    
    const steps = generateInterviewSteps(job, candidateProfile);
    setInterviewSteps(steps);
    
    const welcomeMessage = getInterviewQuestion(steps[0], job, candidateProfile);
    
    const newSession: InterviewSession = {
      id: `interview-${Date.now()}`,
      candidateId: candidateProfile.id,
      candidateName: candidateProfile.name,
      jobId: job.id,
      jobTitle: job.title,
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      messages: [{
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString(),
        questionType: 'welcome'
      }],
      currentStep: 0
    };
    
    setSession(newSession);
    saveInterviewSession(newSession);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session || !candidateProfile) return;
    
    const job = jobs.find(j => j.id === session.jobId);
    if (!job) return;
    
    // Add candidate message
    const candidateMessage: InterviewMessage = {
      id: `msg-${Date.now()}`,
      role: 'candidate',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...session.messages, candidateMessage];
    const updatedSession = { ...session, messages: updatedMessages };
    setSession(updatedSession);
    setInputMessage('');
    setIsTyping(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let nextStep = session.currentStep;
    let responseContent = '';
    let questionType: InterviewMessage['questionType'];
    
    // Check for follow-up
    if (!awaitingFollowUp) {
      const followUp = generateFollowUp(inputMessage, interviewSteps[session.currentStep], job);
      if (followUp && Math.random() > 0.5) { // 50% chance for follow-up
        responseContent = followUp;
        setAwaitingFollowUp(true);
      } else {
        // Move to next step
        nextStep = session.currentStep + 1;
        setAwaitingFollowUp(false);
        
        if (nextStep < interviewSteps.length) {
          responseContent = getInterviewQuestion(interviewSteps[nextStep], job, candidateProfile);
          questionType = interviewSteps[nextStep].split('_')[0] as InterviewMessage['questionType'];
        } else {
          // Interview complete
          responseContent = getInterviewQuestion('closing', job, candidateProfile);
          questionType = 'closing';
        }
      }
    } else {
      // After follow-up, move to next step
      nextStep = session.currentStep + 1;
      setAwaitingFollowUp(false);
      
      if (nextStep < interviewSteps.length) {
        responseContent = getInterviewQuestion(interviewSteps[nextStep], job, candidateProfile);
        questionType = interviewSteps[nextStep].split('_')[0] as InterviewMessage['questionType'];
      } else {
        responseContent = getInterviewQuestion('closing', job, candidateProfile);
        questionType = 'closing';
      }
    }
    
    const assistantMessage: InterviewMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString(),
      questionType
    };
    
    const finalMessages = [...updatedMessages, assistantMessage];
    let finalSession: InterviewSession = {
      ...updatedSession,
      messages: finalMessages,
      currentStep: nextStep
    };
    
    // Check if interview is complete
    if (nextStep >= interviewSteps.length || questionType === 'closing') {
      const evaluation = evaluateInterview(finalMessages, job, candidateProfile);
      finalSession = {
        ...finalSession,
        status: 'completed',
        completedAt: new Date().toISOString(),
        evaluation
      };
      
      // Update application status
      const application = myApplications.find(a => a.jobId === job.id);
      if (application) {
        updateApplication(application.id, { 
          status: 'interview',
          notes: `AI Interview completed. Score: ${evaluation.overallScore}%`
        });
      }
    }
    
    setSession(finalSession);
    saveInterviewSession(finalSession);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStepProgress = () => {
    if (!session || interviewSteps.length === 0) return 0;
    return Math.round((session.currentStep / interviewSteps.length) * 100);
  };

  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold text between **
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span key={i} dangerouslySetInnerHTML={{ __html: boldFormatted }} />
      );
    }).reduce((acc: React.ReactNode[], curr, i) => {
      if (i === 0) return [curr];
      return [...acc, <br key={`br-${i}`} />, curr];
    }, []);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Video className="w-7 h-7 mr-3 text-indigo-600" />
            AI Interview
          </h1>
          <p className="text-gray-600 mt-1">Complete your AI-powered interview for shortlisted positions</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => setShowHistory(true)}
          icon={<History className="w-4 h-4" />}
        >
          Interview History
        </Button>
      </div>

      {!session ? (
        // Interview Selection
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Start New Interview</h2>
            
            {eligibleJobs.length > 0 ? (
              <div className="space-y-4">
                <Select
                  label="Select Position"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  options={[
                    { value: '', label: 'Choose a position...' },
                    ...eligibleJobs.map(job => ({ value: job.id, label: job.title }))
                  ]}
                />
                
                {selectedJobId && (() => {
                  const job = jobs.find(j => j.id === selectedJobId);
                  return job && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{job.department} • {job.location}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.requiredSkills.slice(0, 4).map((skill, i) => (
                          <Badge key={i} variant="info" size="sm">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Before You Start
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-800">
                    <li>• Find a quiet place with stable internet</li>
                    <li>• The interview takes 15-20 minutes</li>
                    <li>• Answer thoughtfully - there's no time limit per question</li>
                    <li>• You can only complete one interview per position</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={startInterview}
                  disabled={!selectedJobId}
                  className="w-full"
                  icon={<Play className="w-4 h-4" />}
                >
                  Start Interview
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900">No Interviews Available</h3>
                <p className="text-sm text-gray-500 mt-1">
                  You'll be able to start an AI interview once you're shortlisted for a position.
                </p>
              </div>
            )}
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              About AI Interviews
            </h2>
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                Our AI Interview Assistant conducts professional interviews to help 
                evaluate your fit for the position. Here's what to expect:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-indigo-600 font-medium">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Background Questions</p>
                    <p className="text-gray-600">Tell us about yourself and your experience</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-indigo-600 font-medium">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Technical Assessment</p>
                    <p className="text-gray-600">Questions related to the required skills</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-indigo-600 font-medium">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Behavioral Scenarios</p>
                    <p className="text-gray-600">How you handle real-world situations</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 mt-4">
                <p className="text-xs text-gray-500">
                  💡 <strong>Tip:</strong> Take your time with each question. 
                  Provide specific examples from your experience when possible.
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        // Interview In Progress
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat */}
          <Card className="lg:col-span-3 flex flex-col h-[600px]" padding="none">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Interview Assistant</h3>
                    <p className="text-sm text-white/80">{session.jobTitle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {session.status === 'completed' ? (
                    <Badge className="bg-green-500 text-white">Completed</Badge>
                  ) : (
                    <>
                      <div className="flex items-center text-white/80 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(new Date(session.startedAt), 'h:mm a')}
                      </div>
                      <Badge className="bg-white/20 text-white">In Progress</Badge>
                    </>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-white/80 mb-1">
                  <span>Progress</span>
                  <span>{getStepProgress()}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${getStepProgress()}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {session.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'candidate' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500' 
                      : 'bg-gray-200'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className={`max-w-[75%] ${message.role === 'candidate' ? 'text-right' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'assistant' 
                        ? 'bg-gray-100 text-gray-800 rounded-tl-none' 
                        : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">
                        {formatMessageContent(message.content)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 px-2">
                      {format(new Date(message.timestamp), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            {session.status !== 'completed' && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex space-x-3">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    rows={2}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim() || isTyping}
                    className="self-end px-6"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            )}
          </Card>
          
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Interview Info */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Interview Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Position</span>
                  <span className="font-medium">{session.jobTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Started</span>
                  <span className="font-medium">{format(new Date(session.startedAt), 'h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Questions</span>
                  <span className="font-medium">{session.currentStep + 1} / {interviewSteps.length}</span>
                </div>
              </div>
            </Card>
            
            {/* Tips */}
            <Card className="bg-yellow-50">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• Be specific with examples</li>
                <li>• Use the STAR method</li>
                <li>• Take your time to think</li>
                <li>• Be honest and authentic</li>
              </ul>
            </Card>
            
            {/* Completion Card */}
            {session.status === 'completed' && session.evaluation && (
              <Card className="bg-green-50 border-green-200">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-900">Interview Complete!</h3>
                  <p className="text-sm text-green-700 mt-2">
                    Your responses have been recorded. Our team will review them shortly.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="Interview History"
        size="lg"
      >
        {previousSessions.length > 0 ? (
          <div className="space-y-4">
            {previousSessions.map(s => (
              <div key={s.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{s.jobTitle}</h4>
                  <Badge variant={s.status === 'completed' ? 'success' : 'warning'}>
                    {s.status}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(s.startedAt), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {s.messages.length} messages
                  </span>
                </div>
                {s.evaluation && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">AI Score</span>
                      <span className="font-bold text-indigo-600">{s.evaluation.overallScore}%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No previous interviews</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIInterview;
