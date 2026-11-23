import {NextRequest,NextResponse} from "next/server";
import {proxyForja} from "@/lib/serverApi";
type Ctx={params:Promise<{projectId:string;kind:string}>};
export async function GET(req:NextRequest,ctx:Ctx){
  const {projectId,kind}=await ctx.params;
  if(!/^\d+$/.test(projectId)||kind!=="zones")
    return NextResponse.json({message:"Parámetros inválidos"},{status:400});
  return proxyForja(req,`/project-classifications/project/${projectId}/${kind}`,"GET");
}
export async function PUT(req:NextRequest,ctx:Ctx){
  const {projectId,kind}=await ctx.params;
  if(!/^\d+$/.test(projectId)||kind!=="zones")
    return NextResponse.json({message:"Parámetros inválidos"},{status:400});
  return proxyForja(req,`/project-classifications/project/${projectId}/${kind}`,"PUT");
}
