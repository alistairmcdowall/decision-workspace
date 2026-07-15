import { NextResponse } from "next/server";
import { pragmatist } from "../../engine/pragmatist";
import { lexusTestContext } from "../../engine/testFixtures";

export async function GET() {
  const result = await pragmatist(lexusTestContext);
  return NextResponse.json(result.panel.pragmatist ?? []);
}