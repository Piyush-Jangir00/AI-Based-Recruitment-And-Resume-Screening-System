import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Textarea from '../../components/UI/Textarea';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import { CandidateProfile, Education, WorkExperience, Certification } from '../../types';
import { parseResumeText, generateResumeSuggestions } from '../../services/aiService';
import { 
  User, Mail, Phone, MapPin, Plus, Edit2, 
  Trash2, Save, Upload, Sparkles, AlertCircle,
  Briefcase, GraduationCap, Award, Code
} from 'lucide-react';

const CandidateProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { candidates, addCandidate, updateCandidate, getCandidateByUserId, jobs } = useData();
  
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: ''
  });

  const [educationForm, setEducationForm] = useState<Education>({
    degree: '',
    institution: '',
    year: new Date().getFullYear()
  });

  const [experienceForm, setExperienceForm] = useState<WorkExperience>({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [certForm, setCertForm] = useState<Certification>({
    name: '',
    issuer: '',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    if (user) {
      const existingProfile = getCandidateByUserId(user.id);
      if (existingProfile) {
        setProfile(existingProfile);
        setFormData({
          name: existingProfile.name,
          email: existingProfile.email,
          phone: existingProfile.phone,
          location: existingProfile.location,
          summary: existingProfile.summary,
          skills: existingProfile.skills.join(', ')
        });
      } else {
        setFormData({
          name: user.name,
          email: user.email,
          phone: '',
          location: '',
          summary: '',
          skills: ''
        });
        setIsEditing(true);
      }
    }
  }, [user, candidates]);

  useEffect(() => {
    if (profile) {
      const sampleJob = jobs.find(j => j.status === 'active');
      setSuggestions(generateResumeSuggestions(profile, sampleJob));
    }
  }, [profile, jobs]);

  const handleSaveProfile = () => {
    if (!user) return;

    const profileData = {
      userId: user.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      summary: formData.summary,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      education: profile?.education || [],
      experience: profile?.experience || [],
      certifications: profile?.certifications || [],
      projects: profile?.projects || []
    };

    if (profile) {
      updateCandidate(profile.id, profileData);
    } else {
      addCandidate(profileData);
    }

    setIsEditing(false);
  };

  const handleParseResume = () => {
    setParsing(true);
    
    // Simulate parsing delay
    setTimeout(() => {
      const parsed = parseResumeText(resumeText);
      
      if (parsed.skills && parsed.skills.length > 0) {
        setFormData(prev => ({
          ...prev,
          skills: [...new Set([...prev.skills.split(',').map(s => s.trim()).filter(s => s), ...parsed.skills!])].join(', ')
        }));
      }
      
      if (parsed.email) {
        setFormData(prev => ({ ...prev, email: parsed.email! }));
      }
      
      if (parsed.phone) {
        setFormData(prev => ({ ...prev, phone: parsed.phone! }));
      }

      if (profile && parsed.education) {
        updateCandidate(profile.id, { 
          education: [...profile.education, ...parsed.education]
        });
      }

      if (profile && parsed.experience) {
        updateCandidate(profile.id, { 
          experience: [...profile.experience, ...parsed.experience]
        });
      }

      setParsing(false);
      setShowResumeModal(false);
      setResumeText('');
    }, 1500);
  };

  const handleAddEducation = () => {
    if (!profile) return;
    updateCandidate(profile.id, {
      education: [...profile.education, educationForm]
    });
    setShowEducationModal(false);
    setEducationForm({ degree: '', institution: '', year: new Date().getFullYear() });
  };

  const handleDeleteEducation = (index: number) => {
    if (!profile) return;
    const newEducation = profile.education.filter((_, i) => i !== index);
    updateCandidate(profile.id, { education: newEducation });
  };

  const handleAddExperience = () => {
    if (!profile) return;
    updateCandidate(profile.id, {
      experience: [...profile.experience, experienceForm]
    });
    setShowExperienceModal(false);
    setExperienceForm({ title: '', company: '', startDate: '', endDate: '', description: '' });
  };

  const handleDeleteExperience = (index: number) => {
    if (!profile) return;
    const newExperience = profile.experience.filter((_, i) => i !== index);
    updateCandidate(profile.id, { experience: newExperience });
  };

  const handleAddCert = () => {
    if (!profile) return;
    updateCandidate(profile.id, {
      certifications: [...profile.certifications, certForm]
    });
    setShowCertModal(false);
    setCertForm({ name: '', issuer: '', year: new Date().getFullYear() });
  };

  const handleDeleteCert = (index: number) => {
    if (!profile) return;
    const newCerts = profile.certifications.filter((_, i) => i !== index);
    updateCandidate(profile.id, { certifications: newCerts });
  };

  // Calculate profile completeness
  const calculateCompleteness = () => {
    const fields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.location,
      formData.summary,
      formData.skills,
      profile?.education?.length,
      profile?.experience?.length
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your profile and resume information</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowResumeModal(true)}
            icon={<Upload className="w-4 h-4" />}
          >
            Parse Resume
          </Button>
          {isEditing ? (
            <Button onClick={handleSaveProfile} icon={<Save className="w-4 h-4" />}>
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} icon={<Edit2 className="w-4 h-4" />}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-500" />
              Basic Information
            </h2>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  icon={<User className="w-5 h-5" />}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="w-5 h-5" />}
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  icon={<Phone className="w-5 h-5" />}
                />
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  icon={<MapPin className="w-5 h-5" />}
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Professional Summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={4}
                    placeholder="Write a brief summary about yourself and your career goals..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {formData.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{formData.name}</h3>
                    <p className="text-gray-500">{formData.location || 'No location set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {formData.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {formData.phone || 'Not set'}
                  </div>
                </div>
                {formData.summary && (
                  <p className="text-gray-600 pt-4 border-t">{formData.summary}</p>
                )}
              </div>
            )}
          </Card>

          {/* Skills */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-indigo-500" />
              Skills
            </h2>
            {isEditing ? (
              <Input
                label="Skills (comma-separated)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. JavaScript, React, Node.js, Python"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.skills.split(',').map((skill, i) => skill.trim() && (
                  <Badge key={i} variant="info" size="md">{skill.trim()}</Badge>
                ))}
                {!formData.skills && (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
            )}
          </Card>

          {/* Work Experience */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
                Work Experience
              </h2>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowExperienceModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>
            {profile?.experience && profile.experience.length > 0 ? (
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{exp.title}</h4>
                      <p className="text-sm text-indigo-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                      {exp.description && (
                        <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteExperience(index)}
                      icon={<Trash2 className="w-4 h-4 text-red-500" />}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No work experience added</p>
            )}
          </Card>

          {/* Education */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-indigo-500" />
                Education
              </h2>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowEducationModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>
            {profile?.education && profile.education.length > 0 ? (
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                      <p className="text-sm text-indigo-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteEducation(index)}
                      icon={<Trash2 className="w-4 h-4 text-red-500" />}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No education added</p>
            )}
          </Card>

          {/* Certifications */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-indigo-500" />
                Certifications
              </h2>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowCertModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>
            {profile?.certifications && profile.certifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-500">{cert.issuer} • {cert.year}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteCert(index)}
                      icon={<Trash2 className="w-4 h-4 text-red-500" />}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No certifications added</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completeness */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Profile Strength</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#E5E7EB"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke={calculateCompleteness() >= 80 ? '#10B981' : calculateCompleteness() >= 50 ? '#6366F1' : '#F59E0B'}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${(calculateCompleteness() / 100) * 301} 301`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{calculateCompleteness()}%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500">
              {calculateCompleteness() < 100 
                ? 'Complete your profile to improve visibility'
                : 'Your profile is complete! 🎉'}
            </p>
          </Card>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                AI Suggestions
              </h3>
              <ul className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-purple-500 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Profile Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Skills</span>
                <span className="font-medium">{formData.skills.split(',').filter(s => s.trim()).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Experience</span>
                <span className="font-medium">{profile?.experience?.length || 0} positions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Education</span>
                <span className="font-medium">{profile?.education?.length || 0} entries</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Certifications</span>
                <span className="font-medium">{profile?.certifications?.length || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Resume Upload Modal */}
      <Modal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        title="Parse Resume with AI"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Paste your resume text below and our AI will extract skills, experience, and education automatically.
          </p>
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={12}
            placeholder="Paste your resume text here...

Example:
John Doe
Software Engineer with 5 years of experience in JavaScript, React, Node.js
Education: Bachelor's in Computer Science from MIT
Certifications: AWS Certified Developer"
          />
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowResumeModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleParseResume} 
              loading={parsing}
              disabled={!resumeText.trim()}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Parse with AI
            </Button>
          </div>
        </div>
      </Modal>

      {/* Education Modal */}
      <Modal
        isOpen={showEducationModal}
        onClose={() => setShowEducationModal(false)}
        title="Add Education"
      >
        <div className="space-y-4">
          <Input
            label="Degree"
            value={educationForm.degree}
            onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
            placeholder="e.g. Bachelor's in Computer Science"
          />
          <Input
            label="Institution"
            value={educationForm.institution}
            onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
            placeholder="e.g. Stanford University"
          />
          <Input
            label="Graduation Year"
            type="number"
            value={educationForm.year}
            onChange={(e) => setEducationForm({ ...educationForm, year: parseInt(e.target.value) })}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowEducationModal(false)}>Cancel</Button>
            <Button onClick={handleAddEducation}>Add Education</Button>
          </div>
        </div>
      </Modal>

      {/* Experience Modal */}
      <Modal
        isOpen={showExperienceModal}
        onClose={() => setShowExperienceModal(false)}
        title="Add Work Experience"
      >
        <div className="space-y-4">
          <Input
            label="Job Title"
            value={experienceForm.title}
            onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
            placeholder="e.g. Software Engineer"
          />
          <Input
            label="Company"
            value={experienceForm.company}
            onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
            placeholder="e.g. Google"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              value={experienceForm.startDate}
              onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
              placeholder="e.g. 2020-01"
            />
            <Input
              label="End Date"
              value={experienceForm.endDate}
              onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
              placeholder="e.g. Present"
            />
          </div>
          <Textarea
            label="Description"
            value={experienceForm.description}
            onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
            rows={3}
            placeholder="Describe your responsibilities and achievements..."
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowExperienceModal(false)}>Cancel</Button>
            <Button onClick={handleAddExperience}>Add Experience</Button>
          </div>
        </div>
      </Modal>

      {/* Certification Modal */}
      <Modal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        title="Add Certification"
      >
        <div className="space-y-4">
          <Input
            label="Certification Name"
            value={certForm.name}
            onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
            placeholder="e.g. AWS Solutions Architect"
          />
          <Input
            label="Issuing Organization"
            value={certForm.issuer}
            onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
            placeholder="e.g. Amazon Web Services"
          />
          <Input
            label="Year"
            type="number"
            value={certForm.year}
            onChange={(e) => setCertForm({ ...certForm, year: parseInt(e.target.value) })}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowCertModal(false)}>Cancel</Button>
            <Button onClick={handleAddCert}>Add Certification</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateProfilePage;
