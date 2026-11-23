"use client";

import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import Link from "next/link";
import "@/styles/workspace.css";

type Profile={id:number;username:string;full_name?:string;rol_id:number};
type Item={href:string;label:string;icon:string;roles:number[]};
const navigation:Item[]=[
 {href:"/home",label:"Inicio",icon:"⌂",roles:[1,2,3]},
 {href:"/proyectos",label:"Todos los proyectos",icon:"▦",roles:[1,2,3]},
 {href:"/proyectos/nuevo",label:"Registrar proyecto",icon:"＋",roles:[2,3]},
 {href:"/administracion/usuarios",label:"Usuarios y solicitudes",icon:"♙",roles:[1]},
 {href:"/administracion/catalogos",label:"Zonas territoriales",icon:"◇",roles:[1]},
];
const roleName:Record<number,string>={1:"Administrador",2:"Monitor",3:"Profesor"};

export default function WorkspaceShell({children}:{children:React.ReactNode}){
 const [profile,setProfile]=useState<Profile|null>(null);
 const [menuOpen,setMenuOpen]=useState(false);
 const pathname=usePathname();
 useEffect(()=>{
  let alive=true;
  fetch("/api/users/me",{cache:"no-store"}).then(async r=>{
   if(!r.ok)throw new Error("Sesión vencida");
   const p:Profile=await r.json();
   if(alive)setProfile(p);
  }).catch(()=>{if(alive)window.location.assign("/login");});
  return ()=>{alive=false};
 },[]);
 async function logout(){
  await fetch("/api/auth/logout",{method:"POST",cache:"no-store"});
  window.location.assign("/login");
 }
 const name=profile?.full_name||profile?.username||"Mi cuenta";
 return <div className="fw-workspace">
  <aside className={`fw-sidebar${menuOpen?" fw-sidebar--open":""}`}>
   <Link href="/home" className="fw-logo" onClick={()=>setMenuOpen(false)}>
    <img src="/images/auth/forja-logo.png" alt="FORJA"/>
   </Link>
   <div className="fw-navigation-caption">PLATAFORMA FORJA</div>
   <nav className="fw-links" aria-label="Navegación principal">
    {navigation.filter(i=>profile?.rol_id&&i.roles.includes(profile.rol_id)).map(i=>{
      const active=i.href==="/proyectos"?pathname==="/proyectos"||pathname.startsWith("/proyectos/")&&!pathname.startsWith("/proyectos/nuevo"):pathname===i.href;
      return <Link className={`fw-link${active?" fw-link--active":""}`} key={i.href}
       href={i.href} aria-current={active?"page":undefined} onClick={()=>setMenuOpen(false)}>
       <span aria-hidden="true" className="fw-icon">{i.icon}</span>{i.label}
      </Link>;
    })}
   </nav>
   <div className="fw-sidebar-bottom">
    <button type="button" onClick={logout} className="fw-sidebar-logout">
      <span aria-hidden="true">↪</span> Cerrar sesión
    </button>
   </div>
  </aside>
  <div className="fw-content">
   <header className="fw-header">
    <button type="button" className="fw-menu-button" aria-label="Abrir navegación"
      aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}>☰</button>
    <div className="fw-header-title"><span>PLATAFORMA FORJA</span><strong>Gestión de proyectos</strong></div>
    <div className="fw-account">
      <span className="fw-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
      <div><strong>{name}</strong><small>{roleName[profile?.rol_id??0]||"Cargando..."}</small></div>
    </div>
   </header>
   <div className="fw-page">{children}</div>
  </div>
 </div>;
}
