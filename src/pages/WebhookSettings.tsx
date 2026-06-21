import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, AlertCircle } from 'lucide-react';
import api from '../api';

interface WebhookData {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
}

const AVAILABLE_EVENTS = [
  { value: 'message.received', label: 'Incoming Messages' },
  { value: 'message.sent', label: 'Outgoing Messages' },
  { value: 'message.delivered', label: 'Message Delivered Reports' },
  { value: 'message.read', label: 'Message Read Reports' },
  { value: 'session.connected', label: 'Session Connected' },
  { value: 'session.disconnected', label: 'Session Disconnected' },
];

export const WebhookSettings: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    try {
      const response = await api.get('/api/webhooks');
      setWebhooks(response.data);
    } catch (err) {
      setError('Failed to fetch webhooks.');
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCheckboxChange = (eventVal: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventVal) ? prev.filter((e) => e !== eventVal) : [...prev, eventVal]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (selectedEvents.length === 0) {
      setError('Please select at least one event trigger.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/webhooks', {
        url: url.trim(),
        events: selectedEvents,
        isActive: true,
      });
      await fetchWebhooks();
      setUrl('');
      setSelectedEvents([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await api.delete(`/api/webhooks/${id}`);
      fetchWebhooks();
    } catch (err) {
      setError('Failed to delete webhook.');
    }
  };

  const toggleWebhookActive = async (wh: WebhookData) => {
    setError(null);
    try {
      await api.put(`/api/webhooks/${wh.id}`, {
        url: wh.url,
        events: wh.events,
        isActive: !wh.isActive,
      });
      fetchWebhooks();
    } catch (err) {
      setError('Failed to toggle webhook state.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
          Webhook Integrations
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          Receive real-time event updates at external URLs when WhatsApp events occur.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to register a webhook */}
        <div className="glass p-8 rounded-2xl border border-dark-800/40">
          <h2 className="text-lg font-bold text-dark-200 mb-6">Register Webhook</h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                Payload Target URL
              </label>
              <input
                type="url"
                required
                className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
                placeholder="https://yourdomain.com/webhooks/whatsapp"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-3">
                Event Subscriptions
              </label>
              <div className="space-y-2.5">
                {AVAILABLE_EVENTS.map((event) => (
                  <label
                    key={event.value}
                    className="flex items-start gap-3 text-sm text-dark-300 hover:text-dark-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 bg-dark-900 border border-dark-700/50 rounded text-brand-500 focus:ring-brand-500"
                      checked={selectedEvents.includes(event.value)}
                      onChange={() => handleCheckboxChange(event.value)}
                    />
                    <span>{event.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-dark-950 font-bold py-3 rounded-lg text-sm transition shadow-[0_4px_15px_rgba(52,186,107,0.15)] disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Plus className="h-5 w-5" /> Add Webhook
                </>
              )}
            </button>
          </form>
        </div>

        {/* Webhooks list */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-dark-200">Active Handlers</h2>
          
          {webhooks.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-dark-800/40">
              <Webhook className="h-12 w-12 text-dark-600 mx-auto mb-3" />
              <p className="text-sm text-dark-400">No webhooks registered. Setup a target URL to start.</p>
            </div>
          ) : (
            webhooks.map((wh) => (
              <div
                key={wh.id}
                className="glass-card p-6 rounded-2xl border border-dark-800/40 hover:border-dark-750 flex items-start justify-between gap-4 transition"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-brand-400 truncate block select-all">
                      {wh.url}
                    </span>
                    <button
                      onClick={() => toggleWebhookActive(wh)}
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border transition ${
                        wh.isActive
                          ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                          : 'bg-dark-800 text-dark-400 border-dark-700/50'
                      }`}
                    >
                      {wh.isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {wh.events.map((evt) => (
                      <span
                        key={evt}
                        className="bg-dark-800 text-dark-300 px-2 py-0.5 rounded text-[10px] font-mono border border-dark-700/40"
                      >
                        {evt}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(wh.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition border border-red-500/10 self-center shrink-0"
                  title="Delete Webhook"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
