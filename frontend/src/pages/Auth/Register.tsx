import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { Mail, Lock, User, Briefcase, UserCircle, Shield } from 'lucide-react';
import { UserRole } from '../../types';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const success = await register(name, email, password, role);
      if (success) {
        navigate(role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard');
      } else {
        setError('Email already exists');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-indigo-600" />
            </div>
            <span className="text-white font-bold text-2xl">RecruitAI</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Join the Future of<br />Smart Hiring
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Create your account and experience the power of AI-driven recruitment. 
            Find the perfect match between talent and opportunity.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">For Candidates</div>
                <div className="text-white/70 text-sm">Upload resume, apply to jobs, track applications</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">For HR/Admin</div>
                <div className="text-white/70 text-sm">Post jobs, screen candidates, schedule interviews</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-white/60 text-sm">
          Trusted by 500+ companies worldwide
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">RecruitAI</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-600 mt-2">Start your journey with us</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`p-4 rounded-xl border-2 transition-all ${
                role === 'candidate'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <UserCircle className={`w-8 h-8 mx-auto mb-2 ${role === 'candidate' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <div className={`font-medium ${role === 'candidate' ? 'text-indigo-600' : 'text-gray-700'}`}>
                Candidate
              </div>
              <div className="text-xs text-gray-500 mt-1">Looking for jobs</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-4 rounded-xl border-2 transition-all ${
                role === 'admin'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Shield className={`w-8 h-8 mx-auto mb-2 ${role === 'admin' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <div className={`font-medium ${role === 'admin' ? 'text-indigo-600' : 'text-gray-700'}`}>
                HR / Admin
              </div>
              <div className="text-xs text-gray-500 mt-1">Hiring talent</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              icon={<User className="w-5 h-5" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="flex items-start">
              <input 
                type="checkbox" 
                className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                required 
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
              </span>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
