import fs from "fs";
import path from "path";
import type { DecisionContext } from "./types";

function mdList(items: string[] | undefined): string {
  if (!items || items.length === 0) return "_none_\n";
  return items.map((i) => `- ${i}`).join("\n") + "\n";
}

export function contextToMarkdown(context: DecisionContext, testName: string): string {
  const lines: string[] = [];
  lines.push(`# Test: ${testName}`);
  lines.push(`\nGenerated: ${new Date().toISOString()}\n`);
  lines.push(`**Prompt:** ${context.prompt}\n`);

  if (context.reframer) {
    lines.push(`## Reframer`);
    lines.push(`- Status: ${context.reframer.status}`);
    lines.push(`- Governing objective: ${context.reframer.governingObjective}`);
    lines.push(`- Route: ${context.reframer.route}`);
    if (context.reframer.suggestedReframe) lines.push(`- Suggested reframe: ${context.reframer.suggestedReframe}`);
    if (context.reframer.clarifyOptions) lines.push(`- Clarify options:\n${mdList(context.reframer.clarifyOptions)}`);
    lines.push("");
  }

  const landscape = context.landscape?.v2 ?? context.landscape?.v1;
  if (landscape) {
    lines.push(`## Landscape (${context.landscape?.v2 ? "V2" : "V1"})`);
    lines.push(`- Subject: ${landscape.subject}`);
    lines.push(`- Commitment: ${landscape.commitment}`);
    lines.push(`- Decision axes:\n${mdList(landscape.decisionAxes)}`);
    lines.push(`- Resolved:\n${mdList(landscape.resolvedUncertainties)}`);
    lines.push(`- Remaining:\n${mdList(landscape.remainingUncertainties)}`);
    lines.push("");
  }

  if (context.panel?.guardian || context.panel?.pragmatist || context.panel?.empathiser) {
    lines.push(`## Reasoning Panel`);
    if (context.panel.guardian) {
      lines.push(`### Guardian`);
      context.panel.guardian.forEach((g) => lines.push(`- **${g.protectedValue}**: ${g.concern}`));
      lines.push("");
    }
    if (context.panel.pragmatist) {
      lines.push(`### Pragmatist`);
      context.panel.pragmatist.forEach((p) => lines.push(`- ${p.requirement}`));
      lines.push("");
    }
    if (context.panel.empathiser) {
      lines.push(`### Empathiser`);
      context.panel.empathiser.forEach((e) => lines.push(`- ${e.humanFactor}`));
      lines.push("");
    }
  }

  if (context.auditor) {
    const a = context.auditor;
    lines.push(`## Auditor`);
    lines.push(`- Readiness: ${a.readinessState} (${a.readinessScore}/100)`);
    lines.push(`- Evidence strength: ${a.evidenceStrength}`);
    lines.push(`- Consistency: ${a.internalConsistency}`);
    lines.push(`- Assumptions:\n${mdList(a.assumptions)}`);
    lines.push(`- Missing information:\n${mdList(a.missingInformation)}`);
    lines.push(`- Blocking uncertainties:\n${mdList(a.blockingUncertainties)}`);
    lines.push(`- Supported:\n${mdList(a.supportedConclusions.map((c) => c.finding))}`);
    lines.push(`- Unsupported:\n${mdList(a.unsupportedConclusions.map((c) => c.finding))}`);
    lines.push("");
  }

  if (context.representativePaths) {
    lines.push(`## Representative Paths`);
    context.representativePaths.forEach((p) => {
      lines.push(`### Path ${p.id} - ${p.title}`);
      lines.push(`- Commitment: ${p.commitment.type}, ${p.commitment.amount} ${p.commitment.currency}`);
      lines.push(`- Outcome: ${p.outcome}`);
      lines.push(`- Required conditions:\n${mdList(p.requiredConditions)}`);
      lines.push("");
    });
  }

  if (context.establishingShots) {
    lines.push(`## Establishing Shots`);
    context.establishingShots.forEach((s) => {
      lines.push(`### Path ${s.pathId}${s.title ? " - " + s.title : ""}`);
      lines.push(`${s.shot}\n`);
    });
  }

  if (context.steelman) {
    lines.push(`## Steelman`);
    context.steelman.forEach((s) => {
      lines.push(`### Path ${s.pathId} - ${s.objective}`);
      lines.push(`${s.case}\n`);
      lines.push(`Supporting conditions:\n${mdList(s.supportingConditions)}`);
    });
  }

  return lines.join("\n");
}

export function saveTestOutput(testName: string, context: DecisionContext): string {
  const dir = path.join(process.cwd(), "test-logs");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${testName}_${timestamp}.md`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, contextToMarkdown(context, testName), "utf-8");

  return filepath;
}