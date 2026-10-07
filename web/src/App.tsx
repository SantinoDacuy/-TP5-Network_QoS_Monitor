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

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-white shadow-lg shadow-cyan-500/25">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white font-display">
                  Network QoS Monitor
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
                  v1.0 • LSI 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Analizador de Calidad de Red Móvil en Tiempo Real & Mapeo de Cobertura
              </p>
            </div>
          </div>

          {/* Active Status Badges */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Backend status badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
                backendOnline
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                  : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
              }`}
              title={backendOnline ? 'Backend de referencia en línea' : 'Backend no detectado en localhost:3001'}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Backend {backendOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Network Type & Operator badge */}
            {currentNetwork && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-cyan-300">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">{currentNetwork.networkGeneration}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{currentNetwork.operatorName}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">{currentNetwork.signal.dbm}dBm</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            Panel General
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'test'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Play className="w-4 h-4" />
            Test Activo (RFC 2544)
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Map className="w-4 h-4" />
            Mapa de Calor (Heatmap)
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analítica & Gráficos
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <History className="w-4 h-4" />
            Historial de Sesiones
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            Exportar & Configuración
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {/* Real-time Degradation Alerts Banner */}
        <DegradationAlertBanner alerts={alerts} onDismiss={dismissAlert} />

        {/* Tab View Switcher */}
        {activeTab === 'dashboard' && (
          <DashboardView onStartTest={() => setActiveTab('test')} />
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
      <footer className="border-t border-slate-900 bg-slate-950/90 py-5 px-6 text-center text-xs text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Desarrollo de Aplicaciones Móviles 2026</span>
            <span>•</span>
            <span>Licenciatura en Sistemas de Información</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>RFC 2544 Benchmarking</span>
            <span>RFC 3550 RTP Jitter</span>
            <span>Android TelephonyManager & iOS CoreTelephony</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
