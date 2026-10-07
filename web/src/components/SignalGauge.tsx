import React from 'react';
import { SignalMetrics, NetworkGeneration } from '../../../mobile/src/core/types';
import { Wifi, Radio, AlertTriangle } from 'lucide-react';

interface SignalGaugeProps {
  signal: SignalMetrics;
  networkType: NetworkGeneration;
  operatorName: string;
  technologyDetail: string;
}

export const SignalGauge: React.FC<SignalGaugeProps> = ({
  signal,
  networkType,
  operatorName,
  technologyDetail
}) => {
  // Normalize dBm: -125 (worst) to -60 (best)
  const clampedDbm = Math.max(-125, Math.min(-55, signal.dbm));
  const percent = Math.round(((clampedDbm - (-125)) / 70) * 100);

  const getColor = () => {
    if (signal.dbm >= -80) return '#10b981'; // Green
    if (signal.dbm >= -95) return '#06b6d4'; // Cyan
    if (signal.dbm >= -110) return '#f59e0b'; // Amber
    return '#f43f5e'; // Red
  };

  const color = getColor();

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      {/* Background radial highlight */}
      <div
        className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {networkType === 'WIFI' ? (
            <Wifi className="w-5 h-5 text-violet-400" />
          ) : (
            <Radio className="w-5 h-5 text-cyan-400" />
          )}
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Nivel de Señal RF (RSSI / dBm)
          </span>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}50` }}
        >
          {signal.qualityDescriptor}
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div>
          <div className="text-3xl font-bold font-mono tracking-tight" style={{ color }}>
            {signal.dbm}{' '}
            <span className="text-sm font-sans font-normal text-slate-400">dBm</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            ASU: <span className="text-slate-200 font-mono">{signal.asuLevel}</span> | Operador:{' '}
            <span className="text-slate-200 font-medium">{operatorName}</span>
          </div>
        </div>

        {/* 5-bar cellular signal visualizer */}
        <div className="flex items-end gap-1.5 h-10 px-2 py-1 bg-slate-900/60 rounded-lg border border-slate-800">
          {[1, 2, 3, 4, 5].map((bar) => {
            const isActive = percent >= bar * 20 - 10;
            return (
              <div
                key={bar}
                className="w-2 rounded-sm transition-all duration-300"
                style={{
                  height: `${bar * 20}%`,
                  backgroundColor: isActive ? color : 'rgba(255,255,255,0.1)',
                  boxShadow: isActive ? `0 0 8px ${color}80` : 'none'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Linear progress bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`
          }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
        <span>-125 dBm (Crítica)</span>
        <span>{technologyDetail}</span>
        <span>-55 dBm (Óptima)</span>
      </div>
    </div>
  );
};
