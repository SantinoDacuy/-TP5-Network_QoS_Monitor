import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { QoSMeasurementRecord } from '../../../mobile/src/core/types';
import { TrendingUp, Clock, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimeSeriesChartsProps {
  records: QoSMeasurementRecord[];
}

export const TimeSeriesCharts: React.FC<TimeSeriesChartsProps> = ({ records }) => {
  // Sort chronologically for time-series charts
  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);

  const labels = sorted.map((r) =>
    new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // 1. Latency / RTT & Jitter Data
  const latencyData = {
    labels,
    datasets: [
      {
        label: 'Latencia Promedio RTT (ms)',
        data: sorted.map((r) => r.pingAvg),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#06b6d4'
      },
      {
        label: 'Jitter RFC 3550 (ms)',
        data: sorted.map((r) => r.jitter),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#f59e0b'
      },
      {
        label: 'Latencia Máxima (ms)',
        data: sorted.map((r) => r.pingMax),
        borderColor: '#f43f5e',
        backgroundColor: 'transparent',
        borderWidth: 1,
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: '#f43f5e'
      }
    ]
  };

  // 2. Throughput Data
  const throughputData = {
    labels,
    datasets: [
      {
        label: 'Descarga (Downlink Mbps)',
        data: sorted.map((r) => r.downloadMbps),
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#22d3ee'
      },
      {
        label: 'Subida (Uplink Mbps)',
        data: sorted.map((r) => r.uploadMbps),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        titleColor: '#38bdf8',
        bodyColor: '#e2e8f0'
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Chart 1: Latency & Jitter */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-100">
              Serie Temporal: Latencia RTT & Jitter (RFC 3550)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">ms por muestra</span>
        </div>
        <div className="h-64">
          <Line data={latencyData} options={chartOptions} />
        </div>
      </div>

      {/* Chart 2: Throughput Download / Upload */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-100">
              Serie Temporal: Throughput de Red (Mbps)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Mbps Downlink / Uplink</span>
        </div>
        <div className="h-64">
          <Line data={throughputData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
