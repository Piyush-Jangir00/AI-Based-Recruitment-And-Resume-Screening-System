import React, { useState } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Bell, Shield, Database, 
  Save, RefreshCw, Download 
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newApplications: true,
    interviewReminders: true,
    weeklyReport: true,
    emailNotifications: true
  });

  const [systemSettings, setSystemSettings] = useState({
    autoShortlistThreshold: 75,
    applicationDeadlineReminder: 3,
    defaultInterviewDuration: 60
  });

  const handleSaveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      updateUser({ name: profileForm.name });
      setSaving(false);
    }, 500);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = {
      jobs: localStorage.getItem('jobs'),
      candidates: localStorage.getItem('candidates'),
      applications: localStorage.getItem('applications'),
      interviews: localStorage.getItem('interviews')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recruitai-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and system preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileForm.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{profileForm.name}</h3>
                    <p className="text-sm text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
                  </div>
                </div>

                <Input
                  label="Full Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled
                />
                <div className="pt-4">
                  <Button onClick={handleSaveProfile} loading={saving} icon={<Save className="w-4 h-4" />}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'newApplications', label: 'New Applications', description: 'Get notified when candidates apply' },
                  { key: 'interviewReminders', label: 'Interview Reminders', description: 'Receive reminders before scheduled interviews' },
                  { key: 'weeklyReport', label: 'Weekly Report', description: 'Receive weekly recruitment summary' },
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' }
                ].map(setting => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{setting.label}</p>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          [setting.key]: e.target.checked 
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auto-Shortlist Threshold (AI Score)
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Candidates with AI scores above this threshold will be automatically shortlisted
                  </p>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={systemSettings.autoShortlistThreshold}
                      onChange={(e) => setSystemSettings({ 
                        ...systemSettings, 
                        autoShortlistThreshold: parseInt(e.target.value) 
                      })}
                      className="flex-1"
                    />
                    <span className="font-medium text-indigo-600 w-12">
                      {systemSettings.autoShortlistThreshold}%
                    </span>
                  </div>
                </div>

                <Select
                  label="Application Deadline Reminder (days before)"
                  value={String(systemSettings.applicationDeadlineReminder)}
                  onChange={(e) => setSystemSettings({ 
                    ...systemSettings, 
                    applicationDeadlineReminder: parseInt(e.target.value) 
                  })}
                  options={[
                    { value: '1', label: '1 day' },
                    { value: '3', label: '3 days' },
                    { value: '7', label: '1 week' }
                  ]}
                />

                <Select
                  label="Default Interview Duration"
                  value={String(systemSettings.defaultInterviewDuration)}
                  onChange={(e) => setSystemSettings({ 
                    ...systemSettings, 
                    defaultInterviewDuration: parseInt(e.target.value) 
                  })}
                  options={[
                    { value: '30', label: '30 minutes' },
                    { value: '45', label: '45 minutes' },
                    { value: '60', label: '1 hour' },
                    { value: '90', label: '1.5 hours' }
                  ]}
                />

                <div className="pt-4">
                  <Button icon={<Save className="w-4 h-4" />}>
                    Save Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h2>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Export Data</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Download all your recruitment data as a JSON file
                  </p>
                  <Button variant="outline" onClick={handleExportData} icon={<Download className="w-4 h-4" />}>
                    Export All Data
                  </Button>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">Reset Data</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Clear all data and reset to initial state. This action cannot be undone.
                  </p>
                  <Button variant="danger" onClick={handleResetData} icon={<RefreshCw className="w-4 h-4" />}>
                    Reset All Data
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
