import { QoSMeasurementRecord } from '../core/types';

export class ExportService {
  /**
   * Converts QoS records into standard RFC 4180 CSV
   */
  public static toCSV(records: QoSMeasurementRecord[]): string {
    const headers = [
      'ID',
      'Timestamp_ISO',
      'Timestamp_UNIX',
      'Session_ID',
      'Network_Type',
      'Technology_Detail',
      'Operator_Name',
      'Signal_dBm',
      'Signal_Level_0_4',
      'Ping_Min_ms',
      'Ping_Avg_ms',
      'Ping_Max_ms',
      'Jitter_ms',
      'Packet_Loss_Percent',
      'Download_Throughput_Mbps',
      'Upload_Throughput_Mbps',
      'Latitude',
      'Longitude',
      'GPS_Accuracy_m',
      'QoS_Score_100',
      'QoS_Grade',
      'Is_Background_Sample',
      'Notes'
    ];

    const rows = records.map((r) => [
      r.id,
      new Date(r.timestamp).toISOString(),
      r.timestamp,
      r.sessionId,
      r.networkType,
      `"${(r.technologyDetail || '').replace(/"/g, '""')}"`,
      `"${(r.operatorName || '').replace(/"/g, '""')}"`,
      r.signalDbm,
      r.signalLevel,
      r.pingMin,
      r.pingAvg,
      r.pingMax,
      r.jitter,
      r.packetLoss,
      r.downloadMbps,
      r.uploadMbps,
      r.latitude,
      r.longitude,
      r.accuracy,
      r.qosScore,
      r.grade,
      r.isBackground ? 'YES' : 'NO',
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  }

  /**
   * Converts QoS records into structured JSON
   */
  public static toJSON(records: QoSMeasurementRecord[]): string {
    const exportBundle = {
      generator: 'Network QoS Monitor - Mobile Telecom Analyzer',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      totalRecords: records.length,
      records
    };
    return JSON.stringify(exportBundle, null, 2);
  }

  /**
   * Triggers client file download for web or returns file content for mobile sharing
   */
  public static triggerDownload(content: string, filename: string, mimeType: string) {
    if (typeof document !== 'undefined') {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Syncs records to reference backend endpoint
   */
  public static async syncToBackend(backendUrl: string, records: QoSMeasurementRecord[]): Promise<boolean> {
    try {
      const endpoint = `${backendUrl.replace(/\/$/, '')}/api/telemetry/sync`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(records)
      });
      return response.ok;
    } catch (e) {
      console.warn('Backend sync failed:', e);
      return false;
    }
  }
}
