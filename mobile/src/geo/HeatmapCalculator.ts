import { HeatmapPoint, QoSMeasurementRecord } from '../core/types';

export type HeatmapMetricType = 'qosScore' | 'signalDbm' | 'downloadMbps' | 'pingAvg';

export class HeatmapCalculator {
  /**
   * Generates heatmap points from QoS records according to chosen metric
   */
  public static calculateHeatmap(
    records: QoSMeasurementRecord[],
    metric: HeatmapMetricType = 'qosScore'
  ): HeatmapPoint[] {
    return records.map((record) => {
      let rawValue = 0;
      let normalizedWeight = 0; // 0 (worst) to 1 (best)
      let color = '#10b981'; // default emerald green

      switch (metric) {
        case 'qosScore':
          rawValue = record.qosScore;
          normalizedWeight = Math.max(0, Math.min(1, record.qosScore / 100));
          break;

        case 'signalDbm':
          rawValue = record.signalDbm;
          // -120 dBm (worst, 0.0) to -65 dBm (best, 1.0)
          normalizedWeight = Math.max(0, Math.min(1, (record.signalDbm - (-120)) / 55));
          break;

        case 'downloadMbps':
          rawValue = record.downloadMbps;
          // 0 Mbps (0.0) to 80 Mbps (1.0)
          normalizedWeight = Math.max(0, Math.min(1, record.downloadMbps / 80));
          break;

        case 'pingAvg':
          rawValue = record.pingAvg;
          // Inverted: 180ms (worst, 0.0) to 15ms (best, 1.0)
          normalizedWeight = Math.max(0, Math.min(1, (180 - record.pingAvg) / 165));
          break;
      }

      // Smooth color gradient interpolation from Red -> Yellow -> Green
      color = this.interpolateColor(normalizedWeight);

      return {
        latitude: record.latitude,
        longitude: record.longitude,
        weight: normalizedWeight,
        metricValue: rawValue,
        color,
        radius: 28,
        recordId: record.id,
        networkType: record.networkType
      };
    });
  }

  /**
   * Interpolates an RGB hex code between Crimson (0.0), Amber (0.5), and Emerald (1.0)
   */
  private static interpolateColor(val: number): string {
    const clamped = Math.max(0, Math.min(1, val));

    if (clamped < 0.45) {
      // Poor: Red to Orange (#ef4444 to #f97316)
      return '#ef4444';
    } else if (clamped < 0.75) {
      // Fair / Moderate: Amber / Yellow (#eab308)
      return '#eab308';
    } else {
      // Good / Excellent: Emerald Green (#10b981)
      return '#10b981';
    }
  }
}
