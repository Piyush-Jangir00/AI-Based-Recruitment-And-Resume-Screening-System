import React from 'react';
import { Application, CandidateProfile, Job } from '../../types';
import Badge from '../UI/Badge';
import Progress from '../UI/Progress';
import { 
  Star, Award, Briefcase, GraduationCap, 
  CheckCircle, XCircle 
} from 'lucide-react';

interface CandidateComparisonProps {
  applications: Application[];
  candidates: CandidateProfile[];
  job: Job;
}

const CandidateComparison: React.FC<CandidateComparisonProps> = ({
  applications,
  candidates,
  job
}) => {
  const getCandidateProfile = (app: Application) => {
    return candidates.find(c => c.id === app.candidateId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  

  const calculateTotalExperience = (profile: CandidateProfile | undefined) => {
    if (!profile) return 0;
    return profile.experience.reduce((acc, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
      return acc + Math.max(0, (end.getFullYear() - start.getFullYear()));
    }, 0);
  };

  // Sort by overall score
  const sortedApps = [...applications].sort((a, b) => 
    b.aiScore.overallScore - a.aiScore.overallScore
  );

  const topScore = sortedApps[0]?.aiScore.overallScore || 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4 font-semibold text-gray-700 w-48">Candidate</th>
            <th className="text-center py-4 px-4 font-semibold text-gray-700">AI Score</th>
            <th className="text-center py-4 px-4 font-semibold text-gray-700">Skills</th>
            <th className="text-center py-4 px-4 font-semibold text-gray-700">Experience</th>
            <th className="text-center py-4 px-4 font-semibold text-gray-700">Education</th>
            <th className="text-center py-4 px-4 font-semibold text-gray-700">Certs</th>
            <th className="text-center py-4 px-4 font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedApps.map((app, index) => {
            const profile = getCandidateProfile(app);
            const isTop = app.aiScore.overallScore === topScore;
            const experience = calculateTotalExperience(profile);

            return (
              <tr 
                key={app.id} 
                className={`border-b border-gray-100 ${isTop ? 'bg-green-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                {/* Candidate Info */}
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {app.candidateName.split(' ').map(n => n[0]).join('')}
                      </div>
                      {isTop && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{app.candidateName}</p>
                      <p className="text-sm text-gray-500">{app.candidateEmail}</p>
                    </div>
                  </div>
                </td>

                {/* AI Score */}
                <td className="py-4 px-4">
                  <div className="flex flex-col items-center">
                    <div className={`text-2xl font-bold ${getScoreColor(app.aiScore.overallScore)}`}>
                      {app.aiScore.overallScore}%
                    </div>
                    <Progress value={app.aiScore.overallScore} size="sm" className="w-20 mt-1" />
                  </div>
                </td>

                {/* Skills Match */}
                <td className="py-4 px-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <span className={`font-semibold ${getScoreColor(app.aiScore.skillMatch)}`}>
                        {app.aiScore.skillMatch}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-gray-600">{app.aiScore.matchedSkills.length}</span>
                      <XCircle className="w-3 h-3 text-red-500 ml-2" />
                      <span className="text-gray-600">{app.aiScore.missingSkills.length}</span>
                    </div>
                  </div>
                </td>

                {/* Experience */}
                <td className="py-4 px-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="font-semibold text-gray-900">{experience} yrs</span>
                    </div>
                    <span className={`text-xs mt-1 ${
                      experience >= job.experienceMin ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {experience >= job.experienceMin ? '✓ Meets req' : '✗ Below req'}
                    </span>
                  </div>
                </td>

                {/* Education */}
                <td className="py-4 px-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 text-gray-400 mr-1" />
                      <span className={`font-semibold ${getScoreColor(app.aiScore.educationMatch)}`}>
                        {app.aiScore.educationMatch}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 truncate max-w-[100px]">
                      {profile?.education[0]?.degree || 'N/A'}
                    </span>
                  </div>
                </td>

                {/* Certifications */}
                <td className="py-4 px-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="font-semibold text-gray-900">
                        {profile?.certifications.length || 0}
                      </span>
                    </div>
                    {profile?.certifications && profile.certifications.length > 0 && (
                      <span className="text-xs text-gray-500 mt-1 truncate max-w-[80px]">
                        {profile.certifications[0].name}
                      </span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <div className="flex justify-center">
                    <Badge 
                      variant={
                        app.status === 'hired' ? 'success' :
                        app.status === 'shortlisted' ? 'purple' :
                        app.status === 'interview' ? 'info' :
                        app.status === 'rejected' ? 'danger' : 'warning'
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end space-x-6 text-sm text-gray-500">
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-400 mr-1" />
          Top Candidate
        </div>
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
          Matched Skills
        </div>
        <div className="flex items-center">
          <XCircle className="w-4 h-4 text-red-500 mr-1" />
          Missing Skills
        </div>
      </div>
    </div>
  );
};

export default CandidateComparison;
