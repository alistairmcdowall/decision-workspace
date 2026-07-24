import { NextResponse } from "next/server";
import { reframer } from "../../engine/reframer";
import { landscape } from "../../engine/landscape";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { paths } from "../../engine/paths";
import { steelman } from "../../engine/steelman";
import type { DecisionContext } from "../../engine/types";

const jagAloneContext: DecisionContext = {
  prompt: "Should I buy a used Jaguar XJ 3.0 V6 (2013-2015)?",
  decision: { subject: "used Jaguar XJ 3.0 V6 (2013-2015)", kind: "PURCHASE" },
  facts: { userStated: { subject: "used Jaguar XJ 3.0 V6 (2013-2015)" }, assumedForSlice: {} },
  panel: {},
};

export async function GET() {
  let context = await reframer(jagAloneContext);
  context = await landscape(context);

  const [g, p, e] = await Promise.all([
    guardian(context),
    pragmatist(context),
    empathiser(context),
  ]);
  context = { ...context, panel: { ...g.panel, ...p.panel, ...e.panel } };

  context = await auditor(context);
  context = await paths(context);
  context = await steelman(context);

  return NextResponse.json({
    guardian: context.panel?.guardian,
    pragmatist: context.panel?.pragmatist,
    empathiser: context.panel?.empathiser,
    representativePaths: context.representativePaths,
    steelman: context.steelman,
  });
}