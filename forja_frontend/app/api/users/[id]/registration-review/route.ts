import {NextRequest,NextResponse} from "next/server";
import {proxyForja} from "@/lib/serverApi";
type Ctx={params:Promise<{id:string}>};
export async function POST(request:NextRequest,ctx:Ctx){
 const {id}=await ctx.params;
 if(!/^[1-9][0-9]*$/.test(id))return NextResponse.json({message:"Usuario inválido"},{status:400});
 return proxyForja(request,`/users/${id}/registration-review`,"POST");
}
