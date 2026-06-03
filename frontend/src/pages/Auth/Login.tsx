import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { Mail, Lock, Briefcase, Sparkles } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoAttempted = useRef(false);

  // Auto-login when opened from Landing page with ?email=...&password=...&auto=1
  useEffect(() => {
    if (autoAttempted.current) return;
    const autoEmail = searchParams.get('email');
    const autoPw = searchParams.get('password');
    const auto = searchParams.get('auto');
    if (auto === '1' && autoEmail && autoPw) {
      autoAttempted.current = true;
      (async () => {
        setLoading(true);
        const ok = await login(autoEmail, autoPw);
        if (ok) {
          // Read role from sessionStorage (per-tab auth)
          try {
            const u = JSON.parse(sessionStorage.getItem('tabUser') || '{}');
            navigate(u.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard', { replace: true });
          } catch {
            navigate('/candidate/dashboard', { replace: true });
          }
        }
        setLoading(false);
      })();
    }
  }, [searchParams, login, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        try {
          const u = JSON.parse(sessionStorage.getItem('tabUser') || '{}');
          navigate(u.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard');
        } catch {
          navigate('/candidate/dashboard');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'candidate') => {
    setLoading(true);
    const credentials = role === 'admin' 
      ? { email: 'admin@recruitai.com', password: 'admin123' }
      : { email: 'john@example.com', password: 'password123' };
    
    const success = await login(credentials.email, credentials.password);
    if (success) {
      navigate(role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between">
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
            AI-Powered Recruitment<br />Made Simple
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Streamline your hiring process with intelligent resume screening, 
            candidate matching, and automated rankings powered by advanced AI.
          </p>
          
          <div className="flex items-center space-x-4 pt-4">
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white text-sm">AI-Powered Matching</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
              <span className="text-white text-sm">Smart Resume Parsing</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-white/80">
          <div>
            <div className="text-3xl font-bold text-white">10K+</div>
            <div className="text-sm">Resumes Processed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">95%</div>
            <div className="text-sm">Accuracy Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">500+</div>
            <div className="text-sm">Companies Trust Us</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">RecruitAI</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">Or try demo accounts</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
              >
                Demo Admin
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin('candidate')}
                disabled={loading}
              >
                Demo Candidate
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
