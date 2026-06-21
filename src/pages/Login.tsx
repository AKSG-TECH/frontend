import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareCode, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, setupAdmin, initialized, checkSetupStatus } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!initialized) {
        // Run setup admin
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await setupAdmin(username, password);
        await checkSetupStatus();
        await login(username, password);
      } else {
        // Run login
        await login(username, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass p-8 rounded-2xl relative shadow-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-brand-500/10 rounded-xl mb-4 shadow-[0_0_15px_rgba(52,186,107,0.1)] border border-brand-500/20">
            <MessageSquareCode className="h-10 w-10 text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            {initialized ? 'Welcome Back' : 'Initial Admin Setup'}
          </h1>
          <p className="text-sm text-dark-400 mt-2">
            {initialized
              ? 'Sign in to manage your WhatsApp Business API'
              : 'Create the primary admin credentials for this instance'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 animate-shake">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition duration-200"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition duration-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!initialized && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition duration-200"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-dark-950 font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_4px_20px_rgba(52,186,107,0.2)] hover:shadow-[0_4px_25px_rgba(52,186,107,0.3)] disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></span>
            ) : initialized ? (
              <>
                <UserCheck className="h-5 w-5" />
                Sign In
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Setup Credentials
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
