import { NextRequest } from "next/server";
import { proxyForja } from "@/lib/serverApi";
type Ctx = { params: Promise<{ projectId: string }> };
export async function GET(request: NextRequest, ctx: Ctx) {
  const { projectId } = await ctx.params;
  if (!/^\d+$/.test(projectId)) return Response.json({message:"ID inválido"},{status:400});
  return proxyForja(request, `/project/${projectId}/ethics`, "GET");
}
export async function PUT(request: NextRequest, ctx: Ctx) {
  const { projectId } = await ctx.params;
  if (!/^\d+$/.test(projectId)) return Response.json({message:"ID inválido"},{status:400});
  return proxyForja(request, `/project/${projectId}/ethics`, "PUT");
}
