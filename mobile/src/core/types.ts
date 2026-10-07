/**
 * Network QoS Monitor - Type Definitions
 * RFC 2544 / RFC 3550 Compliant QoS Metrics
 */

export type NetworkGeneration = '5G' | '4G' | '3G' | '2G' | 'WIFI' | 'UNKNOWN';

export interface SignalMetrics {
  dbm: number;             // e.g. -85 dBm (cellular) or -50 dBm (WiFi)
  level: number;           // 0 (none/poor) to 4 (excellent)
  asuLevel: number;        // Arbitrary Strength Unit (0..31 or 0..97)
  qualityDescriptor: string; // e.g. "Excelente", "Buena", "Degradada"
}

export interface NetworkQoSDetails {
  isWifi: boolean;
  isCellular: boolean;
  operatorName: string;
  simOperator?: string;
  isRoaming: boolean;
  networkGeneration: NetworkGeneration;
  technologyDetail: string; // e.g. "5G NR", "4G LTE", "WiFi 802.11ax"
  signal: SignalMetrics;
  timestamp: number;
}

export interface PingProbeResult {
  sequence: number;
  rttMs: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface HostPingSummary {
  id: string;
  hostName: string;
  host: string;
  port: number;
  protocol: 'TCP' | 'HTTP';
  probesSent: number;
  probesReceived: number;
  samples: number[];
  minRtt: number;
  avgRtt: number;
  maxRtt: number;
  jitterMs: number;         // RFC 3550 statistical jitter
  packetLossPercent: number; // 0 to 100%
  status: 'idle' | 'running' | 'success' | 'failed';
}

export interface ThroughputProgress {
  phase: 'idle' | 'download_prep' | 'downloading' | 'upload_prep' | 'uploading' | 'completed' | 'error';
  currentMbps: number;
  averageMbps: number;
  bytesTransferred: number;
  totalExpectedBytes?: number;
  elapsedMs: number;
  percent: number;
  errorMessage?: string;
}

export interface ThroughputSummary {
  downloadMbps: number;
  uploadMbps: number;
  bytesDownloaded: number;
  bytesUploaded: number;
  downloadDurationMs: number;
  uploadDurationMs: number;
  timestamp: number;
}

export type QoSGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy: number;
  speed?: number | null;
  heading?: number | null;
}

export interface QoSMeasurementRecord {
  id: string;
  timestamp: number;
  sessionId: string;
  networkType: NetworkGeneration;
  technologyDetail: string;
  operatorName: string;
  signalDbm: number;
  signalLevel: number;
  // Multi-host aggregated ping metrics
  pingMin: number;
  pingAvg: number;
  pingMax: number;
  jitter: number;
  packetLoss: number;
  // Throughput
  downloadMbps: number;
  uploadMbps: number;
  // Geo
  latitude: number;
  longitude: number;
  accuracy: number;
  // Evaluated QoS score
  qosScore: number; // 0 to 100
  grade: QoSGrade;
  isBackground: boolean;
  notes?: string;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;      // 0.0 to 1.0 (normalized intensity)
  metricValue: number; // raw value (dBm, Mbps, or QoS Score)
  color: string;
  radius: number;
  recordId: string;
  networkType: NetworkGeneration;
}

export interface FilterCriteria {
  networkTypes?: NetworkGeneration[];
  dateFrom?: number;
  dateTo?: number;
  minQoSScore?: number;
  maxLatency?: number;
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export interface PingTargetConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: 'TCP' | 'HTTP';
  enabled: boolean;
  isDefault?: boolean;
}

export interface AppSettings {
  backendUrl: string;
  pingTargets: PingTargetConfig[];
  backgroundIntervalMinutes: number; // 15, 30, 60
  enableBackgroundSampling: boolean;
  degradationAlertThresholds: {
    maxPingMs: number;       // e.g. 150 ms
    maxJitterMs: number;     // e.g. 35 ms
    maxPacketLossPercent: number; // e.g. 5 %
    minDownloadMbps: number; // e.g. 2.0 Mbps
    minSignalDbm: number;    // e.g. -115 dBm
  };
}
