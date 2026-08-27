// Unified-System-Compliance-Router.ts
// Deterministic compliance routing engine for Beast System 3.0.
// Evaluates rule sets, resolves jurisdictional compliance paths,
// enforces constitutional invariants, and routes actions through governance channels.

import {
  UnifiedSystemRegistry,
  EngineDeclaration
} from "./Unified-System-Registry-Core";

import {
  SovereignAuthorityMap,
  AuthorityResolution,
  AuthorityTier
} from "./Unified-Sovereign-Authority-Map";

export interface ComplianceRule {
  id: string;
  jurisdiction: string;
  requiredTier: AuthorityTier;
  invariants: ReadonlyArray<string>;
  route: string;
}

export interface ComplianceResult {
  ruleId: string;
  engineId: string;
  route: string;
  resolved: boolean;
  reason: string;
  timestamp: number;
}

export class ComplianceRouter {
  private rules = new Map<string, ComplianceRule>();
  private results: ComplianceResult[] = [];

  constructor(
    private readonly registry: UnifiedSystemRegistry,
    private readonly authorityMap: SovereignAuthorityMap
  ) {}

  registerRule(rule: ComplianceRule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Compliance rule already exists: ${rule.id}`);
    }
    this.rules.set(rule.id, rule);
  }

  listRules(): ReadonlyArray<ComplianceRule> {
    return Array.from(this.rules.values());
  }

  route(engineId: string, ruleId: string): ComplianceResult {
    const timestamp = Date.now();

    const engine = this.registry.listEngines().find(e => e.id === engineId);
    if (!engine) {
      return {
        ruleId,
        engineId,
        route: "",
        resolved: false,
        reason: `Engine '${engineId}' not found.`,
        timestamp
      };
    }

    const rule = this.rules.get(ruleId);
    if (!rule) {
      return {
        ruleId,
        engineId,
        route: "",
        resolved: false,
        reason: `Compliance rule '${ruleId}' not found.`,
        timestamp
      };
    }

    const resolution = this.authorityMap.resolve(
      rule.jurisdiction,
      rule.requiredTier,
      rule.invariants
    );

    if (!resolution.resolved) {
      const result: ComplianceResult = {
        ruleId,
        engineId,
        route: "",
        resolved: false,
        reason: resolution.reason,
        timestamp
      };
      this.results.push(result);
      return result;
    }

    const result: ComplianceResult = {
      ruleId,
      engineId,
      route: rule.route,
      resolved: true,
      reason: "Compliance route successfully resolved.",
      timestamp
    };

    this.results.push(result);
    return result;
  }

  listResults(): ReadonlyArray<ComplianceResult> {
    return this.results;
  }
}

// Example wiring
export function createComplianceRouter(
  reg: UnifiedSystemRegistry,
  authMap: SovereignAuthorityMap
) {
  const router = new ComplianceRouter(reg, authMap);

  router.registerRule({
    id: "COMP.TRAUMA.CORE",
    jurisdiction: "JURIS.TRAUMA",
    requiredTier: "sovereign",
    invariants: ["INV.TRAUMA.PREVENT", "INV.SAFETY.CORE"],
    route: "MINISTRY.WELLBEING → MINISTRY.COMPLIANCE → LEDGER"
  });

  router.registerRule({
    id: "COMP.COMPLIANCE.CORE",
    jurisdiction: "JURIS.COMPLIANCE",
    requiredTier: "system",
    invariants: ["INV.COMPLIANCE.CORE"],
    route: "MINISTRY.COMPLIANCE → LEDGER"
  });

  return router;
}
