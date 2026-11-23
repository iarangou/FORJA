import {NextRequest,NextResponse} from "next/server";
import {proxyForja} from "@/lib/serverApi";
type Ctx={params:Promise<{projectId:string;periodId:string}>};
export async function GET(req:NextRequest,ctx:Ctx){
 const {projectId,periodId}=await ctx.params;
 if(![projectId,periodId].every(v=>/^\d+$/.test(v)))return NextResponse.json({message:"ID inválido"},{status:400});
 return proxyForja(req,`/community-feedback/project/${projectId}/periods/${periodId}`);
}
