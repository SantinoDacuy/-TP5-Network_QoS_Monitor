import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQoSStore } from '../../state/useQoSStore';
import { PingHostCard } from '../components/PingHostCard';
import { ThroughputGauge } from '../components/ThroughputGauge';
import { colors } from '../../theme/colors';

interface ActiveTestScreenProps {
  onGoToMap: () => void;
  onGoToDashboard: () => void;
}

export const ActiveTestScreen: React.FC<ActiveTestScreenProps> = ({ onGoToMap, onGoToDashboard }) => {
  const {
    activeTestPhase,
    pingSummaries,
    throughputProgress,
    lastTestResult,
    runFullQoSTest,
    settings
  } = useQoSStore();

  const isTesting = activeTestPhase !== 'idle' && activeTestPhase !== 'completed';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Test Status Banner */}
      <View style={styles.statusBar}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>MOTOR DE MEDICIÓN QOS (RFC 2544)</Text>
          <Text style={styles.statusSubtitle}>
            {activeTestPhase === 'idle'
              ? 'Listo para iniciar benchmarking de red'
              : activeTestPhase === 'running_ping'
              ? 'Fase 1/3: Sondas RTT y Jitter Multi-Host...'
              : activeTestPhase === 'running_download'
              ? 'Fase 2/3: Throughput de Descarga...'
              : activeTestPhase === 'running_upload'
              ? 'Fase 3/3: Throughput de Subida...'
              : 'Test completado con éxito'}
          </Text>
        </View>

        {isTesting && <ActivityIndicator color={colors.primary} size="small" />}
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        style={[styles.actionButton, isTesting && styles.actionButtonDisabled]}
        disabled={isTesting}
        onPress={() => runFullQoSTest()}
      >
        <Text style={styles.actionButtonText}>
          {isTesting ? `EJECUTANDO: ${activeTestPhase.toUpperCase()}...` : '▶ INICIAR TEST COMPLETO AHORA'}
        </Text>
      </TouchableOpacity>

      {/* Live Speedometer (Active during throughput test) */}
      {(isTesting || activeTestPhase === 'completed') && (
        <ThroughputGauge progress={throughputProgress} phase={activeTestPhase} />
      )}

      {/* Multi-Target Ping Cards (RF-02) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SONDAS PING & JITTER MULTI-HOST (RF-02)</Text>
          <Text style={styles.sectionSubtitle}>{settings.pingTargets.length} hosts configurados</Text>
        </View>

        {pingSummaries.length > 0 ? (
          pingSummaries.map((summary) => (
            <PingHostCard key={summary.id} summary={summary} />
          ))
        ) : (
          settings.pingTargets.map((target) => (
            <View key={target.id} style={styles.idleTargetCard}>
              <View>
                <Text style={styles.idleTargetName}>{target.name}</Text>
                <Text style={styles.idleTargetHost}>{target.host}:{target.port} • {target.protocol}</Text>
              </View>
              <Text style={styles.idleTargetStatus}>EN ESPERA</Text>
            </View>
          ))
        )}
      </View>

      {/* Final Evaluated Results Card */}
      {lastTestResult && activeTestPhase === 'completed' && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>EVALUACIÓN GLOBAL DE CALIDAD (RFC 2544 / G.107)</Text>

          <View style={styles.resultMainRow}>
            <View style={[styles.resultGradeBadge, {
              backgroundColor: lastTestResult.qosScore >= 80 ? 'rgba(16, 185, 129, 0.2)' :
                               lastTestResult.qosScore >= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'
            }]}>
              <Text style={[styles.resultGrade, {
                color: lastTestResult.qosScore >= 80 ? colors.success :
                       lastTestResult.qosScore >= 60 ? colors.warning : colors.danger
              }]}>
                {lastTestResult.grade}
              </Text>
              <Text style={styles.resultScoreText}>{lastTestResult.qosScore}/100</Text>
            </View>

            <View style={styles.resultDetailsList}>
              <Text style={styles.resultDetailItem}>
                • Descarga: <Text style={styles.boldWhite}>{lastTestResult.downloadMbps} Mbps</Text>
              </Text>
              <Text style={styles.resultDetailItem}>
                • Subida: <Text style={styles.boldWhite}>{lastTestResult.uploadMbps} Mbps</Text>
              </Text>
              <Text style={styles.resultDetailItem}>
                • Latencia RTT Promedio: <Text style={styles.boldWhite}>{lastTestResult.pingAvg} ms</Text>
              </Text>
              <Text style={styles.resultDetailItem}>
                • Jitter RFC 3550: <Text style={styles.boldWhite}>{lastTestResult.jitter} ms</Text>
              </Text>
              <Text style={styles.resultDetailItem}>
                • Pérdida de paquetes: <Text style={styles.boldWhite}>{lastTestResult.packetLoss}%</Text>
              </Text>
            </View>
          </View>

          <View style={styles.resultActionsRow}>
            <TouchableOpacity style={styles.viewOnMapBtn} onPress={onGoToMap}>
              <Text style={styles.viewOnMapText}>📍 VER EN MAPA DE CALOR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn} onPress={onGoToDashboard}>
              <Text style={styles.backBtnText}>VOLVER AL PANEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  statusInfo: {
    flex: 1,
    marginRight: 8
  },
  statusTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  statusSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4
  },
  actionButtonDisabled: {
    opacity: 0.6
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  section: {
    marginTop: 6
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1
  },
  sectionSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace'
  },
  idleTargetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  idleTargetName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  idleTargetHost: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 2
  },
  idleTargetStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: 8
  },
  resultTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 12
  },
  resultMainRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center'
  },
  resultGradeBadge: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border
  },
  resultGrade: {
    fontSize: 28,
    fontWeight: '900'
  },
  resultScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    fontFamily: 'monospace'
  },
  resultDetailsList: {
    flex: 1,
    gap: 3
  },
  resultDetailItem: {
    fontSize: 11,
    color: colors.textSecondary
  },
  boldWhite: {
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'monospace'
  },
  resultActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  viewOnMapBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  viewOnMapText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff'
  },
  backBtn: {
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary
  }
});
