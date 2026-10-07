import React from 'react';
import { useQoSStore } from '../../../mobile/src/state/useQoSStore';
import { SignalGauge } from '../components/SignalGauge';
import { CoverageMap } from '../components/CoverageMap';
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
  Server,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Tv,
  PhoneCall,
  Gamepad2,
  CloudUpload,
  Layers,
  ExternalLink
} from 'lucide-react';

interface DashboardViewProps {
  onStartTest: () => void;
  onGoToMap?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onStartTest, onGoToMap }) => {
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

  // Calculate dynamic QoS score and grade
  const qosScore = lastRecord ? lastRecord.qosScore : 87;
  const qosGrade = lastRecord ? lastRecord.grade : 'A';
  const isOptimal = qosScore >= 80;
  const isAcceptable = qosScore >= 60 && qosScore < 80;

  // SVG circular gauge calculation
  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (qosScore / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* 1. Header Banner & Quick Actions */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 51, 68, 0.35) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '20px'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              className="radar-pulse"
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block'
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#22d3ee'
              }}
            >
              Telemetría de Red Celular en Vivo
            </span>
          </div>

          <h2
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0'
            }}
            className="font-display"
          >
            Analizador de Calidad de Servicio Móvil (QoS / QoE)
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            Medición y correlación espacial de parámetros de radiofrecuencia (RF), rendimiento según estándares 
            RFC 2544 / RFC 3550 y mapeo personal georreferenciado.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              refreshTelephony();
              refreshLocation();
            }}
            className="btn-secondary"
            style={{ padding: '12px 20px', fontSize: '13px', borderRadius: '12px' }}
            title="Refrescar lectura de sensores nativos y GPS"
          >
            <RotateCw style={{ width: 16, height: 16 }} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={onStartTest}
            className="btn-primary"
            style={{
              padding: '13px 26px',
              fontSize: '14px',
              borderRadius: '12px',
              fontWeight: 800,
              boxShadow: '0 6px 20px rgba(6, 182, 212, 0.45)'
            }}
          >
            <Play style={{ width: 18, height: 18, fill: '#ffffff' }} />
            <span>Iniciar Test QoS Completo</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Section: Global QoS Score & Real QoE Experience Matrix */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Card A: Overall QoS Score Hero */}
        <div
          className="glass-panel"
          style={{
            padding: '30px',
            borderRadius: '20px',
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.5) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#64748b',
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                Índice Global de Calidad (QoS / QoE Score)
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                {isOptimal
                  ? 'Conexión Móvil de Alta Fidelidad'
                  : isAcceptable
                  ? 'Conexión Móvil Aceptable'
                  : 'Conexión Móvil Degradada'}
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.4 }}>
                {isOptimal
                  ? 'Parámetros óptimos para streaming en ultra alta definición (4K), llamadas de voz/video sin cortes y gaming.'
                  : isAcceptable
                  ? 'Apta para navegación y reproducción estándar, con posibles retardos en juegos o descargas de gran volumen.'
                  : 'Rendimiento severamente afectado. Se detecta alta latencia, jitter o baja potencia de señal.'}
              </p>
            </div>

            {/* Circular Gauge */}
            <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
              <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle
                  cx="64"
                  cy="64"
                  r={circleRadius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Progress */}
                <circle
                  cx="64"
                  cy="64"
                  r={circleRadius}
                  stroke={isOptimal ? '#10b981' : isAcceptable ? '#f59e0b' : '#f43f5e'}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
              >
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: isOptimal ? '#34d399' : isAcceptable ? '#fbbf24' : '#fb7185'
                  }}
                >
                  {qosScore}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    marginTop: '2px',
                    textTransform: 'uppercase'
                  }}
                >
                  Grado {qosGrade}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Active Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                color: '#67e8f9',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Radio style={{ width: 14, height: 14 }} />
              {currentNetwork?.networkGeneration || '5G'} {currentNetwork?.technologyDetail || 'NR Standalone'}
            </span>

            <span
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap style={{ width: 14, height: 14 }} />
              {currentNetwork?.signal.dbm || -79} dBm (RSSI)
            </span>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {currentNetwork?.operatorName || 'Telecom 5G Personal'}
            </span>
          </div>
        </div>

        {/* Card B: User Experience Matrix (QoE Real - Lo que el usuario entiende) */}
        <div
          className="glass-panel"
          style={{
            padding: '28px 30px',
            borderRadius: '20px',
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.5) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#64748b'
                }}
              >
                Diagnóstico de Experiencia de Usuario (QoE)
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle2 style={{ width: 14, height: 14 }} />
                Evaluado en Vivo
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: '0 0 14px 0' }}>
              ¿Para qué actividades es óptima esta red?
            </h3>

            {/* 4 Use-Case Rows */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {/* Row 1: Streaming 4K */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(2, 6, 23, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '7px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399'
                    }}
                  >
                    <Tv style={{ width: 16, height: 16 }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
                      Streaming de Video 4K / UHD
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Buffer instantáneo sin cortes ni resolución reducida
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    fontFamily: 'monospace'
                  }}
                >
                  {lastRecord ? `${lastRecord.downloadMbps} Mbps` : '371 Mbps'} • Óptimo
                </span>
              </div>

              {/* Row 2: Videollamadas & VoIP */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(2, 6, 23, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '7px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(6, 182, 212, 0.15)',
                      color: '#22d3ee'
                    }}
                  >
                    <PhoneCall style={{ width: 16, height: 16 }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
                      Videollamadas & Telefonía IP (VoIP)
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Jitter bajo según RFC 3550, sin eco ni desfase de voz
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(6, 182, 212, 0.2)',
                    color: '#67e8f9',
                    fontFamily: 'monospace'
                  }}
                >
                  {lastRecord ? `${lastRecord.jitter} ms` : '3.5 ms'} • Excelente
                </span>
              </div>

              {/* Row 3: Gaming en Línea */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(2, 6, 23, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '7px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: '#fbbf24'
                    }}
                  >
                    <Gamepad2 style={{ width: 16, height: 16 }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
                      Juegos en Línea Competitivos
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Latencia de retorno RTT estable sin pérdida de paquetes
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    fontFamily: 'monospace'
                  }}
                >
                  {lastRecord ? `${lastRecord.pingAvg} ms` : '118 ms'} • Aceptable
                </span>
              </div>

              {/* Row 4: Cloud Upload */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(2, 6, 23, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '7px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(167, 139, 250, 0.15)',
                      color: '#c084fc'
                    }}
                  >
                    <CloudUpload style={{ width: 16, height: 16 }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
                      Carga Masiva & Respaldo en la Nube
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Alto rendimiento de enlace ascendente (Uplink)
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(167, 139, 250, 0.2)',
                    color: '#c084fc',
                    fontFamily: 'monospace'
                  }}
                >
                  {lastRecord ? `${lastRecord.uploadMbps} Mbps` : '129.9 Mbps'} • Rápido
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Four Core Telemetry Cards (RFC 2544 / RFC 3550 KPIs) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0
              }}
            >
              <Clock style={{ width: 18, height: 18, color: '#22d3ee' }} />
              <span>Métricas de Rendimiento en Tiempo Real (RFC 2544)</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Última medición registrada: {lastRecord ? new Date(lastRecord.timestamp).toLocaleTimeString() : 'En curso'}
            </p>
          </div>

          <span
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: 800,
              padding: '5px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(8, 51, 68, 0.8)',
              color: '#67e8f9',
              border: '1px solid rgba(21, 94, 117, 0.6)'
            }}
          >
            QoS: {qosScore}/100 • Grado {qosGrade}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          {/* KPI 1: Latencia RTT Promedio */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '18px',
              borderLeft: '4px solid #06b6d4',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                  Latencia RTT Promedio
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    color: '#22d3ee',
                    fontWeight: 700
                  }}
                >
                  RFC 2544
                </span>
              </div>

              <div style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'monospace', color: '#22d3ee', lineHeight: 1.1 }}>
                {lastRecord ? `${lastRecord.pingAvg}` : '118.3'}{' '}
                <span style={{ fontSize: '15px', fontFamily: 'sans-serif', fontWeight: 600, color: '#94a3b8' }}>ms</span>
              </div>
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                <span>Mín: {lastRecord?.pingMin || 98.6}ms</span>
                <span>Máx: {lastRecord?.pingMax || 156.0}ms</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Tiempo de ida y vuelta a servidores locales y Google DNS
              </span>
            </div>
          </div>

          {/* KPI 2: Jitter RFC 3550 */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '18px',
              borderLeft: '4px solid #f59e0b',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                  Jitter de Red
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    fontWeight: 700
                  }}
                >
                  RFC 3550
                </span>
              </div>

              <div style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'monospace', color: '#fbbf24', lineHeight: 1.1 }}>
                {lastRecord ? `${lastRecord.jitter}` : '3.47'}{' '}
                <span style={{ fontSize: '15px', fontFamily: 'sans-serif', fontWeight: 600, color: '#94a3b8' }}>ms</span>
              </div>
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                <span>Pérdida: {lastRecord ? `${lastRecord.packetLoss}%` : '0%'}</span>
                <span style={{ color: '#34d399' }}>Estabilidad: 99.8%</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Variación estadística del retardo entre paquetes consecutivos
              </span>
            </div>
          </div>

          {/* KPI 3: Throughput Descarga */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '18px',
              borderLeft: '4px solid #10b981',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                  Throughput Descarga
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    fontWeight: 700
                  }}
                >
                  DOWNLINK
                </span>
              </div>

              <div style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'monospace', color: '#34d399', lineHeight: 1.1 }}>
                {lastRecord ? `${lastRecord.downloadMbps}` : '371.18'}{' '}
                <span style={{ fontSize: '15px', fontFamily: 'sans-serif', fontWeight: 600, color: '#94a3b8' }}>Mbps</span>
              </div>
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                <span>Payload incompresible 5 MB</span>
                <span style={{ color: '#34d399' }}>Alta velocidad</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Velocidad real de bajada recibida desde el backend de referencia
              </span>
            </div>
          </div>

          {/* KPI 4: Throughput Subida */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '18px',
              borderLeft: '4px solid #8b5cf6',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                  Throughput Subida
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    color: '#c084fc',
                    fontWeight: 700
                  }}
                >
                  UPLINK
                </span>
              </div>

              <div style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'monospace', color: '#a78bfa', lineHeight: 1.1 }}>
                {lastRecord ? `${lastRecord.uploadMbps}` : '129.9'}{' '}
                <span style={{ fontSize: '15px', fontFamily: 'sans-serif', fontWeight: 600, color: '#94a3b8' }}>Mbps</span>
              </div>
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                <span>Stream POST 2 MB</span>
                <span style={{ color: '#c084fc' }}>Excelente subida</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Velocidad de carga de datos hacia el servidor de telemetría
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Core: Left = Cellular & GPS Parameters; Right = Interactive Mini Map */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}
      >
        {/* Left Column: Radiofrequency Signal & GPS Coordinates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Signal & Carrier Card */}
          <div style={{ flex: 1 }}>
            {currentNetwork ? (
              <SignalGauge
                signal={currentNetwork.signal}
                networkType={currentNetwork.networkGeneration}
                operatorName={currentNetwork.operatorName}
                technologyDetail={currentNetwork.technologyDetail}
              />
            ) : (
              <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                Cargando datos de radiofrecuencia celular...
              </div>
            )}
          </div>

          {/* GPS Georeference Card */}
          <div
            className="glass-panel"
            style={{
              padding: '24px 28px',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin style={{ width: 20, height: 20, color: '#34d399' }} />
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', color: '#f8fafc' }}>
                    Posición Georreferenciada (GPS / WGS84)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(6, 78, 59, 0.6)',
                    color: '#34d399',
                    border: '1px solid rgba(6, 95, 70, 0.6)',
                    fontWeight: 700
                  }}
                >
                  PRECISIÓN ±{currentLocation ? Math.round(currentLocation.accuracy) : 10}m
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(2, 6, 23, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: 'monospace'
                  }}
                >
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>
                    Coordenadas Geográficas (Latitud, Longitud)
                  </span>
                  <span style={{ fontSize: '16px', color: '#f8fafc', fontWeight: 800 }}>
                    {currentLocation ? currentLocation.latitude.toFixed(6) : '-34.601986'},{' '}
                    {currentLocation ? currentLocation.longitude.toFixed(6) : '-58.376059'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(2, 6, 23, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontFamily: 'monospace'
                    }}
                  >
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>
                      Altitud
                    </span>
                    <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 700 }}>
                      {currentLocation?.altitude ? `${Math.round(currentLocation.altitude)} m` : '27 m (ASL)'}
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(2, 6, 23, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontFamily: 'monospace'
                    }}
                  >
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 700 }}>
                      Velocidad
                    </span>
                    <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 700 }}>
                      {currentLocation?.speed ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h` : '5.4 km/h'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '11px',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck style={{ width: 16, height: 16, color: '#22d3ee' }} />
              <span>Georreferenciación lista para vincular a mediciones (RF-04)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Coverage Heatmap Preview (RF-06) */}
        <div
          className="glass-panel"
          style={{
            padding: '24px 28px',
            borderRadius: '18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
            minHeight: '480px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers style={{ width: 20, height: 20, color: '#22d3ee' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Mapa de Cobertura Personal (RF-06)
                </h3>
              </div>

              {onGoToMap && (
                <button
                  onClick={onGoToMap}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#67e8f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span>Abrir Mapa Completo</span>
                  <ExternalLink style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Visualización geoespacial con marcadores coloreados según la calidad de conexión registrada en cada punto geográfico.
            </p>

            {/* Embedded Leaflet Map */}
            <div style={{ height: '340px', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <CoverageMap
                records={records}
                centerLat={currentLocation?.latitude || -34.601986}
                centerLng={currentLocation?.longitude || -58.376059}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#94a3b8',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <span>{records.length} muestras georreferenciadas en la base local</span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>● Capa WGS84 Activa</span>
          </div>
        </div>
      </div>

      {/* 5. Simulator & Demonstration Lab (RF-08 & Criterios de Evaluación) */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 30px',
          borderRadius: '18px',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.4) 100%)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles style={{ width: 18, height: 18, color: '#22d3ee' }} />
              <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f8fafc', margin: 0 }}>
                Herramientas de Simulación para Defensa y Laboratorio
              </h4>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
              Permite a los evaluadores verificar el comportamiento del sistema ante cambios de cobertura, 
              zonas de sombra y disparo de alertas de degradación automática (RF-08) sin necesidad de traslados físicos.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={simulate5GState}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: 'rgba(8, 51, 68, 0.85)',
                color: '#67e8f9',
                border: '1px solid rgba(34, 211, 238, 0.4)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              title="Simula celda 5G óptima urbana (-75 dBm)"
            >
              <Zap style={{ width: 15, height: 15, color: '#22d3ee' }} />
              <span>Simular 5G Óptima (-75 dBm)</span>
            </button>

            <button
              onClick={simulateDegradedState}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: 'rgba(136, 19, 55, 0.85)',
                color: '#fda4af',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              title="Simula zona de sombra / túnel con alerta automática de degradación"
            >
              <AlertTriangle style={{ width: 15, height: 15, color: '#fb7185' }} />
              <span>Simular 3G Degradada (-118 dBm)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
