import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { generateChatResponse } from '../../services/aiService';
import { ChatMessage } from '../../types';
import { Send, Bot, User, Sparkles, Lightbulb, HelpCircle, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

const CandidateChat: React.FC = () => {
  const { user } = useAuth();
  const { jobs, applications, getCandidateByUserId } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋 I'm RecruitAI Assistant, your personal career helper. I can help you with:\n\n• Finding suitable job openings\n• Understanding job requirements\n• Checking your application status\n• Resume improvement tips\n• Interview preparation\n\nHow can I assist you today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const candidateProfile = user ? getCandidateByUserId(user.id) : null;
  const myApplications = candidateProfile 
    ? applications.filter(a => a.candidateId === candidateProfile.id)
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateChatResponse(input, { 
        jobs: jobs.filter(j => j.status === 'active'),
        applications: myApplications 
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    { icon: Briefcase, text: 'What jobs are available?', color: 'bg-blue-100 text-blue-600' },
    { icon: HelpCircle, text: 'How is my application status?', color: 'bg-purple-100 text-purple-600' },
    { icon: Lightbulb, text: 'Tips to improve my resume', color: 'bg-yellow-100 text-yellow-600' },
    { icon: Sparkles, text: 'What skills should I learn?', color: 'bg-green-100 text-green-600' }
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Bot className="w-7 h-7 mr-3 text-indigo-600" />
          AI Career Assistant
        </h1>
        <p className="text-gray-600 mt-1">Ask me anything about jobs, applications, or career advice</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col" padding="none">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
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
                <div className={`max-w-[70%] ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'assistant' 
                      ? 'bg-gray-100 text-gray-800 rounded-tl-none' 
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
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

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isTyping}
                className="px-6"
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="w-80 hidden lg:block space-y-4">
          {/* Quick Questions */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Questions</h3>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => {
                const Icon = question.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question.text)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`p-2 rounded-lg ${question.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-gray-700">{question.text}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">💡</span>
                Ask about specific job requirements
              </li>
              <li className="flex items-start">
                <span className="mr-2">💡</span>
                Get personalized skill recommendations
              </li>
              <li className="flex items-start">
                <span className="mr-2">💡</span>
                Learn about interview preparation
              </li>
              <li className="flex items-start">
                <span className="mr-2">💡</span>
                Understand salary expectations
              </li>
            </ul>
          </Card>

          {/* Stats */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Your Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Applications</span>
                <span className="font-medium">{myApplications.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Open Jobs</span>
                <span className="font-medium">{jobs.filter(j => j.status === 'active').length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateChat;
