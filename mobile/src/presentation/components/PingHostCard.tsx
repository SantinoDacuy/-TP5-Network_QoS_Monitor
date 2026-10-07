import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HostPingSummary } from '../../core/types';
import { colors } from '../../theme/colors';

interface PingHostCardProps {
  summary: HostPingSummary;
}

export const PingHostCard: React.FC<PingHostCardProps> = ({ summary }) => {
  const {
    hostName,
    host,
    port,
    protocol,
    minRtt,
    avgRtt,
    maxRtt,
    jitterMs,
    packetLossPercent,
    status,
    probesSent,
    probesReceived
  } = summary;

  const getStatusColor = () => {
    if (status === 'running') return colors.primary;
    if (status === 'failed' || packetLossPercent > 10) return colors.danger;
    if (avgRtt > 120 || jitterMs > 25) return colors.warning;
    return colors.success;
  };

  const statusColor = getStatusColor();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.hostInfo}>
          <Text style={styles.hostName}>{hostName}</Text>
          <Text style={styles.hostTarget}>
            {host}:{port} • {protocol}
          </Text>
        </View>

        <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: `${statusColor}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status === 'running' ? 'SONDEANDO...' : status === 'success' ? 'COMPLETADO' : status === 'failed' ? 'ERROR' : 'EN ESPERA'}
          </Text>
        </View>
      </View>

      {/* Metrics Grid (Min / Avg / Max / Jitter / Loss) */}
      <View style={styles.grid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>PROM (AVG)</Text>
          <Text style={[styles.metricValue, { color: statusColor }]}>
            {avgRtt > 0 ? `${avgRtt}ms` : '--'}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>MÍN / MÁX</Text>
          <Text style={styles.metricValueMuted}>
            {minRtt > 0 ? `${minRtt}/${maxRtt}ms` : '--'}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>JITTER RFC 3550</Text>
          <Text style={[styles.metricValue, { color: jitterMs > 30 ? colors.warning : colors.text }]}>
            {jitterMs > 0 ? `${jitterMs}ms` : '--'}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>PÉRDIDA</Text>
          <Text style={[styles.metricValue, { color: packetLossPercent > 0 ? colors.danger : colors.success }]}>
            {probesSent > 0 ? `${packetLossPercent}%` : '--'}
          </Text>
        </View>
      </View>

      {/* Footer Probes Count */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Sondas enviadas: {probesSent} | Recibidas: {probesReceived}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  hostInfo: {
    flex: 1,
    marginRight: 8
  },
  hostName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text
  },
  hostTarget: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 2
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  metricItem: {
    alignItems: 'center',
    flex: 1
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 3
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace'
  },
  metricValueMuted: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    fontFamily: 'monospace'
  },
  footer: {
    marginTop: 8,
    alignItems: 'flex-end'
  },
  footerText: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'monospace'
  }
});
