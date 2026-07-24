import { NextResponse } from "next/server";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { jagVsLexusTensionContext } from "../../engine/testFixtures";

export async function GET() {
  const [g, p, e] = await Promise.all([
    guardian(jagVsLexusTensionContext),
    pragmatist(jagVsLexusTensionContext),
    empathiser(jagVsLexusTensionContext),
  ]);

  return NextResponse.json({
    guardian: g.panel?.guardian,
    pragmatist: p.panel?.pragmatist,
    empathiser: e.panel?.empathiser,
  });
}