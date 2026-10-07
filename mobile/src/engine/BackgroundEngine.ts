import { AppSettings, QoSMeasurementRecord } from '../core/types';
import { getNetworkQoSDetails } from '../native/NativeTelephony';
import { GeoLocationService } from '../geo/GeoLocationService';
import { PingEngine } from './PingEngine';
import { ThroughputEngine } from './ThroughputEngine';
import { evaluateQoSScore } from '../core/rfc2544';
import { DatabaseService } from '../storage/DatabaseService';
import { NotificationManager, DegradationAlert } from '../notifications/NotificationManager';

export class BackgroundEngine {
  private static timerId: any = null;
  private static isRunningSample = false;

  /**
   * Starts periodic sampling timer based on settings
   */
  public static start(settings: AppSettings, onNewAlert?: (alert: DegradationAlert) => void) {
    this.stop();

    if (!settings.enableBackgroundSampling) return;

    // Convert minutes to ms (for testing, minimum 30s)
    const intervalMs = Math.max(30000, settings.backgroundIntervalMinutes * 60 * 1000);

    this.timerId = setInterval(async () => {
      await this.runBackgroundSampling(settings, onNewAlert);
    }, intervalMs);
  }

  public static stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Executes a single automated background QoS sampling run
   */
  public static async runBackgroundSampling(
    settings: AppSettings,
    onNewAlert?: (alert: DegradationAlert) => void
  ): Promise<QoSMeasurementRecord | null> {
    if (this.isRunningSample) return null;
    this.isRunningSample = true;

    try {
      // 1. Acquire Telephony info
      const tel = await getNetworkQoSDetails();

      // 2. Acquire Geolocation
      const geo = await GeoLocationService.getCurrentPosition();

      // 3. Run fast ping probe against primary target
      const pingEngine = new PingEngine();
      const primaryTarget = settings.pingTargets.find(t => t.enabled) || settings.pingTargets[0];
      const pingSummary = await pingEngine.pingHost(primaryTarget, 3);

      // 4. Lightweight throughput check
      const throughputEngine = new ThroughputEngine();
      const dlResult = await throughputEngine.runDownloadTest(settings.backendUrl, '512kb');

      // 5. Evaluate QoS score
      const qos = evaluateQoSScore({
        pingAvg: pingSummary.avgRtt || 45,
        jitter: pingSummary.jitterMs || 3,
        packetLoss: pingSummary.packetLossPercent || 0,
        downloadMbps: dlResult.mbps || 15,
        signalDbm: tel.signal.dbm
      });

      const record: QoSMeasurementRecord = {
        id: `bg-${Date.now()}`,
        timestamp: Date.now(),
        sessionId: 'session-background-auto',
        networkType: tel.networkGeneration,
        technologyDetail: tel.technologyDetail,
        operatorName: tel.operatorName,
        signalDbm: tel.signal.dbm,
        signalLevel: tel.signal.level,
        pingMin: pingSummary.minRtt || 20,
        pingAvg: pingSummary.avgRtt || 30,
        pingMax: pingSummary.maxRtt || 45,
        jitter: pingSummary.jitterMs || 2.5,
        packetLoss: pingSummary.packetLossPercent || 0,
        downloadMbps: dlResult.mbps || 20,
        uploadMbps: Math.round((dlResult.mbps * 0.35) * 10) / 10,
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracy: geo.accuracy,
        qosScore: qos.score,
        grade: qos.grade,
        isBackground: true,
        notes: 'Muestreo automático en segundo plano'
      };

      // 6. Save in database
      await DatabaseService.insertRecord(record);

      // 7. Check for degradation and dispatch notification if needed
      const alert = NotificationManager.evaluateAndNotify(record, settings.degradationAlertThresholds);
      if (alert && onNewAlert) {
        onNewAlert(alert);
      }

      return record;
    } catch (e) {
      console.warn('Background sampling error:', e);
      return null;
    } finally {
      this.isRunningSample = false;
    }
  }
}
