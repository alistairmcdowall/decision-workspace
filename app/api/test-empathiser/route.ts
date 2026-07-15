import { NextResponse } from "next/server";
import { empathiser } from "../../engine/empathiser";
import { lexusTestContext } from "../../engine/testFixtures";

export async function GET() {
  const result = await empathiser(lexusTestContext);
  return NextResponse.json(result.panel.empathiser ?? []);
}