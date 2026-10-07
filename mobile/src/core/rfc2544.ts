/**
 * RFC 2544 & RFC 3550 Network Benchmarking & QoS Algorithms
 *
 * Implements:
 * - RFC 2544: Benchmarking Methodology for Network Interconnect Devices (Latency, Loss, Throughput)
 * - RFC 3550: Real-time Transport Protocol (RTP) Interarrival Jitter Estimation
 * - ITU-T G.107 / E-Model derived Quality of Experience (QoE / QoS Score)
 */

import { QoSGrade, AppSettings } from './types';

/**
 * Calculates RFC 3550 Statistical Jitter from a sequence of consecutive RTT probe measurements.
 * Formula: J(i) = J(i-1) + (|D(i-1, i)| - J(i-1)) / 16
 *
 * @param rttSamples Array of consecutive RTT samples in milliseconds
 * @returns Estimated Jitter in milliseconds
 */
export function calculateRFC3550Jitter(rttSamples: number[]): number {
  if (rttSamples.length < 2) return 0;

  let jitter = 0;
  for (let i = 1; i < rttSamples.length; i++) {
    const diff = Math.abs(rttSamples[i] - rttSamples[i - 1]);
    jitter = jitter + (diff - jitter) / 16;
  }

  return Math.round(jitter * 100) / 100;
}

/**
 * Calculates standard descriptive statistics (min, avg, max, standard deviation)
 */
export function calculateLatencyStats(samples: number[]) {
  if (samples.length === 0) {
    return { min: 0, avg: 0, max: 0, stdDev: 0 };
  }

  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const sum = samples.reduce((a, b) => a + b, 0);
  const avg = sum / samples.length;

  const variance = samples.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / samples.length;
  const stdDev = Math.sqrt(variance);

  return {
    min: Math.round(min * 10) / 10,
    avg: Math.round(avg * 10) / 10,
    max: Math.round(max * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10
  };
}

/**
 * Calculates Throughput in Megabits per second (Mbps)
 * Formula: (Bytes * 8) / (ElapsedSeconds * 1,000,000)
 */
export function calculateThroughputMbps(bytes: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || bytes <= 0) return 0;
  const seconds = elapsedMs / 1000;
  const bits = bytes * 8;
  const mbps = bits / (seconds * 1_000_000);
  return Math.round(mbps * 100) / 100;
}

/**
 * Computes an overall QoS Score (0 to 100) and assigns an engineering Grade
 * Based on weighted contributions:
 * - Latency (30%): Ideal < 30ms, Unacceptable > 250ms
 * - Packet Loss (30%): 0% ideal, >10% unacceptable
 * - Jitter (15%): Ideal < 5ms, >40ms poor
 * - Throughput (25%): 0 to 50+ Mbps scale
 */
export function evaluateQoSScore(params: {
  pingAvg: number;
  jitter: number;
  packetLoss: number;
  downloadMbps: number;
  signalDbm?: number;
}): { score: number; grade: QoSGrade; isDegraded: boolean; degradationReasons: string[] } {
  const { pingAvg, jitter, packetLoss, downloadMbps } = params;

  // 1. Latency Score (0 - 100)
  // 20ms or less = 100, 250ms = 0
  let latencyScore = Math.max(0, Math.min(100, 100 - ((pingAvg - 20) / 2.3)));
  if (pingAvg <= 20) latencyScore = 100;

  // 2. Loss Score (0 - 100)
  // 0% loss = 100, 10% loss = 0
  const lossScore = Math.max(0, Math.min(100, 100 - (packetLoss * 10)));

  // 3. Jitter Score (0 - 100)
  // 3ms or less = 100, 40ms = 0
  const jitterScore = Math.max(0, Math.min(100, 100 - ((jitter - 3) * 2.7)));

  // 4. Throughput Score (0 - 100)
  // 40+ Mbps = 100
  const throughputScore = Math.min(100, Math.max(0, downloadMbps * 2.5));

  // Weighted Composite Formula
  const rawScore = (
    latencyScore * 0.30 +
    lossScore * 0.30 +
    jitterScore * 0.15 +
    throughputScore * 0.25
  );

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Grade classification
  let grade: QoSGrade = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  // Degradation Assessment
  const degradationReasons: string[] = [];
  if (pingAvg > 150) degradationReasons.push(`Latencia excesiva (${pingAvg}ms > 150ms)`);
  if (packetLoss > 5) degradationReasons.push(`Pérdida de paquetes crítica (${packetLoss}% > 5%)`);
  if (jitter > 35) degradationReasons.push(`Jitter inestable (${jitter}ms > 35ms)`);
  if (downloadMbps < 2.0 && downloadMbps > 0) degradationReasons.push(`Throughput bajo (${downloadMbps} Mbps < 2.0 Mbps)`);
  if (params.signalDbm && params.signalDbm < -115) degradationReasons.push(`Señal celular muy débil (${params.signalDbm} dBm)`);

  const isDegraded = degradationReasons.length > 0 || score < 50;

  return {
    score,
    grade,
    isDegraded,
    degradationReasons
  };
}

/**
 * Checks whether current conditions breach configured user thresholds
 */
export function checkThresholdBreach(
  record: {
    pingAvg: number;
    jitter: number;
    packetLoss: number;
    downloadMbps: number;
    signalDbm: number;
  },
  thresholds: AppSettings['degradationAlertThresholds']
): { breached: boolean; summary: string } {
  const issues: string[] = [];

  if (record.pingAvg > thresholds.maxPingMs) {
    issues.push(`Ping ${record.pingAvg}ms (límite: ${thresholds.maxPingMs}ms)`);
  }
  if (record.jitter > thresholds.maxJitterMs) {
    issues.push(`Jitter ${record.jitter}ms (límite: ${thresholds.maxJitterMs}ms)`);
  }
  if (record.packetLoss > thresholds.maxPacketLossPercent) {
    issues.push(`Pérdida ${record.packetLoss}% (límite: ${thresholds.maxPacketLossPercent}%)`);
  }
  if (record.downloadMbps > 0 && record.downloadMbps < thresholds.minDownloadMbps) {
    issues.push(`Velocidad ${record.downloadMbps}Mbps (mín: ${thresholds.minDownloadMbps}Mbps)`);
  }
  if (record.signalDbm < thresholds.minSignalDbm) {
    issues.push(`Señal ${record.signalDbm}dBm (mín: ${thresholds.minSignalDbm}dBm)`);
  }

  return {
    breached: issues.length > 0,
    summary: issues.join(', ')
  };
}
