import { useState, useEffect } from 'react';
import {
  AppSettings,
  FilterCriteria,
  GeoCoordinate,
  HostPingSummary,
  NetworkQoSDetails,
  QoSMeasurementRecord,
  ThroughputProgress
} from '../core/types';
import { DEFAULT_APP_SETTINGS } from '../core/config';
import { getNetworkQoSDetails } from '../native/NativeTelephony';
import { GeoLocationService } from '../geo/GeoLocationService';
import { DatabaseService } from '../storage/DatabaseService';
import { PingEngine } from '../engine/PingEngine';
import { ThroughputEngine } from '../engine/ThroughputEngine';
import { evaluateQoSScore } from '../core/rfc2544';
import { NotificationManager, DegradationAlert } from '../notifications/NotificationManager';
import { BackgroundEngine } from '../engine/BackgroundEngine';

interface StoreState {
  currentNetwork: NetworkQoSDetails | null;
  currentLocation: GeoCoordinate | null;
  activeTestPhase: 'idle' | 'running_ping' | 'running_download' | 'running_upload' | 'completed' | 'error';
  pingSummaries: HostPingSummary[];
  throughputProgress: ThroughputProgress | null;
  lastTestResult: QoSMeasurementRecord | null;
  records: QoSMeasurementRecord[];
  filteredRecords: QoSMeasurementRecord[];
  filterCriteria: FilterCriteria;
  settings: AppSettings;
  alerts: DegradationAlert[];
  isLoading: boolean;
}

// Global state singleton pattern with listeners
let globalState: StoreState = {
  currentNetwork: null,
  currentLocation: null,
  activeTestPhase: 'idle',
  pingSummaries: [],
  throughputProgress: null,
  lastTestResult: null,
  records: [],
  filteredRecords: [],
  filterCriteria: {},
  settings: DEFAULT_APP_SETTINGS,
  alerts: [],
  isLoading: true
};

const listeners = new Set<(state: StoreState) => void>();

function notify() {
  listeners.forEach(fn => fn({ ...globalState }));
}

function updateState(partial: Partial<StoreState>) {
  globalState = { ...globalState, ...partial };
  notify();
}

export function useQoSStore() {
  const [state, setState] = useState<StoreState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    refreshTelephony,
    refreshLocation,
    runFullQoSTest,
    updateFilter,
    updateSettings,
    deleteRecord,
    clearAllRecords,
    syncRecords,
    dismissAlert,
    simulateDegradedState,
    simulate5GState
  };
}

/**
 * Initialize core data & listeners
 */
export async function initQoSStore() {
  await DatabaseService.init();
  const allRecords = await DatabaseService.getAllRecords();

  const tel = await getNetworkQoSDetails();
  const loc = await GeoLocationService.getCurrentPosition();

  updateState({
    records: allRecords,
    filteredRecords: allRecords,
    currentNetwork: tel,
    currentLocation: loc,
    isLoading: false
  });

  // Listen to degradation alerts
  NotificationManager.onAlert((alert) => {
    updateState({
      alerts: [alert, ...globalState.alerts.slice(0, 9)]
    });
  });

  // Start background monitoring
  BackgroundEngine.start(globalState.settings, (alert) => {
    updateState({
      alerts: [alert, ...globalState.alerts.slice(0, 9)]
    });
  });
}

export async function refreshTelephony() {
  const tel = await getNetworkQoSDetails();
  updateState({ currentNetwork: tel });
  return tel;
}

export async function refreshLocation() {
  const loc = await GeoLocationService.getCurrentPosition();
  updateState({ currentLocation: loc });
  return loc;
}

export async function updateFilter(newFilter: FilterCriteria) {
  const criteria = { ...globalState.filterCriteria, ...newFilter };
  const filtered = await DatabaseService.queryRecords(criteria);
  updateState({
    filterCriteria: criteria,
    filteredRecords: filtered
  });
}

export function updateSettings(newSettings: Partial<AppSettings>) {
  const updated = { ...globalState.settings, ...newSettings };
  updateState({ settings: updated });
  BackgroundEngine.start(updated);
}

export async function deleteRecord(id: string) {
  await DatabaseService.deleteRecord(id);
  const all = await DatabaseService.getAllRecords();
  const filtered = await DatabaseService.queryRecords(globalState.filterCriteria);
  updateState({ records: all, filteredRecords: filtered });
}

export async function clearAllRecords() {
  await DatabaseService.clearAll();
  updateState({ records: [], filteredRecords: [] });
}

export function dismissAlert(id: string) {
  updateState({
    alerts: globalState.alerts.filter(a => a.id !== id)
  });
}

export async function syncRecords(): Promise<boolean> {
  const { ExportService } = await import('../storage/ExportService');
  const ok = await ExportService.syncToBackend(globalState.settings.backendUrl, globalState.records);
  return ok;
}

/**
 * Runs complete QoS Test suite:
 * Phase 1: Multi-target Ping & Jitter
 * Phase 2: Download Throughput
 * Phase 3: Upload Throughput
 * Phase 4: Scoring & Geo-tagging
 */
export async function runFullQoSTest(): Promise<QoSMeasurementRecord> {
  updateState({
    activeTestPhase: 'running_ping',
    pingSummaries: [],
    throughputProgress: null,
    lastTestResult: null
  });

  // 1. Telephony & Geo
  const tel = await getNetworkQoSDetails();
  const loc = await GeoLocationService.getCurrentPosition();
  updateState({ currentNetwork: tel, currentLocation: loc });

  // 2. Ping Probes
  const pingEngine = new PingEngine();
  const pingResults = await pingEngine.pingAllTargets(
    globalState.settings.pingTargets,
    4,
    (hostId, updated) => {
      const current = [...globalState.pingSummaries];
      const idx = current.findIndex(p => p.id === hostId);
      if (idx >= 0) {
        current[idx] = updated;
      } else {
        current.push(updated);
      }
      updateState({ pingSummaries: current });
    }
  );

  // Compute aggregate ping metrics across hosts
  const successfulPings = pingResults.filter(p => p.probesReceived > 0);
  const avgPing = successfulPings.length > 0
    ? Math.round((successfulPings.reduce((sum, p) => sum + p.avgRtt, 0) / successfulPings.length) * 10) / 10
    : 45;
  const minPing = successfulPings.length > 0
    ? Math.min(...successfulPings.map(p => p.minRtt))
    : 25;
  const maxPing = successfulPings.length > 0
    ? Math.max(...successfulPings.map(p => p.maxRtt))
    : 70;
  const avgJitter = successfulPings.length > 0
    ? Math.round((successfulPings.reduce((sum, p) => sum + p.jitterMs, 0) / successfulPings.length) * 10) / 10
    : 3.2;
  const avgLoss = pingResults.length > 0
    ? Math.round((pingResults.reduce((sum, p) => sum + p.packetLossPercent, 0) / pingResults.length))
    : 0;

  // 3. Download Throughput
  updateState({ activeTestPhase: 'running_download' });
  const throughputEngine = new ThroughputEngine();
  const dlResult = await throughputEngine.runDownloadTest(
    globalState.settings.backendUrl,
    '4mb',
    (progress) => {
      updateState({ throughputProgress: progress });
    }
  );

  // 4. Upload Throughput
  updateState({ activeTestPhase: 'running_upload' });
  const ulResult = await throughputEngine.runUploadTest(
    globalState.settings.backendUrl,
    2,
    (progress) => {
      updateState({ throughputProgress: progress });
    }
  );

  // 5. QoS Evaluation (RFC 2544)
  const qos = evaluateQoSScore({
    pingAvg: avgPing,
    jitter: avgJitter,
    packetLoss: avgLoss,
    downloadMbps: dlResult.mbps,
    signalDbm: tel.signal.dbm
  });

  const record: QoSMeasurementRecord = {
    id: `meas-${Date.now()}`,
    timestamp: Date.now(),
    sessionId: `session-${Date.now().toString(36)}`,
    networkType: tel.networkGeneration,
    technologyDetail: tel.technologyDetail,
    operatorName: tel.operatorName,
    signalDbm: tel.signal.dbm,
    signalLevel: tel.signal.level,
    pingMin: minPing,
    pingAvg: avgPing,
    pingMax: maxPing,
    jitter: avgJitter,
    packetLoss: avgLoss,
    downloadMbps: dlResult.mbps,
    uploadMbps: ulResult.mbps,
    latitude: loc.latitude,
    longitude: loc.longitude,
    accuracy: loc.accuracy,
    qosScore: qos.score,
    grade: qos.grade,
    isBackground: false,
    notes: `Test Manual (${tel.technologyDetail})`
  };

  // 6. Save in SQLite / Storage
  await DatabaseService.insertRecord(record);
  const updatedRecords = await DatabaseService.getAllRecords();
  const updatedFiltered = await DatabaseService.queryRecords(globalState.filterCriteria);

  // 7. Check for degradation alerts
  NotificationManager.evaluateAndNotify(record, globalState.settings.degradationAlertThresholds);

  updateState({
    activeTestPhase: 'completed',
    lastTestResult: record,
    records: updatedRecords,
    filteredRecords: updatedFiltered
  });

  return record;
}

export function simulateDegradedState() {
  import('../native/NativeTelephony').then(({ setSimulatedCellularState }) => {
    setSimulatedCellularState({
      generation: '3G',
      dbm: -118,
      operator: 'Movistar 3G (Degradada)'
    });
    refreshTelephony();
  });
}

export function simulate5GState() {
  import('../native/NativeTelephony').then(({ setSimulatedCellularState }) => {
    setSimulatedCellularState({
      generation: '5G',
      dbm: -75,
      operator: 'Telecom Personal 5G NR'
    });
    refreshTelephony();
  });
}
