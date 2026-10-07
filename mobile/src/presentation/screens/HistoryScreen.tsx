import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useQoSStore } from '../../state/useQoSStore';
import { NetworkGeneration, QoSMeasurementRecord } from '../../core/types';
import { colors } from '../../theme/colors';

export const HistoryScreen: React.FC = () => {
  const { filteredRecords, records, updateFilter, deleteRecord, clearAllRecords } = useQoSStore();
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [scoreFilter, setScoreFilter] = useState<number>(0);
  const [selectedRecord, setSelectedRecord] = useState<QoSMeasurementRecord | null>(null);

  const handleTechChange = (tech: string) => {
    setSelectedTech(tech);
    if (tech === 'ALL') {
      updateFilter({ networkTypes: undefined });
    } else {
      updateFilter({ networkTypes: [tech as NetworkGeneration] });
    }
  };

  const handleScoreFilter = (minScore: number) => {
    setScoreFilter(minScore);
    updateFilter({ minQoSScore: minScore > 0 ? minScore : undefined });
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Eliminar Medición',
      '¿Deseas eliminar este registro del historial local?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteRecord(id) }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Filters Bar (RF-09) */}
      <View style={styles.card}>
        <View style={styles.filterHeader}>
          <Text style={styles.cardLabel}>FILTRADO AVANZADO (RF-09)</Text>
          <Text style={styles.matchCount}>{filteredRecords.length} de {records.length}</Text>
        </View>

        {/* Network Generation Filter */}
        <View style={styles.chipRow}>
          {['ALL', '5G', '4G', '3G', 'WIFI'].map((tech) => (
            <TouchableOpacity
              key={tech}
              style={[styles.chip, selectedTech === tech && styles.chipActive]}
              onPress={() => handleTechChange(tech)}
            >
              <Text style={[styles.chipText, selectedTech === tech && styles.chipTextActive]}>
                {tech === 'ALL' ? 'Todas' : tech}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quality Score Filter */}
        <View style={styles.scoreFilterRow}>
          <Text style={styles.filterSubLabel}>Calidad QoS:</Text>
          <View style={styles.scoreBtnGroup}>
            <TouchableOpacity
              style={[styles.scoreBtn, scoreFilter === 0 && styles.scoreBtnActive]}
              onPress={() => handleScoreFilter(0)}
            >
              <Text style={[styles.scoreBtnText, scoreFilter === 0 && styles.scoreBtnTextActive]}>Todas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scoreBtn, scoreFilter === 60 && styles.scoreBtnActive]}
              onPress={() => handleScoreFilter(60)}
            >
              <Text style={[styles.scoreBtnText, scoreFilter === 60 && styles.scoreBtnTextActive]}>≥ 60 (Aceptable)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scoreBtn, scoreFilter === 80 && styles.scoreBtnActive]}
              onPress={() => handleScoreFilter(80)}
            >
              <Text style={[styles.scoreBtnText, scoreFilter === 80 && styles.scoreBtnTextActive]}>≥ 80 (Excelente)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Measurement List */}
      <View style={styles.listContainer}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map((r) => {
            const dateStr = new Date(r.timestamp).toLocaleString();
            return (
              <TouchableOpacity
                key={r.id}
                style={styles.recordCard}
                onPress={() => setSelectedRecord(r)}
              >
                <View style={styles.recordTop}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.netBadge, {
                      borderColor: r.networkType === '5G' ? colors.gen5G :
                                   r.networkType === '4G' ? colors.gen4G :
                                   r.networkType === '3G' ? colors.gen3G : colors.genWifi
                    }]}>
                      <Text style={[styles.netBadgeText, {
                        color: r.networkType === '5G' ? colors.gen5G :
                               r.networkType === '4G' ? colors.gen4G :
                               r.networkType === '3G' ? colors.gen3G : colors.genWifi
                      }]}>
                        {r.networkType}
                      </Text>
                    </View>
                    <Text style={styles.operatorText}>{r.operatorName}</Text>
                  </View>

                  <View style={[styles.gradeBadge, {
                    backgroundColor: r.qosScore >= 80 ? 'rgba(16, 185, 129, 0.2)' :
                                     r.qosScore >= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                  }]}>
                    <Text style={[styles.gradeText, {
                      color: r.qosScore >= 80 ? colors.success :
                             r.qosScore >= 60 ? colors.warning : colors.danger
                    }]}>
                      {r.grade} ({r.qosScore})
                    </Text>
                  </View>
                </View>

                {/* Metrics */}
                <View style={styles.metricsRow}>
                  <Text style={styles.metricItem}>
                    📥 <Text style={styles.valPrimary}>{r.downloadMbps}M</Text>
                  </Text>
                  <Text style={styles.metricItem}>
                    📤 <Text style={styles.valSuccess}>{r.uploadMbps}M</Text>
                  </Text>
                  <Text style={styles.metricItem}>
                    ⏱️ <Text style={styles.valNormal}>{r.pingAvg}ms</Text>
                  </Text>
                  <Text style={styles.metricItem}>
                    📶 <Text style={styles.valNormal}>{r.signalDbm}dBm</Text>
                  </Text>
                </View>

                {/* Footer with GPS & Time */}
                <View style={styles.recordFooter}>
                  <Text style={styles.footerTime}>{dateStr}</Text>
                  <TouchableOpacity onPress={() => confirmDelete(r.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay mediciones que coincidan</Text>
            <Text style={styles.emptySubtitle}>Ajusta los filtros o realiza un nuevo test.</Text>
          </View>
        )}
      </View>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedRecord(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>DETALLE DE LA MEDICIÓN QOS</Text>
                <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>ID de Sesión:</Text>
                  <Text style={styles.detailVal}>{selectedRecord.sessionId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Tecnología:</Text>
                  <Text style={styles.detailVal}>{selectedRecord.technologyDetail}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Operador:</Text>
                  <Text style={styles.detailVal}>{selectedRecord.operatorName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Potencia Señal RSSI:</Text>
                  <Text style={styles.detailVal}>{selectedRecord.signalDbm} dBm (Nivel {selectedRecord.signalLevel}/4)</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Latencia RTT (Min/Avg/Max):</Text>
                  <Text style={styles.detailVal}>{selectedRecord.pingMin} / {selectedRecord.pingAvg} / {selectedRecord.pingMax} ms</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Jitter Estadístico RFC 3550:</Text>
                  <Text style={styles.detailVal}>{selectedRecord.jitter} ms</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Pérdida de Paquetes:</Text>
                  <Text style={styles.detailVal}>{selectedRecord.packetLoss}%</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Throughput Descarga:</Text>
                  <Text style={styles.detailValPrimary}>{selectedRecord.downloadMbps} Mbps</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Throughput Subida:</Text>
                  <Text style={styles.detailValSuccess}>{selectedRecord.uploadMbps} Mbps</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Puntaje QoS / Grado:</Text>
                  <Text style={styles.detailValPrimary}>{selectedRecord.qosScore}/100 ({selectedRecord.grade})</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Coordenadas GPS:</Text>
                  <Text style={styles.detailVal}>{selectedRecord.latitude.toFixed(6)}, {selectedRecord.longitude.toFixed(6)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Precisión Satelital:</Text>
                  <Text style={styles.detailVal}>±{Math.round(selectedRecord.accuracy)} metros</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Origen del Muestreo:</Text>
                  <Text style={styles.detailVal}>{selectedRecord.isBackground ? 'Segundo Plano (Automático)' : 'Test Manual'}</Text>
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setSelectedRecord(null)}>
                <Text style={styles.modalDoneText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  filterHeader: {
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
  matchCount: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.primary,
    fontWeight: '700'
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10
  },
  chip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary
  },
  chipTextActive: {
    color: '#ffffff'
  },
  scoreFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  filterSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted
  },
  scoreBtnGroup: {
    flexDirection: 'row',
    gap: 4
  },
  scoreBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border
  },
  scoreBtnActive: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.primary
  },
  scoreBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary
  },
  scoreBtnTextActive: {
    color: colors.primary
  },
  listContainer: {
    gap: 10
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  recordTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  netBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1
  },
  netBadgeText: {
    fontSize: 10,
    fontWeight: '900'
  },
  operatorText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '900'
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8
  },
  metricItem: {
    fontSize: 11,
    color: colors.textSecondary
  },
  valPrimary: {
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'monospace'
  },
  valSuccess: {
    fontWeight: '800',
    color: colors.success,
    fontFamily: 'monospace'
  },
  valNormal: {
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'monospace'
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerTime: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'monospace'
  },
  deleteBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  deleteText: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '700'
  },
  emptyCard: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4
  },
  emptySubtitle: {
    fontSize: 11,
    color: colors.textMuted
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    maxHeight: '80%',
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5
  },
  modalClose: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '900',
    padding: 4
  },
  modalBody: {
    marginVertical: 12
  },
  detailRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  detailKey: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'monospace'
  },
  detailValPrimary: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
    fontFamily: 'monospace'
  },
  detailValSuccess: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.success,
    fontFamily: 'monospace'
  },
  modalDoneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6
  },
  modalDoneText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12
  }
});
