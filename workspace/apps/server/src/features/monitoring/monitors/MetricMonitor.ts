import { MonitorMetrics } from "@services/MonitorService.ts";
import { EndpointMetrics } from "../resources/EndpointMetrics.ts";
import { GlobalMetrics } from "../resources/GlobalMetrics.ts";
import { EndpointMetricMonitor } from "./EndpointMetricMonitor.ts";
import { GlobalMetricMonitor } from "./GlobalMetricMonitor.ts";

export class DefaultMap<K, V> extends Map<K, V> {
  static new<K, V>(fn: () => V): DefaultMap<K, V> {
    return new DefaultMap(fn);
  }

  private constructor(private readonly fn: () => V) {
    super();
  }

  override get(key: K): V {
    const value = super.get(key);

    if (!value) {
      const newValue = this.fn();
      this.set(key, newValue);
      return newValue;
    }

    return value;
  }
}

export class MetricMonitor {
  static from(
    globalMetrics: GlobalMetricMonitor,
    endpointsMetrics: DefaultMap<string, EndpointMetricMonitor>,
  ): MetricMonitor {
    return new MetricMonitor(Date.now(), globalMetrics, endpointsMetrics);
  }

  static empty(): MetricMonitor {
    return MetricMonitor.from(GlobalMetricMonitor.empty(), DefaultMap.new(EndpointMetricMonitor.empty));
  }

  private constructor(
    private startTs: number,
    private globalMetrics: GlobalMetricMonitor,
    private endpointsMetrics: DefaultMap<string, EndpointMetricMonitor>,
  ) {}

  recordCache(key: string, isSuccess: boolean): void {
    this.globalMetrics.recordCache(isSuccess);
    this.endpointsMetrics.get(key).recordCache(isSuccess);
  }

  recordRequest(key: string, isSuccess: boolean, timeMs: number): void {
    this.globalMetrics.recordRequest(isSuccess, timeMs);
    this.endpointsMetrics.get(key).recordRequest(isSuccess, timeMs);
  }

  calculateGlobalMetrics(): GlobalMetrics {
    return this.globalMetrics.metrics();
  }

  calculateEndpointMetrics(key: string): EndpointMetrics | undefined {
    return this.endpointsMetrics.get(key)?.metrics();
  }

  calculateEndpointsMetrics(): Record<string, EndpointMetrics> {
    return Object.fromEntries(this.endpointsMetrics.entries().map(([key, metrics]) => [key, metrics.metrics()]));
  }

  calculate(): MonitorMetrics {
    return {
      startTs: this.startTs,
      uptimeMs: Date.now() - this.startTs,
      global: this.calculateGlobalMetrics(),
      endpoints: this.calculateEndpointsMetrics(),
    };
  }

  reset(): void {
    this.endpointsMetrics.clear();
    this.globalMetrics.clear();
    this.startTs = Date.now();
  }
}
