import React, { useState } from 'react';
import { useQoSStore } from '../../../mobile/src/state/useQoSStore';
import { SpeedometerGauge } from '../components/SpeedometerGauge';
import { PingHostCard } from '../components/PingHostCard';
import {
  Play,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Map,
  ShieldCheck,
  Server,
  Activity,
  Layers
} from 'lucide-react';

interface ActiveTestViewProps {
  onGoToMap: () => void;
  onGoToDashboard: () => void;
}

export const ActiveTestView: React.FC<ActiveTestViewProps> = ({
  onGoToMap,
  onGoToDashboard
}) => {
  const {
    activeTestPhase,
    pingSummaries,
    throughputProgress,
    lastTestResult,
    settings,
    runFullQoSTest
  } = useQoSStore();

  const isTesting =
    activeTestPhase === 'running_ping' ||
    activeTestPhase === 'running_download' ||
    activeTestPhase === 'running_upload';

  const isCompleted = activeTestPhase === 'completed' && lastTestResult !== null;

  const currentDlMbps =
    activeTestPhase === 'running_download' && throughputProgress
      ? throughputProgress.currentMbps
      : isCompleted
      ? lastTestResult.downloadMbps
      : 0;

  const currentUlMbps =
    activeTestPhase === 'running_upload' && throughputProgress
      ? throughputProgress.currentMbps
      : isCompleted
      ? lastTestResult.uploadMbps
      : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="animate-fade-in">
      {/* Test Control Header */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          borderRadius: '20px',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 51, 68, 0.3) 100%)'
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isTesting
                  ? 'bg-cyan-400 animate-ping'
                  : isCompleted
                  ? 'bg-emerald-400'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              {isTesting
                ? `EJECUTANDO: ${
                    activeTestPhase === 'running_ping'
                      ? 'SONDEO RTT Y JITTER (RFC 3550)'
                      : activeTestPhase === 'running_download'
                      ? 'TEST DE THROUGHPUT DE DESCARGA'
                      : 'TEST DE THROUGHPUT DE SUBIDA'
                  }`
                : isCompleted
                ? 'TEST COMPLETADO Y REGISTRADO'
                : 'CONSOLA DE MEDICIÓN ACTIVA'}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-100 font-display mt-1">
            Motor de Pruebas QoS RFC 2544
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Evaluación simultánea de latencia multi-host, jitter estadístico y ancho de banda cliente-servidor
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => runFullQoSTest()}
            disabled={isTesting}
            className={`btn-primary ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isTesting ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Midiendo Red...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                {isCompleted ? 'Repetir Test' : 'Comenzar Medición'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stage 1: Multi-Target Ping Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Etapa 1: Sondas RTT Multi-Host & Jitter (RFC 3550)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            3 Hosts de Referencia
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {settings.pingTargets.map((target) => {
            const summary = pingSummaries.find((p) => p.id === target.id) || {
              id: target.id,
              hostName: target.name,
              host: target.host,
              port: target.port,
              protocol: target.protocol,
              probesSent: 0,
              probesReceived: 0,
              samples: [],
              minRtt: 0,
              avgRtt: 0,
              maxRtt: 0,
              jitterMs: 0,
              packetLossPercent: 0,
              status: isTesting && activeTestPhase === 'running_ping' ? 'running' : 'idle'
            };

            return <PingHostCard key={target.id} summary={summary} />;
          })}
        </div>
      </div>

      {/* Stage 2 & 3: Throughput Speedometers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Etapa 2 y 3: Medición de Ancho de Banda (Throughput en Mbps)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Backend de Referencia: {settings.backendUrl}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SpeedometerGauge
            type="download"
            currentMbps={currentDlMbps}
            isActive={activeTestPhase === 'running_download'}
            progressPercent={
              activeTestPhase === 'running_download' && throughputProgress
                ? throughputProgress.percent
                : isCompleted
                ? 100
                : 0
            }
          />

          <SpeedometerGauge
            type="upload"
            currentMbps={currentUlMbps}
            isActive={activeTestPhase === 'running_upload'}
            progressPercent={
              activeTestPhase === 'running_upload' && throughputProgress
                ? throughputProgress.percent
                : isCompleted
                ? 100
                : 0
            }
          />
        </div>
      </div>

      {/* Completed Result Card */}
      {isCompleted && (
        <div className="glass-panel p-6 border-emerald-500/30 bg-emerald-950/20 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex flex-col items-center justify-center text-emerald-400 font-bold font-display">
                <span className="text-2xl">{lastTestResult.grade}</span>
                <span className="text-[10px] font-mono -mt-1">{lastTestResult.qosScore}/100</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-lg font-bold text-slate-100">
                    Diagnóstico de Calidad: {lastTestResult.networkType} ({lastTestResult.operatorName})
                  </h4>
                </div>

                <p className="text-xs text-slate-300 mt-1">
                  Medición persistida exitosamente con coordenadas GPS ({lastTestResult.latitude.toFixed(4)}, {lastTestResult.longitude.toFixed(4)}).
                </p>

                <div className="flex flex-wrap gap-3 mt-2 text-xs font-mono text-slate-300">
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                    Ping: <strong className="text-cyan-400">{lastTestResult.pingAvg}ms</strong> (Jitter: {lastTestResult.jitter}ms)
                  </span>
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                    Descarga: <strong className="text-emerald-400">{lastTestResult.downloadMbps} Mbps</strong>
                  </span>
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                    Subida: <strong className="text-violet-400">{lastTestResult.uploadMbps} Mbps</strong>
                  </span>
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                    Señal: <strong className="text-slate-200">{lastTestResult.signalDbm} dBm</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onGoToMap} className="btn-secondary text-xs">
                <Map className="w-3.5 h-3.5 text-cyan-400" />
                Ver en Mapa de Calor
              </button>
              <button onClick={onGoToDashboard} className="btn-secondary text-xs">
                Volver al Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
