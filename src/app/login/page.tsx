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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-[#070c1a] via-[#0b1329] to-[#111c38] text-slate-100 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#111c38]/80 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">DOCS V1</h1>
          <p className="text-sm text-slate-400 text-center mt-1">Digital Academic Laboratory & Coding Workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email / Identification
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@docs.edu"
              className="w-full px-4 py-2.5 bg-[#0b1329] border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-[#0b1329] border border-slate-700/70 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-xs font-medium text-slate-400 text-center mb-3 flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> Quick Seed Credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillDemo('admin@docs.edu', 'admin123')}
              className="flex flex-col items-center justify-center p-2 bg-[#0b1329] hover:bg-slate-800/60 border border-slate-700/60 rounded-xl transition-all text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400 mb-1" />
              <span className="font-semibold text-slate-200">Admin</span>
              <span className="text-[10px] text-slate-500">admin123</span>
            </button>
            <button
              onClick={() => fillDemo('faculty@docs.edu', 'faculty123')}
              className="flex flex-col items-center justify-center p-2 bg-[#0b1329] hover:bg-slate-800/60 border border-slate-700/60 rounded-xl transition-all text-xs"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="font-semibold text-slate-200">Faculty</span>
              <span className="text-[10px] text-slate-500">faculty123</span>
            </button>
            <button
              onClick={() => fillDemo('student@docs.edu', 'student123')}
              className="flex flex-col items-center justify-center p-2 bg-[#0b1329] hover:bg-slate-800/60 border border-slate-700/60 rounded-xl transition-all text-xs"
            >
              <GraduationCap className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="font-semibold text-slate-200">Student</span>
              <span className="text-[10px] text-slate-500">student123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
