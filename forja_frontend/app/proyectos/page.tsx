"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@/styles/projects.css";
import LogoutButton from "@/components/auth/LogoutButton";

type Project = {
  id: number; code: string; title: string;
  registration_type: string; general_status: string;
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
    <nav className="forja-nav"><Link href="/">FORJA</Link><div className="forja-nav-actions">{profile?.rol_id===1&&<Link href="/administracion/usuarios">Gestionar usuarios</Link>}<LogoutButton/></div></nav>
    <div className="forja-heading"><span className="forja-eyebrow">PLATAFORMA FORJA</span>
      <h1>Proyectos registrados</h1>
      <p>Consulta proyectos y aprobaciones por semestre. Los permisos se comprueban en el servidor.</p>
    </div>
    <div className="forja-actions"><Link className="forja-button" href="/proyectos/nuevo">+ Registrar proyecto</Link></div>
    {loading&&<p>Cargando proyectos...</p>}
    {error&&<p className="forja-alert" role="alert">{error} {error.includes("sesión")&&<Link href="/login">Iniciar sesión</Link>}</p>}
    {message&&<p className="forja-ok" role="status">{message}</p>}
    {!loading&&!error&&projects.length===0&&<div className="forja-panel"><h2>No hay proyectos para mostrar</h2><p>Crea un borrador para empezar.</p></div>}
    <div className="forja-cards">
      {projects.map(p=><article className="forja-panel" key={p.id}>
        <div className="forja-cardhead"><span className="forja-code">{p.code}</span><span>{p.general_status}</span></div>
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
