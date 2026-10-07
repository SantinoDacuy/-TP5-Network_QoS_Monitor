import { QoSMeasurementRecord, AppSettings } from '../core/types';
import { checkThresholdBreach } from '../core/rfc2544';

export interface DegradationAlert {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  severity: 'warning' | 'critical';
  details: string;
}

export class NotificationManager {
  private static alertListeners: ((alert: DegradationAlert) => void)[] = [];

  public static onAlert(listener: (alert: DegradationAlert) => void) {
    this.alertListeners.push(listener);
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== listener);
    };
  }

  /**
   * Request browser / device notification permissions
   */
  public static async requestPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  }

  /**
   * Evaluates a measurement record against thresholds and fires alert if degraded
   */
  public static evaluateAndNotify(
    record: QoSMeasurementRecord,
    thresholds: AppSettings['degradationAlertThresholds']
  ): DegradationAlert | null {
    const breach = checkThresholdBreach(
      {
        pingAvg: record.pingAvg,
        jitter: record.jitter,
        packetLoss: record.packetLoss,
        downloadMbps: record.downloadMbps,
        signalDbm: record.signalDbm
      },
      thresholds
    );

    if (breach.breached || record.qosScore < 45) {
      const severity: 'warning' | 'critical' = record.qosScore < 40 || record.packetLoss > 10 ? 'critical' : 'warning';
      const alert: DegradationAlert = {
        id: `alert-${Date.now()}`,
        timestamp: Date.now(),
        title: severity === 'critical' ? '⚠️ Calidad de Red Crítica Detectada' : '⚠️ Degradación de Servicio (QoS)',
        message: `Red ${record.networkType} (${record.operatorName}): ${breach.summary || 'Puntuación QoS baja (' + record.qosScore + '/100)'}`,
        severity,
        details: `Latencia: ${record.pingAvg}ms | Pérdida: ${record.packetLoss}% | Throughput: ${record.downloadMbps}Mbps | Señal: ${record.signalDbm}dBm`
      };

      // 1. Dispatch in-app listener
      this.alertListeners.forEach(listener => listener(alert));

      // 2. Dispatch system notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(alert.title, {
            body: alert.message,
            icon: '/favicon.ico',
            tag: 'qos-degradation'
          });
        } catch (e) {
          console.warn('System notification failed:', e);
        }
      }

      return alert;
    }

    return null;
  }
}
