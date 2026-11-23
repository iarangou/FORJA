"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import "@/styles/projects.css";
import {ODS} from "@/lib/ods";

type Item={id:number;name:string};
export default function ForjaCatalogsPage(){
 const [zones,setZones]=useState<Item[]>([]);
 const [name,setName]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [role,setRole]=useState<number|null>(null);
 useEffect(()=>{
  let active=true;
  Promise.all([fetch("/api/users/me"),fetch("/api/project-classifications/zones")])
   .then(async ([u,z])=>{
     if(!u.ok)throw new Error("Debes iniciar sesión");
     const user:{rol_id:number}=await u.json();
     const items:Item[]=z.ok?await z.json():[];
     if(active){setRole(user.rol_id);setZones(items);}
   }).catch(e=>{if(active)setError(e instanceof Error?e.message:"Error de conexión")});
  return ()=>{active=false};
 },[]);
 async function create(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(role!==1||busy||!name.trim())return;
  setBusy(true);setMessage("");setError("");
  try{
   const r=await fetch("/api/project-classifications/zones",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name:name.trim()}),
   });
   const data=await r.json();
   if(!r.ok)throw new Error(typeof data.message==="string"?data.message:"Error al guardar la zona");
   setZones(z=>[...z.filter(v=>v.id!==data.id),data].sort((a,b)=>a.id-b.id));
   setName("");
   setMessage("Zona territorial agregada al catálogo.");
  }catch(e){setError(e instanceof Error?e.message:"Error de servidor")}
  finally{setBusy(false)}
 }
 return <main className="forja-projects"><div className="forja-shell">
  <nav className="forja-nav"><Link className="forja-brand" href="/proyectos">FORJA</Link><div className="forja-nav-actions"><Link className="forja-nav-action" href="/proyectos">Proyectos</Link><Link className="forja-nav-action" href="/administracion/usuarios">Gestionar usuarios</Link><LogoutButton/></div></nav>
  <div className="forja-heading">
   <span className="forja-eyebrow">ADMINISTRACIÓN FORJA</span>
   <h1>Zonas territoriales</h1>
   <p>Agrega las siete zonas con sus nombres institucionales reales. Los 17 Objetivos de Desarrollo Sostenible ya están incluidos; no hace falta crear otro catálogo.</p>
  </div>
  {role!==null&&role!==1&&<p className="forja-alert">Solo el administrador puede registrar zonas.</p>}
  <section className="forja-panel forja-editor-section">
   <h2>Zonas territoriales FORJA</h2>
   <p className="forja-description">{zones.length} zonas configuradas de las 7 identificadas por FORJA.</p>
   {zones.map(item=><div className="forja-user-item" key={item.id}>{item.name}</div>)}
   {role===1&&<form className="forja-form" onSubmit={create}>
    <div className="forja-fields"><label>Nombre oficial de zona
     <input value={name} maxLength={160} required onChange={e=>setName(e.target.value)}
       placeholder="Nombre institucional de zona"/>
    </label></div>
    <div className="forja-actions"><button type="submit" disabled={busy||!name.trim()}>
      {busy?"Guardando...":"Agregar zona"}
    </button></div>
   </form>}
  </section>
  <section className="forja-panel forja-editor-section">
   <h2>17 Objetivos de Desarrollo Sostenible</h2>
   <p className="forja-description">Este catálogo es fijo y se selecciona desde «Consideraciones éticas» en cada proyecto.</p>
   {ODS.map(o=><div className="forja-user-item" key={o.id}>ODS {o.id}. {o.name}</div>)}
  </section>
  {error&&<p className="forja-alert" role="alert">{error}</p>}
  {message&&<p className="forja-ok" role="status">{message}</p>}
 </div></main>;
}
