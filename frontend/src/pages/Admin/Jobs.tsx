import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Textarea from '../../components/UI/Textarea';
import Select from '../../components/UI/Select';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import { Job } from '../../types';
import { 
  Plus, Search, MapPin, DollarSign, Clock, Users, 
  Edit2, Trash2, Eye, Briefcase, Filter 
} from 'lucide-react';


const AdminJobs: React.FC = () => {
  const { jobs, addJob, updateJob, deleteJob, getApplicationsByJob } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time' as Job['type'],
    description: '',
    requiredSkills: '',
    preferredSkills: '',
    experienceMin: 0,
    experienceMax: 5,
    educationLevel: '',
    salaryMin: 50000,
    salaryMax: 100000,
    deadline: '',
    status: 'active' as Job['status']
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        description: job.description,
        requiredSkills: job.requiredSkills.join(', '),
        preferredSkills: job.preferredSkills.join(', '),
        experienceMin: job.experienceMin,
        experienceMax: job.experienceMax,
        educationLevel: job.educationLevel,
        salaryMin: job.salary.min,
        salaryMax: job.salary.max,
        deadline: job.deadline.split('T')[0],
        status: job.status
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        department: '',
        location: '',
        type: 'full-time',
        description: '',
        requiredSkills: '',
        preferredSkills: '',
        experienceMin: 0,
        experienceMax: 5,
        educationLevel: '',
        salaryMin: 50000,
        salaryMax: 100000,
        deadline: '',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData = {
      title: formData.title,
      department: formData.department,
      location: formData.location,
      type: formData.type,
      description: formData.description,
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
      preferredSkills: formData.preferredSkills.split(',').map(s => s.trim()).filter(s => s),
      experienceMin: formData.experienceMin,
      experienceMax: formData.experienceMax,
      educationLevel: formData.educationLevel,
      salary: { min: formData.salaryMin, max: formData.salaryMax, currency: 'USD' },
      deadline: new Date(formData.deadline).toISOString(),
      status: formData.status
    };

    if (editingJob) {
      updateJob(editingJob.id, jobData);
    } else {
      addJob(jobData);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteJob(id);
    setShowDeleteConfirm(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default'> = {
      active: 'success',
      closed: 'danger' as 'warning',
      draft: 'default'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-1">Manage your job listings and track applications</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={<Plus className="w-4 h-4" />}>
          Post New Job
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'closed', label: 'Closed' },
              { value: 'draft', label: 'Draft' }
            ]}
            className="md:w-48"
          />
        </div>
      </Card>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map(job => {
          const applicationCount = getApplicationsByJob(job.id).length;
          return (
            <Card key={job.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.department}</p>
                  </div>
                </div>
                {getStatusBadge(job.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  {job.experienceMin}-{job.experienceMax} years experience
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.requiredSkills.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="info" size="sm">{skill}</Badge>
                ))}
                {job.requiredSkills.length > 4 && (
                  <Badge variant="default" size="sm">+{job.requiredSkills.length - 4} more</Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  {applicationCount} applications
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<Edit2 className="w-4 h-4" />}
                    onClick={() => handleOpenModal(job)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<Trash2 className="w-4 h-4 text-red-500" />}
                    onClick={() => setShowDeleteConfirm(job.id)}
                  />
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

      {/* Create/Edit Job Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Software Engineer"
              required
            />
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Engineering"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. San Francisco, CA"
              required
            />
            <Select
              label="Employment Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Job['type'] })}
              options={[
                { value: 'full-time', label: 'Full-time' },
                { value: 'part-time', label: 'Part-time' },
                { value: 'contract', label: 'Contract' },
                { value: 'remote', label: 'Remote' }
              ]}
            />
          </div>

          <Textarea
            label="Job Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            rows={4}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Required Skills (comma-separated)"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              placeholder="e.g. JavaScript, React, Node.js"
              required
            />
            <Input
              label="Preferred Skills (comma-separated)"
              value={formData.preferredSkills}
              onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
              placeholder="e.g. TypeScript, GraphQL"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Min Experience (years)"
              type="number"
              value={formData.experienceMin}
              onChange={(e) => setFormData({ ...formData, experienceMin: parseInt(e.target.value) })}
              min={0}
              required
            />
            <Input
              label="Max Experience (years)"
              type="number"
              value={formData.experienceMax}
              onChange={(e) => setFormData({ ...formData, experienceMax: parseInt(e.target.value) })}
              min={0}
              required
            />
            <Input
              label="Education Level"
              value={formData.educationLevel}
              onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
              placeholder="e.g. Bachelor's in CS"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Min Salary ($)"
              type="number"
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: parseInt(e.target.value) })}
              min={0}
              required
            />
            <Input
              label="Max Salary ($)"
              type="number"
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: parseInt(e.target.value) })}
              min={0}
              required
            />
            <Input
              label="Application Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Job['status'] })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
              { value: 'closed', label: 'Closed' }
            ]}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingJob ? 'Update Job' : 'Post Job'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Job Posting"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this job posting? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(showDeleteConfirm!)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminJobs;
