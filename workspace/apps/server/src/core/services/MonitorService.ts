export interface EndpointMetrics {
  cacheHitCount: number;
  cacheMissCount: number;
  cacheTotal: number;
  cacheHitRatio: number;
  cacheMissRatio: number;

  successCount: number;
  failureCount: number;
  total: number;

  avgTimeMs: number;
  timesMs: number[];

  lastAccessed: number;
}

export interface GlobalMetrics {
  cacheHitCount: number;
  cacheMissCount: number;
  cacheTotal: number;
  cacheHitRatio: number;
  cacheMissRatio: number;

  total: number;
  successCount: number;
  failureCount: number;

  avgTimeMs: number;
  timesMs: number[];

  uptime: number;
  timestamp: number;
}

export interface MonitorContext {
  global: GlobalMetrics;
  endpoints: Record<string, EndpointMetrics>;
}

export class MonitorService {
  static new(): MonitorService {
    return new MonitorService(
      0,
      0,
      0,
      0,
      0,
      [],
      Date.now(),
      new Map<
        string,
        Omit<EndpointMetrics, "cacheHitCount" | "cacheMissCount"> & {
          cacheHitCount: number;
          cacheMissCount: number;
          successCount: number;
          failureCount: number;
          timesMs: number[];
          lastAccessed: number;
        }
      >(),
    );
  }

  private constructor(
    private cacheHitCount: number,
    private cacheMissCount: number,
    private total: number,
    private successCount: number,
    private failureCount: number,
    private timesMs: number[],
    private startTimeMS: number,
    private endpoints: Map<string, {
      cacheHitCount: number;
      cacheMissCount: number;
      successCount: number;
      failureCount: number;
      timesMs: number[];
      lastAccessed: number;
    }>,
  ) {}

  recordCacheHit(key: string): void {
    this.cacheHitCount++;

    if (!this.endpoints.has(key)) {
      this.createEndpointMetrics(key);
    }
    this.endpoints.get(key)!.cacheHitCount++;
  }

  recordCacheMiss(key: string): void {
    this.cacheMissCount++;

    if (!this.endpoints.has(key)) {
      this.createEndpointMetrics(key);
    }
    this.endpoints.get(key)!.cacheMissCount++;
  }

  recordRequest(success: boolean, timeMs: number, key: string): void {
    this.total++;

    this.timesMs.push(timeMs);
    if (this.timesMs.length > 1000) {
      this.timesMs = this.timesMs.slice(-1000);
    }

    if (success) {
      ++this.successCount;
    } else {
      ++this.failureCount;
    }

    if (!this.endpoints.has(key)) {
      this.createEndpointMetrics(key);
    }

    const endpoint = this.endpoints.get(key)!;

    endpoint.timesMs.push(timeMs);
    if (endpoint.timesMs.length > 100) {
      endpoint.timesMs = endpoint.timesMs.slice(-100);
    }

    endpoint.lastAccessed = Date.now();

    if (success) {
      endpoint.successCount++;
    } else {
      endpoint.failureCount++;
    }
  }

  private createEndpointMetrics(endpoint: string): void {
    this.endpoints.set(endpoint, {
      cacheMissCount: 0,
      cacheHitCount: 0,
      successCount: 0,
      failureCount: 0,
      timesMs: [],
      lastAccessed: Date.now(),
    });
  }

  calculateGlobalMetrics(): GlobalMetrics {
    const total = this.cacheHitCount + this.cacheMissCount;
    const avgTimeMs = this.timesMs.length > 0
      ? this.timesMs.reduce((sum, time) => sum + time, 0) / this.timesMs.length
      : 0;

    return {
      cacheHitCount: this.cacheHitCount,
      cacheMissCount: this.cacheMissCount,
      cacheTotal: total,
      cacheHitRatio: total > 0 ? this.cacheHitCount / total : 0,
      cacheMissRatio: total > 0 ? this.cacheMissCount / total : 0,
      total: this.total,
      successCount: this.successCount,
      failureCount: this.failureCount,
      avgTimeMs: avgTimeMs,
      timesMs: [...this.timesMs],
      uptime: Date.now() - this.startTimeMS,
      timestamp: Date.now(),
    };
  }

  getEndpointMetrics(endpoint: string): EndpointMetrics | null {
    const data = this.endpoints.get(endpoint);
    if (!data) return null;

    const cacheTotal = data.cacheHitCount + data.cacheMissCount;
    const total = data.successCount + data.failureCount;
    const averageResponseTime = data.timesMs.length > 0
      ? data.timesMs.reduce((sum, time) => sum + time, 0) / data.timesMs.length
      : 0;

    return {
      cacheHitCount: data.cacheHitCount,
      cacheMissCount: data.cacheMissCount,
      cacheTotal: cacheTotal,
      cacheHitRatio: cacheTotal > 0 ? data.cacheHitCount / cacheTotal : 0,
      cacheMissRatio: cacheTotal > 0 ? data.cacheMissCount / cacheTotal : 0,

      successCount: data.successCount,
      failureCount: data.failureCount,
      total: total,

      avgTimeMs: averageResponseTime,

      timesMs: [...data.timesMs],
      lastAccessed: data.lastAccessed,
    };
  }

  getAllEndpointMetrics(): Record<string, EndpointMetrics> {
    const result: Record<string, EndpointMetrics> = {};

    for (const [endpoint, data] of this.endpoints.entries()) {
      const cacheTotal = data.cacheHitCount + data.cacheMissCount;
      const total = data.successCount + data.failureCount;
      const averageResponseTime = data.timesMs.length > 0
        ? data.timesMs.reduce((sum, time) => sum + time, 0) / data.timesMs.length
        : 0;

      result[endpoint] = {
        cacheHitCount: data.cacheHitCount,
        cacheMissCount: data.cacheMissCount,
        cacheTotal,
        cacheHitRatio: cacheTotal > 0 ? data.cacheHitCount / cacheTotal : 0,
        cacheMissRatio: cacheTotal > 0 ? data.cacheMissCount / cacheTotal : 0,

        successCount: data.successCount,
        failureCount: data.failureCount,
        total,

        avgTimeMs: averageResponseTime,
        timesMs: [...data.timesMs],
        lastAccessed: data.lastAccessed,
      };
    }

    return result;
  }

  getMonitoringData(): MonitorContext {
    return {
      global: this.calculateGlobalMetrics(),
      endpoints: this.getAllEndpointMetrics(),
    };
  }

  reset(): void {
    this.cacheHitCount = 0;
    this.cacheMissCount = 0;
    this.total = 0;
    this.successCount = 0;
    this.failureCount = 0;
    this.timesMs = [];
    this.endpoints.clear();
    this.startTimeMS = Date.now();
  }
}
