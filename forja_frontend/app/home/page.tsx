"use client";
import {useEffect,useState} from "react";
import {Suspense} from "react";
import Link from "next/link";
import WorkspaceShell from "@/components/navigation/WorkspaceShell";
import "@/styles/projects.css";

export default function HomePage(){
 const [role,setRole]=useState<number|null>(null);
 useEffect(()=>{
   let active=true;
   fetch("/api/users/me",{cache:"no-store"}).then(async response=>{
     if(!response.ok)return;
     const user=await response.json() as {rol_id:number};
     if(active)setRole(user.rol_id);
   }).catch(()=>undefined);
   return ()=>{active=false};
 },[]);
 return <Suspense fallback={<div role="status">Cargando FORJA...</div>}><WorkspaceShell>
  <main className="forja-projects"><div className="forja-shell">
   <div className="forja-heading"><span className="forja-eyebrow">BIENVENIDO A FORJA</span>
    <h1>Tu espacio de proyectos<span style={{color:"#f39120"}}>.</span></h1>
    <p>Organiza proyectos por semestre, revisa su ejecución y conserva los documentos de cada período.</p>
   </div>
   <div className="forja-cards">
    <section className="forja-panel"><h2>Consultar proyectos</h2><p>Revisa proyectos, períodos académicos y documentos asociados.</p>
     <Link href="/proyectos" className="forja-button">Ver proyectos</Link></section>
    {(role===2||role===3)&&<section className="forja-panel"><h2>Registrar proyecto</h2><p>Registra un proyecto nuevo o digitaliza un período histórico según tu rol.</p>
     <Link href="/proyectos/nuevo" className="forja-button">Registrar</Link></section>}
   </div>
  </div></main>
 </WorkspaceShell></Suspense>;
}
