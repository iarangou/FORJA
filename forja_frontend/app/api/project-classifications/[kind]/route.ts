import {NextRequest,NextResponse} from "next/server";
import {proxyForja} from "@/lib/serverApi";
type Ctx={params:Promise<{kind:string}>};
export async function GET(req:NextRequest,ctx:Ctx){
  const {kind}=await ctx.params;
  if(kind!=="zones")return NextResponse.json({message:"Catálogo inválido"},{status:400});
  return proxyForja(req,`/project-classifications/${kind}`,"GET");
}
export async function POST(req:NextRequest,ctx:Ctx){
  const {kind}=await ctx.params;
  if(kind!=="zones")return NextResponse.json({message:"Catálogo inválido"},{status:400});
  return proxyForja(req,`/project-classifications/${kind}`,"POST");
}
