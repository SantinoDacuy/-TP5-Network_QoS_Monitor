import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { QoSMeasurementRecord } from '../../core/types';
import { HeatmapCalculator, HeatmapMetricType } from '../../geo/HeatmapCalculator';
import { colors } from '../../theme/colors';

// Try importing react-native-maps gracefully
let MapView: any = null;
let Marker: any = null;
let Circle: any = null;

try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
} catch (e) {
  // Not linked or running in simulator without native maps
}

interface CoverageMapProps {
  records: QoSMeasurementRecord[];
  onSelectRecord?: (record: QoSMeasurementRecord) => void;
}

export const CoverageMap: React.FC<CoverageMapProps> = ({ records, onSelectRecord }) => {
  const [activeMetric, setActiveMetric] = useState<HeatmapMetricType>('qosScore');
  const [selectedPoint, setSelectedPoint] = useState<QoSMeasurementRecord | null>(
    records.length > 0 ? records[0] : null
  );

  const heatmapPoints = HeatmapCalculator.calculateHeatmap(records, activeMetric);

  const centerLat = records.length > 0 ? records[0].latitude : -34.6037;
  const centerLng = records.length > 0 ? records[0].longitude : -58.3816;

  const getMetricLabel = (m: HeatmapMetricType) => {
    switch (m) {
      case 'qosScore': return 'Puntuación QoS';
      case 'signalDbm': return 'Señal (dBm)';
      case 'downloadMbps': return 'Descarga (Mbps)';
      case 'pingAvg': return 'Latencia (ms)';
    }
  };

  return (
    <View style={styles.container}>
      {/* Metric Selector Bar */}
      <View style={styles.metricBar}>
        {(['qosScore', 'signalDbm', 'downloadMbps', 'pingAvg'] as HeatmapMetricType[]).map((m) => {
          const isActive = activeMetric === m;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.metricButton, isActive && styles.metricButtonActive]}
              onPress={() => setActiveMetric(m)}
            >
              <Text style={[styles.metricButtonText, isActive && styles.metricButtonTextActive]}>
                {getMetricLabel(m)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Map Content */}
      <View style={styles.mapWrapper}>
        {MapView ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: centerLat,
              longitude: centerLng,
              latitudeDelta: 0.035,
              longitudeDelta: 0.035
            }}
          >
            {heatmapPoints.map((pt) => {
              const orig = records.find(r => r.id === pt.recordId);
              return (
                <React.Fragment key={pt.recordId}>
                  {Circle && (
                    <Circle
                      center={{ latitude: pt.latitude, longitude: pt.longitude }}
                      radius={120}
                      fillColor={`${pt.color}66`}
                      strokeColor={pt.color}
                      strokeWidth={2}
                    />
                  )}
                  {Marker && (
                    <Marker
                      coordinate={{ latitude: pt.latitude, longitude: pt.longitude }}
                      title={`${orig?.networkType || ''} - ${orig?.operatorName || ''}`}
                      description={`Score: ${orig?.qosScore}/100 | DL: ${orig?.downloadMbps}Mbps | Ping: ${orig?.pingAvg}ms`}
                      onPress={() => {
                        if (orig) {
                          setSelectedPoint(orig);
                          onSelectRecord?.(orig);
                        }
                      }}
                      pinColor={pt.color === '#10b981' ? 'green' : pt.color === '#ef4444' ? 'red' : 'yellow'}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </MapView>
        ) : (
          /* Native Map Fallback / Visual Grid */
          <View style={styles.mapFallback}>
            <View style={styles.radarGrid}>
              <View style={styles.radarCircle1} />
              <View style={styles.radarCircle2} />
              <View style={styles.radarCrosshairH} />
              <View style={styles.radarCrosshairV} />

              {/* Render points scaled onto radar preview */}
              {heatmapPoints.map((pt, idx) => {
                const orig = records.find(r => r.id === pt.recordId);
                // Normalized relative position
                const relX = 50 + (pt.longitude - centerLng) * 4500;
                const relY = 50 + (pt.latitude - centerLat) * 4500;
                const clampedX = Math.max(10, Math.min(90, relX));
                const clampedY = Math.max(10, Math.min(90, relY));

                return (
                  <TouchableOpacity
                    key={pt.recordId}
                    style={[
                      styles.pointMarker,
                      {
                        left: `${clampedX}%`,
                        top: `${clampedY}%`,
                        backgroundColor: pt.color,
                        borderColor: pt.color
                      }
                    ]}
                    onPress={() => {
                      if (orig) {
                        setSelectedPoint(orig);
                        onSelectRecord?.(orig);
                      }
                    }}
                  >
                    <Text style={styles.pointMarkerText}>{orig?.networkType || 'Q'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.fallbackNotice}>
              <Text style={styles.fallbackTitle}>MAPA DE COBERTURA GEORREFERENCIADO</Text>
              <Text style={styles.fallbackDesc}>
                {records.length} puntos registrados • Centro: {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
              </Text>
            </View>
          </View>
        )}

        {/* Legend Overlay */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Excelente</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendText}>Regular</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.legendText}>Degradada</Text>
          </View>
        </View>
      </View>

      {/* Selected Point Detail Card */}
      {selectedPoint && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.detailTitleRow}>
              <View style={[styles.badge, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }]}>
                <Text style={styles.badgeText}>{selectedPoint.networkType}</Text>
              </View>
              <Text style={styles.detailOperator}>{selectedPoint.operatorName}</Text>
            </View>
            <View style={[styles.scoreBadge, {
              backgroundColor: selectedPoint.qosScore >= 80 ? 'rgba(16, 185, 129, 0.2)' :
                               selectedPoint.qosScore >= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'
            }]}>
              <Text style={[styles.scoreText, {
                color: selectedPoint.qosScore >= 80 ? colors.success :
                       selectedPoint.qosScore >= 60 ? colors.warning : colors.danger
              }]}>
                {selectedPoint.grade} • {selectedPoint.qosScore}/100
              </Text>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>DESCARGA</Text>
              <Text style={styles.detailValPrimary}>{selectedPoint.downloadMbps} Mbps</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>SUBIDA</Text>
              <Text style={styles.detailValSuccess}>{selectedPoint.uploadMbps} Mbps</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>PING AVG</Text>
              <Text style={styles.detailVal}>{selectedPoint.pingAvg} ms</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>JITTER</Text>
              <Text style={styles.detailVal}>{selectedPoint.jitter} ms</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>SEÑAL</Text>
              <Text style={styles.detailVal}>{selectedPoint.signalDbm} dBm</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>PÉRDIDA</Text>
              <Text style={styles.detailVal}>{selectedPoint.packetLoss}%</Text>
            </View>
          </View>

          <View style={styles.detailFooter}>
            <Text style={styles.detailCoord}>
              GPS: {selectedPoint.latitude.toFixed(6)}, {selectedPoint.longitude.toFixed(6)} (±{Math.round(selectedPoint.accuracy)}m)
            </Text>
            <Text style={styles.detailTime}>
              {new Date(selectedPoint.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  metricBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 6,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  metricButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8
  },
  metricButtonActive: {
    backgroundColor: colors.primary
  },
  metricButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary
  },
  metricButtonTextActive: {
    color: '#ffffff'
  },
  mapWrapper: {
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    position: 'relative'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  radarGrid: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(6, 182, 212, 0.03)'
  },
  radarCircle1: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    position: 'absolute'
  },
  radarCircle2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    position: 'absolute'
  },
  radarCrosshairH: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    position: 'absolute'
  },
  radarCrosshairV: {
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    position: 'absolute'
  },
  pointMarker: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4
  },
  pointMarkerText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ffffff'
  },
  fallbackNotice: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  fallbackTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  fallbackDesc: {
    fontSize: 9,
    color: colors.textSecondary,
    fontFamily: 'monospace'
  },
  legend: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 8,
    padding: 6,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary
  },
  detailOperator: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '900'
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: colors.backgroundSecondary,
    padding: 8,
    borderRadius: 8
  },
  detailItem: {
    width: '31%',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  detailValPrimary: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'monospace'
  },
  detailValSuccess: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
    fontFamily: 'monospace'
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'monospace'
  },
  detailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  detailCoord: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'monospace'
  },
  detailTime: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'monospace'
  }
});
