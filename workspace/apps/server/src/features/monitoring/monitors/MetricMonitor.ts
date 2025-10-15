import { DefaultMap } from "@utilities/DefaultMap.ts";
import type { EndpointMetrics } from "../resources/EndpointMetrics.ts";
import type { GlobalMetrics } from "../resources/GlobalMetrics.ts";
import type { Metrics } from "../resources/Metrics.ts";
import { EndpointMetricMonitor } from "./EndpointMetricMonitor.ts";
import { GlobalMetricMonitor } from "./GlobalMetricMonitor.ts";

export class MetricMonitor {
  static from(
    globalMetrics: GlobalMetricMonitor,
    endpointsMetrics: DefaultMap<string, EndpointMetricMonitor>,
  ): MetricMonitor {
    return new MetricMonitor(Date.now(), globalMetrics, endpointsMetrics);
  }

  static empty(): MetricMonitor {
    return MetricMonitor.from(GlobalMetricMonitor.empty(), DefaultMap.withInitializer(EndpointMetricMonitor.empty));
  }

  private constructor(
    private startTs: number,
    private globalMetrics: GlobalMetricMonitor,
    private endpointsMetrics: DefaultMap<string, EndpointMetricMonitor>,
  ) {}

  recordCache(key: string, isSuccess: boolean): void {
    this.globalMetrics.recordCache(isSuccess);
    this.endpointsMetrics.ensure(key).recordCache(isSuccess);
  }

  recordRequest(key: string, isSuccess: boolean, timeMs: number): void {
    this.globalMetrics.recordRequest(isSuccess, timeMs);
    this.endpointsMetrics.ensure(key).recordRequest(isSuccess, timeMs);
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

  calculate(): Metrics {
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
