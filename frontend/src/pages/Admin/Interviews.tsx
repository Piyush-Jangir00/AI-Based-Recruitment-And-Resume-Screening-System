import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import { Interview } from '../../types';
import { 
  Calendar, Clock, Video, Phone, MapPin, 
  User, CheckCircle, XCircle, MessageSquare 
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

const AdminInterviews: React.FC = () => {
  const { interviews, updateInterview, updateApplication } = useData();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [feedback, setFeedback] = useState({ result: 'pending', notes: '' });

  const filteredInterviews = interviews.filter(interview => {
    const interviewDate = new Date(interview.scheduledAt);
    if (filter === 'upcoming') return interview.status === 'scheduled' && !isPast(interviewDate);
    if (filter === 'completed') return interview.status === 'completed';
    return true;
  }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const handleUpdateResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;

    updateInterview(selectedInterview.id, {
      status: 'completed',
      result: feedback.result as Interview['result'],
      feedback: feedback.notes
    });

    // Update application status based on result
    if (feedback.result === 'passed') {
      updateApplication(selectedInterview.applicationId, { status: 'hired' });
    } else if (feedback.result === 'failed') {
      updateApplication(selectedInterview.applicationId, { status: 'rejected' });
    }

    setShowFeedbackModal(false);
    setSelectedInterview(null);
    setFeedback({ result: 'pending', notes: '' });
  };

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'phone': return <Phone className="w-5 h-5 text-green-500" />;
      case 'onsite': return <MapPin className="w-5 h-5 text-purple-500" />;
      default: return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string, result?: string) => {
    if (status === 'scheduled') return <Badge variant="info">Scheduled</Badge>;
    if (status === 'cancelled') return <Badge variant="danger">Cancelled</Badge>;
    if (status === 'completed') {
      if (result === 'passed') return <Badge variant="success">Passed</Badge>;
      if (result === 'failed') return <Badge variant="danger">Failed</Badge>;
      return <Badge variant="default">Completed</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  // Group interviews by date
  const groupedInterviews = filteredInterviews.reduce((groups, interview) => {
    const dateKey = format(new Date(interview.scheduledAt), 'yyyy-MM-dd');
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(interview);
    return groups;
  }, {} as Record<string, Interview[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Schedule</h1>
          <p className="text-gray-600 mt-1">Manage and track candidate interviews</p>
        </div>
        <div className="flex space-x-2">
          {(['all', 'upcoming', 'completed'] as const).map(status => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-blue-700">
                {interviews.filter(i => i.status === 'scheduled').length}
              </p>
              <p className="text-sm text-blue-600">Upcoming</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-700">
                {interviews.filter(i => i.result === 'passed').length}
              </p>
              <p className="text-sm text-green-600">Passed</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">
                {interviews.filter(i => i.result === 'failed').length}
              </p>
              <p className="text-sm text-red-600">Failed</p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-purple-700">
                {interviews.filter(i => isToday(new Date(i.scheduledAt))).length}
              </p>
              <p className="text-sm text-purple-600">Today</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Interview List */}
      <div className="space-y-8">
        {Object.entries(groupedInterviews).map(([dateKey, dayInterviews]) => (
          <div key={dateKey}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
              {getDateLabel(dateKey)}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({dayInterviews.length} interview{dayInterviews.length > 1 ? 's' : ''})
              </span>
            </h3>
            <div className="space-y-4">
              {dayInterviews.map(interview => (
                <Card key={interview.id} className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Time & Type */}
                    <div className="flex items-center space-x-4 md:w-48">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getInterviewIcon(interview.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(interview.scheduledAt), 'h:mm a')}
                        </p>
                        <p className="text-sm text-gray-500">{interview.duration} min</p>
                      </div>
                    </div>

                    {/* Candidate & Job */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{interview.candidateName}</h4>
                      <p className="text-sm text-gray-500">{interview.jobTitle}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        Interviewers: {interview.interviewers.join(', ')}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(interview.status, interview.result)}
                      
                      {interview.status === 'scheduled' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setFeedback({ result: 'passed', notes: '' });
                              setShowFeedbackModal(true);
                            }}
                            icon={<CheckCircle className="w-4 h-4" />}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      )}
                      
                      {interview.status === 'completed' && interview.feedback && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<MessageSquare className="w-4 h-4" />}
                          onClick={() => {
                            setSelectedInterview(interview);
                            setShowFeedbackModal(true);
                          }}
                        >
                          View Feedback
                        </Button>
                      )}
                    </div>
                  </div>

                  {interview.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {interview.notes}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredInterviews.length === 0 && (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No interviews found</h3>
          <p className="text-gray-500 mt-1">
            {filter === 'upcoming' ? 'No upcoming interviews scheduled' : 
             filter === 'completed' ? 'No completed interviews yet' : 
             'Schedule interviews from the Candidates page'}
          </p>
        </Card>
      )}

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => { setShowFeedbackModal(false); setSelectedInterview(null); }}
        title={selectedInterview?.status === 'completed' ? 'Interview Feedback' : 'Complete Interview'}
        size="md"
      >
        {selectedInterview?.status === 'completed' ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                {selectedInterview.candidateName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedInterview.candidateName}</p>
                <p className="text-sm text-gray-500">{selectedInterview.jobTitle}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Result</p>
              {getStatusBadge(selectedInterview.status, selectedInterview.result)}
            </div>
            {selectedInterview.feedback && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Feedback</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedInterview.feedback}</p>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateResult} className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                {selectedInterview?.candidateName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedInterview?.candidateName}</p>
                <p className="text-sm text-gray-500">{selectedInterview?.jobTitle}</p>
              </div>
            </div>

            <Select
              label="Interview Result"
              value={feedback.result}
              onChange={(e) => setFeedback({ ...feedback, result: e.target.value })}
              options={[
                { value: 'passed', label: '✅ Passed - Move to Hired' },
                { value: 'failed', label: '❌ Failed - Rejected' },
                { value: 'pending', label: '⏳ Needs Follow-up' }
              ]}
            />

            <Textarea
              label="Feedback Notes"
              value={feedback.notes}
              onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
              placeholder="Add interview feedback, observations, recommendations..."
              rows={4}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save & Complete
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminInterviews;
