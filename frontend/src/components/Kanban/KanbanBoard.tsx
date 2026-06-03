import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../../types';
import { useData } from '../../context/DataContext';
import Badge from '../UI/Badge';
import { User, GripVertical, Eye } from 'lucide-react';

interface KanbanBoardProps {
  applications: Application[];
  onViewCandidate: (app: Application) => void;
}

const statusColumns: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'New Applications', color: 'bg-yellow-100 border-yellow-300' },
  { status: 'reviewed', label: 'Under Review', color: 'bg-blue-100 border-blue-300' },
  { status: 'shortlisted', label: 'Shortlisted', color: 'bg-purple-100 border-purple-300' },
  { status: 'interview', label: 'Interview', color: 'bg-indigo-100 border-indigo-300' },
  { status: 'hired', label: 'Hired', color: 'bg-green-100 border-green-300' },
  { status: 'rejected', label: 'Rejected', color: 'bg-red-100 border-red-300' }
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ applications, onViewCandidate }) => {
  const { updateApplication, jobs } = useData();
  const [draggedApp, setDraggedApp] = useState<Application | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, app: Application) => {
    setDraggedApp(app);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: ApplicationStatus) => {
    e.preventDefault();
    if (draggedApp && draggedApp.status !== newStatus) {
      updateApplication(draggedApp.id, { status: newStatus });
    }
    setDraggedApp(null);
    setDragOverColumn(null);
  };

  const getColumnApps = (status: ApplicationStatus) => {
    return applications.filter(app => app.status === status);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusColumns.map(column => {
        const columnApps = getColumnApps(column.status);
        const isDragOver = dragOverColumn === column.status;

        return (
          <div
            key={column.status}
            className={`flex-shrink-0 w-72 rounded-lg border-2 ${column.color} ${
              isDragOver ? 'ring-2 ring-indigo-400' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-gray-200 bg-white/50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{column.label}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-white rounded-full text-gray-600">
                  {columnApps.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[400px]">
              {columnApps.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                
                return (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app)}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab 
                      hover:shadow-md transition-shadow ${
                        draggedApp?.id === app.id ? 'opacity-50' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-4 h-4 text-gray-300" />
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {app.candidateName.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getScoreColor(app.aiScore.overallScore)}`}>
                        {app.aiScore.overallScore}%
                      </span>
                    </div>

                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {app.candidateName}
                    </h4>
                    <p className="text-xs text-gray-500 truncate mb-2">
                      {job?.title || 'Unknown Position'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {app.aiScore.matchedSkills.slice(0, 2).map((skill, i) => (
                          <Badge key={i} variant="info" size="sm">
                            {skill.length > 8 ? skill.substring(0, 8) + '...' : skill}
                          </Badge>
                        ))}
                      </div>
                      <button
                        onClick={() => onViewCandidate(app)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {columnApps.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <User className="w-8 h-8 mb-2" />
                  <p className="text-sm">No candidates</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
