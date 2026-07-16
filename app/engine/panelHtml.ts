import type { DecisionContext } from "./types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function section(title: string, bodyHtml: string): string {
  return `
    <section style="margin-bottom:28px;">
      <h2 style="font-size:15px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin:0 0 10px 0;">${escapeHtml(title)}</h2>
      ${bodyHtml}
    </section>
  `;
}

function card(title: string, body: string): string {
  return `
    <div style="border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:10px;background:#fff;">
      <div style="font-weight:600;color:#0f172a;margin-bottom:4px;">${escapeHtml(title)}</div>
      <div style="color:#334155;line-height:1.5;">${escapeHtml(body)}</div>
    </div>
  `;
}

function list(items: string[]): string {
  if (items.length === 0) return `<p style="color:#94a3b8;">None</p>`;
  return `<ul style="margin:0;padding-left:20px;color:#334155;line-height:1.6;">${items
    .map((i) => `<li>${escapeHtml(i)}</li>`)
    .join("")}</ul>`;
}

export function renderPanelHtml(context: DecisionContext, title: string): string {
  const guardian = context.panel?.guardian ?? [];
  const pragmatist = context.panel?.pragmatist ?? [];
  const empathiser = context.panel?.empathiser ?? [];
  const aud = context.auditor;

  const readinessColor =
    aud?.readinessState === "GREEN" ? "#16a34a" : aud?.readinessState === "AMBER" ? "#d97706" : "#dc2626";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
</head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;background:#f8fafc;">
  <h1 style="font-size:22px;color:#0f172a;">${escapeHtml(title)}</h1>
  <p style="color:#64748b;font-style:italic;margin-bottom:32px;">${escapeHtml(context.prompt)}</p>

  ${section(
    "Guardian — protected values",
    guardian.map((g) => card(g.protectedValue, g.concern)).join("") || "<p>None</p>"
  )}

  ${section(
    "Pragmatist — requirements",
    list(pragmatist.map((p) => p.requirement))
  )}

  ${section(
    "Empathiser — human factors",
    list(empathiser.map((e) => e.humanFactor))
  )}

  ${
    aud
      ? section(
          "Auditor",
          `
          <div style="margin-bottom:14px;">
            <span style="display:inline-block;padding:4px 10px;border-radius:6px;background:${readinessColor};color:#fff;font-weight:600;font-size:13px;">
              ${escapeHtml(aud.readinessState)} — ${aud.readinessScore}/100
            </span>
            <span style="margin-left:10px;color:#64748b;font-size:13px;">Evidence: ${escapeHtml(aud.evidenceStrength)} · Consistency: ${escapeHtml(aud.internalConsistency)}</span>
          </div>
          <div style="font-weight:600;color:#0f172a;margin-bottom:6px;">Assumptions</div>
          ${list(aud.assumptions)}
          <div style="font-weight:600;color:#0f172a;margin:14px 0 6px 0;">Missing information</div>
          ${list(aud.missingInformation)}
          <div style="font-weight:600;color:#0f172a;margin:14px 0 6px 0;">Blocking uncertainties</div>
          ${list(aud.blockingUncertainties)}
          <div style="font-weight:600;color:#0f172a;margin:14px 0 6px 0;">Supported so far</div>
          ${list(aud.supportedConclusions.map((c) => c.finding))}
          <div style="font-weight:600;color:#0f172a;margin:14px 0 6px 0;">Not yet supported</div>
          ${list(aud.unsupportedConclusions.map((c) => c.finding))}
          `
        )
      : ""
  }
</body>
</html>`;
}

type LandscapeLike = {
  subject: string;
  commitment: string;
  decisionAxes: string[];
  resolvedUncertainties: string[];
  remainingUncertainties: string[];
  state: string;
} | undefined;

function landscapeBlock(title: string, tint: string, data: LandscapeLike): string {
  if (!data) return "";
  return `
    <div style="border:1px solid ${tint};border-radius:12px;padding:16px 18px;margin-bottom:20px;background:#fff;">
      <div style="font-weight:700;color:#0f172a;margin-bottom:2px;">${escapeHtml(title)}</div>
      <div style="font-size:12px;color:#64748b;margin-bottom:10px;">State: ${escapeHtml(data.state)}</div>
      <div style="font-weight:600;color:#0f172a;">${escapeHtml(data.subject)}</div>
      <div style="color:#334155;margin:4px 0 12px 0;">${escapeHtml(data.commitment)}</div>

      <div style="font-weight:600;color:#0f172a;font-size:13px;margin-bottom:4px;">Decision axes</div>
      ${list(data.decisionAxes)}

      <div style="font-weight:600;color:#0f172a;font-size:13px;margin:12px 0 4px 0;">Resolved</div>
      ${list(data.resolvedUncertainties)}

      <div style="font-weight:600;color:#0f172a;font-size:13px;margin:12px 0 4px 0;">Remaining</div>
      ${list(data.remainingUncertainties)}
    </div>
  `;
}

export function renderLandscapeComparisonHtml(
  handAuthored: LandscapeLike,
  generatedV1: LandscapeLike,
  generatedV2: LandscapeLike
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Landscape comparison</title>
</head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;background:#f8fafc;">
  <h1 style="font-size:22px;color:#0f172a;">Landscape - hand-authored vs. real generated</h1>
  ${landscapeBlock("Hand-authored reference (ChatGPT's worked example)", "#94a3b8", handAuthored)}
  ${landscapeBlock("Real generated V1", "#38bdf8", generatedV1)}
  ${landscapeBlock("Real generated V2 (after clarifier answer)", "#34d399", generatedV2)}
</body>
</html>`;
}

export function renderLandscapeEmotionCheckHtml(
  handAuthored: LandscapeLike,
  generatedV1: LandscapeLike,
  generatedV2: LandscapeLike,
  emotionalSignalV1: LandscapeLike,
  empathiserOutput: { humanFactor: string }[] | undefined
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Landscape / emotional-signal check</title>
</head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;background:#f8fafc;">
  <h1 style="font-size:22px;color:#0f172a;">Landscape - discipline and emotional-signal check</h1>

  ${landscapeBlock("Hand-authored reference", "#94a3b8", handAuthored)}
  ${landscapeBlock("Real V1 - no emotional signal in prompt", "#38bdf8", generatedV1)}
  ${landscapeBlock("Real V2 - after clarifier answer", "#34d399", generatedV2)}
  ${landscapeBlock("Real V1 - prompt DOES state emotional attachment (\"I've always wanted a Lexus GS\")", "#f472b6", emotionalSignalV1)}

  <div style="border:1px solid #f59e0b;border-radius:12px;padding:16px 18px;margin-bottom:20px;background:#fff;">
    <div style="font-weight:700;color:#0f172a;margin-bottom:10px;">Real Empathiser, run against the real (non-emotional) Landscape V1</div>
    ${list((empathiserOutput ?? []).map((e) => e.humanFactor))}
  </div>
</body>
</html>`;
}

export function renderEmpathiserComparisonHtml(
  bare: { humanFactor: string }[] | undefined,
  withClarifier: { humanFactor: string }[] | undefined
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Empathiser - dry decision test</title>
</head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;background:#f8fafc;">
  <h1 style="font-size:22px;color:#0f172a;">Empathiser - broadband switch (deliberately mundane)</h1>

  <div style="border:1px solid #94a3b8;border-radius:12px;padding:16px 18px;margin-bottom:20px;background:#fff;">
    <div style="font-weight:700;color:#0f172a;margin-bottom:10px;">Bare decision - no revealed preference</div>
    ${list((bare ?? []).map((e) => e.humanFactor))}
  </div>

  <div style="border:1px solid #34d399;border-radius:12px;padding:16px 18px;margin-bottom:20px;background:#fff;">
    <div style="font-weight:700;color:#0f172a;margin-bottom:10px;">With clarifier answer: "No, wouldn't stay even at matched price"</div>
    ${list((withClarifier ?? []).map((e) => e.humanFactor))}
  </div>
</body>
</html>`;
}

type PathsLike = {
  id: string;
  title: string;
  requiredConditions: string[];
  commitment: { type: string; amount: number; currency: string };
  outcome: string;
}[] | undefined;

function pathsBlock(pathsData: PathsLike): string {
  if (!pathsData || pathsData.length === 0) return "<p>No paths generated</p>";
  return pathsData
    .map(
      (p) => `
      <div style="border:1px solid #cbd5e1;border-radius:10px;padding:14px 16px;margin-bottom:10px;background:#fff;">
        <div style="font-weight:700;color:#0f172a;">Path ${escapeHtml(p.id)} - ${escapeHtml(p.title)}</div>
        <div style="font-size:13px;color:#64748b;margin:4px 0 8px 0;">Commitment: ${escapeHtml(p.commitment.type)} - ${p.commitment.amount} ${escapeHtml(p.commitment.currency)}</div>
        <div style="font-size:13px;color:#334155;margin-bottom:8px;">Outcome: ${escapeHtml(p.outcome)}</div>
        <div style="font-weight:600;font-size:13px;color:#0f172a;margin-bottom:4px;">Required conditions</div>
        ${list(p.requiredConditions)}
      </div>
    `
    )
    .join("");
}

export function renderPathsComparisonHtml(
  title1: string,
  paths1: PathsLike,
  title2: string,
  paths2: PathsLike
): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Paths comparison</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;background:#f8fafc;">
  <h1 style="font-size:22px;color:#0f172a;">Representative Paths - real generated output</h1>

  <h2 style="font-size:16px;color:#0f172a;margin-top:24px;">${escapeHtml(title1)}</h2>
  ${pathsBlock(paths1)}

  <h2 style="font-size:16px;color:#0f172a;margin-top:24px;">${escapeHtml(title2)}</h2>
  ${pathsBlock(paths2)}
</body>
</html>`;
}

function pre(label: string, content: string): string {
  return `
    <div style="margin-bottom:14px;">
      <div style="font-weight:600;color:#0f172a;font-size:13px;margin-bottom:4px;">${escapeHtml(label)}</div>
      <pre style="white-space:pre-wrap;background:#f1f5f9;border-radius:8px;padding:10px 12px;font-size:12px;color:#334155;border:1px solid #e2e8f0;">${escapeHtml(content)}</pre>
    </div>
  `;
}

export function renderFullChainHtml(
  title1: string,
  trace1: any,
  title2: string,
  trace2: any
): string {
  function traceBlock(title: string, trace: any): string {
    return `
      <div style="border:2px solid #64748b;border-radius:12px;padding:18px;margin-bottom:30px;background:#fff;">
        <h2 style="font-size:18px;color:#0f172a;margin-top:0;">${escapeHtml(title)}</h2>
        ${pre("Reframer output", JSON.stringify(trace.reframer, null, 2))}
        ${pre("Landscape output", JSON.stringify(trace.landscape, null, 2))}
        ${pre("Pragmatist output", JSON.stringify(trace.pragmatist, null, 2))}
        ${pre("EXACT user prompt sent to Paths", trace.exactPathsUserPrompt)}
        ${pre("Final Paths result", JSON.stringify(trace.finalPaths, null, 2))}
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Full chain trace</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;background:#f8fafc;">
  <h1 style="font-size:22px;color:#0f172a;">Full chain trace - every real step, exact prompts</h1>
  ${traceBlock(title1, trace1)}
  ${traceBlock(title2, trace2)}
</body>
</html>`;
}

export function renderFullChainHtml3(
  title1: string, trace1: any,
  title2: string, trace2: any,
  title3: string, trace3: any
): string {
  const base = renderFullChainHtml(title1, trace1, title2, trace2);
  const extra = base.replace(
    "</body>",
    `${
      // reuse the same block structure for the third trace
      `<div style="border:2px solid #64748b;border-radius:12px;padding:18px;margin-bottom:30px;background:#fff;">
        <h2 style="font-size:18px;color:#0f172a;margin-top:0;">${escapeHtml(title3)}</h2>
        ${pre("Reframer output", JSON.stringify(trace3.reframer, null, 2))}
        ${pre("Landscape output", JSON.stringify(trace3.landscape, null, 2))}
        ${pre("Pragmatist output", JSON.stringify(trace3.pragmatist, null, 2))}
        ${pre("EXACT user prompt sent to Paths", trace3.exactPathsUserPrompt)}
        ${pre("Final Paths result", JSON.stringify(trace3.finalPaths, null, 2))}
      </div>`
    }</body>`
  );
  return extra;
}
