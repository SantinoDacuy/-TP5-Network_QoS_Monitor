import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThroughputProgress } from '../../core/types';
import { colors } from '../../theme/colors';

interface ThroughputGaugeProps {
  progress: ThroughputProgress | null;
  phase: string;
}

export const ThroughputGauge: React.FC<ThroughputGaugeProps> = ({ progress, phase }) => {
  const isDownload = phase.includes('download') || progress?.phase?.includes('download');
  const isUpload = phase.includes('upload') || progress?.phase?.includes('upload');

  const currentMbps = progress ? progress.currentMbps : 0;
  const avgMbps = progress ? progress.averageMbps : 0;
  const percent = progress ? progress.percent : 0;
  const bytesMb = progress ? (progress.bytesTransferred / (1024 * 1024)).toFixed(1) : '0.0';
  const totalMb = progress?.totalExpectedBytes
    ? (progress.totalExpectedBytes / (1024 * 1024)).toFixed(1)
    : isDownload ? '4.0' : '2.0';

  const accentColor = isDownload ? colors.primary : colors.success;

  return (
    <View style={styles.card}>
      {/* Direction & Phase Badge */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { borderColor: accentColor, backgroundColor: `${accentColor}18` }]}>
            <Text style={[styles.badgeText, { color: accentColor }]}>
              {isDownload ? '📥 TEST DE DESCARGA (DOWNLINK)' : isUpload ? '📤 TEST DE SUBIDA (UPLINK)' : 'TEST DE VELOCIDAD'}
            </Text>
          </View>
        </View>
        <Text style={styles.progressPercent}>{percent}%</Text>
      </View>

      {/* Main Mbps Speedometer Display */}
      <View style={styles.speedDisplay}>
        <Text style={[styles.speedNumber, { color: accentColor }]}>
          {currentMbps.toFixed(1)}
        </Text>
        <Text style={styles.speedUnit}>Mbps</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.max(2, Math.min(100, percent))}%`, backgroundColor: accentColor }
          ]}
        />
      </View>

      {/* Secondary Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>VELOCIDAD MEDIA</Text>
          <Text style={styles.statValue}>{avgMbps.toFixed(1)} Mbps</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>PAYLOAD TRANSFERIDO</Text>
          <Text style={styles.statValue}>{bytesMb} / {totalMb} MB</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TIEMPO</Text>
          <Text style={styles.statValue}>
            {progress ? `${(progress.elapsedMs / 1000).toFixed(1)}s` : '0.0s'}
          </Text>
        </View>
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
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textSecondary,
    fontFamily: 'monospace'
  },
  speedDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14
  },
  speedNumber: {
    fontSize: 54,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: -1,
    lineHeight: 60
  },
  speedUnit: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginTop: -4
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 12
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 3
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'monospace'
  }
});
