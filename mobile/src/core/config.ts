import { AppSettings, PingTargetConfig } from './types';

export const DEFAULT_PING_TARGETS: PingTargetConfig[] = [
  {
    id: 'target-1',
    name: 'Google DNS Primary',
    host: '8.8.8.8',
    port: 53,
    protocol: 'TCP',
    enabled: true,
    isDefault: true
  },
  {
    id: 'target-2',
    name: 'Cloudflare DNS Anycast',
    host: '1.1.1.1',
    port: 53,
    protocol: 'TCP',
    enabled: true,
    isDefault: true
  },
  {
    id: 'target-3',
    name: 'Reference QoS Backend',
    host: 'localhost',
    port: 3001,
    protocol: 'HTTP',
    enabled: true,
    isDefault: true
  }
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  backendUrl: 'http://localhost:3001',
  pingTargets: DEFAULT_PING_TARGETS,
  backgroundIntervalMinutes: 15,
  enableBackgroundSampling: true,
  degradationAlertThresholds: {
    maxPingMs: 150,
    maxJitterMs: 35,
    maxPacketLossPercent: 5,
    minDownloadMbps: 2.0,
    minSignalDbm: -115
  }
};
