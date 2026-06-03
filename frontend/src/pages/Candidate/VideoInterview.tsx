import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Select from '../../components/UI/Select';
import Modal from '../../components/UI/Modal';
import Progress from '../../components/UI/Progress';
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
  checkMediaSupport,
  requestMediaPermissions,
  stopMediaStream,
  toggleVideoTrack,
  toggleAudioTrack,
  SpeechRecognitionService,
  TextToSpeechService,
  AudioVisualizer
} from '../../services/mediaService';
import { 
  Video, VideoOff, Mic, MicOff, Send, Bot, User, Clock, 
  CheckCircle, AlertCircle, Play, History, Volume2, VolumeX,
  MessageSquare, Sparkles, Calendar, Settings,
  Loader2, Radio, Camera, CameraOff
} from 'lucide-react';
import { format } from 'date-fns';

const VideoInterview: React.FC = () => {
  const { user } = useAuth();
  const { jobs, applications, getCandidateByUserId, updateApplication } = useData();
  
  // Interview State
  const [selectedJobId, setSelectedJobId] = useState('');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [interviewSteps, setInterviewSteps] = useState<string[]>([]);
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Media State
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [sttEnabled, setSttEnabled] = useState(true);
  const [, setHasPermissions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [mediaSupport, setMediaSupport] = useState({ video: false, audio: false, speech: false, tts: false });
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<SpeechRecognitionService | null>(null);
  const textToSpeech = useRef<TextToSpeechService | null>(null);
  const audioVisualizer = useRef<AudioVisualizer | null>(null);
  const audioLevelInterval = useRef<number | null>(null);
  
  const candidateProfile = user ? getCandidateByUserId(user.id) : null;
  const myApplications = candidateProfile 
    ? applications.filter(a => a.candidateId === candidateProfile.id)
    : [];
  
  const eligibleJobs = jobs.filter(job => 
    myApplications.some(app => 
      app.jobId === job.id && 
      ['shortlisted', 'interview'].includes(app.status)
    )
  );
  
  const previousSessions = candidateProfile 
    ? getInterviewSessionsByCandidate(candidateProfile.id)
    : [];

  // Check media support on mount
  useEffect(() => {
    const support = checkMediaSupport();
    setMediaSupport(support);
    
    // Initialize services
    if (support.speech) {
      speechRecognition.current = new SpeechRecognitionService();
    }
    if (support.tts) {
      textToSpeech.current = new TextToSpeechService();
    }
    
    return () => {
      stopMediaStream(mediaStream);
      speechRecognition.current?.stop();
      textToSpeech.current?.stop();
      audioVisualizer.current?.disconnect();
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current);
      }
    };
  }, []);

  // Setup video element when stream changes
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  // Initialize media
  const initializeMedia = async () => {
    const stream = await requestMediaPermissions(true, true);
    if (stream) {
      setMediaStream(stream);
      setHasPermissions(true);
      
      // Setup audio visualizer
      audioVisualizer.current = new AudioVisualizer();
      audioVisualizer.current.connect(stream);
      
      // Start audio level monitoring
      audioLevelInterval.current = window.setInterval(() => {
        if (audioVisualizer.current) {
          setAudioLevel(audioVisualizer.current.getAudioLevel());
        }
      }, 100);
      
      return true;
    }
    return false;
  };

  // Toggle video
  const handleToggleVideo = () => {
    toggleVideoTrack(mediaStream, !videoEnabled);
    setVideoEnabled(!videoEnabled);
  };

  // Toggle audio
  const handleToggleAudio = () => {
    toggleAudioTrack(mediaStream, !audioEnabled);
    setAudioEnabled(!audioEnabled);
  };

  // Speech-to-text handlers
  const startListening = useCallback(() => {
    if (speechRecognition.current && sttEnabled) {
      speechRecognition.current.setOnResult((result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          setInputMessage(prev => prev + result.transcript + ' ');
          setTranscript('');
        }
      });
      
      speechRecognition.current.setOnEnd(() => {
        setIsListening(false);
      });
      
      speechRecognition.current.setOnError((error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      });
      
      if (speechRecognition.current.start()) {
        setIsListening(true);
      }
    }
  }, [sttEnabled]);

  const stopListening = useCallback(() => {
    if (speechRecognition.current) {
      speechRecognition.current.stop();
      setIsListening(false);
      setTranscript('');
    }
  }, []);

  // Text-to-speech
  const speakText = useCallback(async (text: string) => {
    if (textToSpeech.current && ttsEnabled) {
      // Clean text for speech (remove markdown)
      const cleanText = text.replace(/\*\*/g, '').replace(/\n/g, ' ');
      
      setIsSpeaking(true);
      textToSpeech.current.setOnEnd(() => {
        setIsSpeaking(false);
      });
      
      try {
        await textToSpeech.current.speak(cleanText, 1.0, 1.0);
      } catch (error) {
        console.error('TTS error:', error);
        setIsSpeaking(false);
      }
    }
  }, [ttsEnabled]);

  const stopSpeaking = useCallback(() => {
    if (textToSpeech.current) {
      textToSpeech.current.stop();
      setIsSpeaking(false);
    }
  }, []);

  // Start interview
  const startInterview = async () => {
    if (!selectedJobId || !candidateProfile) return;
    
    // Initialize media first
    const mediaReady = await initializeMedia();
    if (!mediaReady) {
      alert('Unable to access camera/microphone. Please grant permissions and try again.');
      return;
    }
    
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
    
    // Speak welcome message
    setTimeout(() => {
      speakText(welcomeMessage);
    }, 500);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session || !candidateProfile) return;
    
    const job = jobs.find(j => j.id === session.jobId);
    if (!job) return;
    
    // Stop listening while processing
    stopListening();
    stopSpeaking();
    
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
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let nextStep = session.currentStep;
    let responseContent = '';
    let questionType: InterviewMessage['questionType'];
    
    if (!awaitingFollowUp) {
      const followUp = generateFollowUp(inputMessage, interviewSteps[session.currentStep], job);
      if (followUp && Math.random() > 0.6) {
        responseContent = followUp;
        setAwaitingFollowUp(true);
      } else {
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
    } else {
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
    
    if (nextStep >= interviewSteps.length || questionType === 'closing') {
      const evaluation = evaluateInterview(finalMessages, job, candidateProfile);
      finalSession = {
        ...finalSession,
        status: 'completed',
        completedAt: new Date().toISOString(),
        evaluation
      };
      
      const application = myApplications.find(a => a.jobId === job.id);
      if (application) {
        updateApplication(application.id, { 
          status: 'interview',
          notes: `AI Interview completed. Score: ${evaluation.overallScore}%`
        });
      }
      
      // Stop media on completion
      stopMediaStream(mediaStream);
      setMediaStream(null);
    }
    
    setSession(finalSession);
    saveInterviewSession(finalSession);
    setIsTyping(false);
    
    // Speak the response
    speakText(responseContent);
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
            Video AI Interview
          </h1>
          <p className="text-gray-600 mt-1">Complete your AI-powered video interview</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => setShowSettings(true)}
            icon={<Settings className="w-4 h-4" />}
          >
            Settings
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowHistory(true)}
            icon={<History className="w-4 h-4" />}
          >
            History
          </Button>
        </div>
      </div>

      {!session ? (
        // Interview Selection
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Start Video Interview</h2>
            
            {/* Media Support Check */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">System Check</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  {mediaSupport.video ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  Camera
                </div>
                <div className="flex items-center">
                  {mediaSupport.audio ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  Microphone
                </div>
                <div className="flex items-center">
                  {mediaSupport.speech ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                  )}
                  Speech-to-Text
                </div>
                <div className="flex items-center">
                  {mediaSupport.tts ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                  )}
                  Text-to-Speech
                </div>
              </div>
            </div>
            
            {eligibleJobs.length > 0 ? (
              <div className="space-y-4">
                <Select
                  label="Select Position"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  options={[
                    { value: '', label: 'Choose a position...' },
                    ...eligibleJobs.map(job => ({ value: job.id, label: `${job.title} - ${job.department}` }))
                  ]}
                />
                
                {selectedJobId && (() => {
                  const job = jobs.find(j => j.id === selectedJobId);
                  return job && (
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-medium text-indigo-900">{job.title}</h3>
                      <p className="text-sm text-indigo-700 mt-1">{job.department} • {job.location}</p>
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
                    <Camera className="w-4 h-4 mr-2" />
                    Video Interview Tips
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-800">
                    <li>• Ensure good lighting and a clean background</li>
                    <li>• Use headphones for better audio quality</li>
                    <li>• Speak clearly into your microphone</li>
                    <li>• The AI will speak questions aloud</li>
                    <li>• You can respond via voice or text</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={startInterview}
                  disabled={!selectedJobId}
                  className="w-full"
                  icon={<Play className="w-4 h-4" />}
                  size="lg"
                >
                  Start Video Interview
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900">No Interviews Available</h3>
                <p className="text-sm text-gray-500 mt-1">
                  You'll be able to start a video interview once you're shortlisted.
                </p>
              </div>
            )}
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              AI Video Interview Features
            </h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start space-x-3 bg-white p-3 rounded-lg">
                <Video className="w-6 h-6 text-indigo-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Live Video</p>
                  <p className="text-gray-600">Your camera will be active during the interview</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-white p-3 rounded-lg">
                <Mic className="w-6 h-6 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Voice Recognition</p>
                  <p className="text-gray-600">Speak your answers naturally - AI transcribes in real-time</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-white p-3 rounded-lg">
                <Volume2 className="w-6 h-6 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">AI Voice Response</p>
                  <p className="text-gray-600">Questions are spoken aloud for a natural interview feel</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-white p-3 rounded-lg">
                <Bot className="w-6 h-6 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Adaptive Questions</p>
                  <p className="text-gray-600">AI adjusts questions based on your responses</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        // Interview In Progress
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video & Chat */}
          <div className="lg:col-span-3 space-y-4">
            {/* Video Section */}
            <Card padding="sm" className="bg-gray-900">
              <div className="flex items-start gap-4">
                {/* Video Feed */}
                <div className="relative w-64 h-48 bg-black rounded-lg overflow-hidden flex-shrink-0">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`}
                  />
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <CameraOff className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                  
                  {/* Recording indicator */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-white">LIVE</span>
                  </div>
                  
                  {/* Audio level indicator */}
                  {audioEnabled && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-100"
                          style={{ width: `${audioLevel * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex-1 flex flex-col justify-between h-48">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{session.candidateName}</span>
                      {session.status === 'completed' ? (
                        <Badge className="bg-green-500 text-white">Completed</Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white animate-pulse">In Progress</Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{session.jobTitle}</p>
                    
                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Interview Progress</span>
                        <span>{getStepProgress()}%</span>
                      </div>
                      <Progress value={getStepProgress()} size="sm" />
                    </div>
                  </div>
                  
                  {/* Media Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={videoEnabled ? 'primary' : 'danger'}
                      size="sm"
                      onClick={handleToggleVideo}
                      icon={videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    >
                      {videoEnabled ? 'Camera On' : 'Camera Off'}
                    </Button>
                    <Button
                      variant={audioEnabled ? 'primary' : 'danger'}
                      size="sm"
                      onClick={handleToggleAudio}
                      icon={audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    >
                      {audioEnabled ? 'Mic On' : 'Mic Off'}
                    </Button>
                    <Button
                      variant={ttsEnabled ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setTtsEnabled(!ttsEnabled)}
                      icon={ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    >
                      {ttsEnabled ? 'Voice On' : 'Voice Off'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Chat Section */}
            <Card className="flex flex-col h-[450px]" padding="none">
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Interview Assistant</h3>
                      {isSpeaking && (
                        <span className="text-xs text-white/80 flex items-center">
                          <Radio className="w-3 h-3 mr-1 animate-pulse" />
                          Speaking...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{format(new Date(session.startedAt), 'h:mm a')}</span>
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
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                      <p className="text-sm text-gray-500">AI is thinking...</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              {session.status !== 'completed' && (
                <div className="p-4 border-t bg-gray-50">
                  {/* Voice input indicator */}
                  {isListening && (
                    <div className="mb-2 p-2 bg-red-50 rounded-lg flex items-center">
                      <Radio className="w-4 h-4 text-red-500 animate-pulse mr-2" />
                      <span className="text-sm text-red-600">
                        Listening... {transcript && `"${transcript}"`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button
                      variant={isListening ? 'danger' : 'outline'}
                      onClick={isListening ? stopListening : startListening}
                      disabled={!mediaSupport.speech || !sttEnabled}
                      icon={isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    >
                      {isListening ? 'Stop' : 'Voice'}
                    </Button>
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type or speak your response..."
                      rows={2}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!inputMessage.trim() || isTyping}
                      className="self-end"
                      icon={<Send className="w-4 h-4" />}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Interview Status</h3>
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
                <div className="flex justify-between">
                  <span className="text-gray-500">Video</span>
                  <Badge variant={videoEnabled ? 'success' : 'danger'} size="sm">
                    {videoEnabled ? 'On' : 'Off'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Audio</span>
                  <Badge variant={audioEnabled ? 'success' : 'danger'} size="sm">
                    {audioEnabled ? 'On' : 'Off'}
                  </Badge>
                </div>
              </div>
            </Card>
            
            <Card className="bg-yellow-50">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• Look at the camera</li>
                <li>• Speak clearly</li>
                <li>• Take your time</li>
                <li>• Be specific with examples</li>
              </ul>
            </Card>
            
            {session.status === 'completed' && session.evaluation && (
              <Card className="bg-green-50 border-green-200">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-900">Interview Complete!</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {session.evaluation.overallScore}%
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    Our team will review your interview and contact you soon.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Interview Settings"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Text-to-Speech</p>
              <p className="text-sm text-gray-500">AI speaks questions aloud</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Speech-to-Text</p>
              <p className="text-sm text-gray-500">Speak your responses</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={sttEnabled}
                onChange={(e) => setSttEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button onClick={() => setShowSettings(false)}>Done</Button>
          </div>
        </div>
      </Modal>

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
              <div key={s.id} className="border rounded-lg p-4 hover:bg-gray-50">
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
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Score</span>
                    <span className="text-lg font-bold text-indigo-600">{s.evaluation.overallScore}%</span>
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

export default VideoInterview;
