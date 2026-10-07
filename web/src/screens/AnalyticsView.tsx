import React from 'react';
import { useQoSStore } from '../../../mobile/src/state/useQoSStore';
import { TimeSeriesCharts } from '../components/TimeSeriesCharts';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  ShieldAlert,
  Zap,
  Clock,
  Radio
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { records } = useQoSStore();

  // Calculate advanced network engineering statistics
  const count = records.length;
  const pings = records.map((r) => r.pingAvg).sort((a, b) => a - b);
  const p90Index = Math.min(count - 1, Math.floor(count * 0.9));
  const p90Ping = count > 0 ? pings[p90Index] : 0;

  const maxDownload = count > 0 ? Math.max(...records.map((r) => r.downloadMbps)) : 0;
  const avgDownload =
    count > 0 ? Math.round((records.reduce((a, b) => a + b.downloadMbps, 0) / count) * 10) / 10 : 0;

  const avgJitter =
    count > 0 ? Math.round((records.reduce((a, b) => a + b.jitter, 0) / count) * 10) / 10 : 0;

  const degradedCount = records.filter((r) => r.qosScore < 50 || r.grade === 'F').length;
  const degradedPercent = count > 0 ? Math.round((degradedCount / count) * 100) : 0;

  // Breakdown by generation
  const techBreakdown = records.reduce((acc: any, r) => {
    acc[r.networkType] = (acc[r.networkType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-extrabold text-slate-100 font-display">
            Analítica de Rendimiento & Series Temporales (RFC 2544)
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Evolución temporal del comportamiento de la interfaz de radio móvil y distribución de parámetros de calidad
        </p>
      </div>

      {/* Advanced Telecom KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Percentil 90 (P90) Ping</span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {p90Ping}{' '}
            <span className="text-xs font-sans text-slate-400">ms</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            90% de los paquetes RTT por debajo de este valor
          </span>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Pico Máximo Downlink</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {maxDownload}{' '}
            <span className="text-xs font-sans text-slate-400">Mbps</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Promedio global: {avgDownload} Mbps
          </span>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Jitter Estadístico Medio</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {avgJitter}{' '}
            <span className="text-xs font-sans text-slate-400">ms</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Variación entre paquetes RFC 3550
          </span>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Tasa de Degradación</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {degradedPercent}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {degradedCount} de {count} muestras bajo el umbral crítico
          </span>
        </div>
      </div>

      {/* Time Series Charts Component */}
      <TimeSeriesCharts records={records} />

      {/* Network Distribution Breakdown */}
      <div className="glass-panel p-5">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          Distribución de Muestreos por Tecnología Celular / WiFi
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['5G', '4G', '3G', 'WIFI'].map((tech) => {
            const num = techBreakdown[tech] || 0;
            const pct = count > 0 ? Math.round((num / count) * 100) : 0;

            return (
              <div key={tech} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 font-mono">{tech}</span>
                  <span className="text-xs text-slate-400 font-mono">{num} muestras</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block text-right font-mono">
                  {pct}% del total
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
