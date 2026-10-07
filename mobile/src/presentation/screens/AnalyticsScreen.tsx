import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQoSStore } from '../../state/useQoSStore';
import { TimeSeriesCharts } from '../components/TimeSeriesCharts';
import { colors } from '../../theme/colors';

export const AnalyticsScreen: React.FC = () => {
  const { records } = useQoSStore();

  // Compute breakdown by technology
  const byTech: { [key: string]: { count: number; dlSum: number; ulSum: number; pingSum: number } } = {};
  records.forEach((r) => {
    const t = r.networkType || 'UNKNOWN';
    if (!byTech[t]) byTech[t] = { count: 0, dlSum: 0, ulSum: 0, pingSum: 0 };
    byTech[t].count++;
    byTech[t].dlSum += r.downloadMbps;
    byTech[t].ulSum += r.uploadMbps;
    byTech[t].pingSum += r.pingAvg;
  });

  const techKeys = Object.keys(byTech);

  // Peak metrics
  const maxDl = records.length > 0 ? Math.max(...records.map(r => r.downloadMbps)) : 0;
  const avgPing = records.length > 0
    ? Math.round((records.reduce((sum, r) => sum + r.pingAvg, 0) / records.length) * 10) / 10
    : 0;
  const avgJitter = records.length > 0
    ? Math.round((records.reduce((sum, r) => sum + r.jitter, 0) / records.length) * 10) / 10
    : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 1. Time Series Chart (RF-06) */}
      <TimeSeriesCharts records={records} />

      {/* 2. Key KPI Performance Metrics */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>PICO DESCARGA</Text>
          <Text style={styles.kpiValuePrimary}>{maxDl.toFixed(1)}</Text>
          <Text style={styles.kpiUnit}>Mbps</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>LATENCIA MEDIA</Text>
          <Text style={styles.kpiValueWarning}>{avgPing.toFixed(1)}</Text>
          <Text style={styles.kpiUnit}>ms RTT</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>JITTER RFC 3550</Text>
          <Text style={styles.kpiValueSuccess}>{avgJitter.toFixed(1)}</Text>
          <Text style={styles.kpiUnit}>ms</Text>
        </View>
      </View>

      {/* 3. Breakdown by Network Generation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>COMPARATIVA POR GENERACIÓN DE RED</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, { flex: 1.2 }]}>RED</Text>
          <Text style={[styles.colHeader, { flex: 0.8 }]}>MUESTRAS</Text>
          <Text style={[styles.colHeader, { flex: 1.2 }]}>DESCARGA</Text>
          <Text style={[styles.colHeader, { flex: 1.2 }]}>LATENCIA</Text>
        </View>

        {techKeys.length > 0 ? (
          techKeys.map((tech) => {
            const item = byTech[tech];
            const avgDl = (item.dlSum / item.count).toFixed(1);
            const avgP = (item.pingSum / item.count).toFixed(1);

            return (
              <View key={tech} style={styles.tableRow}>
                <View style={[styles.badge, { flex: 1.2 }]}>
                  <Text style={styles.badgeText}>{tech}</Text>
                </View>
                <Text style={[styles.cellText, { flex: 0.8 }]}>{item.count}</Text>
                <Text style={[styles.cellPrimary, { flex: 1.2 }]}>{avgDl} Mbps</Text>
                <Text style={[styles.cellText, { flex: 1.2 }]}>{avgP} ms</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Sin datos comparativos.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  kpiValuePrimary: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    fontFamily: 'monospace'
  },
  kpiValueWarning: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.warning,
    fontFamily: 'monospace'
  },
  kpiValueSuccess: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.success,
    fontFamily: 'monospace'
  },
  kpiUnit: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: 2
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  colHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  badge: {
    flexDirection: 'row'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary
  },
  cellText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace'
  },
  cellPrimary: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'monospace'
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16
  }
});
