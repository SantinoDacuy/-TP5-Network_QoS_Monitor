import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useQoSStore } from '../../state/useQoSStore';
import { SignalGauge } from '../components/SignalGauge';
import { colors } from '../../theme/colors';

interface DashboardScreenProps {
  onStartTest: () => void;
  onGoToMap: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onStartTest, onGoToMap }) => {
  const {
    currentNetwork,
    currentLocation,
    records,
    activeTestPhase,
    settings,
    refreshTelephony,
    refreshLocation,
    simulate5GState,
    simulateDegradedState
  } = useQoSStore();

  const isTesting = activeTestPhase !== 'idle' && activeTestPhase !== 'completed';
  const latestRecord = records.length > 0 ? records[0] : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 1. Network & Signal Card (RF-01) */}
      <SignalGauge network={currentNetwork} />

      {/* 2. Georeference GPS Card (RF-04) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>GEORREFERENCIACIÓN GPS (RF-04)</Text>
          <TouchableOpacity onPress={() => refreshLocation()} style={styles.refreshBtn}>
            <Text style={styles.refreshBtnText}>Actualizar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gpsRow}>
          <View style={styles.gpsCoordBox}>
            <Text style={styles.coordLabel}>LATITUD / LONGITUD</Text>
            <Text style={styles.coordText}>
              {currentLocation
                ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
                : 'Adquiriendo satélites GPS...'}
            </Text>
          </View>
        </View>

        <View style={styles.gpsStatsRow}>
          <View style={styles.gpsStatItem}>
            <Text style={styles.gpsStatLabel}>PRECISIÓN</Text>
            <Text style={styles.gpsStatVal}>
              ±{currentLocation ? Math.round(currentLocation.accuracy) : 10} m
            </Text>
          </View>
          <View style={styles.gpsStatItem}>
            <Text style={styles.gpsStatLabel}>ALTITUD</Text>
            <Text style={styles.gpsStatVal}>
              {currentLocation?.altitude ? `${Math.round(currentLocation.altitude)} m` : '25 m'}
            </Text>
          </View>
          <View style={styles.gpsStatItem}>
            <Text style={styles.gpsStatLabel}>VELOCIDAD</Text>
            <Text style={styles.gpsStatVal}>
              {currentLocation?.speed ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h` : '0.0 km/h'}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Primary Action: Start QoS Test */}
      <TouchableOpacity
        style={[styles.testButton, isTesting && styles.testButtonDisabled]}
        onPress={onStartTest}
      >
        <Text style={styles.testButtonIcon}>⚡</Text>
        <View style={styles.testButtonTextContainer}>
          <Text style={styles.testButtonTitle}>
            {isTesting ? `EJECUTANDO: ${activeTestPhase.toUpperCase()}...` : 'INICIAR TEST QOS COMPLETO'}
          </Text>
          <Text style={styles.testButtonSubtitle}>
            Ping multi-host (RFC 2544) + Jitter RFC 3550 + Throughput Mbps
          </Text>
        </View>
      </TouchableOpacity>

      {/* 4. Latest Measurement Summary Card */}
      {latestRecord && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>ÚLTIMA MEDICIÓN EVALUADA</Text>
            <TouchableOpacity onPress={onGoToMap}>
              <Text style={styles.linkText}>Ver en Mapa ➔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.latestContent}>
            <View style={styles.scoreBlock}>
              <View style={[styles.scoreBadgeLarge, {
                backgroundColor: latestRecord.qosScore >= 80 ? 'rgba(16, 185, 129, 0.2)' :
                                 latestRecord.qosScore >= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'
              }]}>
                <Text style={[styles.gradeText, {
                  color: latestRecord.qosScore >= 80 ? colors.success :
                         latestRecord.qosScore >= 60 ? colors.warning : colors.danger
                }]}>
                  {latestRecord.grade}
                </Text>
                <Text style={styles.scoreNumber}>{latestRecord.qosScore}/100</Text>
              </View>
            </View>

            <View style={styles.latestMetricsGrid}>
              <View style={styles.latestMetricItem}>
                <Text style={styles.latestMetricLabel}>DESCARGA</Text>
                <Text style={styles.latestMetricValDl}>{latestRecord.downloadMbps} Mbps</Text>
              </View>
              <View style={styles.latestMetricItem}>
                <Text style={styles.latestMetricLabel}>SUBIDA</Text>
                <Text style={styles.latestMetricValUl}>{latestRecord.uploadMbps} Mbps</Text>
              </View>
              <View style={styles.latestMetricItem}>
                <Text style={styles.latestMetricLabel}>PING AVG</Text>
                <Text style={styles.latestMetricVal}>{latestRecord.pingAvg} ms</Text>
              </View>
              <View style={styles.latestMetricItem}>
                <Text style={styles.latestMetricLabel}>JITTER</Text>
                <Text style={styles.latestMetricVal}>{latestRecord.jitter} ms</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 5. Simulation & Testing Bar (For Demo & Verification) */}
      <View style={styles.simCard}>
        <Text style={styles.simLabel}>CONSOLA DE SIMULACIÓN Y PRUEBAS</Text>
        <Text style={styles.simDesc}>
          Permite forzar condiciones celulares ideales o degradadas para verificar el motor de alertas y el mapa de calor:
        </Text>

        <View style={styles.simBtnRow}>
          <TouchableOpacity style={styles.simBtn5G} onPress={simulate5GState}>
            <Text style={styles.simBtnText5G}>Simular 5G Óptimo (-75dBm)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.simBtnDegraded} onPress={simulateDegradedState}>
            <Text style={styles.simBtnTextDegraded}>Simular 3G Degradado (-118dBm)</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 10
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1
  },
  refreshBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.surfaceHighlight
  },
  refreshBtnText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700'
  },
  linkText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700'
  },
  gpsRow: {
    marginBottom: 10
  },
  gpsCoordBox: {
    backgroundColor: colors.backgroundSecondary,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  coordLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  coordText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'monospace'
  },
  gpsStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  gpsStatItem: {
    flex: 1,
    alignItems: 'center'
  },
  gpsStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  gpsStatVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    fontFamily: 'monospace'
  },
  testButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6
  },
  testButtonDisabled: {
    opacity: 0.6
  },
  testButtonIcon: {
    fontSize: 26
  },
  testButtonTextContainer: {
    flex: 1
  },
  testButtonTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  testButtonSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2
  },
  latestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  scoreBlock: {
    alignItems: 'center'
  },
  scoreBadgeLarge: {
    width: 68,
    height: 68,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border
  },
  gradeText: {
    fontSize: 22,
    fontWeight: '900'
  },
  scoreNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    fontFamily: 'monospace'
  },
  latestMetricsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  latestMetricItem: {
    width: '45%'
  },
  latestMetricLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  latestMetricValDl: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
    fontFamily: 'monospace'
  },
  latestMetricValUl: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.success,
    fontFamily: 'monospace'
  },
  latestMetricVal: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
    fontFamily: 'monospace'
  },
  simCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed'
  },
  simLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  simDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 10
  },
  simBtnRow: {
    flexDirection: 'row',
    gap: 8
  },
  simBtn5G: {
    flex: 1,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gen5G,
    alignItems: 'center'
  },
  simBtnText5G: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gen5G
  },
  simBtnDegraded: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center'
  },
  simBtnTextDegraded: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.danger
  }
});
