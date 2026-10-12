'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, GraduationCap, UserCheck, Code2, ArrowRight, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const role = data.user.role;
      if (role === 'ADMIN') router.push('/admin/dashboard');
      else if (role === 'FACULTY') router.push('/faculty/dashboard');
      else if (role === 'STUDENT') router.push('/student/dashboard');
      else router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50 text-gray-900 relative overflow-hidden">
      {/* Glow Effects */}
      
      

      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-2xl z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-auto mb-2 flex items-center justify-center">
            <img src="/logo.jpg" alt="Docs Logo" className="w-full h-auto object-contain mix-blend-multiply border-2 border-black rounded-lg p-1.5 bg-white" />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">Digital Academic Laboratory & Coding Workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Email / Identification
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@docs.edu"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 text-center mb-3 flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" /> Quick Seed Credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillDemo('admin@docs.edu', 'admin123')}
              className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 mb-1" />
              <span className="font-semibold text-gray-800">Admin</span>
              <span className="text-[10px] text-gray-400">admin123</span>
            </button>
            <button
              onClick={() => fillDemo('faculty@docs.edu', 'faculty123')}
              className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all text-xs"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="font-semibold text-gray-800">Faculty</span>
              <span className="text-[10px] text-gray-400">faculty123</span>
            </button>
            <button
              onClick={() => fillDemo('student@docs.edu', 'student123')}
              className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all text-xs"
            >
              <GraduationCap className="w-4 h-4 text-blue-600 mb-1" />
              <span className="font-semibold text-gray-800">Student</span>
              <span className="text-[10px] text-gray-400">student123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
