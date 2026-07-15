import { NextResponse } from "next/server";
import { guardian } from "../../engine/guardian";
import { pragmatist } from "../../engine/pragmatist";
import { empathiser } from "../../engine/empathiser";
import { auditor } from "../../engine/auditor";
import { lexusTestContext } from "../../engine/testFixtures";

export async function GET() {
  let context = lexusTestContext;
  context = await guardian(context);
  context = await pragmatist(context);
  context = await empathiser(context);
  context = await auditor(context);

  return NextResponse.json(context.auditor ?? null);
}