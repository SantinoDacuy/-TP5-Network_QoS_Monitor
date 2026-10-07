import React, { useState } from 'react';
import { useQoSStore } from '../../../mobile/src/state/useQoSStore';
import { ExportService } from '../../../mobile/src/storage/ExportService';
import { NotificationManager } from '../../../mobile/src/notifications/NotificationManager';
import { PingTargetConfig } from '../../../mobile/src/core/types';
import {
  Download,
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  Settings,
  Server,
  Bell,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ExportSettingsView: React.FC = () => {
  const { records, settings, updateSettings, syncRecords } = useQoSStore();

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle');
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [notificationGranted, setNotificationGranted] = useState<boolean>(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  // New host form state
  const [newHostName, setNewHostName] = useState('');
  const [newHostAddress, setNewHostAddress] = useState('');
  const [newHostPort, setNewHostPort] = useState(80);
  const [newHostProtocol, setNewHostProtocol] = useState<'TCP' | 'HTTP'>('TCP');

  // Export CSV
  const handleExportCSV = () => {
    const csv = ExportService.toCSV(records);
    ExportService.triggerDownload(csv, `network_qos_export_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  };

  // Export JSON
  const handleExportJSON = () => {
    const json = ExportService.toJSON(records);
    ExportService.triggerDownload(json, `network_qos_export_${Date.now()}.json`, 'application/json');
  };

  // Sync to Backend
  const handleSyncBackend = async () => {
    setSyncStatus('syncing');
    const ok = await syncRecords();
    if (ok) {
      setSyncStatus('success');
      setSyncedCount(records.length);
      setTimeout(() => setSyncStatus('idle'), 4000);
    } else {
      setSyncStatus('failed');
      setTimeout(() => setSyncStatus('idle'), 4000);
    }
  };

  // Add ping target
  const handleAddHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostName || !newHostAddress) return;

    const newTarget: PingTargetConfig = {
      id: `target-${Date.now()}`,
      name: newHostName,
      host: newHostAddress,
      port: Number(newHostPort),
      protocol: newHostProtocol,
      enabled: true
    };

    updateSettings({
      pingTargets: [...settings.pingTargets, newTarget]
    });

    setNewHostName('');
    setNewHostAddress('');
    setNewHostPort(80);
  };

  // Remove ping target
  const handleRemoveHost = (id: string) => {
    updateSettings({
      pingTargets: settings.pingTargets.filter((t) => t.id !== id)
    });
  };

  // Toggle ping target
  const handleToggleHost = (id: string) => {
    updateSettings({
      pingTargets: settings.pingTargets.map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t
      )
    });
  };

  // Request notifications
  const handleEnableNotifications = async () => {
    const ok = await NotificationManager.requestPermission();
    setNotificationGranted(ok);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Export & Sync Section (RF-08) */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          borderRadius: '20px',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 51, 68, 0.25) 100%)'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-extrabold text-slate-100 font-display">
            Exportación de Datos & Sincronización Remota (RF-08)
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Exporta el historial de mediciones local en formatos estandarizados o sincronízalo con el backend de referencia
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CSV Export Card */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <FileSpreadsheet className="w-5 h-5" />
                <h4 className="text-sm font-bold text-slate-200">Exportar a CSV</h4>
              </div>
              <p className="text-xs text-slate-400">
                Formato tabular compatible con Excel, Pandas, QGIS y telecom analytics (RFC 4180).
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className="btn-secondary text-xs mt-4 w-full justify-center"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Archivo CSV ({records.length} filas)
            </button>
          </div>

          {/* JSON Export Card */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <FileCode className="w-5 h-5" />
                <h4 className="text-sm font-bold text-slate-200">Exportar a JSON</h4>
              </div>
              <p className="text-xs text-slate-400">
                Estructura completa de telemetría geoespacial, metadatos y muestras individuales.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              disabled={records.length === 0}
              className="btn-secondary text-xs mt-4 w-full justify-center"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Archivo JSON
            </button>
          </div>

          {/* Sync to Backend */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-violet-400 mb-2">
                <UploadCloud className="w-5 h-5" />
                <h4 className="text-sm font-bold text-slate-200">Sincronizar con Backend</h4>
              </div>
              <p className="text-xs text-slate-400">
                Envía las mediciones a {settings.backendUrl}/api/telemetry/sync.
              </p>
            </div>

            <button
              onClick={handleSyncBackend}
              disabled={syncStatus === 'syncing' || records.length === 0}
              className="btn-primary text-xs mt-4 w-full justify-center"
            >
              {syncStatus === 'syncing' ? (
                <span>Sincronizando...</span>
              ) : syncStatus === 'success' ? (
                <span className="flex items-center gap-1 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ¡{syncedCount} Sincronizados!
                </span>
              ) : syncStatus === 'failed' ? (
                <span className="flex items-center gap-1 text-white">
                  <AlertCircle className="w-3.5 h-3.5" /> Error de conexión
                </span>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  Sincronizar Telemetría ({records.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Ping Hosts Config (RF-02) */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100 font-display">
              Hosts Configurables para Ping y Latencia (RF-02)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Mínimo 3 hosts requeridos
          </span>
        </div>

        {/* List of current targets */}
        <div className="space-y-2 mb-5">
          {settings.pingTargets.map((target) => (
            <div
              key={target.id}
              className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={target.enabled}
                  onChange={() => handleToggleHost(target.id)}
                  className="accent-cyan-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <h5 className="text-xs font-bold text-slate-200">{target.name}</h5>
                  <span className="text-[11px] font-mono text-slate-400">
                    {target.host}:{target.port} ({target.protocol})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {target.isDefault && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                    Default
                  </span>
                )}
                {!target.isDefault && (
                  <button
                    onClick={() => handleRemoveHost(target.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Host Form */}
        <form onSubmit={handleAddHost} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            Agregar Nuevo Host de Medición
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Nombre (ej: DNS Local)"
              value={newHostName}
              onChange={(e) => setNewHostName(e.target.value)}
              required
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
            />
            <input
              type="text"
              placeholder="Host/IP (ej: 8.8.4.4)"
              value={newHostAddress}
              onChange={(e) => setNewHostAddress(e.target.value)}
              required
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
            />
            <input
              type="number"
              placeholder="Puerto (ej: 53)"
              value={newHostPort}
              onChange={(e) => setNewHostPort(Number(e.target.value))}
              required
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
            />
            <button type="submit" className="btn-primary text-xs justify-center py-1.5">
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          </div>
        </form>
      </div>

      {/* Background Sampling & Alerts Configuration (RF-07) */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100 font-display">
            Muestreo en Segundo Plano y Umbrales de Degradación (RF-07)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Configura la frecuencia del muestreo periódico y los límites para emitir notificaciones locales ante degradaciones severas
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Background Task Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Activar Muestreo en Background
                </span>
                <span className="text-[11px] text-slate-400">
                  Ejecuta mediciones automáticas periódicamente
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableBackgroundSampling}
                onChange={(e) => updateSettings({ enableBackgroundSampling: e.target.checked })}
                className="accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-slate-200 block mb-1">
                Intervalo de Muestreo:
              </label>
              <select
                value={settings.backgroundIntervalMinutes}
                onChange={(e) => updateSettings({ backgroundIntervalMinutes: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value={15}>Cada 15 minutos (Recomendado)</option>
                <option value={30}>Cada 30 minutos</option>
                <option value={60}>Cada 60 minutos</option>
              </select>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Permiso de Notificaciones del Sistema
                </span>
                <span className="text-[11px] text-slate-400">
                  Estado: {notificationGranted ? '✅ Concedido' : '⚠️ No concedido'}
                </span>
              </div>
              {!notificationGranted && (
                <button onClick={handleEnableNotifications} className="btn-secondary text-xs">
                  Solicitar Permiso
                </button>
              )}
            </div>
          </div>

          {/* Degradation Thresholds */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Umbrales de Notificación de Degradación
            </h5>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Latencia RTT Máxima Tolerada:</span>
              <span className="font-mono font-bold text-cyan-400">
                {settings.degradationAlertThresholds.maxPingMs} ms
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Jitter RFC 3550 Máximo Tolerado:</span>
              <span className="font-mono font-bold text-amber-400">
                {settings.degradationAlertThresholds.maxJitterMs} ms
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Pérdida de Paquetes Máxima:</span>
              <span className="font-mono font-bold text-rose-400">
                {settings.degradationAlertThresholds.maxPacketLossPercent}%
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Throughput Mínimo Requerido:</span>
              <span className="font-mono font-bold text-emerald-400">
                {settings.degradationAlertThresholds.minDownloadMbps} Mbps
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Señal RSSI Mínima (dBm):</span>
              <span className="font-mono font-bold text-slate-200">
                {settings.degradationAlertThresholds.minSignalDbm} dBm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
