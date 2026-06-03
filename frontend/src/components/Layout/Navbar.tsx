import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Menu, X, Bell, LogOut, Briefcase, Users, 
  LayoutDashboard, FileText, Calendar, Settings,
  GitBranch, Brain, Sparkles, Video
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { getNotificationsByUser } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifications = user ? getNotificationsByUser(user.id).filter(n => !n.read) : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/admin/candidates', label: 'Candidates', icon: Users },
    { path: '/admin/pipeline', label: 'Pipeline', icon: GitBranch },
    { path: '/admin/ai-screening', label: 'AI Tools', icon: Brain },
    { path: '/admin/interviews', label: 'Interviews', icon: Calendar },
  ];

  const candidateLinks = [
    { path: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/candidate/jobs', label: 'Find Jobs', icon: Briefcase },
    { path: '/candidate/applications', label: 'Applications', icon: FileText },
    { path: '/candidate/video-interview', label: 'Video Interview', icon: Video },
    { path: '/candidate/ai-tools', label: 'AI Tools', icon: Sparkles },
  ];

  const links = user?.role === 'admin' ? adminLinks : candidateLinks;

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="ml-3 text-white font-bold text-xl hidden sm:block">RecruitAI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.avatar || user?.name?.[0] || 'U'}
                </div>
                <span className="hidden sm:block text-sm">{user?.name}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to={user?.role === 'admin' ? '/admin/settings' : '/candidate/profile'}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-indigo-700 px-4 py-2 space-y-1">
          {links.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
