import { NextResponse } from "next/server";
export async function GET(){
  try{
    const response=await fetch(`${process.env.INTERNAL_API_URL||"http://backend:3001"}/faculty/programs`,{cache:"no-store"});
    if(!response.ok)return NextResponse.json({message:"No se pudieron cargar programas"},{status:response.status});
    return NextResponse.json(await response.json());
  }catch{
    return NextResponse.json({message:"No hay conexión con los programas"},{status:503});
  }
}
