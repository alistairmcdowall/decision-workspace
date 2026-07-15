import { NextResponse } from "next/server";
import { guardian } from "../../engine/guardian";
import { lexusTestContext } from "../../engine/testFixtures";

export async function GET() {
  const result = await guardian(lexusTestContext);
  return NextResponse.json(result.panel.guardian ?? []);
}