import { FilterCriteria, QoSMeasurementRecord } from '../core/types';

const STORAGE_KEY_MEASUREMENTS = 'net_qos_measurements_v1';
const STORAGE_KEY_SETTINGS = 'net_qos_settings_v1';

export class DatabaseService {
  private static memoryCache: QoSMeasurementRecord[] | null = null;

  /**
   * Initializes database and loads seed samples if empty
   */
  public static async init(): Promise<void> {
    const records = await this.getAllRecords();
    if (records.length === 0) {
      await this.seedInitialRealisticData();
    }
  }

  /**
   * Retrieves all records from storage
   */
  public static async getAllRecords(): Promise<QoSMeasurementRecord[]> {
    if (this.memoryCache !== null) {
      return [...this.memoryCache];
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_MEASUREMENTS);
        if (raw) {
          const parsed: QoSMeasurementRecord[] = JSON.parse(raw);
          this.memoryCache = parsed;
          return [...parsed];
        }
      }
    } catch (e) {
      console.warn('LocalStorage access error, using memory storage:', e);
    }

    this.memoryCache = [];
    return [];
  }

  /**
   * Inserts a new measurement record
   */
  public static async insertRecord(record: QoSMeasurementRecord): Promise<void> {
    const list = await this.getAllRecords();
    list.unshift(record);
    this.memoryCache = list;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MEASUREMENTS, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Failed saving to localStorage:', e);
    }
  }

  /**
   * Queries records matching complex filter criteria (RF-09)
   * Supports: Network type, Date range, Min QoS score, Geographic bounding box
   */
  public static async queryRecords(filter: FilterCriteria): Promise<QoSMeasurementRecord[]> {
    const all = await this.getAllRecords();

    return all.filter((r) => {
      // 1. Filter by Network Types
      if (filter.networkTypes && filter.networkTypes.length > 0) {
        if (!filter.networkTypes.includes(r.networkType)) {
          return false;
        }
      }

      // 2. Filter by Date Range
      if (filter.dateFrom && r.timestamp < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo && r.timestamp > filter.dateTo) {
        return false;
      }

      // 3. Filter by QoS Score
      if (filter.minQoSScore !== undefined && r.qosScore < filter.minQoSScore) {
        return false;
      }

      // 4. Filter by Max Latency
      if (filter.maxLatency !== undefined && r.pingAvg > filter.maxLatency) {
        return false;
      }

      // 5. Filter by Geographic Bounding Box (Spatial Query)
      if (filter.bounds) {
        const { minLat, maxLat, minLng, maxLng } = filter.bounds;
        if (
          r.latitude < minLat ||
          r.latitude > maxLat ||
          r.longitude < minLng ||
          r.longitude > maxLng
        ) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Deletes a record by ID
   */
  public static async deleteRecord(id: string): Promise<void> {
    const list = await this.getAllRecords();
    const filtered = list.filter((r) => r.id !== id);
    this.memoryCache = filtered;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MEASUREMENTS, JSON.stringify(filtered));
    }
  }

  /**
   * Clears all measurements
   */
  public static async clearAll(): Promise<void> {
    this.memoryCache = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_MEASUREMENTS);
    }
  }

  /**
   * Generates realistic drive-test seeds showing 5G, 4G, WiFi and degraded coverage zones
   */
  public static async seedInitialRealisticData(): Promise<void> {
    const centerLat = -34.6037; // Buenos Aires Central Corridor
    const centerLng = -58.3816;
    const now = Date.now();
    const oneHour = 3600 * 1000;

    const sampleRecords: QoSMeasurementRecord[] = [
      // Session 1: 5G NR Commercial Center (High speed, low latency)
      {
        id: 'seed-01',
        timestamp: now - 3 * oneHour,
        sessionId: 'sess-corridor-1',
        networkType: '5G',
        technologyDetail: '5G NR n78 (3.5GHz)',
        operatorName: 'Telecom Personal 5G',
        signalDbm: -72,
        signalLevel: 4,
        pingMin: 14.2,
        pingAvg: 18.5,
        pingMax: 24.1,
        jitter: 2.1,
        packetLoss: 0,
        downloadMbps: 184.2,
        uploadMbps: 45.6,
        latitude: centerLat + 0.0012,
        longitude: centerLng - 0.0015,
        accuracy: 4.5,
        qosScore: 96,
        grade: 'A+',
        isBackground: false,
        notes: 'Zona Obelisco 5G'
      },
      {
        id: 'seed-02',
        timestamp: now - 2.8 * oneHour,
        sessionId: 'sess-corridor-1',
        networkType: '5G',
        technologyDetail: '5G NR n78',
        operatorName: 'Telecom Personal 5G',
        signalDbm: -76,
        signalLevel: 4,
        pingMin: 16.1,
        pingAvg: 21.0,
        pingMax: 29.8,
        jitter: 2.8,
        packetLoss: 0,
        downloadMbps: 142.0,
        uploadMbps: 38.2,
        latitude: centerLat + 0.0028,
        longitude: centerLng - 0.0022,
        accuracy: 5.2,
        qosScore: 92,
        grade: 'A+',
        isBackground: false,
        notes: 'Av. Corrientes & 9 de Julio'
      },
      // Session 2: 4G LTE Transition (Moderate speed, good coverage)
      {
        id: 'seed-03',
        timestamp: now - 2.5 * oneHour,
        sessionId: 'sess-corridor-1',
        networkType: '4G',
        technologyDetail: '4G LTE Band 4 (AWS)',
        operatorName: 'Claro 4G LTE',
        signalDbm: -86,
        signalLevel: 3,
        pingMin: 28.5,
        pingAvg: 34.2,
        pingMax: 48.0,
        jitter: 4.5,
        packetLoss: 0,
        downloadMbps: 48.5,
        uploadMbps: 16.2,
        latitude: centerLat + 0.0055,
        longitude: centerLng - 0.0038,
        accuracy: 7.1,
        qosScore: 82,
        grade: 'A',
        isBackground: false,
        notes: 'Tribunales 4G LTE'
      },
      {
        id: 'seed-04',
        timestamp: now - 2.2 * oneHour,
        sessionId: 'sess-corridor-1',
        networkType: '4G',
        technologyDetail: '4G LTE Band 28 (700MHz)',
        operatorName: 'Claro 4G LTE',
        signalDbm: -94,
        signalLevel: 2,
        pingMin: 38.0,
        pingAvg: 46.8,
        pingMax: 65.2,
        jitter: 7.2,
        packetLoss: 1.5,
        downloadMbps: 22.4,
        uploadMbps: 7.8,
        latitude: centerLat + 0.0082,
        longitude: centerLng - 0.0050,
        accuracy: 9.0,
        qosScore: 71,
        grade: 'B',
        isBackground: false,
        notes: 'Plaza Lavalle'
      },
      // Degraded / Weak Signal Underground or Cell Edge
      {
        id: 'seed-05',
        timestamp: now - 1.8 * oneHour,
        sessionId: 'sess-degraded-subway',
        networkType: '3G',
        technologyDetail: '3G HSPA+ 850MHz',
        operatorName: 'Movistar 3G',
        signalDbm: -116,
        signalLevel: 1,
        pingMin: 110.0,
        pingAvg: 168.4,
        pingMax: 290.0,
        jitter: 42.1,
        packetLoss: 8.5,
        downloadMbps: 1.8,
        uploadMbps: 0.4,
        latitude: centerLat + 0.0105,
        longitude: centerLng - 0.0068,
        accuracy: 16.0,
        qosScore: 34,
        grade: 'F',
        isBackground: true,
        notes: 'Ingreso Estación Subte B (Degradación Severa)'
      },
      // Fast WiFi at Campus / Office
      {
        id: 'seed-06',
        timestamp: now - 45 * 60 * 1000,
        sessionId: 'sess-office-wifi',
        networkType: 'WIFI',
        technologyDetail: 'WiFi 802.11ax 5GHz',
        operatorName: 'Campus Universidad Red',
        signalDbm: -54,
        signalLevel: 4,
        pingMin: 8.4,
        pingAvg: 11.2,
        pingMax: 15.6,
        jitter: 1.2,
        packetLoss: 0,
        downloadMbps: 260.4,
        uploadMbps: 110.5,
        latitude: centerLat + 0.0040,
        longitude: centerLng + 0.0035,
        accuracy: 3.0,
        qosScore: 99,
        grade: 'A+',
        isBackground: false,
        notes: 'Laboratorio Redes WiFi 6'
      }
    ];

    for (const r of sampleRecords) {
      await this.insertRecord(r);
    }
  }
}
