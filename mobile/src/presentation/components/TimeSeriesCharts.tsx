import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { QoSMeasurementRecord } from '../../core/types';
import { colors } from '../../theme/colors';

// Try importing react-native-svg gracefully
let Svg: any = null;
let Polyline: any = null;
let Line: any = null;
let Circle: any = null;
let SvgText: any = null;

try {
  const RN_SVG = require('react-native-svg');
  Svg = RN_SVG.Svg;
  Polyline = RN_SVG.Polyline;
  Line = RN_SVG.Line;
  Circle = RN_SVG.Circle;
  SvgText = RN_SVG.Text;
} catch (e) {
  // Graceful fallback
}

interface TimeSeriesChartsProps {
  records: QoSMeasurementRecord[];
}

export const TimeSeriesCharts: React.FC<TimeSeriesChartsProps> = ({ records }) => {
  const [chartMode, setChartMode] = useState<'latency' | 'throughput'>('throughput');

  if (records.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>No hay datos temporales registrados aún.</Text>
      </View>
    );
  }

  // Take chronological samples (up to 12 most recent)
  const sorted = [...records].reverse().slice(-12);

  const maxPing = Math.max(...sorted.map(r => r.pingAvg), 100);
  const maxThroughput = Math.max(...sorted.map(r => r.downloadMbps), 50);

  const chartHeight = 140;
  const chartWidth = 300;
  const stepX = sorted.length > 1 ? chartWidth / (sorted.length - 1) : chartWidth;

  // Build SVG points string
  const dlPoints = sorted
    .map((r, i) => {
      const x = i * stepX;
      const y = chartHeight - (r.downloadMbps / maxThroughput) * (chartHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(' ');

  const ulPoints = sorted
    .map((r, i) => {
      const x = i * stepX;
      const y = chartHeight - (r.uploadMbps / maxThroughput) * (chartHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(' ');

  const pingPoints = sorted
    .map((r, i) => {
      const x = i * stepX;
      const y = chartHeight - (r.pingAvg / maxPing) * (chartHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={styles.card}>
      {/* Mode Switcher */}
      <View style={styles.header}>
        <Text style={styles.title}>SERIES TEMPORALES (RF-06)</Text>
        <View style={styles.switcher}>
          <TouchableOpacity
            style={[styles.switchBtn, chartMode === 'throughput' && styles.switchBtnActive]}
            onPress={() => setChartMode('throughput')}
          >
            <Text style={[styles.switchBtnText, chartMode === 'throughput' && styles.switchBtnTextActive]}>
              Throughput
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, chartMode === 'latency' && styles.switchBtnActive]}
            onPress={() => setChartMode('latency')}
          >
            <Text style={[styles.switchBtnText, chartMode === 'latency' && styles.switchBtnTextActive]}>
              Latencia RTT
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart Canvas */}
      <View style={styles.chartContainer}>
        {Svg && Polyline ? (
          <Svg width={chartWidth} height={chartHeight} style={styles.svg}>
            {/* Grid Lines */}
            <Line x1="0" y1="20" x2={chartWidth} y2="20" stroke={colors.border} strokeWidth="1" strokeDasharray="4,4" />
            <Line x1="0" y1="80" x2={chartWidth} y2="80" stroke={colors.border} strokeWidth="1" strokeDasharray="4,4" />
            <Line x1="0" y1={chartHeight - 10} x2={chartWidth} y2={chartHeight - 10} stroke={colors.borderHighlight} strokeWidth="1" />

            {chartMode === 'throughput' ? (
              <>
                {/* Download Polyline (Cyan) */}
                <Polyline points={dlPoints} fill="none" stroke={colors.primary} strokeWidth="2.5" />
                {/* Upload Polyline (Emerald) */}
                <Polyline points={ulPoints} fill="none" stroke={colors.success} strokeWidth="2" strokeDasharray="5,3" />

                {/* Dots */}
                {sorted.map((r, i) => {
                  const x = i * stepX;
                  const y = chartHeight - (r.downloadMbps / maxThroughput) * (chartHeight - 20) - 10;
                  return <Circle key={r.id} cx={x} cy={y} r="3.5" fill={colors.primary} />;
                })}
              </>
            ) : (
              <>
                {/* Latency Polyline (Amber) */}
                <Polyline points={pingPoints} fill="none" stroke={colors.warning} strokeWidth="2.5" />
                {sorted.map((r, i) => {
                  const x = i * stepX;
                  const y = chartHeight - (r.pingAvg / maxPing) * (chartHeight - 20) - 10;
                  return <Circle key={r.id} cx={x} cy={y} r="3.5" fill={colors.warning} />;
                })}
              </>
            )}
          </Svg>
        ) : (
          /* High-fidelity Fallback Histogram Bars */
          <View style={styles.barContainer}>
            {sorted.map((r) => {
              const val = chartMode === 'throughput' ? r.downloadMbps : r.pingAvg;
              const max = chartMode === 'throughput' ? maxThroughput : maxPing;
              const barHeight = Math.max(12, (val / max) * 110);
              const barColor = chartMode === 'throughput' ? colors.primary : colors.warning;

              return (
                <View key={r.id} style={styles.barColumn}>
                  <Text style={styles.barVal}>{Math.round(val)}</Text>
                  <View style={[styles.barVisual, { height: barHeight, backgroundColor: barColor }]} />
                  <Text style={styles.barNet}>{r.networkType}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Legend & Stats */}
      <View style={styles.legendRow}>
        {chartMode === 'throughput' ? (
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendLabel}>Descarga (Máx: {maxThroughput.toFixed(1)} Mbps)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: colors.success }]} />
              <Text style={styles.legendLabel}>Subida (Mbps)</Text>
            </View>
          </>
        ) : (
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendLabel}>Latencia RTT Promedio (Máx: {Math.round(maxPing)} ms)</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  switchBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  switchBtnActive: {
    backgroundColor: colors.surfaceHighlight
  },
  switchBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted
  },
  switchBtnTextActive: {
    color: colors.text
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  svg: {
    alignSelf: 'center'
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    height: 140,
    paddingHorizontal: 8,
    paddingBottom: 6
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%'
  },
  barVal: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 2
  },
  barVisual: {
    width: 14,
    borderRadius: 3
  },
  barNet: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '700'
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600'
  }
});
