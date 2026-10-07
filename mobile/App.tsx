import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { useQoSStore, initQoSStore } from './src/state/useQoSStore';

export default function App(): React.JSX.Element {
  const {
    currentNetwork,
    currentLocation,
    records,
    activeTestPhase,
    runFullQoSTest,
    refreshTelephony
  } = useQoSStore();

  useEffect(() => {
    initQoSStore();
  }, []);

  const isTesting = activeTestPhase !== 'idle' && activeTestPhase !== 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070a13" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Network QoS Monitor</Text>
        <Text style={styles.subtitle}>Analizador de Calidad de Red Móvil (LSI 2026)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Network Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>RED CELULAR / WIFI ACTIVA</Text>
          <Text style={styles.operatorText}>
            {currentNetwork?.operatorName || 'Detectando operador...'}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{currentNetwork?.networkGeneration || '...'}</Text>
            </View>
            <Text style={styles.techText}>{currentNetwork?.technologyDetail || ''}</Text>
          </View>
          <View style={styles.signalRow}>
            <Text style={styles.signalValue}>{currentNetwork?.signal.dbm || -85} dBm</Text>
            <Text style={styles.signalDesc}>{currentNetwork?.signal.qualityDescriptor}</Text>
          </View>
        </View>

        {/* GPS Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>GEORREFERENCIACIÓN GPS</Text>
          <Text style={styles.gpsCoord}>
            {currentLocation ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}` : 'Buscando GPS...'}
          </Text>
          <Text style={styles.gpsAccuracy}>
            Precisión estimada: ±{currentLocation ? Math.round(currentLocation.accuracy) : 10} metros
          </Text>
        </View>

        {/* Test Action Button */}
        <TouchableOpacity
          style={[styles.testButton, isTesting && styles.testButtonDisabled]}
          disabled={isTesting}
          onPress={() => runFullQoSTest()}
        >
          <Text style={styles.testButtonText}>
            {isTesting ? `Ejecutando: ${activeTestPhase}...` : '▶ INICIAR TEST QOS COMPLETO'}
          </Text>
        </TouchableOpacity>

        {/* Recent records summary */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>HISTORIAL DE MEDICIONES ({records.length})</Text>
          {records.slice(0, 3).map((r) => (
            <View key={r.id} style={styles.historyItem}>
              <Text style={styles.historyOp}>{r.networkType} • {r.operatorName}</Text>
              <Text style={styles.historyMetrics}>
                Ping: {r.pingAvg}ms | DL: {r.downloadMbps}Mbps | UL: {r.uploadMbps}Mbps | Score: {r.qosScore}/100
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070a13'
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff'
  },
  subtitle: {
    fontSize: 12,
    color: '#06b6d4',
    marginTop: 2
  },
  content: {
    padding: 16,
    gap: 16
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 6
  },
  operatorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6
  },
  badge: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#06b6d4'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22d3ee'
  },
  techText: {
    fontSize: 12,
    color: '#94a3b8'
  },
  signalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b'
  },
  signalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10b981'
  },
  signalDesc: {
    fontSize: 12,
    color: '#94a3b8'
  },
  gpsCoord: {
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#38bdf8'
  },
  gpsAccuracy: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4
  },
  testButton: {
    backgroundColor: '#06b6d4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  testButtonDisabled: {
    opacity: 0.5
  },
  testButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  historyOp: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e2e8f0'
  },
  historyMetrics: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'monospace',
    marginTop: 2
  }
});
