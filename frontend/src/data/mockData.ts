import { User, Job, CandidateProfile, Application, Interview, Notification } from '../types';

// Initial Admin User
export const initialUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Sarah Johnson',
    email: 'admin@recruitai.com',
    password: 'admin123',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    avatar: 'SJ'
  },
  {
    id: 'candidate-1',
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    role: 'candidate',
    createdAt: '2024-01-15T00:00:00Z',
    avatar: 'JS'
  }
];

// Sample Jobs
export const initialJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'full-time',
    description: 'We are looking for a Senior Software Engineer to join our team. You will be responsible for designing, developing, and maintaining scalable software solutions. The ideal candidate has strong experience with modern web technologies and cloud platforms.',
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS'],
    preferredSkills: ['GraphQL', 'Docker', 'Kubernetes', 'PostgreSQL'],
    experienceMin: 5,
    experienceMax: 10,
    educationLevel: "Bachelor's in Computer Science",
    salary: { min: 150000, max: 200000, currency: 'USD' },
    status: 'active',
    createdAt: '2024-01-10T00:00:00Z',
    deadline: '2024-03-31T00:00:00Z',
    applicationsCount: 45
  },
  {
    id: 'job-2',
    title: 'Data Scientist',
    department: 'Data Science',
    location: 'New York, NY',
    type: 'full-time',
    description: 'Join our data science team to build ML models and derive insights from large datasets. You will work on recommendation systems, NLP projects, and predictive analytics.',
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
    preferredSkills: ['PyTorch', 'NLP', 'Spark', 'AWS SageMaker'],
    experienceMin: 3,
    experienceMax: 7,
    educationLevel: "Master's in Data Science or related field",
    salary: { min: 130000, max: 180000, currency: 'USD' },
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
    deadline: '2024-04-15T00:00:00Z',
    applicationsCount: 62
  },
  {
    id: 'job-3',
    title: 'Product Manager',
    department: 'Product',
    location: 'Austin, TX',
    type: 'full-time',
    description: 'We are seeking an experienced Product Manager to lead product strategy and execution. You will work closely with engineering, design, and stakeholders to deliver impactful products.',
    requiredSkills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Roadmap Planning'],
    preferredSkills: ['SQL', 'A/B Testing', 'Figma', 'JIRA'],
    experienceMin: 4,
    experienceMax: 8,
    educationLevel: "Bachelor's in Business or related field",
    salary: { min: 120000, max: 160000, currency: 'USD' },
    status: 'active',
    createdAt: '2024-01-20T00:00:00Z',
    deadline: '2024-04-30T00:00:00Z',
    applicationsCount: 38
  },
  {
    id: 'job-4',
    title: 'UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'remote',
    description: 'We need a creative UX Designer to create intuitive user experiences. You will conduct user research, create wireframes, and collaborate with developers to implement designs.',
    requiredSkills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    preferredSkills: ['Adobe XD', 'Sketch', 'HTML/CSS', 'Accessibility'],
    experienceMin: 2,
    experienceMax: 5,
    educationLevel: "Bachelor's in Design or related field",
    salary: { min: 90000, max: 130000, currency: 'USD' },
    status: 'active',
    createdAt: '2024-02-01T00:00:00Z',
    deadline: '2024-05-01T00:00:00Z',
    applicationsCount: 55
  },
  {
    id: 'job-5',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Seattle, WA',
    type: 'full-time',
    description: 'Looking for a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. You will ensure system reliability, security, and performance.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    preferredSkills: ['Terraform', 'Ansible', 'Prometheus', 'Grafana'],
    experienceMin: 3,
    experienceMax: 6,
    educationLevel: "Bachelor's in Computer Science",
    salary: { min: 130000, max: 170000, currency: 'USD' },
    status: 'active',
    createdAt: '2024-02-05T00:00:00Z',
    deadline: '2024-04-20T00:00:00Z',
    applicationsCount: 28
  }
];

// Sample Candidate Profiles
export const initialCandidates: CandidateProfile[] = [
  {
    id: 'profile-1',
    userId: 'candidate-1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer with 6 years of experience in full-stack development. Passionate about building scalable applications and mentoring junior developers.',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'],
    education: [
      { degree: "Master's in Computer Science", institution: 'Stanford University', year: 2018, gpa: 3.8 },
      { degree: "Bachelor's in Computer Science", institution: 'UC Berkeley', year: 2016, gpa: 3.7 }
    ],
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        startDate: '2020-01',
        endDate: 'Present',
        description: 'Lead development of microservices architecture serving 1M+ users'
      },
      {
        title: 'Software Engineer',
        company: 'StartupXYZ',
        startDate: '2018-06',
        endDate: '2019-12',
        description: 'Built core features for the main product using React and Node.js'
      }
    ],
    certifications: [
      { name: 'AWS Solutions Architect', issuer: 'Amazon', year: 2022 },
      { name: 'Certified Kubernetes Administrator', issuer: 'CNCF', year: 2021 }
    ],
    projects: [
      { name: 'E-commerce Platform', description: 'Built a scalable e-commerce platform', technologies: ['React', 'Node.js', 'MongoDB'] }
    ],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'profile-2',
    userId: 'candidate-2',
    name: 'Emily Chen',
    email: 'emily@example.com',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    summary: 'Data Scientist with 4 years of experience in machine learning and NLP. Strong background in Python and deep learning frameworks.',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'NLP', 'SQL', 'Spark', 'Statistics'],
    education: [
      { degree: "Ph.D. in Data Science", institution: 'MIT', year: 2020, gpa: 3.9 }
    ],
    experience: [
      {
        title: 'Senior Data Scientist',
        company: 'AI Solutions Inc',
        startDate: '2020-06',
        endDate: 'Present',
        description: 'Developed NLP models for sentiment analysis and text classification'
      }
    ],
    certifications: [
      { name: 'TensorFlow Developer Certificate', issuer: 'Google', year: 2021 }
    ],
    projects: [
      { name: 'Recommendation Engine', description: 'Built a recommendation system for e-commerce', technologies: ['Python', 'TensorFlow', 'AWS'] }
    ],
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-02-05T00:00:00Z'
  },
  {
    id: 'profile-3',
    userId: 'candidate-3',
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    summary: 'Product Manager with 5 years of experience leading cross-functional teams. Expert in agile methodologies and data-driven decision making.',
    skills: ['Product Strategy', 'Agile', 'Scrum', 'Data Analysis', 'SQL', 'User Research', 'A/B Testing', 'JIRA'],
    education: [
      { degree: 'MBA', institution: 'Harvard Business School', year: 2019, gpa: 3.8 }
    ],
    experience: [
      {
        title: 'Senior Product Manager',
        company: 'ProductCo',
        startDate: '2019-08',
        endDate: 'Present',
        description: 'Led product strategy for a B2B SaaS platform with $10M ARR'
      }
    ],
    certifications: [
      { name: 'Certified Scrum Product Owner', issuer: 'Scrum Alliance', year: 2020 }
    ],
    projects: [],
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z'
  },
  {
    id: 'profile-4',
    userId: 'candidate-4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '+1 (555) 456-7890',
    location: 'Los Angeles, CA',
    summary: 'UX Designer with a passion for creating user-centered designs. 3 years of experience in mobile and web design.',
    skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'HTML/CSS'],
    education: [
      { degree: "Bachelor's in Graphic Design", institution: 'RISD', year: 2021, gpa: 3.6 }
    ],
    experience: [
      {
        title: 'UX Designer',
        company: 'DesignStudio',
        startDate: '2021-05',
        endDate: 'Present',
        description: 'Designed user interfaces for mobile apps with 500K+ downloads'
      }
    ],
    certifications: [
      { name: 'Google UX Design Certificate', issuer: 'Google', year: 2022 }
    ],
    projects: [
      { name: 'Banking App Redesign', description: 'Complete UX overhaul of a banking application', technologies: ['Figma', 'Principle'] }
    ],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'profile-5',
    userId: 'candidate-5',
    name: 'David Kim',
    email: 'david@example.com',
    phone: '+1 (555) 567-8901',
    location: 'Seattle, WA',
    summary: 'DevOps Engineer with expertise in cloud infrastructure and automation. 4 years of experience in building reliable systems.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Python', 'Ansible'],
    education: [
      { degree: "Bachelor's in Computer Engineering", institution: 'University of Washington', year: 2020, gpa: 3.7 }
    ],
    experience: [
      {
        title: 'DevOps Engineer',
        company: 'CloudTech',
        startDate: '2020-07',
        endDate: 'Present',
        description: 'Managed AWS infrastructure for high-traffic applications'
      }
    ],
    certifications: [
      { name: 'AWS DevOps Professional', issuer: 'Amazon', year: 2022 },
      { name: 'Certified Kubernetes Administrator', issuer: 'CNCF', year: 2021 }
    ],
    projects: [],
    createdAt: '2024-02-05T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z'
  }
];

// Sample Applications
export const initialApplications: Application[] = [
  {
    id: 'app-1',
    candidateId: 'profile-1',
    jobId: 'job-1',
    candidateName: 'John Smith',
    candidateEmail: 'john@example.com',
    status: 'shortlisted',
    appliedAt: '2024-02-01T00:00:00Z',
    aiScore: {
      skillMatch: 85,
      experienceMatch: 90,
      educationMatch: 95,
      certificationMatch: 80,
      overallScore: 87,
      matchedSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS'],
      missingSkills: ['GraphQL'],
      recommendations: ['Strong candidate with excellent skill match', 'Consider for senior role']
    },
    notes: 'Strong technical background'
  },
  {
    id: 'app-2',
    candidateId: 'profile-2',
    jobId: 'job-2',
    candidateName: 'Emily Chen',
    candidateEmail: 'emily@example.com',
    status: 'interview',
    appliedAt: '2024-02-05T00:00:00Z',
    aiScore: {
      skillMatch: 92,
      experienceMatch: 85,
      educationMatch: 100,
      certificationMatch: 90,
      overallScore: 91,
      matchedSkills: ['Python', 'Machine Learning', 'TensorFlow', 'NLP', 'SQL'],
      missingSkills: ['Spark'],
      recommendations: ['Excellent match for data science role', 'PhD adds significant value']
    },
    notes: 'Top candidate for DS position'
  },
  {
    id: 'app-3',
    candidateId: 'profile-3',
    jobId: 'job-3',
    candidateName: 'Michael Brown',
    candidateEmail: 'michael@example.com',
    status: 'reviewed',
    appliedAt: '2024-02-10T00:00:00Z',
    aiScore: {
      skillMatch: 88,
      experienceMatch: 82,
      educationMatch: 90,
      certificationMatch: 75,
      overallScore: 85,
      matchedSkills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
      missingSkills: ['Roadmap Planning'],
      recommendations: ['Good fit for PM role', 'MBA provides strong business acumen']
    },
    notes: ''
  },
  {
    id: 'app-4',
    candidateId: 'profile-4',
    jobId: 'job-4',
    candidateName: 'Sarah Williams',
    candidateEmail: 'sarah@example.com',
    status: 'pending',
    appliedAt: '2024-02-15T00:00:00Z',
    aiScore: {
      skillMatch: 90,
      experienceMatch: 70,
      educationMatch: 85,
      certificationMatch: 80,
      overallScore: 82,
      matchedSkills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
      missingSkills: ['Accessibility'],
      recommendations: ['Good design skills', 'Consider for junior-mid level position']
    },
    notes: ''
  },
  {
    id: 'app-5',
    candidateId: 'profile-5',
    jobId: 'job-5',
    candidateName: 'David Kim',
    candidateEmail: 'david@example.com',
    status: 'hired',
    appliedAt: '2024-02-01T00:00:00Z',
    aiScore: {
      skillMatch: 95,
      experienceMatch: 88,
      educationMatch: 85,
      certificationMatch: 100,
      overallScore: 92,
      matchedSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
      missingSkills: [],
      recommendations: ['Excellent match', 'Strong certifications', 'Immediate hire recommendation']
    },
    notes: 'Offer accepted'
  }
];

// Sample Interviews
export const initialInterviews: Interview[] = [
  {
    id: 'interview-1',
    applicationId: 'app-2',
    candidateId: 'profile-2',
    candidateName: 'Emily Chen',
    jobId: 'job-2',
    jobTitle: 'Data Scientist',
    scheduledAt: '2024-02-25T14:00:00Z',
    duration: 60,
    type: 'video',
    interviewers: ['Sarah Johnson', 'Dr. James Wilson'],
    status: 'scheduled',
    result: 'pending',
    notes: 'Technical interview - ML focus'
  },
  {
    id: 'interview-2',
    applicationId: 'app-1',
    candidateId: 'profile-1',
    candidateName: 'John Smith',
    jobId: 'job-1',
    jobTitle: 'Senior Software Engineer',
    scheduledAt: '2024-02-20T10:00:00Z',
    duration: 90,
    type: 'video',
    interviewers: ['Sarah Johnson', 'Mike Taylor'],
    status: 'completed',
    result: 'passed',
    feedback: 'Excellent technical skills, great communication',
    notes: 'System design interview'
  }
];

// Sample Notifications
export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'admin-1',
    title: 'New Application',
    message: 'John Smith applied for Senior Software Engineer position',
    type: 'info',
    read: false,
    createdAt: '2024-02-20T10:00:00Z'
  },
  {
    id: 'notif-2',
    userId: 'candidate-1',
    title: 'Application Update',
    message: 'Your application for Senior Software Engineer has been shortlisted',
    type: 'success',
    read: false,
    createdAt: '2024-02-21T14:00:00Z'
  }
];
