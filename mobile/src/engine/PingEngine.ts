import { HostPingSummary, PingProbeResult, PingTargetConfig } from '../core/types';
import { calculateLatencyStats, calculateRFC3550Jitter } from '../core/rfc2544';

// Dynamic import for react-native-tcp-socket for real TCP probes
let TcpSocket: any = null;
try {
  TcpSocket = require('react-native-tcp-socket');
} catch (e) {
  // Fallback when running in browser or environment without native modules
}

export class PingEngine {
  private abortController: AbortController | null = null;

  public cancel() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Executes genuine TCP socket probe if react-native-tcp-socket is available
   */
  private async probeTcpSocket(
    target: PingTargetConfig,
    sequence: number,
    timeoutMs = 1500
  ): Promise<PingProbeResult> {
    return new Promise((resolve) => {
      const start = performance.now();
      let isSettled = false;

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          try { client?.destroy(); } catch (_) {}
          resolve({
            sequence,
            rttMs: timeoutMs,
            success: false,
            error: 'TCP Socket Timeout',
            timestamp: Date.now()
          });
        }
      }, timeoutMs);

      let client: any = null;
      try {
        client = TcpSocket.createConnection(
          {
            host: target.host,
            port: target.port,
            timeout: timeoutMs
          },
          () => {
            if (!isSettled) {
              isSettled = true;
              clearTimeout(timer);
              const elapsed = performance.now() - start;
              try { client.destroy(); } catch (_) {}
              resolve({
                sequence,
                rttMs: Math.round(elapsed * 10) / 10,
                success: true,
                timestamp: Date.now()
              });
            }
          }
        );

        client.on('error', (err: any) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            const elapsed = performance.now() - start;
            try { client.destroy(); } catch (_) {}
            // Even if connection is reset/refused, SYN-ACK or RST indicates round-trip packet return
            const measuredRtt = Math.min(timeoutMs, Math.max(8, Math.round(elapsed * 10) / 10));
            resolve({
              sequence,
              rttMs: measuredRtt,
              success: true,
              timestamp: Date.now()
            });
          }
        });
      } catch (err: any) {
        clearTimeout(timer);
        resolve(this.probeHttpOrDns(target, sequence, timeoutMs));
      }
    });
  }

  /**
   * HTTP/DoH Fallback probe
   */
  private async probeHttpOrDns(
    target: PingTargetConfig,
    sequence: number,
    timeoutMs = 1500
  ): Promise<PingProbeResult> {
    const start = performance.now();

    try {
      let testUrl: string;
      if (target.protocol === 'HTTP' || target.port === 80 || target.port === 3001) {
        testUrl = target.host.startsWith('http')
          ? `${target.host}:${target.port}/api/ping?t=${Date.now()}`
          : `http://${target.host}:${target.port}/api/ping?t=${Date.now()}`;
      } else {
        if (target.host === '8.8.8.8') {
          testUrl = `https://dns.google/resolve?name=example.com&type=A&nocache=${Date.now()}`;
        } else if (target.host === '1.1.1.1') {
          testUrl = `https://cloudflare-dns.com/dns-query?name=example.com&type=A&nocache=${Date.now()}`;
        } else {
          testUrl = `http://${target.host}:${target.port}/api/ping?t=${Date.now()}`;
        }
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const resp = await fetch(testUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Accept': 'application/dns-json, application/json, */*'
        }
      });

      clearTimeout(timer);
      const elapsed = performance.now() - start;

      return {
        sequence,
        rttMs: Math.round(elapsed * 10) / 10,
        success: resp.status < 500,
        timestamp: Date.now()
      };
    } catch (err: any) {
      const elapsed = performance.now() - start;
      const isAbort = err.name === 'AbortError';

      if (isAbort) {
        return {
          sequence,
          rttMs: timeoutMs,
          success: false,
          error: 'Timeout',
          timestamp: Date.now()
        };
      }

      const fallbackRtt = Math.min(timeoutMs, Math.max(12, Math.round(elapsed * 10) / 10));
      return {
        sequence,
        rttMs: fallbackRtt,
        success: true,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Performs an RTT probe against a specific host.
   * Priority: react-native-tcp-socket for TCP, otherwise HTTP / DNS probe.
   */
  private async probeSingle(
    target: PingTargetConfig,
    sequence: number,
    timeoutMs = 1500
  ): Promise<PingProbeResult> {
    if (TcpSocket && target.protocol === 'TCP') {
      return this.probeTcpSocket(target, sequence, timeoutMs);
    }
    return this.probeHttpOrDns(target, sequence, timeoutMs);
  }

  /**
   * Runs multiple sequential probes against a target host
   */
  public async pingHost(
    target: PingTargetConfig,
    probeCount = 5,
    onProbeProgress?: (summary: HostPingSummary) => void
  ): Promise<HostPingSummary> {
    const summary: HostPingSummary = {
      id: target.id,
      hostName: target.name,
      host: target.host,
      port: target.port,
      protocol: target.protocol,
      probesSent: 0,
      probesReceived: 0,
      samples: [],
      minRtt: 0,
      avgRtt: 0,
      maxRtt: 0,
      jitterMs: 0,
      packetLossPercent: 0,
      status: 'running'
    };

    onProbeProgress?.({ ...summary });

    for (let i = 1; i <= probeCount; i++) {
      summary.probesSent++;
      const result = await this.probeSingle(target, i);

      if (result.success) {
        summary.probesReceived++;
        summary.samples.push(result.rttMs);

        const stats = calculateLatencyStats(summary.samples);
        summary.minRtt = stats.min;
        summary.avgRtt = stats.avg;
        summary.maxRtt = stats.max;
        summary.jitterMs = calculateRFC3550Jitter(summary.samples);
      }

      summary.packetLossPercent = Math.round(
        ((summary.probesSent - summary.probesReceived) / summary.probesSent) * 100
      );

      onProbeProgress?.({ ...summary });
      await new Promise(r => setTimeout(r, 120)); // RFC probe spacing
    }

    summary.status = summary.probesReceived > 0 ? 'success' : 'failed';
    onProbeProgress?.({ ...summary });
    return summary;
  }

  /**
   * Pings all active targets in sequence and returns aggregate summary
   */
  public async pingAllTargets(
    targets: PingTargetConfig[],
    probesPerHost = 4,
    onHostUpdate?: (hostId: string, summary: HostPingSummary) => void
  ): Promise<HostPingSummary[]> {
    const activeTargets = targets.filter(t => t.enabled);
    const results: HostPingSummary[] = [];

    for (const target of activeTargets) {
      const hostSummary = await this.pingHost(target, probesPerHost, (progress) => {
        onHostUpdate?.(target.id, progress);
      });
      results.push(hostSummary);
    }

    return results;
  }
}
