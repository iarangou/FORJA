"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import "@/styles/projects.css";

type Item={id:number;name:string};
type Kind="zones"|"commitments";
const definitions:{
  kind:Kind;title:string;estimated:number;
}[]=[
  {kind:"zones",title:"Zonas territoriales FORJA",estimated:7},
  {kind:"commitments",title:"Compromisos de sostenibilidad",estimated:11},
];

export default function ForjaCatalogsPage(){
  const [lists,setLists]=useState<Record<Kind,Item[]>>({zones:[],commitments:[]});
  const [names,setNames]=useState<Record<Kind,string>>({zones:"",commitments:""});
  const [busy,setBusy]=useState<Kind|null>(null);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [role,setRole]=useState<number|null>(null);

  useEffect(()=>{
    let mounted=true;
    Promise.all([
      fetch("/api/users/me"),
      fetch("/api/project-classifications/zones"),
      fetch("/api/project-classifications/commitments"),
    ]).then(async ([u,z,c])=>{
      if(!u.ok)throw new Error("Debes iniciar sesión como administrador");
      const user:{rol_id:number}=await u.json();
      const zones:Item[]=z.ok?await z.json():[];
      const commitments:Item[]=c.ok?await c.json():[];
      if(mounted){
        setRole(user.rol_id);
        setLists({zones,commitments});
      }
    }).catch(e=>{if(mounted)setError(e instanceof Error?e.message:"Error cargando los catálogos")});
    return ()=>{mounted=false};
  },[]);

  async function create(kind:Kind,event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(role!==1||busy||!names[kind].trim())return;
    setBusy(kind);setMessage("");setError("");
    try{
      const response=await fetch(`/api/project-classifications/${kind}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name:names[kind].trim()}),
      });
      const result=await response.json();
      if(!response.ok)throw new Error(typeof result.message==="string"?result.message:"Error al guardar");
      setLists(current=>({...current,[kind]:[
        ...current[kind].filter(item=>item.id!==result.id),result,
      ].sort((a,b)=>a.id-b.id)}));
      setNames(current=>({...current,[kind]:""}));
      setMessage("Elemento del catálogo guardado correctamente.");
    }catch(e){setError(e instanceof Error?e.message:"Error de servidor");}
    finally{setBusy(null);}
  }
  return <main className="forja-projects"><div className="forja-shell">
    <nav className="forja-nav"><Link href="/proyectos">← Proyectos</Link><Link href="/">FORJA</Link></nav>
    <div className="forja-heading">
      <span className="forja-eyebrow">ADMINISTRACIÓN FORJA</span>
      <h1>Catálogos para clasificar proyectos</h1>
      <p>Registra únicamente las denominaciones oficiales proporcionadas por FORJA.
        Se estiman siete zonas y aproximadamente once compromisos; no se generan nombres ficticios.</p>
    </div>
    {role===null&&!error&&<p>Cargando catálogos...</p>}
    {role!==null&&role!==1&&<p className="forja-alert">Solo el administrador puede modificar los catálogos.</p>}
    {definitions.map(def=><section key={def.kind} className="forja-panel forja-editor-section">
      <h2>{def.title}</h2>
      <p className="forja-description">Elementos configurados: {lists[def.kind].length} · Referencia institucional aproximada: {def.estimated}</p>
      <div className="forja-user-list">
        {lists[def.kind].map(item=><div className="forja-user-item" key={item.id}>
          <span>{item.id}. {item.name}</span>
        </div>)}
      </div>
      {role===1&&<form className="forja-form" onSubmit={event=>create(def.kind,event)}>
        <div className="forja-fields">
          <label>Nombre oficial
            <input required maxLength={def.kind==="zones"?160:180} value={names[def.kind]}
              onChange={e=>setNames(v=>({...v,[def.kind]:e.target.value}))}
              placeholder="Escribe la denominación oficial"/>
          </label>
        </div>
        <div className="forja-actions"><button type="submit" disabled={busy!==null||!names[def.kind].trim()}>
          {busy===def.kind?"Guardando...":"Agregar al catálogo"}
        </button></div>
      </form>}
    </section>)}
    {error&&<p className="forja-alert" role="alert">{error}</p>}
    {message&&<p className="forja-ok" role="status">{message}</p>}
  </div></main>;
}
