import { NextRequest } from "next/server";
import { proxyForja } from "@/lib/serverApi";
type Ctx = { params: Promise<{ projectId: string }> };
export async function GET(request: NextRequest, context: Ctx) {
  const {projectId}=await context.params;
  if(!/^\d+$/.test(projectId))return Response.json({message:"ID inválido"},{status:400});
  return proxyForja(request,`/project/${projectId}`,"GET");
}
export async function PATCH(request: NextRequest, context: Ctx) {
  const {projectId}=await context.params;
  if(!/^\d+$/.test(projectId))return Response.json({message:"ID inválido"},{status:400});
  return proxyForja(request,`/project/${projectId}`,"PATCH");
}
