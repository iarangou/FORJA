import {NextRequest,NextResponse} from "next/server";
type Ctx={params:Promise<{projectId:string;periodId:string;evidenceId:string}>};
export async function GET(req:NextRequest,ctx:Ctx){
  const {projectId,periodId,evidenceId}=await ctx.params;
  if(![projectId,periodId,evidenceId].every(v=>/^\d+$/.test(v)))
    return NextResponse.json({message:"ID inválido"},{status:400});
  const token=req.cookies.get("forja_session")?.value;
  if(!token)return NextResponse.json({message:"Debes iniciar sesión"},{status:401});
  try{
    const r=await fetch(`${process.env.INTERNAL_API_URL||"http://backend:3001"}/project/${projectId}/periods/${periodId}/evidences/${evidenceId}/download`,{
      headers:{Authorization:`Bearer ${token}`},cache:"no-store"
    });
    if(!r.ok)return NextResponse.json({message:"No se pudo descargar la evidencia"},{status:r.status});
    return new NextResponse(r.body,{status:200,headers:{
      "Content-Type":"application/pdf",
      "Content-Disposition":`attachment; filename="forja-evidencia-${evidenceId}.pdf"`,
      "Cache-Control":"private, no-store",
      "X-Content-Type-Options":"nosniff",
      "Content-Security-Policy":"sandbox",
    }});
  }catch{
    return NextResponse.json({message:"Error descargando evidencia"},{status:503});
  }
}
