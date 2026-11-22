import {NextRequest,NextResponse} from "next/server";
type Ctx={params:Promise<{token:string}>};
const api=process.env.INTERNAL_API_URL||"http://backend:3001";
export async function GET(_req:NextRequest,ctx:Ctx){
  const {token}=await ctx.params;
  if(!/^[a-f0-9]{64}$/.test(token))
    return NextResponse.json({message:"Enlace inválido"},{status:404});
  try{
    const r=await fetch(`${api}/community-feedback/form/${token}`,{cache:"no-store"});
    return NextResponse.json(await r.json(),{status:r.status,headers:{"Cache-Control":"no-store"}});
  }catch{
    return NextResponse.json({message:"No hay conexión con FORJA"},{status:503});
  }
}
export async function POST(req:NextRequest,ctx:Ctx){
  const {token}=await ctx.params;
  if(!/^[a-f0-9]{64}$/.test(token))
    return NextResponse.json({message:"Enlace inválido"},{status:404});
  try{
    const body=await req.text();
    if(body.length>12000)return NextResponse.json({message:"Respuesta demasiado extensa"},{status:413});
    const r=await fetch(`${api}/community-feedback/form/${token}`,{
      method:"POST",headers:{"Content-Type":"application/json"},body,cache:"no-store",
    });
    return NextResponse.json(await r.json(),{status:r.status,headers:{"Cache-Control":"no-store"}});
  }catch{
    return NextResponse.json({message:"No se pudo enviar la evaluación"},{status:503});
  }
}
