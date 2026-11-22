"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@/styles/projects.css";

type Project = {
  id: number; code: string; title: string;
  registration_type: string; general_status: string;
  created_at: string;
};
type Period = {
  id:number; academic_year:number; academic_semester:number;
  approval_status:string; record_type:string;
};
export default function ProjectsPage() {
  const [projects,setProjects] = useState<Project[]>([]);
  const [periods,setPeriods] = useState<Record<number,Period[]>>({});
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  useEffect(()=>{
    let mounted=true;
    fetch("/api/projects",{credentials:"same-origin"})
      .then(async r=>{
        if(!r.ok)throw new Error(r.status===401?"Debes iniciar sesión para consultar proyectos.":"No se pudieron consultar los proyectos.");
        return r.json();
      })
      .then((data:unknown)=>{if(mounted)setProjects(Array.isArray(data)?data:[]);})
      .catch((err:unknown)=>{if(mounted)setError(err instanceof Error?err.message:"Error de conexión");})
      .finally(()=>{if(mounted)setLoading(false);});
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
  return <main className="forja-projects"><div className="forja-shell">
    <nav className="forja-nav"><Link href="/">FORJA</Link><Link href="/login">Acceso</Link></nav>
    <div className="forja-heading"><span className="forja-eyebrow">PLATAFORMA FORJA</span>
      <h1>Proyectos registrados</h1>
      <p>Consulta proyectos y aprobaciones por semestre. Los permisos se comprueban también en el servidor.</p>
    </div>
    <div className="forja-actions"><Link className="forja-button" href="/proyectos/nuevo">+ Registrar proyecto</Link></div>
    {loading&&<p>Cargando proyectos...</p>}
    {error&&<p className="forja-alert" role="alert">{error} {error.includes("sesión")&&<Link href="/login">Iniciar sesión</Link>}</p>}
    {!loading&&!error&&projects.length===0&&<div className="forja-panel"><h2>No hay proyectos para mostrar</h2><p>Crea un borrador para empezar.</p></div>}
    <div className="forja-cards">
      {projects.map(p=><article className="forja-panel" key={p.id}>
        <div className="forja-cardhead"><span className="forja-code">{p.code}</span><span>{p.general_status}</span></div>
        <h2>{p.title}</h2>
        <p>{p.registration_type==="HISTORICO"?"Registro histórico":"Proyecto nuevo"}</p>
        <button type="button" className="forja-textbutton" onClick={()=>seePeriods(p.id)}>Ver períodos y estados</button>
        {periods[p.id]&&<div className="forja-periods">
          {periods[p.id].length===0?<p>Sin períodos registrados.</p>:periods[p.id].map(period=>
            <p key={period.id}><strong>{period.academic_year}-{period.academic_semester}</strong> · {period.record_type} · {period.approval_status}</p>
          )}
        </div>}
      </article>)}
    </div>
  </div></main>;
}
