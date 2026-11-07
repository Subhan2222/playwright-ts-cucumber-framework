import type { AgentTelemetryEvent, TelemetrySink } from '../../contracts/telemetry';

/** Safe default: emits nothing and performs no network or file I/O. */
export class NoopTelemetrySink implements TelemetrySink {
  async emit(_event: AgentTelemetryEvent): Promise<void> {
    // Intentionally empty.
  }
}
