import { Job, CandidateProfile } from '../types';

export interface InterviewMessage {
  id: string;
  role: 'assistant' | 'candidate';
  content: string;
  timestamp: string;
  questionType?: 'welcome' | 'verification' | 'background' | 'technical' | 'behavioral' | 'closing';
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  messages: InterviewMessage[];
  currentStep: number;
  evaluation?: InterviewEvaluation;
}

export interface InterviewEvaluation {
  technicalSkills: number;
  problemSolving: number;
  communication: number;
  experience: number;
  culturalFit: number;
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
  summary: string;
}

// Interview question bank
const backgroundQuestions = [
  "Tell me about yourself and your professional background.",
  "Walk me through your career journey so far.",
  "What interests you most about this position?",
  "Why are you looking for a new opportunity at this time?",
  "What do you know about our company and why do you want to work here?"
];

const behavioralQuestions = [
  "Describe a challenging project you worked on. What was your role and how did you overcome obstacles?",
  "Tell me about a time when you had to solve a difficult technical problem. What was your approach?",
  "How do you handle tight deadlines and pressure? Give me a specific example.",
  "Describe a situation where you had to work with a difficult team member. How did you handle it?",
  "Tell me about a time you failed at something. What did you learn from it?",
  "Give an example of when you had to learn something new quickly. How did you approach it?",
  "Describe a situation where you had to make a decision with incomplete information."
];

const technicalQuestionsBySkill: Record<string, string[]> = {
  'javascript': [
    "Explain the difference between var, let, and const in JavaScript.",
    "How does the JavaScript event loop work?",
    "What are closures and how would you use them in a real application?",
    "Explain prototypal inheritance in JavaScript."
  ],
  'react': [
    "Explain the Virtual DOM and how React uses it for performance.",
    "What are React hooks? Explain useState and useEffect.",
    "How would you optimize a React application for performance?",
    "Explain the difference between controlled and uncontrolled components."
  ],
  'typescript': [
    "What are the benefits of using TypeScript over JavaScript?",
    "Explain generics in TypeScript and when you would use them.",
    "What is the difference between interface and type in TypeScript?"
  ],
  'python': [
    "Explain the difference between lists and tuples in Python.",
    "What are decorators and how would you use them?",
    "How does garbage collection work in Python?",
    "Explain the GIL and its implications for multithreading."
  ],
  'node.js': [
    "How does Node.js handle asynchronous operations?",
    "Explain the difference between process.nextTick and setImmediate.",
    "How would you handle memory leaks in a Node.js application?"
  ],
  'aws': [
    "Explain the difference between EC2, Lambda, and ECS.",
    "How would you design a highly available architecture on AWS?",
    "What are IAM roles and policies?"
  ],
  'sql': [
    "Explain the difference between INNER JOIN and LEFT JOIN.",
    "How would you optimize a slow-running SQL query?",
    "What are database indexes and when should you use them?"
  ],
  'machine learning': [
    "Explain the bias-variance tradeoff.",
    "How would you handle imbalanced datasets?",
    "What techniques would you use to prevent overfitting?"
  ],
  // Non-tech department skills
  'operations management': [
    "How do you approach process improvement in operations?",
    "Describe your experience with Lean or Six Sigma methodologies.",
    "How do you balance quality with efficiency in operations?"
  ],
  'supply chain': [
    "How do you optimize inventory levels to minimize costs?",
    "What metrics do you use to measure supply chain performance?",
    "How do you handle supplier relationship management?"
  ],
  'financial analysis': [
    "Walk me through how you would build a financial model.",
    "How do you approach forecasting and budgeting?",
    "What key financial metrics do you track and why?"
  ],
  'accounting': [
    "Explain the month-end close process.",
    "How do you ensure compliance with GAAP?",
    "Describe your experience with financial reconciliation."
  ],
  'recruiting': [
    "How do you source candidates in a competitive market?",
    "What strategies do you use to improve candidate experience?",
    "How do you measure recruiting success?"
  ],
  'hr management': [
    "How do you handle employee relations issues?",
    "What's your approach to performance management?",
    "How do you ensure compliance with employment laws?"
  ],
  'sales': [
    "Walk me through your sales process.",
    "How do you handle objections from prospects?",
    "What's your approach to building a sales pipeline?"
  ],
  'marketing': [
    "How do you measure the ROI of marketing campaigns?",
    "Describe your approach to developing a marketing strategy.",
    "How do you segment and target audiences?"
  ],
  'customer success': [
    "How do you ensure customer satisfaction and retention?",
    "What metrics do you track for customer success?",
    "How do you handle escalations from unhappy customers?"
  ],
  'ux design': [
    "Walk me through your design process.",
    "How do you conduct and apply user research?",
    "How do you measure the success of your designs?"
  ],
  'project management': [
    "How do you prioritize tasks when managing multiple projects?",
    "Describe your experience with Agile methodologies.",
    "How do you handle scope creep?"
  ],
  'docker': [
    "Explain the difference between a Docker image and container.",
    "How would you optimize a Dockerfile for production?",
    "What are Docker volumes and when would you use them?"
  ]
};

const closingMessages = [
  "Thank you for completing this interview. Your responses have been recorded and will be reviewed by our recruitment team.",
  "We appreciate you taking the time to speak with us today. Our team will carefully review your interview and get back to you soon.",
  "This concludes our interview. Thank you for your thoughtful responses. The hiring team will be in touch regarding next steps."
];

// Generate interview steps based on job and candidate
export const generateInterviewSteps = (job: Job, _candidate: CandidateProfile): string[] => {
  const steps: string[] = [];
  
  // Welcome
  steps.push('welcome');
  
  // Verification
  steps.push('verification');
  
  // Background (2-3 questions)
  steps.push('background_1');
  steps.push('background_2');
  
  // Technical questions based on job skills (3-4 questions)
  const matchedSkills = job.requiredSkills.filter(skill =>
    Object.keys(technicalQuestionsBySkill).some(key => 
      skill.toLowerCase().includes(key) || key.includes(skill.toLowerCase())
    )
  );
  
  for (let i = 0; i < Math.min(matchedSkills.length, 3); i++) {
    steps.push(`technical_${i + 1}`);
  }
  
  // Behavioral questions (2-3)
  steps.push('behavioral_1');
  steps.push('behavioral_2');
  
  // Closing
  steps.push('closing');
  
  return steps;
};

// Get question for current step
export const getInterviewQuestion = (
  step: string,
  job: Job,
  candidate: CandidateProfile,
  _previousAnswers: string[] = []
): string => {
  if (step === 'welcome') {
    const duration = 15 + Math.floor(job.requiredSkills.length * 2);
    return `Hello ${candidate.name.split(' ')[0]}, welcome to RecruitAI! 👋

I'm your AI Interview Assistant, and I'll be conducting your interview today for the **${job.title}** position in our ${job.department} team.

This interview will take approximately **${duration} minutes** and will cover:
• Your background and experience
• Technical questions related to the role
• Behavioral scenarios

Please take your time with each question and feel free to ask for clarification if needed.

Are you ready to begin?`;
  }
  
  if (step === 'verification') {
    return `Great! Before we start, let me verify a few details:

1. Can you please confirm your full name?
2. You've applied for the **${job.title}** position - is that correct?

Please confirm these details so we can proceed.`;
  }
  
  if (step.startsWith('background_')) {
    const index = parseInt(step.split('_')[1]) - 1;
    const questions = [
      `Thank you for confirming. Let's start with some background questions.\n\n**${backgroundQuestions[0]}**`,
      `**${backgroundQuestions[2]}**\n\nI'd love to understand what drew you to this opportunity.`
    ];
    return questions[index] || backgroundQuestions[index];
  }
  
  if (step.startsWith('technical_')) {
    const index = parseInt(step.split('_')[1]) - 1;
    
    // Find relevant skill and get question
    const matchedSkills = job.requiredSkills.filter(skill =>
      Object.keys(technicalQuestionsBySkill).some(key => 
        skill.toLowerCase().includes(key) || key.includes(skill.toLowerCase())
      )
    );
    
    if (index < matchedSkills.length) {
      const skill = matchedSkills[index];
      const skillKey = Object.keys(technicalQuestionsBySkill).find(key =>
        skill.toLowerCase().includes(key) || key.includes(skill.toLowerCase())
      );
      
      if (skillKey) {
        const questions = technicalQuestionsBySkill[skillKey];
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        
        if (index === 0) {
          return `Excellent! Now let's move on to some technical questions related to the role.\n\nI see that **${skill}** is important for this position.\n\n**${randomQ}**`;
        }
        return `**${randomQ}**`;
      }
    }
    
    return `Can you describe your experience with ${job.requiredSkills[index] || 'the technologies'} mentioned in the job requirements?`;
  }
  
  if (step.startsWith('behavioral_')) {
    const index = parseInt(step.split('_')[1]) - 1;
    
    if (index === 0) {
      return `Great responses on the technical questions! Now I'd like to understand how you handle real-world situations.\n\n**${behavioralQuestions[0]}**`;
    }
    
    return `**${behavioralQuestions[index + 1]}**`;
  }
  
  if (step === 'closing') {
    return `Thank you so much for your time and thoughtful responses today, ${candidate.name.split(' ')[0]}! 🎉

${closingMessages[0]}

**What happens next:**
• Our recruitment team will review your interview within 3-5 business days
• You'll receive an email update on your application status
• If selected, we'll reach out to schedule the next round

We appreciate your interest in joining our team. Best of luck! 🍀

*This interview session is now complete.*`;
  }
  
  return "Thank you for your response. Let's continue.";
};

// Generate follow-up question based on answer
export const generateFollowUp = (
  answer: string,
  currentStep: string,
  _job: Job
): string | null => {
  const answerLower = answer.toLowerCase();
  
  // Check if answer is too short or vague
  if (answer.length < 50 && !currentStep.includes('verification')) {
    return "Could you elaborate a bit more on that? I'd like to understand your experience in more detail.";
  }
  
  // Technical follow-ups
  if (currentStep.startsWith('technical_')) {
    if (answerLower.includes('i think') || answerLower.includes('maybe') || answerLower.includes('not sure')) {
      return "Can you walk me through a specific example from your experience where you applied this concept?";
    }
  }
  
  // Behavioral follow-ups
  if (currentStep.startsWith('behavioral_')) {
    if (!answerLower.includes('result') && !answerLower.includes('outcome') && !answerLower.includes('learned')) {
      return "What was the outcome of that situation? What did you learn from it?";
    }
  }
  
  return null;
};

// Evaluate interview responses
export const evaluateInterview = (
  messages: InterviewMessage[],
  job: Job,
  candidate: CandidateProfile
): InterviewEvaluation => {
  const candidateResponses = messages.filter(m => m.role === 'candidate');
  
  // Calculate scores based on response analysis
  let technicalScore = 50;
  let problemSolvingScore = 50;
  let communicationScore = 50;
  let experienceScore = 50;
  let culturalFitScore = 50;
  
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];
  
  candidateResponses.forEach(response => {
    const text = response.content.toLowerCase();
    const wordCount = response.content.split(' ').length;
    
    // Communication assessment (based on response length and clarity)
    if (wordCount > 50 && wordCount < 300) {
      communicationScore += 5;
    }
    
    // Technical indicators
    const technicalKeywords = ['implemented', 'developed', 'built', 'designed', 'architected', 'optimized'];
    technicalKeywords.forEach(kw => {
      if (text.includes(kw)) technicalScore += 3;
    });
    
    // Problem-solving indicators
    const problemKeywords = ['solved', 'resolved', 'fixed', 'improved', 'analyzed', 'debugged'];
    problemKeywords.forEach(kw => {
      if (text.includes(kw)) problemSolvingScore += 3;
    });
    
    // Experience indicators
    const expKeywords = ['years', 'experience', 'worked', 'led', 'managed', 'team'];
    expKeywords.forEach(kw => {
      if (text.includes(kw)) experienceScore += 3;
    });
    
    // Cultural fit indicators
    const cultureKeywords = ['team', 'collaborate', 'help', 'learn', 'grow', 'passionate'];
    cultureKeywords.forEach(kw => {
      if (text.includes(kw)) culturalFitScore += 3;
    });
  });
  
  // Cap scores at 100
  technicalScore = Math.min(100, Math.max(30, technicalScore));
  problemSolvingScore = Math.min(100, Math.max(30, problemSolvingScore));
  communicationScore = Math.min(100, Math.max(30, communicationScore));
  experienceScore = Math.min(100, Math.max(30, experienceScore));
  culturalFitScore = Math.min(100, Math.max(30, culturalFitScore));
  
  // Calculate overall
  const overallScore = Math.round(
    (technicalScore * 0.3) +
    (problemSolvingScore * 0.2) +
    (communicationScore * 0.2) +
    (experienceScore * 0.2) +
    (culturalFitScore * 0.1)
  );
  
  // Generate strengths and areas for improvement
  if (technicalScore >= 70) strengths.push('Strong technical knowledge demonstrated');
  else if (technicalScore < 50) areasForImprovement.push('Technical skills need further development');
  
  if (communicationScore >= 70) strengths.push('Clear and articulate communication');
  else if (communicationScore < 50) areasForImprovement.push('Communication could be more structured');
  
  if (problemSolvingScore >= 70) strengths.push('Good problem-solving approach');
  else if (problemSolvingScore < 50) areasForImprovement.push('Problem-solving methodology unclear');
  
  if (experienceScore >= 70) strengths.push('Relevant professional experience');
  else if (experienceScore < 50) areasForImprovement.push('Limited relevant experience');
  
  if (culturalFitScore >= 70) strengths.push('Positive team-oriented attitude');
  
  // Determine recommendation
  let recommendation: InterviewEvaluation['recommendation'];
  if (overallScore >= 80) recommendation = 'Strong Hire';
  else if (overallScore >= 65) recommendation = 'Hire';
  else if (overallScore >= 50) recommendation = 'Maybe';
  else recommendation = 'No Hire';
  
  const summary = `${candidate.name} completed the AI interview for ${job.title}. ` +
    `Overall performance was ${overallScore >= 70 ? 'strong' : overallScore >= 50 ? 'satisfactory' : 'below expectations'}. ` +
    `${strengths.length > 0 ? `Key strengths include ${strengths.slice(0, 2).join(' and ').toLowerCase()}. ` : ''}` +
    `${areasForImprovement.length > 0 ? `Areas for follow-up: ${areasForImprovement[0].toLowerCase()}.` : ''}`;
  
  return {
    technicalSkills: technicalScore,
    problemSolving: problemSolvingScore,
    communication: communicationScore,
    experience: experienceScore,
    culturalFit: culturalFitScore,
    overallScore,
    strengths,
    areasForImprovement,
    recommendation,
    summary
  };
};

// Storage helpers
export const saveInterviewSession = (session: InterviewSession): void => {
  const sessions = getInterviewSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem('interviewSessions', JSON.stringify(sessions));
};

export const getInterviewSessions = (): InterviewSession[] => {
  const stored = localStorage.getItem('interviewSessions');
  return stored ? JSON.parse(stored) : [];
};

export const getInterviewSessionById = (id: string): InterviewSession | undefined => {
  return getInterviewSessions().find(s => s.id === id);
};

export const getInterviewSessionsByCandidate = (candidateId: string): InterviewSession[] => {
  return getInterviewSessions().filter(s => s.candidateId === candidateId);
};

export const getInterviewSessionsByJob = (jobId: string): InterviewSession[] => {
  return getInterviewSessions().filter(s => s.jobId === jobId);
};
