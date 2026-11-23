import { NextRequest,NextResponse } from "next/server";
import {proxyForja} from "@/lib/serverApi";
type Ctx={params:Promise<{projectId:string;periodId:string}>};
function valid(...ids:string[]){return ids.every(x=>/^\d+$/.test(x))}
export async function GET(req:NextRequest,ctx:Ctx){
  const {projectId,periodId}=await ctx.params;
  if(!valid(projectId,periodId))return NextResponse.json({message:"ID inválido"},{status:400});
  return proxyForja(req,`/project/${projectId}/periods/${periodId}/evidences`);
}
export async function POST(req:NextRequest,ctx:Ctx){
  const {projectId,periodId}=await ctx.params;
  if(!valid(projectId,periodId))return NextResponse.json({message:"ID inválido"},{status:400});
  const token=req.cookies.get("forja_session")?.value;
  if(!token)return NextResponse.json({message:"Debes iniciar sesión"},{status:401});
  try{
    const data=await req.formData();
    const file=data.get("file");
    if(!(file instanceof File))return NextResponse.json({message:"Selecciona un PDF"},{status:400});
    if(file.size>20*1024*1024)return NextResponse.json({message:"El máximo es 20 MB"},{status:413});
    if(file.type!=="application/pdf"||!file.name.toLowerCase().endsWith(".pdf"))
      return NextResponse.json({message:"Solo PDF"},{status:400});
    const upload=new FormData();upload.set("file",file,file.name);
    const response=await fetch(`${process.env.INTERNAL_API_URL||"http://backend:3001"}/project/${projectId}/periods/${periodId}/evidences`,{
      method:"POST",headers:{Authorization:`Bearer ${token}`},body:upload,cache:"no-store"
    });
    const payload=await response.json();
    return NextResponse.json(payload,{status:response.status});
  }catch{
    return NextResponse.json({message:"No se pudo enviar el PDF al servidor"},{status:503});
  }
}
