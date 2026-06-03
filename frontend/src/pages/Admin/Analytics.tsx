import React from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Briefcase, CheckCircle, Clock, 
  Award, Target, Zap 
} from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  const { jobs, applications, candidates, interviews } = useData();

  // Calculate statistics
  const stats = {
    totalApplications: applications.length,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    hired: applications.filter(a => a.status === 'hired').length,
    avgScore: applications.length > 0 
      ? Math.round(applications.reduce((acc, a) => acc + a.aiScore.overallScore, 0) / applications.length)
      : 0,
    interviewPassRate: interviews.filter(i => i.result === 'passed').length / 
      Math.max(interviews.filter(i => i.status === 'completed').length, 1) * 100
  };

  // Applications by status for pie chart
  const statusData = [
    { name: 'Pending', value: applications.filter(a => a.status === 'pending').length, color: '#FCD34D' },
    { name: 'Reviewed', value: applications.filter(a => a.status === 'reviewed').length, color: '#60A5FA' },
    { name: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, color: '#A78BFA' },
    { name: 'Interview', value: applications.filter(a => a.status === 'interview').length, color: '#34D399' },
    { name: 'Hired', value: applications.filter(a => a.status === 'hired').length, color: '#10B981' },
    { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: '#F87171' }
  ].filter(d => d.value > 0);

  // Applications by job
  const jobsData = jobs.map(job => ({
    name: job.title.length > 15 ? job.title.substring(0, 15) + '...' : job.title,
    applications: applications.filter(a => a.jobId === job.id).length,
    hired: applications.filter(a => a.jobId === job.id && a.status === 'hired').length
  }));

  // AI Score distribution
  const scoreRanges = [
    { range: '0-40', count: applications.filter(a => a.aiScore.overallScore <= 40).length },
    { range: '41-60', count: applications.filter(a => a.aiScore.overallScore > 40 && a.aiScore.overallScore <= 60).length },
    { range: '61-80', count: applications.filter(a => a.aiScore.overallScore > 60 && a.aiScore.overallScore <= 80).length },
    { range: '81-100', count: applications.filter(a => a.aiScore.overallScore > 80).length }
  ];

  // Top skills across all candidates
  const skillCounts: Record<string, number> = {};
  candidates.forEach(c => {
    c.skills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  // Monthly trend (simulated)
  const monthlyData = [
    { month: 'Jan', applications: 25, hired: 3 },
    { month: 'Feb', applications: 35, hired: 5 },
    { month: 'Mar', applications: 45, hired: 7 },
    { month: 'Apr', applications: 40, hired: 6 },
    { month: 'May', applications: 55, hired: 8 },
    { month: 'Jun', applications: 65, hired: 10 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Recruitment insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: stats.totalApplications, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Hired', value: stats.hired, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Avg AI Score', value: `${stats.avgScore}%`, icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100' }
        ].map((metric, index) => (
          <Card key={index}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${metric.bg}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-500">{metric.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Trend */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Applications Trend</h3>
            <Badge variant="success">
              <TrendingUp className="w-3 h-3 mr-1" />
              +18%
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="applications" 
                stroke="#6366F1" 
                strokeWidth={2}
                fill="url(#colorApps)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Application Status Distribution */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-6">Application Status Distribution</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-40 space-y-2">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Job */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-6">Applications by Job</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={jobsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="applications" fill="#6366F1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="hired" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Score Distribution */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-6">AI Score Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="range" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {scoreRanges.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={['#F87171', '#FCD34D', '#60A5FA', '#10B981'][index]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Skills */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-6">Top Skills in Talent Pool</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topSkills.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{item.count}</div>
                <div className="text-sm text-gray-600 mt-1">{item.skill}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-6">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Interview Pass Rate</span>
              </div>
              <span className="font-bold text-gray-900">{Math.round(stats.interviewPassRate)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Avg Time to Hire</span>
              </div>
              <span className="font-bold text-gray-900">14 days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-sm text-gray-600">Quality of Hire</span>
              </div>
              <span className="font-bold text-gray-900">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-sm text-gray-600">Candidates per Job</span>
              </div>
              <span className="font-bold text-gray-900">
                {stats.activeJobs > 0 ? Math.round(stats.totalApplications / stats.activeJobs) : 0}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
