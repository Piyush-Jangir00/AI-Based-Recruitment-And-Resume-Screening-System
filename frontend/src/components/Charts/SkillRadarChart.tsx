import React from 'react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import { CandidateProfile, Job } from '../../types';

interface SkillRadarChartProps {
  candidate: CandidateProfile;
  job: Job;
}

const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ candidate, job }) => {
  // Calculate scores for different skill categories
  const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());

  const categories = [
    {
      name: 'Technical Skills',
      candidateScore: Math.min(100, (candidate.skills.length / 10) * 100),
      requiredScore: 80
    },
    {
      name: 'Experience',
      candidateScore: Math.min(100, (candidate.experience.reduce((acc, exp) => {
        const start = new Date(exp.startDate);
        const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
        return acc + (end.getFullYear() - start.getFullYear());
      }, 0) / job.experienceMax) * 100),
      requiredScore: 70
    },
    {
      name: 'Education',
      candidateScore: candidate.education.length > 0 ? 
        (candidate.education.some(e => e.degree.toLowerCase().includes('master') || e.degree.toLowerCase().includes('phd')) ? 100 : 70) : 30,
      requiredScore: 60
    },
    {
      name: 'Certifications',
      candidateScore: Math.min(100, candidate.certifications.length * 30),
      requiredScore: 40
    },
    {
      name: 'Skill Match',
      candidateScore: Math.round((job.requiredSkills.filter(skill =>
        candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()))
      ).length / job.requiredSkills.length) * 100),
      requiredScore: 75
    },
    {
      name: 'Projects',
      candidateScore: Math.min(100, (candidate.projects?.length || 0) * 25),
      requiredScore: 50
    }
  ];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={categories}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
          />
          <Radar
            name="Required"
            dataKey="requiredScore"
            stroke="#E5E7EB"
            fill="#E5E7EB"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Candidate"
            dataKey="candidateScore"
            stroke="#6366F1"
            fill="#6366F1"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
            formatter={(value) => [`${value}%`, '']}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;
