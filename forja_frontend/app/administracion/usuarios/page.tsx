"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import "@/styles/projects.css";

type Faculty = { id: number; name: string };
type User = {
  id: number; username: string; email: string; full_name: string;
  rol_id: number; rol: string; is_active: boolean;
};
type ApiError = { message?: string | string[] };
function makeTemporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const random = new Uint32Array(24);
  crypto.getRandomValues(random);
  return Array.from(random, value => alphabet[value % alphabet.length]).join("");
}

export default function AdminUsersPage() {
  const [role,setRole] = useState<number|null>(null);
  const [users,setUsers] = useState<User[]>([]);
  const [faculties,setFaculties] = useState<Faculty[]>([]);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");
  const [courseName,setCourseName] = useState("");
  const [courses,setCourses] = useState<{id:number;name:string}[]>([]);
  const [courseBusy,setCourseBusy] = useState(false);
  const [form,setForm] = useState({
    full_name:"Docente de prueba",
    email:"docente.prueba@javerianacali.edu.co",
    rol_id:3,
    faculty_id:"",
    password:"",
  });

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

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(saving)return;
    setError("");setSuccess("");setSaving(true);
    try{
      if(form.rol_id===3&&!form.faculty_id)throw new Error("Selecciona una facultad para el profesor.");
      if(!form.password || form.password.length<12)throw new Error("La contraseña debe tener mínimo 12 caracteres.");
      const res=await fetch("/api/users",{
        method:"POST",
        credentials:"same-origin",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          full_name:form.full_name.trim(),
          email:form.email.trim().toLowerCase(),
          rol_id:form.rol_id,
          is_active:true,
          password:form.password,
          ...(form.rol_id===3?{faculty_id:Number(form.faculty_id)}:{}),
        }),
      });
      const data=await res.json() as ApiError;
      if(!res.ok)throw new Error(Array.isArray(data.message)?data.message.join(", "):data.message||"No se pudo crear el usuario.");
      setSuccess("Usuario creado. Copia y entrega su contraseña únicamente a la persona que usará la cuenta. En esta etapa todavía no hay cambio obligatorio de contraseña en el primer acceso.");
      await refreshUsers();
    }catch(e:unknown){setError(e instanceof Error?e.message:"Error de servidor");}
    finally{setSaving(false);}
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
    <nav className="forja-nav"><Link href="/proyectos">← Proyectos</Link><LogoutButton/></nav>
    <div className="forja-heading">
      <span className="forja-eyebrow">ADMINISTRACIÓN FORJA</span>
      <h1>Usuarios y roles</h1>
      <p>El administrador crea las cuentas. Profesores y monitores no pueden registrarse desde la página pública.</p>
    </div>
    {loading&&<p>Cargando...</p>}
    {error&&<p role="alert" className="forja-alert">{error}</p>}
    {!loading&&role!==1&&<p role="alert" className="forja-alert">Solo los administradores pueden administrar usuarios.</p>}
    {!loading&&role===1&&<>
      <section className="forja-panel forja-editor-section">
        <h2>Crear usuario</h2>
        <form onSubmit={submit} className="forja-form">
          <div className="forja-fields">
            <label>Nombre completo
              <input required maxLength={180} value={form.full_name} onChange={e=>setForm(v=>({...v,full_name:e.target.value}))}/>
            </label>
            <label>Correo institucional
              <input required type="email" autoComplete="off" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/>
            </label>
            <label>Rol
              <select value={form.rol_id} onChange={e=>setForm(v=>({...v,rol_id:Number(e.target.value)}))}>
                <option value={3}>Profesor</option>
                <option value={2}>Monitor (digitalización histórica)</option>
              </select>
            </label>
            {form.rol_id===3&&<label>Facultad del docente
              <select required value={form.faculty_id} onChange={e=>setForm(v=>({...v,faculty_id:e.target.value}))}>
                <option value="">Seleccionar</option>
                {faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </label>}
            <label className="full">Contraseña inicial (mínimo 12 caracteres)
              <input type="text" minLength={12} required value={form.password} onChange={e=>setForm(v=>({...v,password:e.target.value}))} autoComplete="off" spellCheck={false}/>
              <button type="button" className="forja-textbutton" onClick={()=>setForm(v=>({...v,password:makeTemporaryPassword()}))}>Generar contraseña aleatoria</button>
              <small>Evita reutilizar contraseñas. No hagas capturas ni compartas este valor públicamente. La cuenta de prueba es solo local.</small>
            </label>
          </div>
          {success&&<p className="forja-ok" role="status">{success}</p>}
          <div className="forja-actions"><button type="submit" disabled={saving}>{saving?"Creando...":"Crear usuario"}</button></div>
        </form>
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
            <span>{u.is_active?"Activo":"Inactivo"}</span>
          </div>)}
        </div>
      </section>
    </>}
  </div></main>;
}
