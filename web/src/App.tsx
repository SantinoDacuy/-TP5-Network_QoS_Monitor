import React, { useState, useEffect } from 'react';
import { useQoSStore, initQoSStore } from '../../mobile/src/state/useQoSStore';
import { DashboardView } from './screens/DashboardView';
import { ActiveTestView } from './screens/ActiveTestView';
import { CoverageMapView } from './screens/CoverageMapView';
import { AnalyticsView } from './screens/AnalyticsView';
import { HistoryView } from './screens/HistoryView';
import { ExportSettingsView } from './screens/ExportSettingsView';
import { DegradationAlertBanner } from './components/DegradationAlertBanner';
import {
  Activity,
  Radio,
  Map,
  BarChart3,
  History,
  Settings,
  Play,
  Signal,
  Wifi,
  Server,
  ShieldCheck
} from 'lucide-react';

export type TabType = 'dashboard' | 'test' | 'map' | 'analytics' | 'history' | 'settings';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  const {
    currentNetwork,
    currentLocation,
    alerts,
    dismissAlert,
    isLoading,
    settings
  } = useQoSStore();

  useEffect(() => {
    initQoSStore();

    // Check backend health periodically
    const checkBackend = async () => {
      try {
        const res = await fetch(`${settings.backendUrl}/api/health`, { cache: 'no-store' });
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  const getTabStyle = (tab: TabType) => {
    const isActive = activeTab === tab;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '9px 18px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: isActive ? '#06b6d4' : 'rgba(255, 255, 255, 0.04)',
      color: isActive ? '#ffffff' : '#94a3b8',
      border: isActive ? '1px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: isActive ? '0 4px 18px rgba(6, 182, 212, 0.45)' : 'none',
    };
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#070a13', color: '#f1f5f9' }}>
      {/* Top Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(2, 6, 23, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
          padding: '14px 20px'
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* Logo & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '10px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 18px rgba(6, 182, 212, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                  Network QoS Monitor
                </h1>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(8, 51, 68, 0.8)',
                    color: '#67e8f9',
                    border: '1px solid rgba(21, 94, 117, 0.6)',
                    fontWeight: 700
                  }}
                >
                  v1.0 • LSI 2026
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Analizador de Calidad de Red Móvil en Tiempo Real & Mapeo de Cobertura
              </p>
            </div>
          </div>

          {/* Active Status Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Backend status badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                backgroundColor: backendOnline ? 'rgba(6, 78, 59, 0.6)' : 'rgba(120, 53, 15, 0.6)',
                border: backendOnline ? '1px solid rgba(6, 95, 70, 0.6)' : '1px solid rgba(146, 64, 14, 0.6)',
                color: backendOnline ? '#34d399' : '#fbbf24',
                fontWeight: 600
              }}
              title={backendOnline ? 'Backend de referencia en línea' : 'Backend no detectado en localhost:3001'}
            >
              <Server style={{ width: 14, height: 14 }} />
              <span>Backend {backendOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Network Type & Operator badge */}
            {currentNetwork && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  color: '#67e8f9',
                  fontWeight: 600
                }}
              >
                <Radio style={{ width: 14, height: 14, color: '#22d3ee' }} />
                <span style={{ fontWeight: 800 }}>{currentNetwork.networkGeneration}</span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ color: '#cbd5e1' }}>{currentNetwork.operatorName}</span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ color: '#34d399', fontWeight: 800 }}>{currentNetwork.signal.dbm}dBm</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Pill Bar */}
        <div
          style={{
            maxWidth: '1360px',
            margin: '14px auto 0 auto',
            paddingTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto'
          }}
          className="no-scrollbar"
        >
          <button onClick={() => setActiveTab('dashboard')} style={getTabStyle('dashboard')}>
            <Activity style={{ width: 16, height: 16 }} />
            <span>Panel General</span>
          </button>

          <button onClick={() => setActiveTab('test')} style={getTabStyle('test')}>
            <Play style={{ width: 16, height: 16 }} />
            <span>Test Activo (RFC 2544)</span>
          </button>

          <button onClick={() => setActiveTab('map')} style={getTabStyle('map')}>
            <Map style={{ width: 16, height: 16 }} />
            <span>Mapa de Calor (Heatmap)</span>
          </button>

          <button onClick={() => setActiveTab('analytics')} style={getTabStyle('analytics')}>
            <BarChart3 style={{ width: 16, height: 16 }} />
            <span>Analítica & Gráficos</span>
          </button>

          <button onClick={() => setActiveTab('history')} style={getTabStyle('history')}>
            <History style={{ width: 16, height: 16 }} />
            <span>Historial de Sesiones</span>
          </button>

          <button onClick={() => setActiveTab('settings')} style={getTabStyle('settings')}>
            <Settings style={{ width: 16, height: 16 }} />
            <span>Exportar & Configuración</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '32px 20px' }}>
        {/* Real-time Degradation Alerts Banner */}
        <DegradationAlertBanner alerts={alerts} onDismiss={dismissAlert} />

        {/* Tab View Switcher */}
        {activeTab === 'dashboard' && (
          <DashboardView
            onStartTest={() => setActiveTab('test')}
            onGoToMap={() => setActiveTab('map')}
          />
        )}
        {activeTab === 'test' && (
          <ActiveTestView
            onGoToMap={() => setActiveTab('map')}
            onGoToDashboard={() => setActiveTab('dashboard')}
          />
        )}
        {activeTab === 'map' && <CoverageMapView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'settings' && <ExportSettingsView />}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #1e293b',
          backgroundColor: 'rgba(2, 6, 23, 0.95)',
          padding: '16px 20px',
          fontSize: '12px',
          color: '#64748b'
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: '#cbd5e1' }}>Desarrollo de Aplicaciones Móviles 2026</span>
            <span>•</span>
            <span>Licenciatura en Sistemas de Información</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontFamily: 'monospace' }}>
            <span>RFC 2544 Benchmarking</span>
            <span>RFC 3550 RTP Jitter</span>
            <span>Android TelephonyManager & iOS CoreTelephony</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
