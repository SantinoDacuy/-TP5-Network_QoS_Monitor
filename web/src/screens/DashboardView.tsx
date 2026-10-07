import React from 'react';
import { useQoSStore } from '../../../mobile/src/state/useQoSStore';
import { SignalGauge } from '../components/SignalGauge';
import {
  Activity,
  Zap,
  Radio,
  MapPin,
  Clock,
  ShieldCheck,
  Play,
  RotateCw,
  Sparkles,
  Wifi,
  Server
} from 'lucide-react';

interface DashboardViewProps {
  onStartTest: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onStartTest }) => {
  const {
    currentNetwork,
    currentLocation,
    records,
    refreshTelephony,
    refreshLocation,
    simulate5GState,
    simulateDegradedState
  } = useQoSStore();

  const lastRecord = records.length > 0 ? records[0] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              SISTEMA EN TIEMPO REAL
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 font-display mt-1">
            Analizador de Calidad de Servicio Móvil (QoS / QoE)
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Métricas de rendimiento según RFC 2544 / RFC 3550 y mapeo de cobertura georreferenciado
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              refreshTelephony();
              refreshLocation();
            }}
            className="btn-secondary text-xs"
            title="Refrescar telemetría nativa y GPS"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Actualizar
          </button>

          <button onClick={onStartTest} className="btn-primary text-sm font-bold">
            <Play className="w-4 h-4 fill-white" />
            Iniciar Test QoS Completo
          </button>
        </div>
      </div>

      {/* Grid: Live Cellular Telemetry + GPS Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cell Signal & Operator Card */}
        <div className="lg:col-span-2">
          {currentNetwork ? (
            <SignalGauge
              signal={currentNetwork.signal}
              networkType={currentNetwork.networkGeneration}
              operatorName={currentNetwork.operatorName}
              technologyDetail={currentNetwork.technologyDetail}
            />
          ) : (
            <div className="glass-panel p-6 text-center text-slate-400">
              Cargando parámetros de telefonía celular...
            </div>
          )}
        </div>

        {/* GPS Georeference Status Card */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Posición GPS Activa
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono">
                PRECISIÓN ±{currentLocation ? Math.round(currentLocation.accuracy) : 10}m
              </span>
            </div>

            <div className="space-y-2 mt-2">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono text-xs">
                <span className="text-slate-400 block text-[10px] uppercase">Coordenadas WGS84</span>
                <span className="text-slate-100 font-bold">
                  {currentLocation ? currentLocation.latitude.toFixed(6) : '-34.603700'},{' '}
                  {currentLocation ? currentLocation.longitude.toFixed(6) : '-58.381600'}
                </span>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Altitud</span>
                  <span className="text-slate-200">
                    {currentLocation?.altitude ? `${Math.round(currentLocation.altitude)} m` : '24 m (ASL)'}
                  </span>
                </div>
                <div className="flex-1 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Velocidad</span>
                  <span className="text-slate-200">
                    {currentLocation?.speed ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h` : '0.0 km/h'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Georreferenciación lista para vincular a mediciones</span>
          </div>
        </div>
      </div>

      {/* KPI Cards: Última Medición Registrada */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Última Medición Registrada ({lastRecord ? new Date(lastRecord.timestamp).toLocaleTimeString() : 'Sin datos'})
          </h3>
          {lastRecord && (
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
              QoS Score: {lastRecord.qosScore}/100 (Grado {lastRecord.grade})
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4">
            <span className="text-[11px] uppercase font-bold text-slate-400">Latencia RTT Promedio</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {lastRecord ? `${lastRecord.pingAvg} ` : '-- '}
              <span className="text-xs font-sans text-slate-400">ms</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
              Min: {lastRecord?.pingMin || '--'}ms | Max: {lastRecord?.pingMax || '--'}ms
            </span>
          </div>

          <div className="glass-panel p-4">
            <span className="text-[11px] uppercase font-bold text-slate-400">Jitter RFC 3550</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {lastRecord ? `${lastRecord.jitter} ` : '-- '}
              <span className="text-xs font-sans text-slate-400">ms</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
              Pérdida: {lastRecord ? `${lastRecord.packetLoss}%` : '0%'}
            </span>
          </div>

          <div className="glass-panel p-4">
            <span className="text-[11px] uppercase font-bold text-slate-400">Throughput Descarga</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {lastRecord ? `${lastRecord.downloadMbps} ` : '-- '}
              <span className="text-xs font-sans text-slate-400">Mbps</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Downlink medido</span>
          </div>

          <div className="glass-panel p-4">
            <span className="text-[11px] uppercase font-bold text-slate-400">Throughput Subida</span>
            <div className="text-2xl font-bold font-mono text-violet-400 mt-1">
              {lastRecord ? `${lastRecord.uploadMbps} ` : '-- '}
              <span className="text-xs font-sans text-slate-400">Mbps</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Uplink medido</span>
          </div>
        </div>
      </div>

      {/* Simulator Mode Bar (for instant demonstration & testing) */}
      <div className="glass-panel p-4 border-slate-700/60 bg-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Simulador de Escenarios Móviles (Para Demo & Defensa)
              </h4>
              <p className="text-[11px] text-slate-400">
                Permite simular transiciones de celda, zonas de sombra/degradación y alta velocidad 5G
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={simulate5GState}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 transition-all"
            >
              Simular 5G Óptima (-75 dBm)
            </button>
            <button
              onClick={simulateDegradedState}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition-all"
            >
              Simular 3G Degradada (-118 dBm)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
