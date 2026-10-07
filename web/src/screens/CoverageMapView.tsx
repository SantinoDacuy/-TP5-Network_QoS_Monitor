import React, { useState } from 'react';
import { useQoSStore } from '../../../mobile/src/state/useQoSStore';
import { CoverageMap } from '../components/CoverageMap';
import { NetworkGeneration } from '../../../mobile/src/core/types';
import {
  Filter,
  Layers,
  MapPin,
  RotateCcw,
  Signal,
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';

export const CoverageMapView: React.FC = () => {
  const { filteredRecords, records, filterCriteria, updateFilter } = useQoSStore();
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [minScore, setMinScore] = useState<number>(0);

  const handleTechChange = (tech: string) => {
    setSelectedTech(tech);
    if (tech === 'ALL') {
      updateFilter({ networkTypes: undefined });
    } else {
      updateFilter({ networkTypes: [tech as NetworkGeneration] });
    }
  };

  const handleScoreChange = (score: number) => {
    setMinScore(score);
    updateFilter({ minQoSScore: score > 0 ? score : undefined });
  };

  const handleResetFilters = () => {
    setSelectedTech('ALL');
    setMinScore(0);
    updateFilter({ networkTypes: undefined, minQoSScore: undefined, dateFrom: undefined, dateTo: undefined });
  };

  // Quick stats for the current filtered map
  const avgDbm =
    filteredRecords.length > 0
      ? Math.round(filteredRecords.reduce((acc, r) => acc + r.signalDbm, 0) / filteredRecords.length)
      : -85;

  const avgSpeed =
    filteredRecords.length > 0
      ? Math.round((filteredRecords.reduce((acc, r) => acc + r.downloadMbps, 0) / filteredRecords.length) * 10) / 10
      : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Filter and Control Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          borderRadius: '20px',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 51, 68, 0.25) 100%)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Filtros Geoespaciales & Tecnológicos (RF-09)
            </h3>
          </div>

          <button onClick={handleResetFilters} className="btn-secondary text-xs self-start md:self-auto">
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800">
          {/* Tech Filter */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">
              Tipo de Red Activa:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['ALL', '5G', '4G', '3G', 'WIFI'].map((tech) => (
                <button
                  key={tech}
                  onClick={() => handleTechChange(tech)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedTech === tech
                      ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/50'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {tech === 'ALL' ? 'Todas' : tech}
                </button>
              ))}
            </div>
          </div>

          {/* Min QoS Score Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs text-slate-400 font-medium">
                Puntaje Mínimo de Calidad (QoS):
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">{minScore}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minScore}
              onChange={(e) => handleScoreChange(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0 (Cualquiera)</span>
              <span>50 (Aceptable)</span>
              <span>80+ (Excelente)</span>
            </div>
          </div>

          {/* Quick Stats in filtered area */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-around">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Puntos Mapeados</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {filteredRecords.length} / {records.length}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Señal Promedio</span>
              <span className="text-base font-bold font-mono text-slate-200">
                {avgDbm} dBm
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Velocidad Promedio</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {avgSpeed} Mbps
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map with Heatmap */}
      <CoverageMap records={filteredRecords} />
    </div>
  );
};
