import {NextRequest,NextResponse} from "next/server";
import {ODS} from "@/lib/ods";
import {createWorkbook} from "@/lib/xlsx-export";

type Project={
 id:number;code:string;title:string;registration_type:string;general_status:string;
 creation_year:number|null;
 external_population:string|null;ods_ids:number[];zone_ids:number[];
 department_ids:number[];academic_program_ids:number[];
 academic_pairs:{department_id:number|null;academic_program_id:number|null}[];
};
type Period={
 project_id:number;academic_year:number;academic_semester:number;
 record_type:string;approval_status:string;execution_status:string;
 student_count:number|null;budget:number|string|null;
 department_id:number|null;academic_program_id:number|null;
 faculty_name:string|null;department_name:string|null;academic_program_name:string|null;
};
type Named={id:number;name:string};

const externalLabels:Record<string,string>={
 NINGUNO:"Ninguno / no aplica",MENORES:"Menores de edad",
 ADULTOS_MAYORES:"Adultos mayores",ADULTOS_MAYORES_INSTITUCIONALIZADOS:"Adultos mayores institucionalizados",
 DISCAPACIDAD:"Personas con discapacidad",LGBTIQ:"Comunidad LGBTIQ+",
 VICTIMAS_CONFLICTO:"Víctimas del conflicto armado",EXCOMBATIENTES:"Excombatientes",
 PERSONAS_ENFERMEDAD:"Personas en condición de enfermedad",MINORIAS_ETNICAS:"Minorías étnicas",
 HABITANTES_CALLE:"Habitantes de calle",MIGRANTES:"Población migrante",
 EMBARAZO:"Personas en estado de embarazo",VULNERABILIDAD_SOCIOECONOMICA:"Vulnerabilidad socioeconómica",
 OTRO:"Otro",
};

export async function GET(req:NextRequest){
 const token=req.cookies.get("forja_session")?.value;
 if(!token)return NextResponse.json({message:"Debes iniciar sesión."},{status:401});
 const base=process.env.INTERNAL_API_URL||"http://localhost:3001";
 const auth={Authorization:`Bearer ${token}`};
 try{
  // La autorización se verifica en el backend, no por un rol informado por el navegador.
  const paths=["/users/me","/project","/project/report-periods",
   "/project-classifications/zones","/faculty/departments","/faculty/programs"];
  const responses=await Promise.all(paths.map(p=>fetch(base+p,{headers:auth,cache:"no-store"})));
  if(responses[0].status===401)return NextResponse.json({message:"Inicia sesión de nuevo."},{status:401});
  if(responses[0].status===403||responses[2].status===403)
    return NextResponse.json({message:"Solo el administrador puede exportar."},{status:403});
  if(responses.some(r=>!r.ok))return NextResponse.json({message:"No se pudieron cargar los datos del informe."},{status:502});
  const [user,projects,periods,zones,departments,programs]=await Promise.all(responses.map(r=>r.json())) as
   [{rol_id:number},Project[],Period[],Named[],Named[],Named[]];
  if(user.rol_id!==1)return NextResponse.json({message:"Solo el administrador puede exportar."},{status:403});
  const params=req.nextUrl.searchParams;
  const pick=(field:string)=>params.get(field)||"";
  const zone=pick("zone"),ods=pick("ods"),department=pick("department"),
    program=pick("program"),population=pick("population"),year=pick("year");
  const isId=(value:string)=>!value||/^[1-9][0-9]*$/.test(value);
  if(![zone,ods,department,program,year].every(isId)||
     (year&&(Number(year)<1900||Number(year)>2200))||
     (population&&!Object.hasOwn(externalLabels,population)))
    return NextResponse.json({message:"Filtros inválidos."},{status:400});
  const filtered=projects.filter(p=>
   (!year||p.creation_year===Number(year))&&
   (!zone||(p.zone_ids??[]).includes(Number(zone)))&&
   (!ods||(p.ods_ids??[]).includes(Number(ods)))&&
   ((!department&&!program)||
    (p.academic_pairs??[]).some(a=>
     (!department||a.department_id===Number(department))&&
     (!program||a.academic_program_id===Number(program))
    ))&&
   (!population||p.external_population===population)
  );
  const allowed=new Set(filtered.map(p=>p.id));
  const filteredPeriods=periods.filter(p=>allowed.has(p.project_id)&&
   (!department||p.department_id===Number(department))&&
   (!program||p.academic_program_id===Number(program)));
  const byId=(arr:Named[],id:number)=>arr.find(x=>x.id===id)?.name||`Código ${id}`;
  const joined=(ids:number[]|null|undefined,fn:(id:number)=>string)=>(ids??[]).map(fn).join(" | ");
  const projectRows=filtered.map(p=>[
   p.code,p.title,p.creation_year,p.registration_type,p.general_status,
   joined(p.zone_ids,id=>byId(zones,id)),
   joined(p.ods_ids,id=>`ODS ${id}: ${ODS.find(o=>o.id===id)?.name||"Sin catálogo"}`),
   joined(p.department_ids,id=>byId(departments,id)),
   joined(p.academic_program_ids,id=>byId(programs,id)),
   p.external_population?externalLabels[p.external_population]||p.external_population:"Sin registrar",
   filteredPeriods.filter(v=>v.project_id===p.id).length,
   filteredPeriods.filter(v=>v.project_id===p.id)
    .reduce((n,v)=>n+(typeof v.student_count==="number"?v.student_count:0),0),
  ]);
  const codeById=new Map(filtered.map(p=>[p.id,p.code]));
  const periodRows=filteredPeriods.map(p=>[
   codeById.get(p.project_id)||"",`${p.academic_year}-${p.academic_semester}`,
   p.record_type,p.approval_status,p.execution_status,
   p.faculty_name||"",p.department_name||"",p.academic_program_name||"",
   p.student_count,p.budget==null?null:Number(p.budget),
  ]);
  const workbook=createWorkbook([
   {name:"Proyectos",headers:["Código FORJA","Proyecto","Año de inicio","Tipo de registro","Estado",
     "Zonas territoriales","ODS asociados","Departamentos académicos","Carreras",
     "Población externa predominante","Semestres registrados","Estudiantes (suma semestral)"],
    rows:projectRows},
   {name:"Semestres",headers:["Código FORJA","Semestre","Tipo de registro",
     "Estado de aprobación","Estado de ejecución","Facultad","Departamento académico",
     "Programa o carrera","Número de estudiantes","Presupuesto COP"],rows:periodRows},
  ]);
  const buffer=new ArrayBuffer(workbook.byteLength);
  new Uint8Array(buffer).set(workbook);
  return new NextResponse(buffer,{
   status:200,headers:{
    "Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition":'attachment; filename="FORJA_reporte_filtrado.xlsx"',
    "Cache-Control":"private, no-store",
    "X-Content-Type-Options":"nosniff",
   },
  });
 }catch{
  return NextResponse.json({message:"No fue posible generar el archivo Excel."},{status:503});
 }
}
