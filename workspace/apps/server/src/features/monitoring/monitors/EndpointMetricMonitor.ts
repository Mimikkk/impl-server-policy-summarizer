import type { EndpointMetrics } from "../resources/EndpointMetrics.ts";

export class EndpointMetricMonitor {
  static from(
    cacheSuccessCount: number,
    cacheFailureCount: number,
    successCount: number,
    failureCount: number,
    timesMs: number[],
    lastUsedTs: number,
  ): EndpointMetricMonitor {
    return new EndpointMetricMonitor(
      cacheSuccessCount,
      cacheFailureCount,
      successCount,
      failureCount,
      timesMs,
      lastUsedTs,
    );
  }

  static empty(): EndpointMetricMonitor {
    return EndpointMetricMonitor.from(0, 0, 0, 0, [], Date.now());
  }

  private constructor(
    public cacheSuccessCount: number,
    public cacheFailureCount: number,
    public successCount: number,
    public failureCount: number,
    public timesMs: number[],
    public lastUsedTs: number,
  ) {}

  recordCache(isSuccess: boolean) {
    if (isSuccess) {
      this.cacheSuccessCount++;
    } else {
      this.cacheFailureCount++;
    }
  }

  recordRequest(isSuccess: boolean, timeMs: number) {
    if (isSuccess) {
      this.successCount++;
    } else {
      this.failureCount++;
    }

    if (this.timesMs.length > 100) {
      this.timesMs.shift();
    }

    this.timesMs.push(timeMs);
    this.lastUsedTs = Date.now();
  }

  metrics(): EndpointMetrics {
    const { cacheSuccessCount, cacheFailureCount, successCount, failureCount, timesMs, lastUsedTs } = this;
    const cacheRequestTotal = cacheSuccessCount + cacheFailureCount;

    return {
      cacheSuccessCount,
      cacheFailureCount,
      cacheSuccessRatio: cacheRequestTotal > 0 ? cacheSuccessCount / cacheRequestTotal : 0,
      cacheFailureRatio: cacheRequestTotal > 0 ? cacheFailureCount / cacheRequestTotal : 0,
      cacheRequestTotal,
      successCount,
      failureCount,
      requestCount: successCount + failureCount,
      timesMs: [...timesMs],
      avgTimeMs: timesMs.length > 0 ? timesMs.reduce((sum, time) => sum + time, 0) / timesMs.length : 0,
      lastUsedTs,
    };
  }
}
