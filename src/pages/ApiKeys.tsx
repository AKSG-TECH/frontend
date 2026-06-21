import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Check, AlertCircle } from 'lucide-react';
import api from '../api';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export const ApiKeys: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const response = await api.get('/api/auth/api-keys');
      setKeys(response.data);
    } catch (err) {
      setError('Failed to fetch API keys.');
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/auth/api-keys', { name: name.trim() });
      await fetchKeys();
      setName('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate API key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Any active scripts using this key will immediately fail.')) {
      return;
    }
    setError(null);
    try {
      await api.delete(`/api/auth/api-keys/${id}`);
      fetchKeys();
    } catch (err) {
      setError('Failed to revoke API key');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            API Keys
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Generate and manage access tokens for sending messages programmatically.
          </p>
        </div>

        {/* Generate key form */}
        <form onSubmit={handleCreate} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            required
            className="bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-2.5 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 w-full md:w-60"
            placeholder="e.g. CRM Integration"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-dark-950 font-bold px-4 py-2.5 rounded-lg text-sm transition-all duration-200 shadow-[0_4px_15px_rgba(52,186,107,0.15)] shrink-0 disabled:opacity-50"
          >
            <Plus className="h-5 w-5" /> Generate Key
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Keys list */}
      <div className="glass rounded-2xl border border-dark-800/40 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-900/50 text-dark-400 uppercase tracking-widest text-[10px] font-bold border-b border-dark-800/40">
              <th className="py-4 px-6">Label</th>
              <th className="py-4 px-6">API Token</th>
              <th className="py-4 px-6">Created At</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/20">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-dark-400 text-sm">
                  <Key className="h-10 w-10 text-dark-600 mx-auto mb-3" />
                  No API Keys generated yet. Create one above to begin.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="hover:bg-dark-800/10 transition">
                  <td className="py-4 px-6 text-sm font-semibold text-dark-200">{k.name}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 max-w-xs md:max-w-md">
                      <span className="font-mono text-xs text-dark-300 bg-dark-950 border border-dark-850 px-2.5 py-1.5 rounded-lg select-all overflow-x-auto truncate flex-1">
                        {k.key}
                      </span>
                      <button
                        onClick={() => copyToClipboard(k.key, k.id)}
                        className="p-1.5 hover:bg-dark-800 hover:text-brand-400 rounded-lg text-dark-400 transition"
                        title="Copy Key"
                      >
                        {copiedId === k.id ? (
                          <Check className="h-4 w-4 text-brand-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-dark-400">
                    {new Date(k.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition border border-red-500/10"
                      title="Revoke Token"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
