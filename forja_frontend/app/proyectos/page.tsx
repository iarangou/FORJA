"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@/styles/projects.css";
import LogoutButton from "@/components/auth/LogoutButton";
import {ODS} from "@/lib/ods";
import {EXTERNAL_POPULATION_OPTIONS} from "@/lib/external-population";

type Project = {
  id: number; code: string; title: string; creation_year:number;
  registration_type: string; general_status: string;
  zone_ids:number[];ods_ids:number[];
  department_ids:number[];academic_program_ids:number[];
  academic_pairs:{department_id:number|null;academic_program_id:number|null}[];
  external_population:string|null;
};
type Period = {
  id:number; academic_year:number; academic_semester:number;
  approval_status:string; record_type:string;
};
type UserProfile = { id: number; username: string; rol_id: number };

export default function ProjectsPage() {
  const [projects,setProjects] = useState<Project[]>([]);
  const [periods,setPeriods] = useState<Record<number,Period[]>>({});
  const [profile,setProfile] = useState<UserProfile|null>(null);
  const [notes,setNotes] = useState<Record<number,string>>({});
  const [working,setWorking] = useState<number|null>(null);
  const [loading,setLoading] = useState(true);
  const [zones,setZones]=useState<{id:number;name:string}[]>([]);
  const [departments,setDepartments]=useState<{id:number;name:string;faculty_id:number}[]>([]);
  const [programs,setPrograms]=useState<{id:number;name:string;faculty_id:number}[]>([]);
  const [zoneFilter,setZoneFilter]=useState("");
  const [yearFilter,setYearFilter]=useState("");
  const [odsFilter,setOdsFilter]=useState("");
  const [departmentFilter,setDepartmentFilter]=useState("");
  const [programFilter,setProgramFilter]=useState("");
  const [populationFilter,setPopulationFilter]=useState("");
  const [exporting,setExporting]=useState(false);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");

  useEffect(()=>{
    let mounted=true;
    Promise.all([
      fetch("/api/projects",{credentials:"same-origin"}),
      fetch("/api/users/me",{credentials:"same-origin"}),
    ]).then(async ([response,userResponse])=>{
      if(!response.ok)throw new Error(response.status===401?"Debes iniciar sesión para consultar proyectos.":"No se pudieron consultar los proyectos.");
      const list:unknown=await response.json();
      const user:UserProfile|null=userResponse.ok?await userResponse.json():null;
      if(mounted){setProjects(Array.isArray(list)?list:[]);setProfile(user);}
    }).catch((err:unknown)=>{
      if(mounted)setError(err instanceof Error?err.message:"Error de conexión");
    }).finally(()=>{if(mounted)setLoading(false);});
    return ()=>{mounted=false;};
  },[]);

  useEffect(()=>{
    Promise.all([
      fetch("/api/project-classifications/zones"),
      fetch("/api/faculty/departments"),
      fetch("/api/faculty/programs"),
    ]).then(async ([a,d,p])=>{
      if(a.ok){const data:unknown=await a.json();setZones(Array.isArray(data)?data:[]);}
      if(d.ok){const data:unknown=await d.json();setDepartments(Array.isArray(data)?data:[]);}
      if(p.ok){const data:unknown=await p.json();setPrograms(Array.isArray(data)?data:[]);}
    }).catch(()=>undefined);
  },[]);
  const availableYears=Array.from(new Set(projects.map(p=>p.creation_year).filter(y=>Number.isInteger(y)))).sort((a,b)=>b-a);
  const filteredProjects=projects.filter(p=>
    (!yearFilter||p.creation_year===Number(yearFilter))&&
    (!zoneFilter||(p.zone_ids??[]).includes(Number(zoneFilter)))&&
    (!odsFilter||(p.ods_ids??[]).includes(Number(odsFilter)))&&
    ((!departmentFilter&&!programFilter)||
      (p.academic_pairs??[]).some(a=>
        (!departmentFilter||a.department_id===Number(departmentFilter))&&
        (!programFilter||a.academic_program_id===Number(programFilter))
      ))&&
    (!populationFilter||p.external_population===populationFilter)
  );

  async function exportFiltered(){
    if(profile?.rol_id!==1||exporting)return;
    setError("");setExporting(true);
    const params=new URLSearchParams();
    if(yearFilter)params.set("year",yearFilter);
    if(zoneFilter)params.set("zone",zoneFilter);
    if(odsFilter)params.set("ods",odsFilter);
    if(departmentFilter)params.set("department",departmentFilter);
    if(programFilter)params.set("program",programFilter);
    if(populationFilter)params.set("population",populationFilter);
    try{
      const response=await fetch(`/api/projects/export?${params.toString()}`,{
        credentials:"same-origin",cache:"no-store",
      });
      if(!response.ok){
        const data=await response.json().catch(()=>({}));
        throw new Error(typeof data.message==="string"?data.message:"No fue posible exportar el Excel");
      }
      const blob=await response.blob();
      const url=URL.createObjectURL(blob);
      const link=document.createElement("a");
      link.href=url;link.download="FORJA_reporte_filtrado.xlsx";
      document.body.appendChild(link);link.click();link.remove();
      URL.revokeObjectURL(url);
    }catch(e){setError(e instanceof Error?e.message:"No fue posible exportar");}
    finally{setExporting(false);}
  }

  async function seePeriods(id:number) {
    try {
      const res=await fetch(`/api/projects/${id}/periods`,{credentials:"same-origin"});
      if(!res.ok)throw new Error("No fue posible consultar los períodos");
      const data:unknown=await res.json();
      setPeriods(current=>({...current,[id]:Array.isArray(data)?data:[]}));
    }catch(e){setError(e instanceof Error?e.message:"Error");}
  }

  async function changeStatus(projectId:number,periodId:number,decision:"APROBADO"|"DEVUELTO"|"ENVIAR"){
    setWorking(periodId);setMessage("");setError("");
    const url=decision==="ENVIAR"
      ?`/api/projects/${projectId}/periods/${periodId}/submit`
      :`/api/projects/${projectId}/periods/${periodId}/review`;
    try {
      const response=await fetch(url,{
        method:"POST",credentials:"same-origin",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(decision==="ENVIAR"?{}:{decision,notes:notes[periodId]??""}),
      });
      const payload=await response.json();
      if(!response.ok){
        const missing=Array.isArray(payload.missing)?payload.missing.join(", "):"";
        const message=typeof payload.message==="string"?payload.message:"Solicitud rechazada";
        throw new Error([message,missing].filter(Boolean).join(": "));
      }
      setMessage(decision==="ENVIAR"?"Período enviado a revisión.":"Decisión registrada correctamente.");
      await seePeriods(projectId);
    }catch(e){setError(e instanceof Error?e.message:"Error de servidor");}
    finally{setWorking(null);}
  }

  return <main className="forja-projects"><div className="forja-shell">
    <nav className="forja-nav"><Link className="forja-brand" href="/">FORJA</Link><div className="forja-nav-actions">{profile?.rol_id===1&&<><Link className="forja-nav-action" href="/administracion/usuarios">Gestionar usuarios</Link><Link className="forja-nav-action" href="/administracion/catalogos">Administrar zonas</Link></>}<LogoutButton/></div></nav>
    <div className="forja-heading"><span className="forja-eyebrow">PLATAFORMA FORJA</span>
      <h1>Proyectos registrados</h1>
      <p>Consulta proyectos y aprobaciones por semestre. Los permisos se comprueban en el servidor.</p>
    </div>
    <div className="forja-actions"><Link className="forja-button" href="/proyectos/nuevo">+ Registrar proyecto</Link></div>
    <div className="fw-project-summary" aria-label="Resumen de proyectos">
      <div><span>Proyectos disponibles</span><strong>{projects.length}</strong></div>
      <div><span>Proyectos activos</span><strong>{projects.filter(p=>p.general_status==="ACTIVO").length}</strong></div>
      <div><span>Proyectos finalizados</span><strong>{projects.filter(p=>p.general_status==="FINALIZADO").length}</strong></div>
      <div><span>Resultado del filtro</span><strong>{filteredProjects.length}</strong></div>
    </div>
    <div className="forja-panel fw-filters-panel">
      <div className="fw-filters-title"><h2>Encuentra un proyecto</h2>
       <button type="button" onClick={()=>{
        setYearFilter("");setZoneFilter("");setDepartmentFilter("");setProgramFilter("");setOdsFilter("");setPopulationFilter("");
       }} className="fw-clear-filters">Limpiar filtros</button>
      </div>
      <div className="forja-fields">
        <label>Año de inicio del proyecto
          <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)}>
            <option value="">Todos los años</option>
            {availableYears.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label>Zona territorial
          <select value={zoneFilter} onChange={e=>setZoneFilter(e.target.value)}>
            <option value="">Todas las zonas</option>
            {zones.map(z=><option value={z.id} key={z.id}>{z.name}</option>)}
          </select>
        </label>
        <label>Departamento académico
          <select value={departmentFilter} onChange={e=>setDepartmentFilter(e.target.value)}>
            <option value="">Todos los departamentos</option>
            {departments.map(d=><option value={d.id} key={d.id}>{d.name}</option>)}
          </select>
        </label>
        <label>Programa o carrera
          <select value={programFilter} onChange={e=>setProgramFilter(e.target.value)}>
            <option value="">Todas las carreras</option>
            {programs.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label>Población externa predominante
          <select value={populationFilter} onChange={e=>setPopulationFilter(e.target.value)}>
            <option value="">Todas las poblaciones</option>
            {EXTERNAL_POPULATION_OPTIONS.map(([value,label])=><option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>Objetivo de Desarrollo Sostenible (ODS)
          <select value={odsFilter} onChange={e=>setOdsFilter(e.target.value)}>
            <option value="">Todos los ODS</option>
            {ODS.map(o=><option value={o.id} key={o.id}>ODS {o.id}: {o.name}</option>)}
          </select>
        </label>
      </div>
      <div className="forja-filter-footer">
        <p className="forja-description">{filteredProjects.length} proyectos coinciden con los filtros seleccionados.</p>
        {profile?.rol_id===1&&<button className="forja-export-button" type="button"
          disabled={loading||exporting} onClick={exportFiltered}>
          {exporting?"Generando Excel...":"Descargar Excel con estos filtros"}
        </button>}
      </div>
      <p className="forja-description">El Excel incluye los proyectos coincidentes y el detalle de sus semestres, sin datos personales de contacto.</p>
    </div>
    {loading&&<p>Cargando proyectos...</p>}
    {error&&<p className="forja-alert" role="alert">{error} {error.includes("sesión")&&<Link href="/login">Iniciar sesión</Link>}</p>}
    {message&&<p className="forja-ok" role="status">{message}</p>}
    {!loading&&!error&&projects.length===0&&<div className="forja-panel"><h2>No hay proyectos para mostrar</h2><p>Crea un borrador para empezar.</p></div>}
    <div className="forja-cards fw-project-list">
      {filteredProjects.map(p=><article className="forja-panel fw-project-card" key={p.id}>
        <div className="forja-cardhead"><span className="forja-code">{p.code}</span><span className={p.general_status==="ACTIVO"?"fw-status-active":"fw-status-finalized"}>{p.general_status}</span></div>
        <h2>{p.title}</h2>
        <Link href={`/proyectos/${p.id}`} className="forja-textbutton">Abrir proyecto y editar borrador</Link>
        <p>{p.registration_type==="HISTORICO"?"Registro histórico":"Proyecto nuevo"}</p>
        <button type="button" className="forja-textbutton" onClick={()=>seePeriods(p.id)}>Ver períodos y estados</button>
        {periods[p.id]&&<div className="forja-periods">
          {periods[p.id].length===0?<p>Sin períodos registrados.</p>:periods[p.id].map(period=>
            <div key={period.id} className="forja-perioditem">
              <p><strong>{period.academic_year}-{period.academic_semester}</strong> · {period.record_type==="HISTORICO"?"HISTÓRICO · SIN APROBACIÓN RETROACTIVA":`ACTUAL · ${period.approval_status}`}</p>
              {profile?.rol_id===1&&period.approval_status==="EN_REVISION"&&<>
                <label>Observaciones de la revisión
                  <textarea rows={2} value={notes[period.id]??""} onChange={e=>setNotes(prev=>({...prev,[period.id]:e.target.value}))}/>
                </label>
                <div className="forja-actions">
                  <button disabled={working===period.id} type="button" onClick={()=>changeStatus(p.id,period.id,"APROBADO")}>Aprobar</button>
                  <button disabled={working===period.id||!(notes[period.id]??"").trim()} className="secondary" type="button" onClick={()=>changeStatus(p.id,period.id,"DEVUELTO")}>Devolver</button>
                </div>
              </>}
              {profile?.rol_id===3&&period.record_type==="ACTUAL"&&["BORRADOR","DEVUELTO"].includes(period.approval_status)&&
                <button disabled={working===period.id} className="forja-textbutton" type="button" onClick={()=>changeStatus(p.id,period.id,"ENVIAR")}>Enviar a revisión</button>}
            </div>
          )}
        </div>}
      </article>)}
    </div>
  </div></main>;
}
