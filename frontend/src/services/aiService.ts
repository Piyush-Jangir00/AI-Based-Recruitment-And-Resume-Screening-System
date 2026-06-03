import { Job, CandidateProfile, AIScore } from '../types';

// Simulated NLP Keywords Database
const skillCategories: Record<string, string[]> = {
  programming: ['javascript', 'typescript', 'python', 'java', 'c++', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin'],
  frontend: ['react', 'vue', 'angular', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'nextjs', 'gatsby'],
  backend: ['nodejs', 'express', 'django', 'flask', 'spring', 'rails', 'fastapi', 'graphql', 'rest api'],
  database: ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra'],
  cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd'],
  data: ['machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'spark', 'hadoop', 'nlp', 'deep learning'],
  design: ['figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'wireframing', 'prototyping', 'ui/ux'],
  management: ['agile', 'scrum', 'jira', 'product strategy', 'roadmap', 'stakeholder management', 'okr']
};

// Simulated Resume Text Parser
export const parseResumeText = (text: string): Partial<CandidateProfile> => {
  const lines = text.toLowerCase().split('\n');
  const extractedData: Partial<CandidateProfile> = {
    skills: [],
    education: [],
    experience: [],
    certifications: []
  };

  // Extract email
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    extractedData.email = emailMatch[0];
  }

  // Extract phone
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    extractedData.phone = phoneMatch[0];
  }

  // Extract skills
  const allSkills = Object.values(skillCategories).flat();
  const foundSkills = new Set<string>();
  
  allSkills.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  extractedData.skills = Array.from(foundSkills);

  // Extract education keywords
  const degreeKeywords = ["bachelor", "master", "phd", "doctorate", "associate", "mba"];
  const educationMatches: any[] = [];
  
  lines.forEach((line, index) => {
    degreeKeywords.forEach(keyword => {
      if (line.includes(keyword)) {
        educationMatches.push({
          degree: line.trim(),
          institution: lines[index + 1]?.trim() || 'Unknown',
          year: new Date().getFullYear() - Math.floor(Math.random() * 5)
        });
      }
    });
  });
  
  extractedData.education = educationMatches.slice(0, 3);

  // Extract experience years
  const expRegex = /(\d+)\+?\s*years?\s*(of)?\s*experience/i;
  const expMatch = text.match(expRegex);
  const yearsOfExperience = expMatch ? parseInt(expMatch[1]) : 0;

  // Generate work experience based on years
  if (yearsOfExperience > 0) {
    const roles = ['Software Engineer', 'Developer', 'Analyst', 'Designer', 'Manager'];
    const companies = ['Tech Corp', 'Innovation Labs', 'Digital Solutions', 'StartupXYZ'];
    
    for (let i = 0; i < Math.min(yearsOfExperience / 2, 3); i++) {
      extractedData.experience?.push({
        title: roles[i % roles.length],
        company: companies[i % companies.length],
        startDate: `${2024 - yearsOfExperience + i * 2}-01`,
        endDate: i === 0 ? 'Present' : `${2024 - yearsOfExperience + (i + 1) * 2}-12`,
        description: 'Worked on various projects and initiatives'
      });
    }
  }

  // Extract certifications
  const certKeywords = ['certified', 'certificate', 'certification', 'aws', 'azure', 'google', 'pmp', 'scrum'];
  const certMatches: any[] = [];
  
  lines.forEach(line => {
    certKeywords.forEach(keyword => {
      if (line.includes(keyword) && line.length < 100) {
        certMatches.push({
          name: line.trim(),
          issuer: 'Certification Authority',
          year: new Date().getFullYear() - Math.floor(Math.random() * 3)
        });
      }
    });
  });
  
  extractedData.certifications = certMatches.slice(0, 5);

  return extractedData;
};

// Calculate Semantic Similarity (Simulated)
const calculateSimilarity = (text1: string[], text2: string[]): number => {
  const set1 = new Set(text1.map(s => s.toLowerCase()));
  const set2 = new Set(text2.map(s => s.toLowerCase()));
  
  let matches = 0;
  set1.forEach(item => {
    if (set2.has(item)) matches++;
    // Partial matching for related skills
    set2.forEach(item2 => {
      if (item.includes(item2) || item2.includes(item)) {
        matches += 0.5;
      }
    });
  });
  
  const maxPossible = Math.max(set1.size, set2.size);
  return maxPossible > 0 ? Math.min((matches / maxPossible) * 100, 100) : 0;
};

// Calculate Experience Match
const calculateExperienceMatch = (candidateExp: number, minExp: number, maxExp: number): number => {
  if (candidateExp >= maxExp) return 100;
  if (candidateExp >= minExp) return 80 + ((candidateExp - minExp) / (maxExp - minExp)) * 20;
  if (candidateExp >= minExp * 0.7) return 60 + (candidateExp / minExp) * 20;
  return Math.max(30, (candidateExp / minExp) * 50);
};

// Calculate Education Match
const calculateEducationMatch = (candidateEdu: string[], requiredEdu: string): number => {
  const eduLevels: Record<string, number> = {
    'phd': 100,
    'doctorate': 100,
    'master': 85,
    'mba': 85,
    'bachelor': 70,
    'associate': 50
  };

  let candidateLevel = 0;
  candidateEdu.forEach(edu => {
    const eduLower = edu.toLowerCase();
    Object.entries(eduLevels).forEach(([level, score]) => {
      if (eduLower.includes(level)) {
        candidateLevel = Math.max(candidateLevel, score);
      }
    });
  });

  let requiredLevel = 50;
  Object.entries(eduLevels).forEach(([level, score]) => {
    if (requiredEdu.toLowerCase().includes(level)) {
      requiredLevel = score;
    }
  });

  if (candidateLevel >= requiredLevel) return 100;
  return Math.max(40, (candidateLevel / requiredLevel) * 100);
};

// Main AI Matching Function
export const calculateAIScore = (candidate: CandidateProfile, job: Job): AIScore => {
  // Skill Match (40% weight)
  const allJobSkills = [...job.requiredSkills, ...job.preferredSkills];
  const skillMatch = calculateSimilarity(candidate.skills, allJobSkills);
  
  // Find matched and missing skills
  const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
  const matchedSkills = job.requiredSkills.filter(skill => 
    candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );
  const missingSkills = job.requiredSkills.filter(skill => 
    !candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );

  // Experience Match (30% weight)
  const totalExperience = candidate.experience.reduce((acc, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
    return acc + (end.getFullYear() - start.getFullYear());
  }, 0);
  const experienceMatch = calculateExperienceMatch(totalExperience, job.experienceMin, job.experienceMax);

  // Education Match (20% weight)
  const candidateEducation = candidate.education.map(e => e.degree);
  const educationMatch = calculateEducationMatch(candidateEducation, job.educationLevel);

  // Certification Match (10% weight)
  const certificationMatch = candidate.certifications.length > 0 
    ? Math.min(100, candidate.certifications.length * 30)
    : 40;

  // Overall Score Calculation
  const overallScore = Math.round(
    skillMatch * 0.4 +
    experienceMatch * 0.3 +
    educationMatch * 0.2 +
    certificationMatch * 0.1
  );

  // Generate Recommendations
  const recommendations: string[] = [];
  
  if (overallScore >= 85) {
    recommendations.push('🌟 Top candidate - highly recommended for immediate interview');
  } else if (overallScore >= 70) {
    recommendations.push('✅ Good match - consider for second round of screening');
  } else if (overallScore >= 50) {
    recommendations.push('📋 Moderate match - review additional qualifications');
  } else {
    recommendations.push('⚠️ Below average match - may not meet minimum requirements');
  }

  if (missingSkills.length > 0 && missingSkills.length <= 2) {
    recommendations.push(`💡 Minor skill gaps can be addressed through training: ${missingSkills.join(', ')}`);
  }

  if (totalExperience > job.experienceMax) {
    recommendations.push('📈 Overqualified - consider for senior or leadership position');
  }

  if (candidate.certifications.length >= 2) {
    recommendations.push('🏆 Strong certifications demonstrate commitment to professional development');
  }

  return {
    skillMatch: Math.round(skillMatch),
    experienceMatch: Math.round(experienceMatch),
    educationMatch: Math.round(educationMatch),
    certificationMatch: Math.round(certificationMatch),
    overallScore,
    matchedSkills,
    missingSkills,
    recommendations
  };
};

// Rank Candidates for a Job
export const rankCandidates = (candidates: CandidateProfile[], job: Job): Array<{ candidate: CandidateProfile; score: AIScore }> => {
  const rankedCandidates = candidates.map(candidate => ({
    candidate,
    score: calculateAIScore(candidate, job)
  }));

  return rankedCandidates.sort((a, b) => b.score.overallScore - a.score.overallScore);
};

// Generate Resume Improvement Suggestions
export const generateResumeSuggestions = (candidate: CandidateProfile, targetJob?: Job): string[] => {
  const suggestions: string[] = [];

  if (candidate.skills.length < 5) {
    suggestions.push('📝 Add more technical skills to your profile');
  }

  if (candidate.summary.length < 100) {
    suggestions.push('✍️ Expand your professional summary to highlight key achievements');
  }

  if (candidate.certifications.length === 0) {
    suggestions.push('🎓 Consider adding relevant certifications to stand out');
  }

  if (candidate.projects.length === 0) {
    suggestions.push('💻 Add portfolio projects to demonstrate practical experience');
  }

  if (targetJob) {
    const missingSkills = targetJob.requiredSkills.filter(
      skill => !candidate.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
    if (missingSkills.length > 0) {
      suggestions.push(`🎯 Consider learning these in-demand skills: ${missingSkills.slice(0, 3).join(', ')}`);
    }
  }

  return suggestions;
};

// Skill Gap Analysis
export const analyzeSkillGap = (candidate: CandidateProfile, job: Job): {
  matched: string[];
  missing: string[];
  suggested: string[];
  gapScore: number;
} => {
  const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
  const matched = job.requiredSkills.filter(skill => 
    candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()))
  );
  const missing = job.requiredSkills.filter(skill => 
    !candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()))
  );
  
  // Suggest related skills
  const suggested: string[] = [];
  missing.forEach(skill => {
    Object.entries(skillCategories).forEach(([_category, skills]) => {
      if (skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        const relatedSkills = skills.filter(s => 
          s.toLowerCase() !== skill.toLowerCase() && 
          !candidateSkillsLower.includes(s.toLowerCase())
        ).slice(0, 2);
        suggested.push(...relatedSkills);
      }
    });
  });

  const gapScore = job.requiredSkills.length > 0 
    ? Math.round((matched.length / job.requiredSkills.length) * 100)
    : 100;

  return { matched, missing, suggested: [...new Set(suggested)].slice(0, 5), gapScore };
};

// AI Chatbot Response Generator
export const generateChatResponse = (query: string, context: { jobs?: Job[]; applications?: any[] }): string => {
  const queryLower = query.toLowerCase();

  // Job-related queries
  if (queryLower.includes('job') || queryLower.includes('position') || queryLower.includes('opening')) {
    if (context.jobs && context.jobs.length > 0) {
      return `We currently have ${context.jobs.length} open positions. Some highlights include:\n\n${
        context.jobs.slice(0, 3).map(j => `• ${j.title} - ${j.location}`).join('\n')
      }\n\nWould you like more details about any specific role?`;
    }
    return "I'd be happy to help you find job opportunities. Please check our Jobs section for current openings.";
  }

  // Application status queries
  if (queryLower.includes('status') || queryLower.includes('application')) {
    if (context.applications && context.applications.length > 0) {
      return `You have ${context.applications.length} active application(s). Your most recent application status is: ${context.applications[0].status}. Check the Applications page for detailed updates.`;
    }
    return "You can view your application status in the 'My Applications' section of your dashboard.";
  }

  // Interview queries
  if (queryLower.includes('interview')) {
    return "Interviews are typically scheduled within 1-2 weeks of being shortlisted. You'll receive an email notification with meeting details. Make sure to:\n\n• Test your video/audio setup\n• Research the company\n• Prepare examples of your work\n• Have questions ready for the interviewer";
  }

  // Resume queries
  if (queryLower.includes('resume') || queryLower.includes('cv')) {
    return "For the best results, ensure your resume includes:\n\n• Clear contact information\n• Professional summary\n• Relevant skills and technologies\n• Work experience with achievements\n• Education and certifications\n\nOur AI analyzes resumes for keyword matching, so include relevant technical terms.";
  }

  // Skills queries
  if (queryLower.includes('skill') || queryLower.includes('learn')) {
    return "Based on current job market trends, in-demand skills include:\n\n• Programming: Python, JavaScript, TypeScript\n• Cloud: AWS, Azure, Kubernetes\n• AI/ML: TensorFlow, PyTorch, NLP\n• Data: SQL, Spark, Data Analysis\n\nConsider online certifications to boost your profile.";
  }

  // Salary queries
  if (queryLower.includes('salary') || queryLower.includes('pay') || queryLower.includes('compensation')) {
    return "Salary information is listed on each job posting. Our compensation packages include:\n\n• Competitive base salary\n• Annual bonuses\n• Stock options (for eligible roles)\n• Health benefits\n• 401(k) matching\n\nSpecific ranges depend on role, experience, and location.";
  }

  // Default response
  return "I'm here to help with your recruitment questions! You can ask me about:\n\n• Job openings and requirements\n• Application status\n• Interview process\n• Resume tips\n• Required skills\n• Compensation information\n\nHow can I assist you today?";
};
