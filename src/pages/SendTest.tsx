import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Info } from 'lucide-react';
import api from '../api';

interface Session {
  id: string;
  sessionId: string;
  status: string;
}

export const SendTest: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState<'text' | 'image' | 'document'>('text');
  
  // Text payload
  const [message, setMessage] = useState('');

  // Image payload
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  // Document payload
  const [documentUrl, setDocumentUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/api/sessions');
        const active = res.data.filter((s: Session) => s.status === 'CONNECTED');
        setSessions(active);
        if (active.length > 0) {
          setSessionId(active[0].sessionId);
        }
      } catch (err) {
        console.error('Failed to load active sessions:', err);
      }
    };
    fetchSessions();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !to) {
      setError('Please select a session and enter a target phone number.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    let endpoint = '/api/messages/send-text';
    let payload: any = { sessionId, to };

    if (type === 'text') {
      endpoint = '/api/messages/send-text';
      payload.message = message;
    } else if (type === 'image') {
      endpoint = '/api/messages/send-image';
      payload.imageUrl = imageUrl;
      payload.caption = caption;
    } else if (type === 'document') {
      endpoint = '/api/messages/send-document';
      payload.documentUrl = documentUrl;
      payload.fileName = fileName || undefined;
      payload.mimetype = 'application/pdf'; // Default
    }

    try {
      const res = await api.post(endpoint, payload);
      setResponse(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to dispatch message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
          Send Test Message
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          Perform a manual API test delivery to confirm message routing logic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-2 glass p-8 rounded-2xl border border-dark-800/40">
          <form onSubmit={handleSend} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Session ID Selection */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                  Select Connected Session
                </label>
                <select
                  required
                  className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 focus:outline-none focus:border-brand-500"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                >
                  {sessions.length === 0 ? (
                    <option value="">No connected sessions found</option>
                  ) : (
                    sessions.map((s) => (
                      <option key={s.id} value={s.sessionId}>
                        {s.sessionId}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Destination Phone Number */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                  Recipient Number (JID format)
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
                  placeholder="e.g. 919999999999"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>

            {/* Message Type Selection */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-3">
                Message Type
              </label>
              <div className="flex gap-4">
                {(['text', 'image', 'document'] as const).map((t) => (
                  <label
                    key={t}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-lg border text-sm font-semibold cursor-pointer transition capitalize ${
                      type === t
                        ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                        : 'border-dark-750 text-dark-400 bg-dark-900/30 hover:border-dark-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="messageType"
                      value={t}
                      checked={type === t}
                      onChange={() => setType(t)}
                      className="sr-only"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Inputs */}
            {type === 'text' && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 resize-none"
                  placeholder="Enter message body here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            )}

            {type === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    required
                    className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                    Image Caption
                  </label>
                  <input
                    type="text"
                    className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
                    placeholder="Enter visual caption (optional)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
              </div>
            )}

            {type === 'document' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                    Document URL
                  </label>
                  <input
                    type="url"
                    required
                    className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
                    placeholder="https://example.com/invoice.pdf"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-dark-400 font-semibold mb-2">
                    File Name (with extension)
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
                    placeholder="invoice.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || sessions.length === 0}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-dark-950 font-bold px-6 py-3 rounded-lg text-sm transition shadow-[0_4px_15px_rgba(52,186,107,0.15)] disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="h-5 w-5" /> Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Response panel */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-dark-800/40">
            <h3 className="text-sm uppercase tracking-wider font-semibold text-dark-300 flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-brand-500" /> API Schema Reference
            </h3>
            <p className="text-xs text-dark-400 leading-relaxed">
              When triggering dispatches programmatically, send an HTTP POST request to:
            </p>
            <div className="bg-dark-950 border border-dark-850 p-3 rounded-lg text-xs font-mono select-all overflow-x-auto text-brand-400 mt-3">
              POST /api/messages/send-{type}
            </div>
            <p className="text-xs text-dark-400 leading-relaxed mt-4">
              Don't forget to include your generated credentials header:
            </p>
            <div className="bg-dark-950 border border-dark-850 p-3 rounded-lg text-xs font-mono select-all overflow-x-auto text-yellow-400 mt-3">
              x-api-key: YOUR_API_KEY
            </div>
          </div>

          {response && (
            <div className="bg-brand-500/5 border border-brand-500/20 text-brand-300 p-6 rounded-2xl">
              <div className="flex items-center gap-2 font-bold mb-3 text-brand-400 text-sm">
                <CheckCircle className="h-5 w-5" /> Transmission Successful!
              </div>
              <pre className="text-xs font-mono bg-dark-950 p-4 rounded-xl overflow-x-auto text-dark-300">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-6 rounded-2xl">
              <div className="flex items-center gap-2 font-bold mb-3 text-red-400 text-sm">
                <AlertCircle className="h-5 w-5" /> Transmission Failed!
              </div>
              <p className="text-xs text-dark-300 mb-3">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
