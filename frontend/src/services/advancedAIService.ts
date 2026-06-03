import { Job, CandidateProfile, Application } from '../types';

// AI Resume Screening with LLM-style Analysis
export interface AIResumeAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skillsAnalysis: {
    matched: string[];
    missing: string[];
    additional: string[];
  };
  experienceAnalysis: {
    totalYears: number;
    relevantYears: number;
    seniorityLevel: string;
    industryMatch: boolean;
  };
  educationAnalysis: {
    level: string;
    relevance: string;
    score: number;
  };
  overallAssessment: string;
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
  confidenceScore: number;
}

export const generateAIResumeAnalysis = (
  candidate: CandidateProfile, 
  job: Job
): AIResumeAnalysis => {
  const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
  const requiredSkillsLower = job.requiredSkills.map(s => s.toLowerCase());
  const preferredSkillsLower = job.preferredSkills.map(s => s.toLowerCase());
  
  const matchedSkills = job.requiredSkills.filter(skill => 
    candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );
  
  const missingSkills = job.requiredSkills.filter(skill => 
    !candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );
  
  const additionalSkills = candidate.skills.filter(skill => 
    !requiredSkillsLower.some(rs => skill.toLowerCase().includes(rs) || rs.includes(skill.toLowerCase())) &&
    !preferredSkillsLower.some(ps => skill.toLowerCase().includes(ps) || ps.includes(skill.toLowerCase()))
  );

  const totalYears = candidate.experience.reduce((acc, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
    return acc + Math.max(0, (end.getFullYear() - start.getFullYear()));
  }, 0);

  const skillMatchPercent = (matchedSkills.length / job.requiredSkills.length) * 100;
  const expMatchPercent = totalYears >= job.experienceMin ? 100 : (totalYears / job.experienceMin) * 100;
  
  let recommendation: AIResumeAnalysis['hiringRecommendation'];
  let confidenceScore: number;
  
  if (skillMatchPercent >= 80 && expMatchPercent >= 80) {
    recommendation = 'Strong Hire';
    confidenceScore = 90 + Math.random() * 8;
  } else if (skillMatchPercent >= 60 && expMatchPercent >= 60) {
    recommendation = 'Hire';
    confidenceScore = 75 + Math.random() * 10;
  } else if (skillMatchPercent >= 40 || expMatchPercent >= 50) {
    recommendation = 'Maybe';
    confidenceScore = 55 + Math.random() * 15;
  } else {
    recommendation = 'No Hire';
    confidenceScore = 30 + Math.random() * 20;
  }

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (matchedSkills.length >= job.requiredSkills.length * 0.7) {
    strengths.push(`Strong technical match with ${matchedSkills.length}/${job.requiredSkills.length} required skills`);
  }
  if (totalYears >= job.experienceMax) {
    strengths.push(`Extensive experience (${totalYears} years) exceeds requirements`);
  } else if (totalYears >= job.experienceMin) {
    strengths.push(`Solid experience of ${totalYears} years meets requirements`);
  }
  if (candidate.certifications.length >= 2) {
    strengths.push(`Multiple certifications demonstrate commitment to professional growth`);
  }
  if (candidate.education.length > 0) {
    const hasAdvancedDegree = candidate.education.some(e => 
      e.degree.toLowerCase().includes('master') || e.degree.toLowerCase().includes('phd')
    );
    if (hasAdvancedDegree) {
      strengths.push('Advanced degree provides strong academic foundation');
    }
  }
  if (additionalSkills.length > 3) {
    strengths.push(`Diverse skill set with ${additionalSkills.length} additional relevant technologies`);
  }

  if (missingSkills.length > 0) {
    weaknesses.push(`Missing ${missingSkills.length} required skill(s): ${missingSkills.slice(0, 3).join(', ')}`);
  }
  if (totalYears < job.experienceMin) {
    weaknesses.push(`Experience (${totalYears} years) below minimum requirement of ${job.experienceMin} years`);
  }
  if (candidate.certifications.length === 0) {
    weaknesses.push('No professional certifications listed');
  }
  if (!candidate.summary || candidate.summary.length < 50) {
    weaknesses.push('Weak or missing professional summary');
  }

  const seniorityLevel = totalYears >= 8 ? 'Senior/Lead' : 
                         totalYears >= 5 ? 'Mid-Senior' : 
                         totalYears >= 2 ? 'Mid-Level' : 'Junior';

  const summary = `${candidate.name} is a ${seniorityLevel} professional with ${totalYears} years of experience. ` +
    `The candidate demonstrates ${matchedSkills.length >= job.requiredSkills.length * 0.7 ? 'strong' : 'partial'} alignment ` +
    `with the ${job.title} position requirements. ` +
    (missingSkills.length > 0 
      ? `Key skill gaps include ${missingSkills.slice(0, 2).join(' and ')}. `
      : 'All required skills are present. ') +
    `Overall, this candidate ${recommendation === 'Strong Hire' || recommendation === 'Hire' 
      ? 'shows promise and should advance in the interview process' 
      : 'may need additional evaluation or training'}.`;

  return {
    summary,
    strengths,
    weaknesses,
    skillsAnalysis: {
      matched: matchedSkills,
      missing: missingSkills,
      additional: additionalSkills.slice(0, 5)
    },
    experienceAnalysis: {
      totalYears,
      relevantYears: Math.round(totalYears * (skillMatchPercent / 100)),
      seniorityLevel,
      industryMatch: skillMatchPercent > 50
    },
    educationAnalysis: {
      level: candidate.education[0]?.degree || 'Not specified',
      relevance: skillMatchPercent > 60 ? 'High' : 'Moderate',
      score: Math.min(100, (candidate.education.length * 30) + (skillMatchPercent * 0.5))
    },
    overallAssessment: recommendation === 'Strong Hire' 
      ? 'Exceptional candidate who exceeds requirements'
      : recommendation === 'Hire'
      ? 'Qualified candidate who meets core requirements'
      : recommendation === 'Maybe'
      ? 'Potential candidate with some gaps to address'
      : 'Candidate does not meet minimum requirements',
    hiringRecommendation: recommendation,
    confidenceScore: Math.round(confidenceScore)
  };
};

// AI Interview Question Generator
export interface InterviewQuestion {
  id: string;
  category: 'technical' | 'behavioral' | 'situational' | 'skill-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  followUp?: string;
  evaluationCriteria: string[];
  expectedDuration: number;
}

const technicalQuestionTemplates: Record<string, string[]> = {
  'javascript': [
    'Explain the event loop in JavaScript and how it handles asynchronous operations.',
    'What are closures and how would you use them in a real application?',
    'Describe the difference between var, let, and const.',
    'How does prototypal inheritance work in JavaScript?'
  ],
  'react': [
    'Explain the Virtual DOM and how React uses it for performance optimization.',
    'What is the difference between useMemo and useCallback? When would you use each?',
    'How would you implement state management in a large React application?',
    'Describe the React component lifecycle and its modern hooks equivalent.'
  ],
  'typescript': [
    'What are generics in TypeScript and how do they improve code reusability?',
    'Explain the difference between interface and type in TypeScript.',
    'How would you handle strict null checks in a TypeScript project?',
    'Describe how you would type a higher-order component.'
  ],
  'python': [
    'Explain the GIL (Global Interpreter Lock) and its implications.',
    'What are decorators and how would you implement one?',
    'Describe the difference between lists and tuples.',
    'How does garbage collection work in Python?'
  ],
  'node.js': [
    'How does the Node.js event-driven architecture work?',
    'Explain the difference between process.nextTick and setImmediate.',
    'How would you handle memory leaks in a Node.js application?',
    'Describe strategies for scaling a Node.js application.'
  ],
  'aws': [
    'Explain the difference between EC2, Lambda, and ECS. When would you use each?',
    'How would you design a highly available architecture on AWS?',
    'Describe IAM roles and policies and their security implications.',
    'What strategies would you use to optimize AWS costs?'
  ],
  'docker': [
    'Explain the difference between a Docker image and a container.',
    'How would you optimize a Dockerfile for production?',
    'Describe Docker networking modes and when to use each.',
    'How do you handle secrets in Docker containers?'
  ],
  'sql': [
    'Explain the difference between INNER JOIN, LEFT JOIN, and CROSS JOIN.',
    'How would you optimize a slow-running query?',
    'Describe database indexing strategies and trade-offs.',
    'What are ACID properties and why are they important?'
  ],
  'machine learning': [
    'Explain the bias-variance tradeoff.',
    'How would you handle imbalanced datasets?',
    'Describe the difference between supervised and unsupervised learning.',
    'What techniques would you use to prevent overfitting?'
  ]
};

const behavioralQuestions = [
  'Tell me about a time you had to work with a difficult team member.',
  'Describe a situation where you had to meet a tight deadline.',
  'Give an example of a time you failed and what you learned from it.',
  'How do you handle conflicting priorities?',
  'Tell me about your most challenging project and how you overcame obstacles.',
  'Describe a time when you had to learn a new technology quickly.',
  'How do you approach giving and receiving feedback?',
  'Tell me about a time you had to make a decision with incomplete information.'
];

const situationalQuestions = [
  'How would you handle a production outage during off-hours?',
  'What would you do if you disagreed with a technical decision made by your team lead?',
  'How would you approach mentoring a junior developer?',
  'What steps would you take to debug a performance issue in production?',
  'How would you prioritize features with competing stakeholders?'
];

export const generateInterviewQuestions = (
  candidate: CandidateProfile,
  job: Job,
  count: number = 10
): InterviewQuestion[] => {
  const questions: InterviewQuestion[] = [];
  const usedQuestions = new Set<string>();

  // Get skill-specific questions
  const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
  const relevantSkills = Object.keys(technicalQuestionTemplates).filter(skill =>
    candidateSkillsLower.some(cs => cs.includes(skill)) ||
    job.requiredSkills.some(rs => rs.toLowerCase().includes(skill))
  );

  // Add technical questions
  relevantSkills.forEach(skill => {
    const skillQuestions = technicalQuestionTemplates[skill];
    const randomQ = skillQuestions[Math.floor(Math.random() * skillQuestions.length)];
    if (!usedQuestions.has(randomQ) && questions.length < count * 0.5) {
      usedQuestions.add(randomQ);
      questions.push({
        id: `q-${Date.now()}-${questions.length}`,
        category: 'technical',
        difficulty: Math.random() > 0.5 ? 'medium' : 'hard',
        question: randomQ,
        followUp: 'Can you provide a specific example from your experience?',
        evaluationCriteria: [
          'Depth of understanding',
          'Practical application',
          'Communication clarity',
          'Problem-solving approach'
        ],
        expectedDuration: 5
      });
    }
  });

  // Add behavioral questions
  const shuffledBehavioral = [...behavioralQuestions].sort(() => Math.random() - 0.5);
  shuffledBehavioral.slice(0, 3).forEach(q => {
    if (questions.length < count) {
      questions.push({
        id: `q-${Date.now()}-${questions.length}`,
        category: 'behavioral',
        difficulty: 'medium',
        question: q,
        evaluationCriteria: [
          'Self-awareness',
          'Growth mindset',
          'Team collaboration',
          'Communication skills'
        ],
        expectedDuration: 4
      });
    }
  });

  // Add situational questions
  const shuffledSituational = [...situationalQuestions].sort(() => Math.random() - 0.5);
  shuffledSituational.slice(0, 2).forEach(q => {
    if (questions.length < count) {
      questions.push({
        id: `q-${Date.now()}-${questions.length}`,
        category: 'situational',
        difficulty: 'medium',
        question: q,
        evaluationCriteria: [
          'Decision-making process',
          'Prioritization skills',
          'Leadership potential',
          'Professional judgment'
        ],
        expectedDuration: 4
      });
    }
  });

  // Add skill-gap specific questions
  const missingSkills = job.requiredSkills.filter(skill =>
    !candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()))
  );

  if (missingSkills.length > 0 && questions.length < count) {
    questions.push({
      id: `q-${Date.now()}-gap`,
      category: 'skill-specific',
      difficulty: 'medium',
      question: `I notice you don't have ${missingSkills[0]} listed on your resume. How would you approach learning this technology for this role?`,
      evaluationCriteria: [
        'Learning agility',
        'Self-motivation',
        'Realistic assessment',
        'Action-oriented thinking'
      ],
      expectedDuration: 3
    });
  }

  return questions.slice(0, count);
};

// AI Interview Feedback Analyzer
export interface InterviewFeedbackAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  keyStrengths: string[];
  areasForImprovement: string[];
  recommendation: 'Strong Hire' | 'Hire' | 'Hold' | 'No Hire';
  summary: string;
  nextSteps: string[];
  fitScore: number;
}

export const analyzeInterviewFeedback = (
  feedbackText: string,
  interviewerNotes: string[] = []
): InterviewFeedbackAnalysis => {
  const combinedFeedback = [feedbackText, ...interviewerNotes].join(' ').toLowerCase();
  
  const positiveKeywords = [
    'excellent', 'strong', 'impressive', 'great', 'good', 'skilled',
    'knowledgeable', 'experienced', 'confident', 'clear', 'articulate',
    'passionate', 'enthusiastic', 'prepared', 'professional', 'recommend'
  ];
  
  const negativeKeywords = [
    'weak', 'lacking', 'poor', 'unclear', 'confused', 'nervous',
    'inexperienced', 'unprepared', 'concern', 'struggle', 'difficult',
    'hesitant', 'unsure', 'limited', 'gap', 'miss'
  ];

  const positiveCount = positiveKeywords.filter(kw => combinedFeedback.includes(kw)).length;
  const negativeCount = negativeKeywords.filter(kw => combinedFeedback.includes(kw)).length;
  
  const sentiment = positiveCount > negativeCount + 2 ? 'positive' :
                   negativeCount > positiveCount + 2 ? 'negative' : 'neutral';

  const fitScore = Math.min(100, Math.max(0, 50 + (positiveCount * 5) - (negativeCount * 7)));

  let recommendation: InterviewFeedbackAnalysis['recommendation'];
  if (fitScore >= 80) recommendation = 'Strong Hire';
  else if (fitScore >= 60) recommendation = 'Hire';
  else if (fitScore >= 40) recommendation = 'Hold';
  else recommendation = 'No Hire';

  const keyStrengths = [];
  const areasForImprovement = [];

  if (combinedFeedback.includes('technical')) {
    if (positiveCount > negativeCount) keyStrengths.push('Strong technical knowledge');
    else areasForImprovement.push('Technical skills need development');
  }
  if (combinedFeedback.includes('communicat')) {
    if (positiveCount > negativeCount) keyStrengths.push('Excellent communication skills');
    else areasForImprovement.push('Communication could be improved');
  }
  if (combinedFeedback.includes('problem') || combinedFeedback.includes('solution')) {
    keyStrengths.push('Good problem-solving abilities');
  }
  if (combinedFeedback.includes('team') || combinedFeedback.includes('collaborat')) {
    keyStrengths.push('Team player mentality');
  }
  if (combinedFeedback.includes('experience')) {
    if (sentiment === 'positive') keyStrengths.push('Relevant experience');
    else areasForImprovement.push('Experience gaps identified');
  }

  if (keyStrengths.length === 0) keyStrengths.push('Shows potential with proper guidance');
  if (areasForImprovement.length === 0 && sentiment !== 'positive') {
    areasForImprovement.push('Further evaluation recommended');
  }

  const nextSteps = [];
  if (recommendation === 'Strong Hire') {
    nextSteps.push('Proceed to offer stage');
    nextSteps.push('Discuss compensation package');
    nextSteps.push('Complete reference checks');
  } else if (recommendation === 'Hire') {
    nextSteps.push('Schedule final round interview');
    nextSteps.push('Complete background check');
    nextSteps.push('Prepare offer details');
  } else if (recommendation === 'Hold') {
    nextSteps.push('Schedule additional technical assessment');
    nextSteps.push('Discuss with hiring manager');
    nextSteps.push('Consider for alternative roles');
  } else {
    nextSteps.push('Send polite rejection email');
    nextSteps.push('Keep on file for future opportunities');
  }

  return {
    overallSentiment: sentiment,
    keyStrengths,
    areasForImprovement,
    recommendation,
    summary: `Based on the interview feedback, the candidate demonstrates a ${sentiment} overall impression. ` +
      `Key areas evaluated include technical skills, communication, and problem-solving. ` +
      `The recommendation is to ${recommendation.toLowerCase()} this candidate.`,
    nextSteps,
    fitScore
  };
};

// AI Cover Letter Generator
export const generateCoverLetter = (
  candidate: CandidateProfile,
  job: Job
): string => {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const relevantSkills = candidate.skills.filter(skill =>
    job.requiredSkills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()) || 
    skill.toLowerCase().includes(rs.toLowerCase()))
  );

  const recentExp = candidate.experience[0];
  const topEducation = candidate.education[0];

  return `${today}

Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at your company. With ${candidate.experience.length > 0 ? `my background as a ${recentExp?.title}` : 'my passion for this field'} and expertise in ${relevantSkills.slice(0, 3).join(', ')}, I am confident I would be a valuable addition to your team.

${candidate.summary || `I am a dedicated professional with a proven track record of delivering results. My technical skills and collaborative approach make me well-suited for this opportunity.`}

Key qualifications I bring to this role:

${relevantSkills.length > 0 ? `• Technical Expertise: Proficient in ${relevantSkills.slice(0, 5).join(', ')}, directly aligned with your requirements.` : '• Eager to learn and grow in this role.'}

${recentExp ? `• Professional Experience: As ${recentExp.title} at ${recentExp.company}, I ${recentExp.description?.toLowerCase() || 'contributed to key projects and initiatives'}.` : ''}

${topEducation ? `• Educational Background: ${topEducation.degree} from ${topEducation.institution}, providing a strong foundation for this role.` : ''}

${candidate.certifications.length > 0 ? `• Certifications: ${candidate.certifications.map(c => c.name).join(', ')}, demonstrating my commitment to professional development.` : ''}

I am particularly drawn to this opportunity because it aligns with my career goals and would allow me to contribute my skills in ${job.requiredSkills.slice(0, 2).join(' and ')}. I am excited about the prospect of working with your team and contributing to ${job.department}'s success.

I would welcome the opportunity to discuss how my background and skills would benefit your organization. Thank you for considering my application.

Sincerely,
${candidate.name}
${candidate.email}
${candidate.phone || ''}`;
};

// AI Resume Improvement Suggestions
export interface ResumeImprovement {
  category: 'format' | 'content' | 'keywords' | 'ats' | 'impact';
  priority: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  example?: string;
}

export const generateResumeImprovements = (
  candidate: CandidateProfile,
  targetJob?: Job
): ResumeImprovement[] => {
  const improvements: ResumeImprovement[] = [];

  // Content suggestions
  if (!candidate.summary || candidate.summary.length < 100) {
    improvements.push({
      category: 'content',
      priority: 'high',
      issue: 'Missing or weak professional summary',
      suggestion: 'Add a compelling 2-3 sentence summary highlighting your key achievements and career goals.',
      example: `Results-driven ${candidate.experience[0]?.title || 'professional'} with ${candidate.experience.length}+ years of experience in ${candidate.skills.slice(0, 3).join(', ')}. Proven track record of delivering high-impact solutions.`
    });
  }

  if (candidate.skills.length < 8) {
    improvements.push({
      category: 'keywords',
      priority: 'high',
      issue: 'Limited skills listed',
      suggestion: 'Add more relevant technical and soft skills to improve ATS matching.',
      example: 'Consider adding: Leadership, Agile, Communication, Problem-Solving'
    });
  }

  if (candidate.experience.some(exp => !exp.description || exp.description.length < 50)) {
    improvements.push({
      category: 'impact',
      priority: 'high',
      issue: 'Experience descriptions lack detail',
      suggestion: 'Use action verbs and quantify achievements. Start with verbs like Led, Developed, Increased, Reduced.',
      example: 'Instead of "Worked on projects", write "Led development of 3 microservices, reducing load time by 40%"'
    });
  }

  if (candidate.certifications.length === 0) {
    improvements.push({
      category: 'content',
      priority: 'medium',
      issue: 'No certifications listed',
      suggestion: 'Add relevant professional certifications to stand out. Many are available online.',
      example: 'Consider: AWS Certified, Google Cloud, Scrum Master, PMP'
    });
  }

  if (candidate.projects.length === 0) {
    improvements.push({
      category: 'content',
      priority: 'medium',
      issue: 'No projects section',
      suggestion: 'Add a projects section showcasing hands-on work, especially for technical roles.',
      example: 'Include personal projects, open source contributions, or hackathon projects'
    });
  }

  // ATS Optimization
  if (targetJob) {
    const missingKeywords = targetJob.requiredSkills.filter(skill =>
      !candidate.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
    
    if (missingKeywords.length > 0) {
      improvements.push({
        category: 'ats',
        priority: 'high',
        issue: `Missing ${missingKeywords.length} key skills from job requirements`,
        suggestion: `Add these skills if you have experience: ${missingKeywords.slice(0, 4).join(', ')}`,
        example: 'Match exact keywords used in the job description for better ATS scores'
      });
    }
  }

  // Format suggestions
  improvements.push({
    category: 'format',
    priority: 'low',
    issue: 'Resume formatting',
    suggestion: 'Use a clean, single-column format for better ATS parsing. Avoid tables, graphics, and headers/footers.',
    example: 'Standard fonts: Arial, Calibri, Georgia. Font size: 10-12pt'
  });

  return improvements.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

// Duplicate Candidate Detection
export interface DuplicateCandidate {
  candidateId: string;
  matchType: 'email' | 'phone' | 'name' | 'similar';
  matchConfidence: number;
  matchedFields: string[];
}

export const detectDuplicateCandidates = (
  newCandidate: Partial<CandidateProfile>,
  existingCandidates: CandidateProfile[]
): DuplicateCandidate[] => {
  const duplicates: DuplicateCandidate[] = [];

  existingCandidates.forEach(existing => {
    const matchedFields: string[] = [];
    let matchConfidence = 0;

    // Email match (exact)
    if (newCandidate.email && existing.email.toLowerCase() === newCandidate.email.toLowerCase()) {
      matchedFields.push('email');
      matchConfidence += 50;
    }

    // Phone match
    if (newCandidate.phone && existing.phone) {
      const cleanNew = newCandidate.phone.replace(/\D/g, '');
      const cleanExisting = existing.phone.replace(/\D/g, '');
      if (cleanNew === cleanExisting) {
        matchedFields.push('phone');
        matchConfidence += 40;
      }
    }

    // Name similarity
    if (newCandidate.name && existing.name) {
      const newName = newCandidate.name.toLowerCase();
      const existingName = existing.name.toLowerCase();
      if (newName === existingName) {
        matchedFields.push('name');
        matchConfidence += 30;
      } else if (newName.split(' ')[0] === existingName.split(' ')[0] ||
                 newName.split(' ').slice(-1)[0] === existingName.split(' ').slice(-1)[0]) {
        matchedFields.push('partial_name');
        matchConfidence += 15;
      }
    }

    // Skills similarity
    if (newCandidate.skills && existing.skills) {
      const commonSkills = newCandidate.skills.filter(s => 
        existing.skills.some(es => es.toLowerCase() === s.toLowerCase())
      );
      if (commonSkills.length > 5) {
        matchedFields.push('skills');
        matchConfidence += 10;
      }
    }

    if (matchConfidence >= 30) {
      duplicates.push({
        candidateId: existing.id,
        matchType: matchedFields.includes('email') ? 'email' :
                  matchedFields.includes('phone') ? 'phone' :
                  matchedFields.includes('name') ? 'name' : 'similar',
        matchConfidence: Math.min(100, matchConfidence),
        matchedFields
      });
    }
  });

  return duplicates.sort((a, b) => b.matchConfidence - a.matchConfidence);
};

// Personalized Job Recommendations
export const getPersonalizedJobRecommendations = (
  candidate: CandidateProfile,
  jobs: Job[],
  applications: Application[]
): Array<{ job: Job; matchScore: number; reasons: string[] }> => {
  const appliedJobIds = new Set(applications.map(a => a.jobId));
  const availableJobs = jobs.filter(j => j.status === 'active' && !appliedJobIds.has(j.id));

  const recommendations = availableJobs.map(job => {
    const reasons: string[] = [];
    let matchScore = 0;

    // Skill matching
    const matchedSkills = candidate.skills.filter(skill =>
      job.requiredSkills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(rs.toLowerCase()))
    );
    const skillMatchPercent = (matchedSkills.length / job.requiredSkills.length) * 100;
    matchScore += skillMatchPercent * 0.5;
    
    if (skillMatchPercent >= 70) {
      reasons.push(`Strong skill match (${matchedSkills.length}/${job.requiredSkills.length} skills)`);
    }

    // Experience matching
    const totalYears = candidate.experience.reduce((acc, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
      return acc + Math.max(0, (end.getFullYear() - start.getFullYear()));
    }, 0);

    if (totalYears >= job.experienceMin && totalYears <= job.experienceMax + 2) {
      matchScore += 25;
      reasons.push(`Experience level matches (${totalYears} years)`);
    } else if (totalYears >= job.experienceMin * 0.8) {
      matchScore += 15;
    }

    // Location preference
    if (job.location.toLowerCase().includes(candidate.location?.toLowerCase() || '') ||
        job.type === 'remote') {
      matchScore += 15;
      reasons.push(job.type === 'remote' ? 'Remote position available' : 'Location matches your preference');
    }

    // Certification bonus
    if (candidate.certifications.length > 0) {
      matchScore += 5;
    }

    // Recent similar applications (collaborative filtering concept)
    const hasRecentSimilarApp = applications.some(app => {
      const appJob = jobs.find(j => j.id === app.jobId);
      return appJob && appJob.department === job.department;
    });
    if (hasRecentSimilarApp) {
      matchScore += 5;
      reasons.push('Similar to jobs you\'ve applied for');
    }

    return {
      job,
      matchScore: Math.round(Math.min(100, matchScore)),
      reasons
    };
  });

  return recommendations
    .filter(r => r.matchScore >= 40)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
};

// Interview Preparation - Mock Questions
export interface MockInterviewSession {
  questions: Array<{
    question: string;
    category: string;
    tips: string[];
    sampleAnswer: string;
  }>;
  preparationTips: string[];
  companyResearch: string[];
}

export const generateMockInterview = (
  job: Job,
  candidateSkills: string[]
): MockInterviewSession => {
  const questions = [];
  
  // Technical questions based on job skills
  const matchedSkills = candidateSkills.filter(skill =>
    job.requiredSkills.some(rs => rs.toLowerCase().includes(skill.toLowerCase()))
  );

  matchedSkills.slice(0, 3).forEach(skill => {
    questions.push({
      question: `Can you describe a challenging project where you used ${skill}?`,
      category: 'Technical',
      tips: [
        'Use the STAR method (Situation, Task, Action, Result)',
        'Include specific metrics and outcomes',
        `Highlight your ${skill} expertise`
      ],
      sampleAnswer: `In my previous role, I worked on a project that required extensive ${skill} implementation. The situation was [describe challenge]. My task was to [describe your responsibility]. I took action by [describe what you did]. The result was [quantifiable outcome].`
    });
  });

  // Behavioral questions
  questions.push({
    question: 'Tell me about a time when you faced a significant challenge at work.',
    category: 'Behavioral',
    tips: [
      'Choose a relevant professional example',
      'Focus on your problem-solving approach',
      'Highlight what you learned'
    ],
    sampleAnswer: 'I once faced a situation where [describe the challenge]. I approached it by [your methodology]. Through [specific actions], I was able to [positive outcome]. This taught me [key learning].'
  });

  questions.push({
    question: 'How do you handle tight deadlines and pressure?',
    category: 'Behavioral',
    tips: [
      'Show you remain calm under pressure',
      'Mention prioritization strategies',
      'Give a specific example'
    ],
    sampleAnswer: 'I thrive under pressure by maintaining organization and clear priorities. For example, [specific instance]. I use [techniques/tools] to stay on track and ensure deliverables meet quality standards.'
  });

  // Role-specific
  questions.push({
    question: `Why are you interested in this ${job.title} role?`,
    category: 'Motivation',
    tips: [
      'Research the company beforehand',
      'Connect your skills to the role',
      'Show genuine enthusiasm'
    ],
    sampleAnswer: `I'm excited about this ${job.title} position because it aligns perfectly with my expertise in ${job.requiredSkills.slice(0, 2).join(' and ')}. I'm particularly drawn to [specific aspect of the role/company]. My experience in [relevant background] has prepared me to contribute immediately.`
  });

  return {
    questions,
    preparationTips: [
      'Review the job description thoroughly',
      'Prepare 5-7 questions to ask the interviewer',
      'Practice your answers out loud',
      'Research recent company news and culture',
      'Test your video/audio setup if virtual',
      'Prepare stories demonstrating key competencies',
      'Review your resume and be ready to elaborate on any point',
      'Get a good night\'s sleep before the interview'
    ],
    companyResearch: [
      'Company mission and values',
      'Recent news or product launches',
      'Company culture and work environment',
      'Key competitors and market position',
      'Growth trajectory and funding (if startup)',
      'Team structure and leadership'
    ]
  };
};
