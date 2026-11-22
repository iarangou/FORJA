import {NextRequest,NextResponse} from "next/server";
import {proxyForja} from "@/lib/serverApi";
type Ctx={params:Promise<{projectId:string}>};
export async function POST(req:NextRequest,ctx:Ctx){
  const {projectId}=await ctx.params;
  if(!/^\d+$/.test(projectId))return NextResponse.json({message:"ID inválido"},{status:400});
  return proxyForja(req,`/project/${projectId}/responsible-teacher`,"POST");
}
