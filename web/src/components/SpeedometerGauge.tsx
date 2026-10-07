import React from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface SpeedometerGaugeProps {
  type: 'download' | 'upload';
  currentMbps: number;
  maxScale?: number;
  isActive: boolean;
  progressPercent?: number;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  type,
  currentMbps,
  maxScale = 200,
  isActive,
  progressPercent = 0
}) => {
  const isDl = type === 'download';
  const color = isDl ? '#06b6d4' : '#10b981'; // Cyan for download, Emerald for upload
  const Icon = isDl ? ArrowDownCircle : ArrowUpCircle;
  const title = isDl ? 'Descarga (Downlink)' : 'Subida (Uplink)';

  // Calculate arc rotation (from -120 deg to +120 deg)
  const ratio = Math.min(1, Math.max(0, currentMbps / maxScale));
  const angle = -120 + ratio * 240;

  // SVG arc calculation (radius 75)
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ratio * (240 / 360)) * circumference;

  return (
    <div className={`glass-panel p-5 flex flex-col items-center relative overflow-hidden ${isActive ? 'glass-panel-glow' : ''}`}>
      <div className="flex items-center gap-2 mb-2 self-start">
        <Icon className="w-5 h-5" style={{ color }} />
        <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
          {title}
        </span>
      </div>

      {/* Circular Speedometer */}
      <div className="relative w-48 h-48 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background track circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="12"
            strokeDasharray={`${circumference * (240 / 360)} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(150 100 100)"
          />

          {/* Active progress arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${circumference * (240 / 360)} ${circumference}`}
            strokeDashoffset={circumference * (240 / 360) * (1 - ratio)}
            strokeLinecap="round"
            transform="rotate(150 100 100)"
            style={{
              transition: 'stroke-dashoffset 0.15s ease-out',
              filter: `drop-shadow(0 0 8px ${color}80)`
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold font-mono tracking-tight" style={{ color }}>
            {currentMbps.toFixed(1)}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            Mbps
          </span>
          {isActive && (
            <span className="text-[10px] text-cyan-400 animate-pulse mt-1 font-mono">
              MIDIENDO... {progressPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Scale markers */}
      <div className="w-full flex justify-between px-6 text-[11px] text-slate-400 font-mono -mt-2">
        <span>0</span>
        <span>{Math.round(maxScale / 2)}</span>
        <span>{maxScale}+ Mbps</span>
      </div>
    </div>
  );
};
