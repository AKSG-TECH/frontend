import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Search, AlertCircle, PhoneCall } from 'lucide-react';
import api from '../api';

interface Contact {
  id: string;
  sessionId: string;
  waId: string;
  name: string | null;
  createdAt: string;
}

interface Session {
  id: string;
  sessionId: string;
  status: string;
}

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  
  // Create contact state
  const [sessionId, setSessionId] = useState('');
  const [waId, setWaId] = useState('');
  const [name, setName] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      const response = await api.get(
        selectedSessionId ? `/api/contacts?sessionId=${selectedSessionId}` : '/api/contacts'
      );
      setContacts(response.data);
    } catch (err) {
      setError('Failed to fetch WhatsApp contacts.');
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await api.get('/api/sessions');
      setSessions(response.data);
      if (response.data.length > 0) {
        setSessionId(response.data[0].sessionId);
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [selectedSessionId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !waId.trim()) return;
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/contacts', {
        sessionId,
        waId: waId.trim(),
        name: name.trim() || undefined,
      });
      await fetchContacts();
      setWaId('');
      setName('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact record?')) {
      return;
    }
    setError(null);
    try {
      await api.delete(`/api/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      setError('Failed to delete contact.');
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesName = c.name ? c.name.toLowerCase().includes(q) : false;
    const matchesPhone = c.waId.includes(q);
    const matchesSession = c.sessionId.toLowerCase().includes(q);
    return matchesName || matchesPhone || matchesSession;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            Contacts Manager
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Browse and sync chat contacts for active WhatsApp sessions.
          </p>
        </div>

        {/* Filter Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-400 font-semibold uppercase tracking-wider">Filter Session:</span>
          <select
            className="bg-dark-900 border border-dark-700/50 rounded-lg px-3 py-2 text-xs text-dark-100 focus:outline-none focus:border-brand-500"
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
          >
            <option value="">All Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.sessionId}>
                {s.sessionId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Register Contact Form */}
        <div className="glass p-8 rounded-2xl border border-dark-800/40 self-start">
          <h2 className="text-lg font-bold text-dark-200 mb-6">Register Contact</h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                Session Link
              </label>
              <select
                required
                className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              >
                {sessions.length === 0 ? (
                  <option value="">No sessions configured</option>
                ) : (
                  sessions.map((s) => (
                    <option key={s.id} value={s.sessionId}>
                      {s.sessionId}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                Phone Number (waId)
              </label>
              <input
                type="text"
                required
                className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
                placeholder="e.g. 919999999999"
                value={waId}
                onChange={(e) => setWaId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                Display Name
              </label>
              <input
                type="text"
                className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
                placeholder="e.g. Amit Gupta"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || sessions.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-dark-950 font-bold py-3 rounded-lg text-sm transition shadow-[0_4px_15px_rgba(52,186,107,0.15)] disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Plus className="h-5 w-5" /> Add Contact
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contacts list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="h-5 w-5 text-dark-500 absolute left-4 top-3.5" />
            <input
              type="text"
              className="w-full bg-dark-900 border border-dark-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
              placeholder="Search contacts by name, JID, or session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="glass rounded-2xl border border-dark-800/40 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-900/50 text-dark-400 uppercase tracking-widest text-[10px] font-bold border-b border-dark-800/40">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">WhatsApp ID</th>
                  <th className="py-4 px-6">Session ID</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/20">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-dark-400 text-sm">
                      <Users className="h-10 w-10 text-dark-600 mx-auto mb-3" />
                      No synchronized contacts found.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-dark-800/10 transition">
                      <td className="py-4 px-6 text-sm font-semibold text-dark-200">
                        {c.name || (
                          <span className="text-dark-500 italic font-normal">Unnamed Contact</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-dark-300">
                        <span className="flex items-center gap-1.5">
                          <PhoneCall className="h-3 w-3 text-brand-500" /> {c.waId}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-dark-800 text-dark-300 px-2 py-0.5 rounded text-[10px] font-mono border border-dark-700/40">
                          {c.sessionId}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition border border-red-500/10"
                          title="Delete Contact Record"
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
      </div>
    </div>
  );
};
