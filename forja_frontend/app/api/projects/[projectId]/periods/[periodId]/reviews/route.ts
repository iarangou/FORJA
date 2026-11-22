import { NextRequest } from "next/server";
import { proxyForja } from "@/lib/serverApi";
type Ctx = { params: Promise<{ projectId: string;periodId:string }> };
export async function GET(request: NextRequest, context: Ctx) {
  const {projectId,periodId}=await context.params;
  if(!/^\d+$/.test(projectId)||!/^\d+$/.test(periodId))return Response.json({message:"ID inválido"},{status:400});
  return proxyForja(request,`/project/${projectId}/periods/${periodId}/reviews`,"GET");
}
