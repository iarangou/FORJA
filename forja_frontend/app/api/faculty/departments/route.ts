import { NextResponse } from "next/server";
export async function GET(){
  try{
    const response=await fetch(`${process.env.INTERNAL_API_URL||"http://backend:3001"}/faculty/departments`,{cache:"no-store"});
    if(!response.ok)return NextResponse.json({message:"No se pudieron cargar departamentos"},{status:response.status});
    return NextResponse.json(await response.json());
  }catch{
    return NextResponse.json({message:"No hay conexión con los departamentos"},{status:503});
  }
}
