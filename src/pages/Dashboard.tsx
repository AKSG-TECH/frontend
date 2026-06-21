import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus,
  Play,
  Square,
  Trash2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  QrCode,
  X,
} from 'lucide-react';
import api from '../api';

interface Session {
  id: string;
  sessionId: string;
  status: string;
  qrCode: string | null;
}

export const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSessionId, setNewSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // QR Code scan modal state
  const [activeQrSession, setActiveQrSession] = useState<Session | null>(null);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/api/sessions');
      setSessions(response.data);
    } catch (err: any) {
      setError('Failed to fetch WhatsApp sessions.');
    }
  };

  useEffect(() => {
    fetchSessions();

    // Initialize Socket.IO connection
    // In dev: proxies via Vite, In prod: relative paths through Nginx
    const socket = io('/', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    // Listen for live connection/QR updates
    socket.on('session_update', (payload: { sessionId: string; event: string; data: any }) => {
      const { sessionId, event, data } = payload;
      
      setSessions((prev) =>
        prev.map((s) => {
          if (s.sessionId === sessionId) {
            const updated = { ...s };
            if (event === 'status') {
              updated.status = data.status;
              updated.qrCode = data.qrCode || null;

              // Update active QR code modal if open
              if (activeQrSession && activeQrSession.sessionId === sessionId) {
                setActiveQrSession((prevActive) => 
                  prevActive ? { ...prevActive, status: data.status, qrCode: data.qrCode || null } : null
                );
              }
            }
            return updated;
          }
          return s;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [activeQrSession]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionId.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/sessions/start', { sessionId: newSessionId.trim() });
      await fetchSessions();
      
      // Auto open QR modal if initializing
      const created = response.data;
      setActiveQrSession(created);
      setNewSessionId('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create WhatsApp session');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (sessionId: string) => {
    setError(null);
    try {
      await api.post('/api/sessions/start', { sessionId });
      fetchSessions();
      // Find session and set it as active QR viewer
      const match = sessions.find((s) => s.sessionId === sessionId);
      if (match) setActiveQrSession(match);
    } catch (err: any) {
      setError(`Failed to start session ${sessionId}`);
    }
  };

  const handleStop = async (sessionId: string) => {
    setError(null);
    try {
      await api.post('/api/sessions/stop', { sessionId });
      fetchSessions();
      if (activeQrSession?.sessionId === sessionId) {
        setActiveQrSession(null);
      }
    } catch (err: any) {
      setError(`Failed to stop session ${sessionId}`);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm(`Are you sure you want to delete session ${sessionId}? This will wipe stored logins.`)) {
      return;
    }
    setError(null);
    try {
      await api.delete(`/api/sessions/${sessionId}`);
      fetchSessions();
      if (activeQrSession?.sessionId === sessionId) {
        setActiveQrSession(null);
      }
    } catch (err: any) {
      setError(`Failed to delete session ${sessionId}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="flex items-center gap-1.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
            <CheckCircle className="h-3.5 w-3.5" /> Connected
          </span>
        );
      case 'SCAN_QR':
        return (
          <span className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
            <QrCode className="h-3.5 w-3.5" /> Scan QR Code
          </span>
        );
      case 'INITIALIZING':
      case 'CONNECTING':
        return (
          <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Connecting...
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 bg-dark-700/30 text-dark-400 border border-dark-700/20 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Square className="h-3.5 w-3.5" /> Disconnected
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            WhatsApp Sessions
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Configure and manage multi-device WhatsApp Business links.
          </p>
        </div>

        {/* Create Session Form */}
        <form onSubmit={handleCreateSession} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            required
            className="bg-dark-900 border border-dark-700/50 rounded-lg px-4 py-2.5 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 w-full md:w-60"
            placeholder="e.g. support-agent-1"
            value={newSessionId}
            onChange={(e) => setNewSessionId(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-dark-950 font-bold px-4 py-2.5 rounded-lg text-sm transition-all duration-200 shadow-[0_4px_15px_rgba(52,186,107,0.15)] shrink-0 disabled:opacity-50"
          >
            <Plus className="h-5 w-5" /> Add Session
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm shadow-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-dark-800/40">
          <QrCode className="h-16 w-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-dark-200">No WhatsApp Sessions Configured</h2>
          <p className="text-dark-400 max-w-md mx-auto mt-2 text-sm">
            You don't have any WhatsApp connection slots set up yet. Input a session identifier above and click "Add Session" to connect your account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="glass-card rounded-2xl p-6 border border-dark-800/40 hover:border-dark-700/50 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-dark-100 tracking-wide truncate pr-4">
                    {session.sessionId}
                  </h3>
                  {getStatusBadge(session.status)}
                </div>

                {/* Info Text */}
                <p className="text-xs text-dark-400 mb-6 leading-relaxed">
                  {session.status === 'CONNECTED'
                    ? 'Device is authenticated and ready to route automated message flows.'
                    : session.status === 'SCAN_QR'
                    ? 'Scan the generated QR code below or click the View QR button to link WhatsApp.'
                    : session.status === 'INITIALIZING'
                    ? 'Spawning WhatsApp background engine socket. Waiting for state check...'
                    : 'WhatsApp link is offline. Click Play to start or re-establish connections.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-auto pt-4 border-t border-dark-800/30">
                {session.status === 'CONNECTED' ? (
                  <button
                    onClick={() => handleStop(session.sessionId)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-dark-800 hover:bg-dark-700 text-dark-200 hover:text-dark-100 py-2 rounded-lg text-xs font-semibold transition"
                    title="Stop Session"
                  >
                    <Square className="h-3.5 w-3.5" /> Stop
                  </button>
                ) : (
                  <button
                    onClick={() => handleStart(session.sessionId)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 py-2 rounded-lg text-xs font-semibold transition border border-brand-500/10"
                    title="Start Session"
                  >
                    <Play className="h-3.5 w-3.5" /> Connect
                  </button>
                )}

                {session.status === 'SCAN_QR' && session.qrCode && (
                  <button
                    onClick={() => setActiveQrSession(session)}
                    className="flex items-center justify-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg text-xs font-semibold transition border border-yellow-500/10"
                  >
                    <QrCode className="h-3.5 w-3.5" /> View QR
                  </button>
                )}

                <button
                  onClick={() => handleDelete(session.sessionId)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition border border-red-500/10"
                  title="Delete Session"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal overlay */}
      {activeQrSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
          <div className="glass max-w-md w-full p-8 rounded-2xl border border-dark-800 relative shadow-2xl animate-scaleIn text-center">
            <button
              onClick={() => setActiveQrSession(null)}
              className="absolute top-4 right-4 p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-800 rounded-lg transition"
            >
              <Trash2 className="hidden" /> {/* Temp ref */}
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-extrabold text-xl text-dark-100 tracking-wide mb-2">
              Link WhatsApp Account
            </h3>
            <p className="text-xs text-dark-400 mb-6">
              Session ID: <span className="text-dark-200 font-bold">{activeQrSession.sessionId}</span>
            </p>

            {/* Modal Body */}
            <div className="flex flex-col items-center justify-center">
              {activeQrSession.status === 'SCAN_QR' && activeQrSession.qrCode ? (
                <>
                  <div className="bg-white p-4 rounded-2xl shadow-inner border border-dark-700/50 mb-6">
                    <QRCodeSVG
                      value={activeQrSession.qrCode}
                      size={240}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <ol className="text-left text-xs text-dark-300 space-y-2 max-w-xs mx-auto mb-2 list-decimal list-inside leading-relaxed">
                    <li>Open WhatsApp on your phone</li>
                    <li>Tap Menu (Android) or Settings (iOS)</li>
                    <li>Tap Linked Devices and tap Link a Device</li>
                    <li>Scan this QR code to sign in</li>
                  </ol>
                </>
              ) : activeQrSession.status === 'CONNECTED' ? (
                <div className="py-10 flex flex-col items-center">
                  <CheckCircle className="h-16 w-16 text-brand-500 animate-bounce mb-4" />
                  <span className="font-bold text-lg text-brand-400">Authenticated successfully!</span>
                  <p className="text-xs text-dark-400 mt-2">You can close this window now.</p>
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center">
                  <RefreshCw className="h-12 w-12 text-brand-400 animate-spin mb-4" />
                  <span className="text-sm text-dark-300 font-medium">
                    Initializing socket connection...
                  </span>
                  <p className="text-xs text-dark-500 mt-1 max-w-[240px]">
                    Waiting for WhatsApp API configuration. QR will load momentarily.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
