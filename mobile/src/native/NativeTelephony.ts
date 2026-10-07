import { NativeModules, Platform } from 'react-native';
import { NetworkQoSDetails } from '../core/types';

interface TelephonyNativeModuleInterface {
  getNetworkQoSDetails(): Promise<NetworkQoSDetails>;
}

const { TelephonyModule } = NativeModules;

// Simulated cellular states for testing and simulator environments
let simulatedNetworkGeneration: '5G' | '4G' | '3G' | 'WIFI' = '5G';
let simulatedDbm = -78;
let simulatedOperator = 'Telecom 5G Personal';

export function setSimulatedCellularState(options: {
  generation?: '5G' | '4G' | '3G' | 'WIFI';
  dbm?: number;
  operator?: string;
}) {
  if (options.generation) simulatedNetworkGeneration = options.generation;
  if (options.dbm !== undefined) simulatedDbm = options.dbm;
  if (options.operator) simulatedOperator = options.operator;
}

/**
 * Gets real network telemetry via Android TelephonyManager or iOS CoreTelephony.
 * If native bridge is not available (e.g. web runner or simulator), falls back gracefully.
 */
export async function getNetworkQoSDetails(): Promise<NetworkQoSDetails> {
  if (TelephonyModule && typeof TelephonyModule.getNetworkQoSDetails === 'function') {
    try {
      const result: NetworkQoSDetails = await TelephonyModule.getNetworkQoSDetails();
      return result;
    } catch (err) {
      console.warn('Native TelephonyModule call failed, falling back to simulated state:', err);
    }
  }

  // High-fidelity fallback / simulator mode
  // Allows testing on Web, Expo, or Android/iOS Simulators
  const jitteredDbm = simulatedDbm + (Math.floor(Math.random() * 5) - 2);

  let qualityDescriptor = 'Excelente (-80 dBm o superior)';
  let level = 4;
  if (jitteredDbm < -110) {
    qualityDescriptor = 'Mala / Degradada (inferior a -110 dBm)';
    level = 1;
  } else if (jitteredDbm < -95) {
    qualityDescriptor = 'Regular (-110 a -96 dBm)';
    level = 2;
  } else if (jitteredDbm < -80) {
    qualityDescriptor = 'Buena (-95 a -81 dBm)';
    level = 3;
  }

  return {
    isWifi: simulatedNetworkGeneration === 'WIFI',
    isCellular: simulatedNetworkGeneration !== 'WIFI',
    operatorName: simulatedOperator,
    simOperator: '722034',
    isRoaming: false,
    networkGeneration: simulatedNetworkGeneration,
    technologyDetail: simulatedNetworkGeneration === '5G' ? '5G NR NSA' :
                      simulatedNetworkGeneration === '4G' ? '4G LTE-Advanced' :
                      simulatedNetworkGeneration === '3G' ? '3G HSPA+' : 'WiFi 802.11ax 5GHz',
    signal: {
      dbm: jitteredDbm,
      level,
      asuLevel: Math.max(0, Math.min(31, Math.round((jitteredDbm + 140) / 3))),
      qualityDescriptor
    },
    timestamp: Date.now()
  };
}
