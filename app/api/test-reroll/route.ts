import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { paths } from "../../engine/paths";
import { establishingShots } from "../../engine/establishingShots";
import { singaporeRelocationTestContext } from "../../engine/testFixtures";
import { saveTestOutput } from "../../engine/testLogger";

export async function GET() {
  let context = await reframer(singaporeRelocationTestContext);
  context = await landscape(context);

  const [guardianResult, pragmatistResult, empathiserResult] = await Promise.all([
    guardian(context),
    pragmatist(context),
    empathiser(context),
  ]);

  context = {
    ...context,
    panel: {
      ...guardianResult.panel,
      ...pragmatistResult.panel,
      ...empathiserResult.panel,
    },
  };

  context = await auditor(context);
  context = await paths(context);

  // First attempt - no previous attempts to avoid.
  const firstAttempt = await establishingShots(context);

  // Second attempt - pass the first attempt's shots back in, asking for something different.
  const previousAttempts = (firstAttempt.establishingShots ?? []).map((s) => ({
    pathId: s.pathId,
    shot: s.shot,
  }));
  const secondAttempt = await establishingShots(context, previousAttempts);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Reroll test</title></head>
<body style="font-family:-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;background:#f8fafc;">
  <h1>Reroll test - Singapore relocation</h1>
  <h2>Attempt 1</h2>
  ${(firstAttempt.establishingShots ?? [])
    .map(
      (s) => `<div style="border:1px solid #cbd5e1;border-radius:10px;padding:14px;margin-bottom:12px;background:#fff;">
        <strong>Path ${s.pathId} - ${s.title}</strong><p>${s.shot}</p></div>`
    )
    .join("")}
  <h2>Attempt 2 (told to avoid attempt 1)</h2>
  ${(secondAttempt.establishingShots ?? [])
    .map(
      (s) => `<div style="border:1px solid #34d399;border-radius:10px;padding:14px;margin-bottom:12px;background:#fff;">
        <strong>Path ${s.pathId} - ${s.title}</strong><p>${s.shot}</p></div>`
    )
    .join("")}
</body>
</html>`;

  saveTestOutput("reroll-test", { ...context, establishingShots: secondAttempt.establishingShots } as any);

  return new Response(html, { headers: { "content-type": "text/html" } });
}