import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useQoSStore } from '../../state/useQoSStore';
import { CoverageMap } from '../components/CoverageMap';
import { NetworkGeneration } from '../../core/types';
import { colors } from '../../theme/colors';

export const CoverageMapScreen: React.FC = () => {
  const { filteredRecords, records, updateFilter, refreshLocation } = useQoSStore();
  const [selectedTech, setSelectedTech] = useState<string>('ALL');

  const handleTechFilter = (tech: string) => {
    setSelectedTech(tech);
    if (tech === 'ALL') {
      updateFilter({ networkTypes: undefined });
    } else {
      updateFilter({ networkTypes: [tech as NetworkGeneration] });
    }
  };

  const avgDbm = filteredRecords.length > 0
    ? Math.round(filteredRecords.reduce((sum, r) => sum + r.signalDbm, 0) / filteredRecords.length)
    : -85;

  const avgSpeed = filteredRecords.length > 0
    ? Math.round((filteredRecords.reduce((sum, r) => sum + r.downloadMbps, 0) / filteredRecords.length) * 10) / 10
    : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Filter and Stats Bar */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>FILTROS GEOESPACIALES (RF-09)</Text>
          <TouchableOpacity onPress={() => refreshLocation()} style={styles.recenterBtn}>
            <Text style={styles.recenterBtnText}>Centrar GPS</Text>
          </TouchableOpacity>
        </View>

        {/* Tech Selector */}
        <View style={styles.techFilterRow}>
          {['ALL', '5G', '4G', '3G', 'WIFI'].map((tech) => {
            const isSelected = selectedTech === tech;
            return (
              <TouchableOpacity
                key={tech}
                style={[styles.techChip, isSelected && styles.techChipActive]}
                onPress={() => handleTechFilter(tech)}
              >
                <Text style={[styles.techChipText, isSelected && styles.techChipTextActive]}>
                  {tech === 'ALL' ? 'Todas' : tech}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Aggregate Stats in Current Zone */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>PUNTOS MAPEADOS</Text>
            <Text style={styles.statValPrimary}>{filteredRecords.length} / {records.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SEÑAL MEDIA</Text>
            <Text style={styles.statVal}>{avgDbm} dBm</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>VELOCIDAD MEDIA</Text>
            <Text style={styles.statValSuccess}>{avgSpeed} Mbps</Text>
          </View>
        </View>
      </View>

      {/* Interactive Map with Heatmap */}
      <CoverageMap records={filteredRecords} />
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
    padding: 14,
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
  recenterBtn: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  recenterBtnText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700'
  },
  techFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12
  },
  techChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  techChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  techChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary
  },
  techChipTextActive: {
    color: '#ffffff'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  statBox: {
    alignItems: 'center',
    flex: 1
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  statValPrimary: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
    fontFamily: 'monospace'
  },
  statValSuccess: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.success,
    fontFamily: 'monospace'
  },
  statVal: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
    fontFamily: 'monospace'
  }
});
