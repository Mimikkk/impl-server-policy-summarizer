import type { GlobalMetrics } from "../resources/GlobalMetrics.ts";

export class GlobalMetricMonitor {
  static from(
    cacheSuccessCount: number,
    cacheFailureCount: number,
    successCount: number,
    failureCount: number,
    timesMs: number[],
  ): GlobalMetricMonitor {
    return new GlobalMetricMonitor(
      cacheSuccessCount,
      cacheFailureCount,
      successCount,
      failureCount,
      timesMs,
    );
  }

  static empty(): GlobalMetricMonitor {
    return GlobalMetricMonitor.from(0, 0, 0, 0, []);
  }

  private constructor(
    public cacheSuccessCount: number,
    public cacheFailureCount: number,
    public successCount: number,
    public failureCount: number,
    public timesMs: number[],
  ) {}

  clear(): void {
    this.cacheSuccessCount = 0;
    this.cacheFailureCount = 0;
    this.successCount = 0;
    this.failureCount = 0;
    this.timesMs = [];
  }

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

    if (this.timesMs.length > 1000) {
      this.timesMs.shift();
    }

    this.timesMs.push(timeMs);
  }

  metrics(): GlobalMetrics {
    const { cacheSuccessCount, cacheFailureCount, successCount, failureCount, timesMs } = this;

    return {
      cacheSuccessCount,
      cacheFailureCount,
      cacheSuccessRatio: cacheSuccessCount / (cacheSuccessCount + cacheFailureCount),
      cacheFailureRatio: cacheFailureCount / (cacheSuccessCount + cacheFailureCount),
      cacheRequestTotal: cacheSuccessCount + cacheFailureCount,
      successCount,
      failureCount,
      requestCount: successCount + failureCount,
      timesMs: [...timesMs],
      avgTimeMs: timesMs.length > 0 ? timesMs.reduce((sum, time) => sum + time, 0) / timesMs.length : 0,
    };
  }
}
