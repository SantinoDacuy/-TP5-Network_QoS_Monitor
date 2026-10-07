import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { useQoSStore } from '../../state/useQoSStore';
import { ExportService } from '../../storage/ExportService';
import { BackgroundEngine } from '../../engine/BackgroundEngine';
import { colors } from '../../theme/colors';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, records, syncRecords } = useQoSStore();
  const [backendUrl, setBackendUrl] = useState(settings.backendUrl);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSaveBackendUrl = () => {
    updateSettings({ backendUrl });
    Alert.alert('Configuración guardada', `URL del backend actualizada a: ${backendUrl}`);
  };

  const handleToggleBackground = (enabled: boolean) => {
    updateSettings({ enableBackgroundSampling: enabled });
  };

  const handleSetInterval = (minutes: number) => {
    updateSettings({ backgroundIntervalMinutes: minutes });
  };

  const handleToggleTarget = (id: string) => {
    const updated = settings.pingTargets.map((t) =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    );
    updateSettings({ pingTargets: updated });
  };

  const handleExportCSV = () => {
    const csvContent = ExportService.toCSV(records);
    ExportService.triggerDownload(csvContent, `qos_export_${Date.now()}.csv`, 'text/csv');
    Alert.alert('Exportación CSV Generada', `Se generó el archivo CSV conforme a RFC 4180 con ${records.length} registros.`);
  };

  const handleExportJSON = () => {
    const jsonContent = ExportService.toJSON(records);
    ExportService.triggerDownload(jsonContent, `qos_export_${Date.now()}.json`, 'application/json');
    Alert.alert('Exportación JSON Generada', `Se exportaron ${records.length} registros en formato JSON.`);
  };

  const handleSyncBackend = async () => {
    setSyncStatus('Sincronizando...');
    const success = await syncRecords();
    if (success) {
      setSyncStatus('✓ Sincronizado');
      Alert.alert('Sincronización Exitosa', `Se enviaron ${records.length} mediciones al backend.`);
    } else {
      setSyncStatus('✕ Error');
      Alert.alert('Fallo de Sincronización', `No se pudo conectar a ${settings.backendUrl}/api/telemetry/sync`);
    }
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleRunBackgroundNow = async () => {
    Alert.alert('Muestreo en Background', 'Iniciando sonda automática periódica...');
    const res = await BackgroundEngine.runBackgroundSampling(settings);
    if (res) {
      Alert.alert('Muestreo Completado', `Muestra guardada: ${res.networkType} • ${res.downloadMbps}Mbps • Ping ${res.pingAvg}ms`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 1. Hosts de Ping Configurables (RF-02) */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>HOSTS DE PING CONFIGURABLES (RF-02)</Text>
        <Text style={styles.cardDesc}>
          Hosts de sondeo de latencia RTT y Jitter RFC 3550:
        </Text>

        {settings.pingTargets.map((target) => (
          <View key={target.id} style={styles.targetItem}>
            <View style={styles.targetLeft}>
              <Text style={styles.targetName}>{target.name}</Text>
              <Text style={styles.targetAddress}>
                {target.host}:{target.port} • {target.protocol}
              </Text>
            </View>
            <Switch
              value={target.enabled}
              onValueChange={() => handleToggleTarget(target.id)}
              thumbColor={target.enabled ? colors.primary : colors.surfaceHighlight}
              trackColor={{ false: colors.border, true: 'rgba(6, 182, 212, 0.4)' }}
            />
          </View>
        ))}
      </View>

      {/* 2. Muestreo en Segundo Plano (RF-07) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>MUESTREO EN SEGUNDO PLANO (RF-07)</Text>
          <Switch
            value={settings.enableBackgroundSampling}
            onValueChange={handleToggleBackground}
            thumbColor={settings.enableBackgroundSampling ? colors.primary : colors.surfaceHighlight}
            trackColor={{ false: colors.border, true: 'rgba(6, 182, 212, 0.4)' }}
          />
        </View>

        <Text style={styles.cardDesc}>
          Ejecuta mediciones periódicas cuando la aplicación está en segundo plano o el dispositivo bloqueado.
        </Text>

        <View style={styles.intervalRow}>
          <Text style={styles.intervalLabel}>Intervalo:</Text>
          <View style={styles.intervalBtnGroup}>
            {[15, 30, 60].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.intervalBtn, settings.backgroundIntervalMinutes === m && styles.intervalBtnActive]}
                onPress={() => handleSetInterval(m)}
              >
                <Text style={[styles.intervalBtnText, settings.backgroundIntervalMinutes === m && styles.intervalBtnTextActive]}>
                  {m} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.manualSampleBtn} onPress={handleRunBackgroundNow}>
          <Text style={styles.manualSampleText}>⚡ Ejecutar Muestra en Background Ahora</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Umbrales de Alertas de Degradación (RF-07) */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>UMBRALES DE ALERTA DE DEGRADACIÓN SEVERA</Text>
        <View style={styles.thresholdGrid}>
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdKey}>Ping Máximo:</Text>
            <Text style={styles.thresholdVal}>{settings.degradationAlertThresholds.maxPingMs} ms</Text>
          </View>
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdKey}>Jitter Máximo:</Text>
            <Text style={styles.thresholdVal}>{settings.degradationAlertThresholds.maxJitterMs} ms</Text>
          </View>
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdKey}>Pérdida Máxima:</Text>
            <Text style={styles.thresholdVal}>{settings.degradationAlertThresholds.maxPacketLossPercent}%</Text>
          </View>
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdKey}>Descarga Mínima:</Text>
            <Text style={styles.thresholdVal}>{settings.degradationAlertThresholds.minDownloadMbps} Mbps</Text>
          </View>
        </View>
      </View>

      {/* 4. Backend de Referencia */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>BACKEND DE REFERENCIA (RF-03 / SYNC)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={backendUrl}
            onChangeText={setBackendUrl}
            placeholder="http://localhost:3001"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBackendUrl}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Exportación & Sincronización (RF-08) */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>EXPORTACIÓN Y SINCRONIZACIÓN (RF-08)</Text>
        <Text style={styles.cardDesc}>
          Exporta el historial completo de {records.length} mediciones georreferenciadas:
        </Text>

        <View style={styles.exportBtnsRow}>
          <TouchableOpacity style={styles.exportCsvBtn} onPress={handleExportCSV}>
            <Text style={styles.exportBtnText}>📄 Exportar CSV (RFC 4180)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportJsonBtn} onPress={handleExportJSON}>
            <Text style={styles.exportBtnText}>📦 Exportar JSON</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.syncBtn} onPress={handleSyncBackend}>
          <Text style={styles.syncBtnText}>
            {syncStatus ? syncStatus : '☁️ Sincronizar con Backend de Referencia'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 6
  },
  cardDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 10
  },
  targetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  targetLeft: {
    flex: 1,
    marginRight: 10
  },
  targetName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text
  },
  targetAddress: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 2
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8
  },
  intervalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary
  },
  intervalBtnGroup: {
    flexDirection: 'row',
    gap: 6
  },
  intervalBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border
  },
  intervalBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  intervalBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary
  },
  intervalBtnTextActive: {
    color: '#ffffff'
  },
  manualSampleBtn: {
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  manualSampleText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary
  },
  thresholdGrid: {
    gap: 6,
    backgroundColor: colors.backgroundSecondary,
    padding: 10,
    borderRadius: 10
  },
  thresholdItem: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  thresholdKey: {
    fontSize: 11,
    color: colors.textSecondary
  },
  thresholdVal: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'monospace'
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 12,
    fontFamily: 'monospace'
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff'
  },
  exportBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  exportCsvBtn: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  exportJsonBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff'
  },
  syncBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: colors.success,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  syncBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success
  }
});
