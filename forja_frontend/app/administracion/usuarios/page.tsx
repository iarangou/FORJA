"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import "@/styles/projects.css";

type Faculty = { id: number; name: string };
type User = {
  id: number; username: string; email: string; full_name: string;
  rol_id: number; rol: string; is_active: boolean;
  registration_status?:"PENDING"|"APPROVED"|"REJECTED";
};
type ApiError = { message?: string | string[] };
export default function AdminUsersPage() {
  const [role,setRole] = useState<number|null>(null);
  const [users,setUsers] = useState<User[]>([]);
  const [faculties,setFaculties] = useState<Faculty[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");
  const [courseName,setCourseName] = useState("");
  const [courses,setCourses] = useState<{id:number;name:string}[]>([]);
  const [courseBusy,setCourseBusy] = useState(false);
  const [reviewBusy,setReviewBusy] = useState<number|null>(null);
  const [reviewRoles,setReviewRoles] = useState<Record<number,number>>({});
  const [reviewFaculties,setReviewFaculties] = useState<Record<number,string>>({});


  async function refreshUsers() {
    const result = await fetch("/api/users",{cache:"no-store"});
    if (!result.ok) throw new Error("No se pudieron consultar los usuarios");
    const data:unknown = await result.json();
    setUsers(Array.isArray(data) ? data : []);
  }

  useEffect(()=>{
    let active=true;
    async function load() {
      try {
        const me=await fetch("/api/users/me",{cache:"no-store"});
        if(!me.ok) throw new Error("Debes iniciar sesión.");
        const profile=await me.json() as {rol_id:number};
        if(!active)return;
        setRole(profile.rol_id);
        if(profile.rol_id!==1)return;
        const [usersResponse,facultyResponse]=await Promise.all([
          fetch("/api/users",{cache:"no-store"}),
          fetch("/api/faculty",{cache:"no-store"}),
        ]);
        if(!usersResponse.ok||!facultyResponse.ok)throw new Error("No se pudieron cargar los catálogos.");
        const [usersList,facultiesList]=await Promise.all([
          usersResponse.json(),facultyResponse.json(),
        ]) as [unknown,unknown];
        if(active){
          setUsers(Array.isArray(usersList)?usersList:[]);
          setFaculties(Array.isArray(facultiesList)?facultiesList:[]);
        }
        const courseResponse = await fetch("/api/courses",{cache:"no-store"});
        if(courseResponse.ok){
          const courseList:unknown=await courseResponse.json();
          if(active)setCourses(Array.isArray(courseList)?courseList:[]);
        }
      } catch(e:unknown) {
        if(active)setError(e instanceof Error?e.message:"Error de conexión");
      } finally {
        if(active)setLoading(false);
      }
    }
    void load();
    return ()=>{active=false;};
  },[]);

  async function reviewRegistration(userId:number,decision:"APPROVE"|"REJECT"){
    if(reviewBusy!==null)return;
    const rol_id=reviewRoles[userId];
    const faculty_id=Number(reviewFaculties[userId]||0);
    if(decision==="APPROVE"&&![2,3].includes(rol_id)){
      setError("Selecciona si la persona será Profesor o Monitor antes de activarla.");return;
    }
    if(decision==="APPROVE"&&rol_id===3&&!faculty_id){
      setError("Selecciona la facultad del profesor antes de activarlo.");return;
    }
    setReviewBusy(userId);setError("");setSuccess("");
    try{
      const response=await fetch(`/api/users/${userId}/registration-review`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({decision,...(decision==="APPROVE"?{rol_id,...(rol_id===3?{faculty_id}:{})}:{})}),
      });
      const data=await response.json() as ApiError;
      if(!response.ok)throw new Error(Array.isArray(data.message)?data.message.join(", "):data.message||"Error al revisar");
      await refreshUsers();
      setSuccess(decision==="APPROVE"?"Usuario activado con el rol seleccionado.":"Solicitud rechazada.");
    }catch(e){setError(e instanceof Error?e.message:"Error de conexión");}
    finally{setReviewBusy(null);}
  }

  async function createCourse(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(courseBusy)return;
    setCourseBusy(true);setError("");setSuccess("");
    try {
      const name=courseName.trim();
      if(!name)throw new Error("Indica un nombre de asignatura.");
      const response=await fetch("/api/courses",{
        method:"POST",credentials:"same-origin",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name}),
      });
      const data=await response.json() as ApiError;
      if(!response.ok){
        throw new Error(Array.isArray(data.message)?data.message.join(", "):data.message||"No se pudo guardar la asignatura");
      }
      const latest=await fetch("/api/courses",{cache:"no-store"});
      if(latest.ok){
        const value:unknown=await latest.json();
        setCourses(Array.isArray(value)?value:[]);
      }
      setCourseName("");
      setSuccess("Asignatura creada correctamente. Ya está disponible en el formulario de proyectos.");
    }catch(e:unknown){setError(e instanceof Error?e.message:"Error al registrar asignatura");}
    finally{setCourseBusy(false);}
  }

  return <main className="forja-projects"><div className="forja-shell">
    <nav className="forja-nav"><Link className="forja-brand" href="/proyectos">FORJA</Link><div className="forja-nav-actions"><Link className="forja-nav-action" href="/proyectos">Proyectos</Link><Link className="forja-nav-action" href="/administracion/catalogos">Administrar zonas</Link><LogoutButton/></div></nav>
    <div className="forja-heading">
      <span className="forja-eyebrow">ADMINISTRACIÓN FORJA</span>
      <h1>Solicitudes y roles</h1>
      <p>Cada persona crea su cuenta y verifica su correo. Aquí decides quién accede a FORJA, asignándole el rol de profesor o monitor. El administrador no establece contraseñas.</p>
    </div>
    {loading&&<p>Cargando...</p>}
    {error&&<p role="alert" className="forja-alert">{error}</p>}
    {!loading&&role!==1&&<p role="alert" className="forja-alert">Solo los administradores pueden administrar usuarios.</p>}
    {!loading&&role===1&&<>
      <section className="forja-panel forja-editor-section">
        <h2>Solicitudes de registro pendientes</h2>
        <p>El correo ya está verificado; el acceso sigue bloqueado hasta que apruebes la cuenta y asignes su rol.</p>
        <div className="forja-user-list">
          {users.filter(u=>u.registration_status==="PENDING").map(u=>
           <div key={u.id} className="forja-user-item">
            <div><strong>{u.full_name}</strong><p>{u.email}</p></div>
            <label>Rol a asignar
             <select value={reviewRoles[u.id]??""} disabled={reviewBusy===u.id}
              onChange={e=>setReviewRoles(current=>({...current,[u.id]:Number(e.target.value)}))}>
              <option value="">Seleccionar rol</option>
              <option value={3}>Profesor</option>
              <option value={2}>Monitor</option>
             </select>
            </label>
            {reviewRoles[u.id]===3&&<label>Facultad
             <select value={reviewFaculties[u.id]??""} disabled={reviewBusy===u.id}
              onChange={e=>setReviewFaculties(current=>({...current,[u.id]:e.target.value}))}>
              <option value="">Seleccionar facultad</option>
              {faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
             </select>
            </label>}
            <div className="forja-actions">
             <button type="button" disabled={reviewBusy!==null}
              onClick={()=>reviewRegistration(u.id,"APPROVE")}>
              {reviewBusy===u.id?"Guardando...":"Aprobar y activar"}
             </button>
             <button type="button" className="forja-textbutton" disabled={reviewBusy!==null}
              onClick={()=>reviewRegistration(u.id,"REJECT")}>Rechazar</button>
            </div>
           </div>)}
          {users.filter(u=>u.registration_status==="PENDING").length===0&&<p>No hay solicitudes pendientes.</p>}
        </div>
      </section>
      <section className="forja-panel forja-editor-section">
        <h2>Asignaturas</h2>
        <p>Agrega aquí las asignaturas que realmente se vinculen con proyectos FORJA.</p>
        <form onSubmit={createCourse} className="forja-form">
          <div className="forja-fields">
            <label className="full">Nombre de la asignatura
              <input required maxLength={180} value={courseName}
                onChange={e=>setCourseName(e.target.value)}
                placeholder="Ejemplo para pruebas: Taller de competencias digitales"/>
            </label>
          </div>
          <div className="forja-actions">
            <button type="submit" disabled={courseBusy}>{courseBusy?"Guardando...":"Agregar asignatura"}</button>
          </div>
        </form>
        <p className="forja-description">Asignaturas registradas: {courses.length}</p>
        {courses.length>0&&<div className="forja-user-list">{courses.map(course=><div className="forja-user-item" key={course.id}>{course.name}</div>)}</div>}
      </section>
      <section className="forja-panel">
        <h2>Usuarios registrados</h2>
        <div className="forja-user-list">
          {users.map(u=><div key={u.id} className="forja-user-item">
            <div><strong>{u.full_name}</strong><p>{u.email}</p></div>
            <span>{u.rol==="admin"?"Administrador":u.rol==="teacher"?"Profesor":u.rol==="monitor"?"Monitor":u.rol}</span>
            <span>{u.registration_status==="PENDING"?"Pendiente de aprobación":u.registration_status==="REJECTED"?"Solicitud rechazada":u.is_active?"Activo":"Inactivo"}</span>
          </div>)}
        </div>
      </section>
    </>}
  </div></main>;
}
