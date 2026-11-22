import { NextRequest } from "next/server";
import { proxyForja } from "@/lib/serverApi";
type Ctx = { params: Promise<{ projectId: string; periodId: string }> };
export async function POST(request: NextRequest, ctx: Ctx) {
  const { projectId, periodId } = await ctx.params;
  if (!/^\d+$/.test(projectId) || !/^\d+$/.test(periodId)) {
    return Response.json({message:"ID inválido"},{status:400});
  }
  return proxyForja(request, `/project/${projectId}/periods/${periodId}/review`, "POST");
}
