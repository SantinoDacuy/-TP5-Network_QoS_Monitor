import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NetworkQoSDetails } from '../../core/types';
import { colors } from '../../theme/colors';

interface SignalGaugeProps {
  network: NetworkQoSDetails | null;
}

export const SignalGauge: React.FC<SignalGaugeProps> = ({ network }) => {
  if (!network) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>Adquiriendo telemetría celular...</Text>
      </View>
    );
  }

  const { signal, networkGeneration, operatorName, technologyDetail, isRoaming } = network;
  const level = signal.level; // 0 to 4
  const dbm = signal.dbm;

  const getGenColor = () => {
    switch (networkGeneration) {
      case '5G': return colors.gen5G;
      case '4G': return colors.gen4G;
      case '3G': return colors.gen3G;
      case 'WIFI': return colors.genWifi;
      default: return colors.primary;
    }
  };

  const getSignalColor = () => {
    if (dbm >= -80) return colors.success;
    if (dbm >= -95) return colors.primary;
    if (dbm >= -110) return colors.warning;
    return colors.danger;
  };

  const genColor = getGenColor();
  const signalColor = getSignalColor();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.operatorBlock}>
          <Text style={styles.label}>RED ACTIVA Y OPERADOR</Text>
          <Text style={styles.operatorName} numberOfLines={1}>
            {operatorName || 'Desconocido'}
          </Text>
        </View>

        <View style={[styles.genBadge, { borderColor: genColor, backgroundColor: `${genColor}20` }]}>
          <Text style={[styles.genText, { color: genColor }]}>{networkGeneration}</Text>
        </View>
      </View>

      <View style={styles.techRow}>
        <Text style={styles.techText}>{technologyDetail}</Text>
        {isRoaming && (
          <View style={styles.roamingBadge}>
            <Text style={styles.roamingText}>ROAMING</Text>
          </View>
        )}
      </View>

      {/* Signal Strength Meter */}
      <View style={styles.meterContainer}>
        {/* Signal Bars (0 to 4) */}
        <View style={styles.barsContainer}>
          {[1, 2, 3, 4].map((barIndex) => {
            const isActive = level >= barIndex;
            return (
              <View
                key={barIndex}
                style={[
                  styles.bar,
                  { height: 8 + barIndex * 6 },
                  isActive
                    ? { backgroundColor: signalColor, shadowColor: signalColor, shadowOpacity: 0.5, shadowRadius: 4 }
                    : { backgroundColor: colors.surfaceHighlight }
                ]}
              />
            );
          })}
        </View>

        {/* dBm Value */}
        <View style={styles.valueContainer}>
          <View style={styles.dbmRow}>
            <Text style={[styles.dbmNumber, { color: signalColor }]}>{dbm}</Text>
            <Text style={styles.dbmUnit}>dBm</Text>
          </View>
          <Text style={styles.asuText}>ASU: {signal.asuLevel} • Nivel {level}/4</Text>
        </View>
      </View>

      {/* Quality Descriptor Footer */}
      <View style={styles.footerRow}>
        <View style={[styles.statusDot, { backgroundColor: signalColor }]} />
        <Text style={styles.descriptorText} numberOfLines={1}>
          {signal.qualityDescriptor}
        </Text>
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
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  operatorBlock: {
    flex: 1,
    marginRight: 8
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2
  },
  operatorName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  genBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5
  },
  genText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14
  },
  techText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  roamingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.warning
  },
  roamingText: {
    color: colors.warning,
    fontSize: 9,
    fontWeight: '800'
  },
  meterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 34,
    paddingBottom: 2
  },
  bar: {
    width: 8,
    borderRadius: 3
  },
  valueContainer: {
    alignItems: 'flex-end'
  },
  dbmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4
  },
  dbmNumber: {
    fontSize: 26,
    fontWeight: '900',
    fontFamily: 'monospace'
  },
  dbmUnit: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '700'
  },
  asuText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 2
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  descriptorText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500'
  }
});
