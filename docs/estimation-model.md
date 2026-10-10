# Estimation model

How BOEE turns assumptions into numbers. All calculations live in `src/core/estimate.ts`;
implications in `src/core/rules.ts`. Full precision is kept internally; rounding happens
only in `src/core/format.ts` for display.

## Units

Storage and network use **decimal SI units**: 1 KB = 1,000 bytes, 1 MB = 1,000,000 bytes.
This matches cloud billing for disk and bandwidth. Availability is stored as a fraction
(0.999) and displayed as a percentage with enough decimals to tell 99.999% from 100%.
Growth is stored as a monthly fraction (0.05) and displayed as a percentage.

## Throughput

- Daily ops = DAU × actions/user/day, split by the read:write ratio R as
  reads = ops × R/(1+R), writes = ops × 1/(1+R). A ratio of 0 means all writes.
- Average QPS = ops/day ÷ 86,400. Peak QPS = average × peak multiplier.
- **Server capacity** = ceil(peak total QPS ÷ per-server QPS), minimum 1. This is a
  throughput estimate only: it says nothing about redundancy, failover, CPU, memory,
  or dependencies. High availability targets are addressed by a separate implication.

## Storage model

Four distinct quantities; replication is applied exactly once, to new data:

- **Logical storage** = objects written/day × object size. Unique application data.
- **Physical storage** = logical × replication factor. What you provision.
- **Retained storage** = physical/day × retention days. What accumulates in the window.
- **Storage overhead** (indexes, metadata, compression): not modeled; assumed negligible
  for envelope math. No hidden multipliers exist in the formulas.

Annual storage = physical/day × 365. Ingress/egress are peak client-facing traffic
(objects/day × object size × peak ÷ 86,400); internal replication traffic is excluded.

## Growth projection

DAU compounds monthly: DAU(n) = DAU × (1 + growth)^n.

Projected 12-month storage sums each month's new replicated data, grown compoundingly,
weighted by the fraction of that month still inside the retention window at month 12
(months older than the retention period contribute nothing). With zero growth and full
retention this equals annual storage exactly.

## Cache and availability

- **Cache hot set** = daily read bytes × hot-working-set fraction (default 20%, editable
  in Constants). An 80/20 heuristic for the frequently read subset; excludes keys and
  metadata and must not be read as a sizing requirement.
- **Allowed downtime/year** = (1 − availability) × 31,536,000 s (365-day year).

## Implications

Each rule compares unrounded derived values against inputs/constants and reports its
trigger. Warnings flag exceeded single-node, NIC, cache, memory, or redundancy
thresholds; info notes cover retention tiering and growth outlook. Recommendations
describe likely next steps, never guarantees: zones, replicas, or tiers alone do not
promise a given availability target.
