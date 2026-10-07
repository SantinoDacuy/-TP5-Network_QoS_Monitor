import React from 'react';
import { HostPingSummary } from '../../../mobile/src/core/types';
import { Activity, Server, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface PingHostCardProps {
  summary: HostPingSummary;
}

export const PingHostCard: React.FC<PingHostCardProps> = ({ summary }) => {
  const isRunning = summary.status === 'running';
  const isSuccess = summary.status === 'success';
  const isFailed = summary.status === 'failed';

  const getLatencyColor = (ms: number) => {
    if (ms <= 30) return 'text-emerald-400';
    if (ms <= 75) return 'text-cyan-400';
    if (ms <= 130) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className={`glass-panel p-4 flex flex-col justify-between transition-all ${isRunning ? 'border-cyan-500/50 shadow-lg shadow-cyan-900/20' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{summary.hostName}</h4>
            <span className="text-[11px] font-mono text-slate-400">
              {summary.host}:{summary.port} ({summary.protocol})
            </span>
          </div>
        </div>

        <div>
          {isRunning && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Sondeando...
            </span>
          )}
          {isSuccess && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              OK
            </span>
          )}
          {isFailed && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
              <XCircle className="w-3.5 h-3.5" />
              Perdido
            </span>
          )}
        </div>
      </div>

      {/* RTT Metrics */}
      <div className="grid grid-cols-4 gap-2 my-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Min</span>
          <span className="font-mono text-xs font-semibold text-slate-200">
            {summary.minRtt > 0 ? `${summary.minRtt}ms` : '--'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg</span>
          <span className={`font-mono text-xs font-bold ${getLatencyColor(summary.avgRtt)}`}>
            {summary.avgRtt > 0 ? `${summary.avgRtt}ms` : '--'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Max</span>
          <span className="font-mono text-xs font-semibold text-slate-200">
            {summary.maxRtt > 0 ? `${summary.maxRtt}ms` : '--'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Jitter</span>
          <span className="font-mono text-xs font-semibold text-amber-400">
            {summary.jitterMs > 0 ? `${summary.jitterMs}ms` : '--'}
          </span>
        </div>
      </div>

      {/* Packet Loss & Sample bars */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>
          Pérdida:{' '}
          <strong className={summary.packetLossPercent > 0 ? 'text-rose-400' : 'text-emerald-400 font-mono'}>
            {summary.packetLossPercent}%
          </strong>
        </span>
        <span>
          Muestras:{' '}
          <span className="text-slate-200 font-mono">
            {summary.probesReceived}/{summary.probesSent}
          </span>
        </span>
      </div>
    </div>
  );
};
