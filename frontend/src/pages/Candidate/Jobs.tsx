import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import { Job } from '../../types';
import { calculateAIScore } from '../../services/aiService';
import { 
  Search, MapPin, DollarSign, Clock, Briefcase, 
  Building, Filter, CheckCircle, Star, Zap, BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

const CandidateJobs: React.FC = () => {
  const { user } = useAuth();
  const { jobs, applications, getCandidateByUserId, addApplication } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const candidateProfile = user ? getCandidateByUserId(user.id) : null;
  const activeJobs = jobs.filter(j => j.status === 'active');
  
  // Get unique locations and departments
  const locations = [...new Set(activeJobs.map(j => j.location))];
  const departments = [...new Set(activeJobs.map(j => j.department))];

  const filteredJobs = activeJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
    return matchesSearch && matchesLocation && matchesType && matchesDepartment;
  });

  const hasApplied = (jobId: string) => {
    return candidateProfile && applications.some(a => a.jobId === jobId && a.candidateId === candidateProfile.id);
  };

  const handleApply = async () => {
    if (!selectedJob || !candidateProfile) return;
    
    setApplying(true);
    
    // Calculate AI score
    const aiScore = calculateAIScore(candidateProfile, selectedJob);
    
    // Create application
    addApplication({
      candidateId: candidateProfile.id,
      jobId: selectedJob.id,
      candidateName: candidateProfile.name,
      candidateEmail: candidateProfile.email,
      status: 'pending',
      aiScore,
      notes: ''
    });

    setApplied(true);
    setApplying(false);
    
    setTimeout(() => {
      setShowApplyModal(false);
      setSelectedJob(null);
      setApplied(false);
    }, 2000);
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
    setApplied(false);
  };

  // Calculate match score for display
  const getMatchScore = (job: Job) => {
    if (!candidateProfile) return null;
    const score = calculateAIScore(candidateProfile, job);
    return score.overallScore;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
        <p className="text-gray-600 mt-1">Discover opportunities matching your skills</p>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search jobs, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Locations' },
              ...locations.map(loc => ({ value: loc, label: loc }))
            ]}
            className="md:w-48"
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'full-time', label: 'Full-time' },
              { value: 'part-time', label: 'Part-time' },
              { value: 'contract', label: 'Contract' },
              { value: 'remote', label: 'Remote' }
            ]}
            className="md:w-40"
          />
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Departments' },
              ...departments.map(dept => ({ value: dept, label: dept }))
            ]}
            className="md:w-48"
          />
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Found <span className="font-semibold text-gray-900">{filteredJobs.length}</span> jobs
        </p>
        {candidateProfile && (
          <Badge variant="purple">
            <Zap className="w-3 h-3 mr-1" />
            AI Matching Enabled
          </Badge>
        )}
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map(job => {
          const matchScore = getMatchScore(job);
          const alreadyApplied = hasApplied(job.id);
          
          return (
            <Card key={job.id} hover className="relative">
              {matchScore && matchScore >= 80 && (
                <div className="absolute top-4 right-4">
                  <Badge variant="success">
                    <Star className="w-3 h-3 mr-1" />
                    Great Match
                  </Badge>
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
                  <div className="flex items-center text-gray-500 mt-1">
                    <Building className="w-4 h-4 mr-1" />
                    <span className="text-sm">{job.department}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  ${(job.salary.min / 1000).toFixed(0)}k - ${(job.salary.max / 1000).toFixed(0)}k
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  {job.experienceMin}-{job.experienceMax} years
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Badge size="sm">{job.type}</Badge>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.requiredSkills.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="info" size="sm">{skill}</Badge>
                ))}
                {job.requiredSkills.length > 4 && (
                  <Badge variant="default" size="sm">+{job.requiredSkills.length - 4}</Badge>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Posted {format(new Date(job.createdAt), 'MMM d')}
                </div>
                <div className="flex items-center space-x-3">
                  {matchScore && (
                    <div className="flex items-center text-sm">
                      <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                      <span className={`font-medium ${
                        matchScore >= 80 ? 'text-green-600' : 
                        matchScore >= 60 ? 'text-blue-600' : 
                        'text-gray-600'
                      }`}>
                        {matchScore}% match
                      </span>
                    </div>
                  )}
                  {alreadyApplied ? (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Applied
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={() => openJobDetails(job)}>
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <Card className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
        </Card>
      )}

      {/* Job Details & Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => { setShowApplyModal(false); setSelectedJob(null); }}
        title={selectedJob?.title || 'Job Details'}
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-6">
            {applied ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Application Submitted!</h3>
                <p className="text-gray-600 mt-2">
                  Your application has been sent. We'll notify you of any updates.
                </p>
              </div>
            ) : (
              <>
                {/* Job Header */}
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h3>
                    <p className="text-gray-500">{selectedJob.department} • {selectedJob.location}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge>{selectedJob.type}</Badge>
                      <span className="text-sm text-gray-500">
                        ${selectedJob.salary.min.toLocaleString()} - ${selectedJob.salary.max.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Match Score */}
                {candidateProfile && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                        <span className="font-medium text-gray-900">AI Match Analysis</span>
                      </div>
                      <span className="text-2xl font-bold text-indigo-600">
                        {getMatchScore(selectedJob)}%
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Skills: {calculateAIScore(candidateProfile, selectedJob).skillMatch}%
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Experience: {calculateAIScore(candidateProfile, selectedJob).experienceMatch}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">About the Role</h4>
                  <p className="text-gray-600">{selectedJob.description}</p>
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requiredSkills.map((skill, i) => (
                        <Badge key={i} variant="info">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Preferred Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.preferredSkills.map((skill, i) => (
                        <Badge key={i} variant="default">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{selectedJob.experienceMin}-{selectedJob.experienceMax} years</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Education</p>
                      <p className="font-medium">{selectedJob.educationLevel}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowApplyModal(false)}>
                    Cancel
                  </Button>
                  {hasApplied(selectedJob.id) ? (
                    <Button disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Already Applied
                    </Button>
                  ) : (
                    <Button onClick={handleApply} loading={applying}>
                      Submit Application
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CandidateJobs;
