import { formatBytes, formatCount, formatDuration, formatPercent, formatQps } from '@/core/format';
import type {
  Constants,
  DerivedMetrics,
  Implication,
  ImplicationCategory,
  ImplicationSeverity,
  Inputs,
} from '@/domain/types';

export interface RuleContext {
  inputs: Inputs;
  derived: DerivedMetrics;
  constants: Constants;
}

interface RuleFinding {
  message: string;
  trigger: string;
}

interface Rule {
  id: string;
  category: ImplicationCategory;
  severity: ImplicationSeverity;
  evaluate: (ctx: RuleContext) => RuleFinding | null;
}

const rules: Rule[] = [
  {
    id: 'storage-exceeds-memory',
    category: 'storage',
    severity: 'warning',
    evaluate: ({ derived, constants }) =>
      derived.totalStorageBytes > constants.infrastructure.cacheRamBytes
        ? {
            message: `Retained data (${formatBytes(derived.totalStorageBytes)}) exceeds the assumed ${formatBytes(constants.infrastructure.cacheRamBytes)} memory budget — primary data belongs on disk or object storage, not in RAM.`,
            trigger: 'total storage > RAM budget',
          }
        : null,
  },
  {
    id: 'read-scale',
    category: 'scaling',
    severity: 'warning',
    evaluate: ({ derived, constants }) =>
      derived.peakReadQps > constants.infrastructure.singleNodeReadQps
        ? {
            message: `Peak read load (${formatQps(derived.peakReadQps)}) exceeds a single relational node (~${formatQps(constants.infrastructure.singleNodeReadQps)}) — add read replicas, caching, or shard reads.`,
            trigger: 'peak read QPS > single-node read capacity',
          }
        : null,
  },
  {
    id: 'write-scale',
    category: 'scaling',
    severity: 'warning',
    evaluate: ({ derived, constants }) =>
      derived.peakWriteQps > constants.infrastructure.singleNodeWriteQps
        ? {
            message: `Peak write load (${formatQps(derived.peakWriteQps)}) exceeds a single primary (~${formatQps(constants.infrastructure.singleNodeWriteQps)}) — plan write sharding or a distributed store.`,
            trigger: 'peak write QPS > single-node write capacity',
          }
        : null,
  },
  {
    id: 'network-ingress',
    category: 'network',
    severity: 'warning',
    evaluate: ({ derived, constants }) =>
      derived.ingressBytesPerSecond > constants.infrastructure.nicBytesPerSecond
        ? {
            message: `Peak ingress (${formatBytes(derived.ingressBytesPerSecond)}/s) exceeds a ${formatBytes(constants.infrastructure.nicBytesPerSecond)}/s NIC — provision more bandwidth or a load-balanced write path.`,
            trigger: 'peak ingress > NIC capacity',
          }
        : null,
  },
  {
    id: 'network-egress',
    category: 'network',
    severity: 'warning',
    evaluate: ({ derived, constants }) =>
      derived.egressBytesPerSecond > constants.infrastructure.nicBytesPerSecond
        ? {
            message: `Peak egress (${formatBytes(derived.egressBytesPerSecond)}/s) exceeds a ${formatBytes(constants.infrastructure.nicBytesPerSecond)}/s NIC — put a CDN in front and scale network capacity.`,
            trigger: 'peak egress > NIC capacity',
          }
        : null,
  },
  {
    id: 'cache-hot-set',
    category: 'caching',
    severity: 'warning',
    evaluate: ({ derived, constants }) =>
      derived.cacheHotSetBytes > constants.infrastructure.cacheRamBytes
        ? {
            message: `Working hot set (${formatBytes(derived.cacheHotSetBytes)}) exceeds the ${formatBytes(constants.infrastructure.cacheRamBytes)} cache budget — shard the cache across nodes.`,
            trigger: 'hot working set > cache RAM',
          }
        : null,
  },
  {
    id: 'retention-tiering',
    category: 'storage',
    severity: 'info',
    evaluate: ({ inputs }) =>
      inputs.dataShape.retentionDays > 365
        ? {
            message: `Retention of ${inputs.dataShape.retentionDays} days suggests moving aged data to cheaper tiered or object storage.`,
            trigger: 'retention > 1 year',
          }
        : null,
  },
  {
    id: 'availability-redundancy',
    category: 'redundancy',
    severity: 'warning',
    evaluate: ({ inputs, derived }) =>
      inputs.nonFunctional.availabilityTarget >= 0.9999
        ? {
            message: `A ${formatPercent(inputs.nonFunctional.availabilityTarget)} target allows only ${formatDuration(derived.allowedDowntimeSecondsPerYear)} downtime per year — requires multi-AZ redundancy and automated failover.`,
            trigger: 'availability target >= 99.99%',
          }
        : null,
  },
  {
    id: 'growth-outlook',
    category: 'growth',
    severity: 'info',
    evaluate: ({ inputs, derived }) =>
      inputs.nonFunctional.monthlyGrowthRate > 0
        ? {
            message: `At ${formatPercent(inputs.nonFunctional.monthlyGrowthRate)} monthly growth, expect ~${formatCount(derived.projectedDailyActiveUsers12mo)} DAU and ~${formatBytes(derived.projectedStorage12moBytes)} stored within 12 months.`,
            trigger: 'positive monthly growth rate',
          }
        : null,
  },
];

export function deriveImplications(ctx: RuleContext): Implication[] {
  const implications: Implication[] = [];
  for (const rule of rules) {
    const finding = rule.evaluate(ctx);
    if (finding) {
      implications.push({
        id: rule.id,
        category: rule.category,
        severity: rule.severity,
        message: finding.message,
        trigger: finding.trigger,
      });
    }
  }
  return implications;
}
