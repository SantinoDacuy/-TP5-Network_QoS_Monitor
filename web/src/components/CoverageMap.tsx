import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { QoSMeasurementRecord } from '../../../mobile/src/core/types';
import { HeatmapCalculator, HeatmapMetricType } from '../../../mobile/src/geo/HeatmapCalculator';
import { Layers, MapPin, Signal, Gauge, Activity, Clock } from 'lucide-react';

interface CoverageMapProps {
  records: QoSMeasurementRecord[];
  centerLat?: number;
  centerLng?: number;
}

export const CoverageMap: React.FC<CoverageMapProps> = ({
  records,
  centerLat = -34.6037,
  centerLng = -58.3816
}) => {
  const [activeMetric, setActiveMetric] = useState<HeatmapMetricType>('qosScore');

  const heatmapPoints = HeatmapCalculator.calculateHeatmap(records, activeMetric);

  const getMetricLabel = (m: HeatmapMetricType) => {
    switch (m) {
      case 'qosScore': return 'Puntaje QoS (0-100)';
      case 'signalDbm': return 'Potencia de Señal (dBm)';
      case 'downloadMbps': return 'Velocidad de Descarga (Mbps)';
      case 'pingAvg': return 'Latencia Promedio RTT (ms)';
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col h-full min-h-[520px]">
      {/* Map Header / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-slate-100">Mapa de Cobertura Personal & Heatmap</h3>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
            {records.length} puntos
          </span>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveMetric('qosScore')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeMetric === 'qosScore'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            QoS Score
          </button>
          <button
            onClick={() => setActiveMetric('signalDbm')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeMetric === 'signalDbm'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Señal (dBm)
          </button>
          <button
            onClick={() => setActiveMetric('downloadMbps')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeMetric === 'downloadMbps'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Descarga (Mbps)
          </button>
          <button
            onClick={() => setActiveMetric('pingAvg')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeMetric === 'pingAvg'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ping (ms)
          </button>
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', minHeight: '440px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render Heatmap Points & Pins */}
          {heatmapPoints.map((pt) => {
            const originalRecord = records.find(r => r.id === pt.recordId);

            return (
              <CircleMarker
                key={pt.recordId}
                center={[pt.latitude, pt.longitude]}
                radius={pt.radius * 0.75}
                pathOptions={{
                  fillColor: pt.color,
                  fillOpacity: 0.65,
                  color: pt.color,
                  weight: 2,
                  opacity: 0.95
                }}
              >
                <Popup>
                  {originalRecord ? (
                    <div className="p-1 min-w-[220px]">
                      <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
                        <span className="font-bold text-sm text-cyan-300">
                          {originalRecord.networkType} ({originalRecord.operatorName})
                        </span>
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">
                          {originalRecord.grade} ({originalRecord.qosScore}/100)
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tecnología:</span>
                          <span className="font-medium text-slate-200">{originalRecord.technologyDetail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Señal RSSI:</span>
                          <span className="font-mono font-semibold text-slate-200">{originalRecord.signalDbm} dBm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Descarga:</span>
                          <span className="font-mono font-semibold text-cyan-400">{originalRecord.downloadMbps} Mbps</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Subida:</span>
                          <span className="font-mono font-semibold text-emerald-400">{originalRecord.uploadMbps} Mbps</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Latencia RTT:</span>
                          <span className="font-mono font-semibold text-amber-400">{originalRecord.pingAvg} ms (Jitter: {originalRecord.jitter}ms)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pérdida:</span>
                          <span className="font-mono font-semibold text-rose-400">{originalRecord.packetLoss}%</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                          <span>Fecha:</span>
                          <span>{new Date(originalRecord.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-xs z-[1000] shadow-lg pointer-events-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Escala {getMetricLabel(activeMetric)}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-slate-200 font-medium">Excelente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              <span className="text-slate-200 font-medium">Regular</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span className="text-slate-200 font-medium">Degradada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
