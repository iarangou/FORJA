import {NextRequest,NextResponse} from "next/server";
import {proxyForja} from "@/lib/serverApi";
type Ctx={params:Promise<{projectId:string;periodId:string;evidenceId:string}>};
export async function POST(req:NextRequest,ctx:Ctx){
  const {projectId,periodId,evidenceId}=await ctx.params;
  if(![projectId,periodId,evidenceId].every(v=>/^\d+$/.test(v)))
    return NextResponse.json({message:"ID inválido"},{status:400});
  return proxyForja(req,`/project/${projectId}/periods/${periodId}/evidences/${evidenceId}/review`,"POST");
}
