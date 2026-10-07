import React, { useState } from 'react';
import { useQoSStore } from '../../../mobile/src/state/useQoSStore';
import {
  History,
  Trash2,
  Search,
  Filter,
  MapPin,
  Clock,
  ArrowDown,
  ArrowUp,
  Activity,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { filteredRecords, records, deleteRecord, clearAllRecords, updateFilter } = useQoSStore();
  const [searchTerm, setSearchTerm] = useState('');

  const displayList = filteredRecords.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.operatorName.toLowerCase().includes(term) ||
      r.technologyDetail.toLowerCase().includes(term) ||
      r.networkType.toLowerCase().includes(term) ||
      (r.notes && r.notes.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header & Search */}
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
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-xl font-extrabold text-slate-100 font-display">
                Historial de Mediciones QoS (RF-04)
              </h2>
              <span className="text-xs text-slate-400">
                {records.length} registros totales guardados en base de datos local
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas eliminar todo el historial de mediciones?')) {
                  clearAllRecords();
                }
              }}
              disabled={records.length === 0}
              className="btn-secondary text-xs text-rose-400 hover:text-rose-300 hover:border-rose-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar Historial
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por operador, tecnología (5G, LTE, 802.11) o notas de sesión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* Record Cards List */}
      <div className="space-y-3">
        {displayList.length === 0 ? (
          <div className="glass-panel p-10 text-center text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-50" />
            <p className="text-sm font-semibold">No se encontraron mediciones registradas.</p>
            <p className="text-xs text-slate-400 mt-1">
              Ejecuta un nuevo test QoS desde el menú principal para registrar datos.
            </p>
          </div>
        ) : (
          displayList.map((record) => {
            const isDegraded = record.qosScore < 50;

            return (
              <div
                key={record.id}
                className={`glass-panel p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isDegraded ? 'border-rose-900/40 bg-rose-950/10' : ''
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-mono text-sm border flex-shrink-0 ${
                      record.grade === 'A+' || record.grade === 'A'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                        : record.grade === 'B' || record.grade === 'C'
                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    <span>{record.grade}</span>
                    <span className="text-[9px] -mt-0.5">{record.qosScore}</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        {record.operatorName}
                      </span>
                      <span
                        className={`badge text-[10px] ${
                          record.networkType === '5G'
                            ? 'badge-5g'
                            : record.networkType === '4G'
                            ? 'badge-4g'
                            : record.networkType === '3G'
                            ? 'badge-3g'
                            : 'badge-wifi'
                        }`}
                      >
                        {record.technologyDetail}
                      </span>
                      {record.isBackground && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                          Background Auto
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)} (±{Math.round(record.accuracy)}m)
                      </span>
                      {record.notes && (
                        <span className="text-cyan-400 text-xs font-sans">
                          • {record.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right KPIs + Delete action */}
                <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800/80">
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Latencia</span>
                      <span className="text-cyan-400 font-bold">{record.pingAvg}ms</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Jitter</span>
                      <span className="text-amber-400 font-bold">{record.jitter}ms</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Descarga</span>
                      <span className="text-emerald-400 font-bold">{record.downloadMbps}M</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Señal</span>
                      <span className="text-slate-200 font-bold">{record.signalDbm}dBm</span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Eliminar este registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
