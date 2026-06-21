import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Terminal, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../api';

interface Log {
  id: string;
  level: string;
  category: string;
  message: string;
  details: any;
  createdAt: string;
}

interface SocketLog {
  type: string;
  sessionId: string;
  message: string;
  timestamp: string;
}

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [liveLogs, setLiveLogs] = useState<SocketLog[]>([]);
  const [activeTab, setActiveTab] = useState<'historical' | 'live'>('historical');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const liveEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/logs?limit=100');
      setLogs(response.data);
    } catch (err) {
      setError('Failed to fetch system logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'historical') {
      fetchLogs();
    }
  }, [activeTab]);

  useEffect(() => {
    // Connect to Socket.IO for live logs streaming
    const socket = io('/', {
      transports: ['websocket'],
    });

    socket.on('log_stream', (data: any) => {
      const liveMsg: SocketLog = {
        type: data.type || 'info',
        sessionId: data.sessionId || 'system',
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
      };
      setLiveLogs((prev) => [...prev.slice(-99), liveMsg]); // Limit to last 100 entries
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Scroll live console to bottom when new logs arrive
    if (activeTab === 'live') {
      liveEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveLogs, activeTab]);

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all system logs from the database?')) {
      return;
    }
    try {
      await api.delete('/api/logs');
      setLogs([]);
    } catch (err) {
      setError('Failed to clear logs.');
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-400 font-bold';
      case 'warn':
        return 'text-yellow-400 font-bold';
      case 'debug':
        return 'text-blue-400';
      default:
        return 'text-green-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            System logs
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Audit API executions, webhook dispatches, and WhatsApp socket activities.
          </p>
        </div>

        {/* Tab switcher & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto self-end">
          <div className="flex bg-dark-900 border border-dark-800/40 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('historical')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'historical'
                  ? 'bg-brand-500 text-dark-950 font-bold'
                  : 'text-dark-400 hover:text-dark-100'
              }`}
            >
              Saved Logs
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'live'
                  ? 'bg-brand-500 text-dark-950 font-bold'
                  : 'text-dark-400 hover:text-dark-100'
              }`}
            >
              Live Console
            </button>
          </div>

          {activeTab === 'historical' && logs.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold px-3.5 py-2.5 rounded-lg transition"
            >
              <Trash2 className="h-4 w-4" /> Clear All
            </button>
          )}

          {activeTab === 'historical' && (
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2.5 bg-dark-900 hover:bg-dark-800 border border-dark-750 text-dark-300 rounded-lg transition"
              title="Refresh Logs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-shake">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Console Box */}
      <div className="glass rounded-2xl border border-dark-800/40 overflow-hidden shadow-2xl flex flex-col h-[550px]">
        {/* Terminal Header */}
        <div className="bg-dark-900 px-6 py-3 border-b border-dark-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 bg-red-500 rounded-full"></span>
            <span className="h-3.5 w-3.5 bg-yellow-500 rounded-full"></span>
            <span className="h-3.5 w-3.5 bg-green-500 rounded-full"></span>
            <span className="text-xs font-semibold text-dark-400 font-mono ml-3">
              {activeTab === 'historical' ? 'database_audit_logs.sh' : 'live_socket_stream.log'}
            </span>
          </div>
          {activeTab === 'live' && (
            <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-400 animate-pulse bg-brand-500/5 px-2.5 py-1 border border-brand-500/10 rounded-full">
              <span className="h-1.5 w-1.5 bg-brand-500 rounded-full"></span> Live
            </span>
          )}
        </div>

        {/* Terminal logs list */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-dark-300 bg-dark-950 space-y-2">
          {activeTab === 'historical' ? (
            loading ? (
              <div className="h-full flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-brand-400 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center text-dark-500 py-20 font-sans">
                <Terminal className="h-12 w-12 text-dark-750 mx-auto mb-3" />
                No saved audit logs in database.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border-b border-dark-900/30 pb-2 leading-relaxed">
                  <span className="text-dark-500">[{new Date(log.createdAt).toISOString()}]</span>{' '}
                  <span className={getLogLevelColor(log.level)}>{log.level.toUpperCase()}</span>{' '}
                  <span className="text-brand-500 font-semibold">[{log.category.toUpperCase()}]</span>:{' '}
                  <span className="text-dark-200">{log.message}</span>
                  {log.details && (
                    <details className="mt-1 text-dark-400/80 cursor-pointer font-sans pl-4 border-l border-dark-800">
                      <summary className="text-[10px] text-dark-400 hover:text-dark-200 select-none">
                        Show Payload Details
                      </summary>
                      <pre className="mt-1.5 p-2.5 bg-dark-900 border border-dark-850 rounded-lg text-[10px] font-mono overflow-x-auto text-dark-300">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )
          ) : liveLogs.length === 0 ? (
            <div className="text-center text-dark-500 py-20 font-sans">
              <Terminal className="h-12 w-12 text-dark-750 mx-auto mb-3 animate-pulse" />
              Waiting for live WhatsApp socket operations or messages to log...
            </div>
          ) : (
            liveLogs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                <span className="text-dark-500">[{log.timestamp}]</span>{' '}
                <span className="text-brand-400">[{log.sessionId.toUpperCase()}]</span>{' '}
                <span className="text-dark-200">{log.message}</span>
              </div>
            ))
          )}
          <div ref={liveEndRef} />
        </div>
      </div>
    </div>
  );
};
