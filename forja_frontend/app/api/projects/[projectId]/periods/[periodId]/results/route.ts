import {NextRequest,NextResponse} from "next/server";
import {proxyForja} from "@/lib/serverApi";
type Ctx={params:Promise<{projectId:string;periodId:string}>};
export async function PUT(req:NextRequest,ctx:Ctx){
  const {projectId,periodId}=await ctx.params;
  if(![projectId,periodId].every(id=>/^\d+$/.test(id)))
    return NextResponse.json({message:"ID inválido"},{status:400});
  return proxyForja(req,`/project/${projectId}/periods/${periodId}/results`,"PUT");
}
