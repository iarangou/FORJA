"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

type Course = { id: number; name: string };
type CreateResponse = { id: number; code: string; title: string };
type PeriodResponse = { id: number };
type ApiFailure = { message?: string | string[]; missing?: string[] };

async function jsonRequest<T>(url: string, method: "POST" | "PUT", data: unknown): Promise<T> {
  const response = await fetch(url, {
    method, headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data), credentials: "same-origin",
  });
  const payload = (await response.json()) as ApiFailure & T;
  if (!response.ok) {
    const message = Array.isArray(payload.message)
      ? payload.message.join(", ") : payload.message;
    const missing = payload.missing?.join(", ");
    throw new Error([message || "No se pudo completar la solicitud", missing].filter(Boolean).join(": "));
  }
  return payload;
}

const externalOptions: [string,string][] = [
  ["NINGUNO", "Ninguno / no aplica"],
  ["MENORES", "Menores de edad"],
  ["ADULTOS_MAYORES", "Adultos mayores (65 años o más)"],
  ["ADULTOS_MAYORES_INSTITUCIONALIZADOS", "Adultos mayores institucionalizados"],
  ["DISCAPACIDAD", "Personas con discapacidad"],
  ["LGBTIQ", "Comunidad LGBTIQ+"],
  ["VICTIMAS_CONFLICTO", "Víctimas del conflicto armado"],
  ["EXCOMBATIENTES", "Excombatientes / reinsertados"],
  ["PERSONAS_ENFERMEDAD", "Personas en condición de enfermedad"],
  ["MINORIAS_ETNICAS", "Minorías étnicas"],
  ["HABITANTES_CALLE", "Habitantes de calle"],
  ["MIGRANTES", "Población migrante"],
  ["EMBARAZO", "Personas en estado de embarazo"],
  ["VULNERABILIDAD_SOCIOECONOMICA", "Vulnerabilidad socioeconómica"],
  ["OTRO", "Otro"],
];
const universityOptions: [string,string][] = [
  ["NINGUNO", "Ninguno / no aplica"],
  ["ESTUDIANTES_INSTITUCION", "Estudiantes de la misma institución"],
  ["ESTUDIANTES_OTRAS_INSTITUCIONES", "Estudiantes de otras instituciones"],
  ["TRABAJADORES_ORGANIZACION", "Trabajadores de la organización socia"],
  ["PERSONAS_PRIVADAS_LIBERTAD", "Personas privadas de la libertad"],
  ["FUERZAS_ARMADAS_POLICIA", "Fuerzas armadas / Policía"],
  ["OTRO", "Otro"],
];

export default function NewProjectForm() {
  const [courses,setCourses]=useState<Course[]>([]);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [project,setProject]=useState<CreateResponse|null>(null);
  const [period,setPeriod]=useState<PeriodResponse|null>(null);
  const [role,setRole]=useState<number|null>(null);
  const [form,setForm]=useState({
    title:"", general_problem:"", general_objective:"", justification:"",
    community_name:"", community_contact:"",community_location:"",
    registration_type:"NUEVO", duration:"1", academic_year:"2026", academic_semester:"2",
    course_id:"", objectives:"", activities:"", student_count:"",
    budget:"", start_date:"", end_date:"", missing_information:"",
    external_population:"NINGUNO", university_population:"NINGUNO",
    involves_vulnerable_population:false, handles_personal_data:false,
    identifiable_media:false, privacy_measures:"", risk_mitigation:"",
    truthful_declaration:false,
  });
  function change<K extends keyof typeof form>(field:K,value:(typeof form)[K]){
    setForm(current=>({...current,[field]:value}));
  }
  useEffect(()=>{
    fetch("/api/courses",{credentials:"same-origin"})
      .then(r=>r.ok?r.json():[])
      .then((value:unknown)=>setCourses(Array.isArray(value)?value:[]))
      .catch(()=>setCourses([]));
  },[]);
  useEffect(()=>{
    fetch("/api/users/me",{credentials:"same-origin"})
      .then(async response=>{
        if(!response.ok) return null;
        const data = (await response.json()) as {rol_id?:number};
        return typeof data.rol_id==="number"?data.rol_id:null;
      })
      .then(nextRole=>{
        setRole(nextRole);
        if(nextRole===2)setForm(current=>({...current,registration_type:"HISTORICO"}));
        if(nextRole===3)setForm(current=>({...current,registration_type:"NUEVO"}));
      })
      .catch(()=>setRole(null));
  },[]);

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(loading)return;
    setLoading(true);setError("");setMessage("");
    try {
      let nextProject=project;
      if(!nextProject){
        nextProject=await jsonRequest<CreateResponse>("/api/projects","POST",{
          title:form.title, general_problem:form.general_problem || undefined,
          general_objective:form.general_objective || undefined,
          justification:form.justification || undefined,
          community_name:form.community_name || undefined,
          community_contact:form.community_contact || undefined,
          community_location:form.community_location || undefined,
          registration_type:form.registration_type,
          duration:Number(form.duration),
          ...(form.start_date?{start_date:form.start_date}:{}),
          ...(form.end_date?{end_date:form.end_date}:{}),
        });
        setProject(nextProject);
      }
      let nextPeriod=period;
      if(!nextPeriod){
        nextPeriod=await jsonRequest<PeriodResponse>(
          `/api/projects/${nextProject.id}/periods`,"POST",{
          academic_year:Number(form.academic_year),
          academic_semester:Number(form.academic_semester),
          record_type:form.registration_type==="HISTORICO"?"HISTORICO":"ACTUAL",
          ...(form.course_id?{course_id:Number(form.course_id)}:{}),
          ...(form.student_count?{student_count:Number(form.student_count)}:{}),
          ...(form.budget?{budget:Number(form.budget)}:{}),
          ...(form.start_date?{start_date:form.start_date}:{}),
          ...(form.end_date?{end_date:form.end_date}:{}),
          objectives:form.objectives,activities:form.activities,
          missing_information:form.missing_information || undefined,
        });
        setPeriod(nextPeriod);
      }
      if(form.registration_type==="NUEVO"){
        await jsonRequest(`/api/projects/${nextProject.id}/ethics`,"PUT",{
          external_population:form.external_population,
          university_population:form.university_population,
          handles_personal_data:form.handles_personal_data,
          involves_vulnerable_population:form.involves_vulnerable_population,
          identifiable_media:form.identifiable_media,
          privacy_measures:form.privacy_measures,
          risk_mitigation:form.risk_mitigation,
          truthful_declaration:form.truthful_declaration,
        });
      }
      setMessage(`Proyecto ${nextProject.code} y período guardados en BORRADOR. Puedes consultarlo en el listado.`);
    }catch(e:unknown){
      setError(e instanceof Error?e.message:"No fue posible guardar el formulario");
    }finally{setLoading(false);}
  }

  async function submit(){
    if(!project||!period||loading||role!==3)return;
    setLoading(true);setError("");
    try{
      await jsonRequest(
        `/api/projects/${project.id}/periods/${period.id}/submit`,"POST",{});
      setMessage("Período enviado a revisión. El administrador deberá decidir.");
    }catch(e:unknown){setError(e instanceof Error?e.message:"No fue posible presentar el período");}
    finally{setLoading(false);}
  }

  return (
    <main className="forja-projects">
      <div className="forja-shell">
        <nav className="forja-nav">
          <Link href="/">FORJA</Link><Link href="/proyectos">Mis proyectos</Link>
        </nav>
        <div className="forja-heading">
          <span className="forja-eyebrow">GESTIÓN DE PROYECTOS</span>
          <h1>{role===2?"Digitalizar proyecto histórico":"Registrar proyecto"}</h1>
          <p>{role===2?"Registra únicamente la información histórica disponible. No es necesario inventar datos ni aprobar períodos anteriores.":"Completa la información disponible. El sistema permite guardar primero un borrador; la aprobación ocurre por semestre."}</p>
        </div>
        <form onSubmit={save} className="forja-form">
          <section className="forja-panel">
            <h2>01. Información general</h2>
            <div className="forja-fields">
              <label>Tipo de registro
                <select value={form.registration_type} disabled={!!project} onChange={e=>change("registration_type",e.target.value)}>
                  {role!==2&&<option value="NUEVO">Proyecto nuevo (profesor)</option>}
                  {role!==3&&<option value="HISTORICO">Digitalización histórica (monitor)</option>}
                </select>
              </label>
              <label>Título del proyecto *
                <input required maxLength={255} disabled={!!project} value={form.title} onChange={e=>change("title",e.target.value)}/>
              </label>
              <label>Comunidad u organización
                <input disabled={!!project} value={form.community_name} onChange={e=>change("community_name",e.target.value)}/>
              </label>
              <label>Contacto comunitario (solo si se dispone de autorización)
                <input disabled={!!project} value={form.community_contact} onChange={e=>change("community_contact",e.target.value)}/>
              </label>
              <label className="full">Problemática
                <textarea disabled={!!project} rows={3} value={form.general_problem} onChange={e=>change("general_problem",e.target.value)}/>
              </label>
              <label className="full">Objetivo general
                <textarea disabled={!!project} rows={3} value={form.general_objective} onChange={e=>change("general_objective",e.target.value)}/>
              </label>
              <label className="full">Justificación
                <textarea disabled={!!project} rows={2} value={form.justification} onChange={e=>change("justification",e.target.value)}/>
              </label>
            </div>
            {project && <p className="forja-note">Código asignado: <strong>{project.code}</strong>. Los datos generales ya están guardados; su edición estará disponible en una etapa posterior.</p>}
          </section>
          <section className="forja-panel">
            <h2>02. Período académico</h2>
            <div className="forja-fields">
              <label>Año
                <input type="number" min="1900" max="2200" disabled={!!period} required value={form.academic_year} onChange={e=>change("academic_year",e.target.value)}/>
              </label>
              <label>Semestre
                <select disabled={!!period} value={form.academic_semester} onChange={e=>change("academic_semester",e.target.value)}>
                  <option value="1">Primero</option><option value="2">Segundo</option>
                </select>
              </label>
              <label>Duración del proyecto
                <select disabled={!!project} value={form.duration} onChange={e=>change("duration",e.target.value)}>
                  <option value="1">Un semestre</option><option value="2">Dos semestres</option>
                </select>
              </label>
              <label>Asignatura
                <select disabled={!!period} value={form.course_id} onChange={e=>change("course_id",e.target.value)}>
                  <option value="">Seleccionar asignatura</option>
                  {courses.map(course=><option key={course.id} value={course.id}>{course.name}</option>)}
                </select>
                {courses.length===0&&<small>El administrador debe registrar las asignaturas reales; no se crearán nombres ficticios.</small>}
              </label>
              <label>Fecha de inicio
                <input disabled={!!period} type="date" value={form.start_date} onChange={e=>change("start_date",e.target.value)}/>
              </label>
              <label>Fecha de finalización
                <input disabled={!!period} type="date" value={form.end_date} onChange={e=>change("end_date",e.target.value)}/>
              </label>
              <label>Número de estudiantes
                <input disabled={!!period} type="number" min="0" value={form.student_count} onChange={e=>change("student_count",e.target.value)}/>
              </label>
              <label>Presupuesto (COP)
                <input disabled={!!period} type="number" min="0" step="0.01" value={form.budget} onChange={e=>change("budget",e.target.value)}/>
              </label>
              <label className="full">Objetivos del período
                <textarea disabled={!!period} rows={3} value={form.objectives} onChange={e=>change("objectives",e.target.value)}/>
              </label>
              <label className="full">Actividades
                <textarea disabled={!!period} rows={3} value={form.activities} onChange={e=>change("activities",e.target.value)}/>
              </label>
              {form.registration_type==="HISTORICO"&&
                <label className="full">Información o documentación histórica faltante
                  <textarea disabled={!!period} rows={3} value={form.missing_information} onChange={e=>change("missing_information",e.target.value)}/>
                </label>}
            </div>
          </section>
          {form.registration_type==="NUEVO"&&<section className="forja-panel">
            <h2>03. Consideraciones éticas</h2>
            <p className="forja-description">Preguntas iniciales propuestas a partir del formato recibido. No sustituyen una revisión ética institucional.</p>
            <div className="forja-fields">
              <label>Población externa predominante
                <select value={form.external_population} onChange={e=>change("external_population",e.target.value)}>
                  {externalOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>Grupo universitario predominante
                <select value={form.university_population} onChange={e=>change("university_population",e.target.value)}>
                  {universityOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="forja-check"><input type="checkbox" checked={form.involves_vulnerable_population} onChange={e=>change("involves_vulnerable_population",e.target.checked)}/> Participa población vulnerable o que requiere protección adicional</label>
              <label className="forja-check"><input type="checkbox" checked={form.handles_personal_data} onChange={e=>change("handles_personal_data",e.target.checked)}/> Se tratarán datos personales</label>
              <label className="forja-check"><input type="checkbox" checked={form.identifiable_media} onChange={e=>change("identifiable_media",e.target.checked)}/> Se crearán fotos o videos identificables</label>
              <label className="full">Protección de la privacidad
                <textarea value={form.privacy_measures} rows={2} onChange={e=>change("privacy_measures",e.target.value)}/>
              </label>
              <label className="full">Medidas para mitigar riesgos
                <textarea value={form.risk_mitigation} rows={2} onChange={e=>change("risk_mitigation",e.target.value)}/>
              </label>
              <label className="forja-check full"><input type="checkbox" checked={form.truthful_declaration} onChange={e=>change("truthful_declaration",e.target.checked)}/> Declaro que la información suministrada es verídica</label>
            </div>
            <p className="forja-description">Esta información permite al administrador evaluar el proyecto. No se exige un aval automáticamente por seleccionar una población.</p>
          </section>}
          {form.registration_type==="HISTORICO"&&<p className="forja-note">Después de guardar, abre el proyecto para agregar más semestres históricos o completar la información faltante.</p>}
          {error&&<p role="alert" className="forja-alert">{error}</p>}
          {message&&<p role="status" className="forja-ok">{message}</p>}
          <div className="forja-actions">
            <button type="submit" disabled={loading}>{loading?"Guardando...":"Guardar borrador"}</button>
            {project&&period&&role===3&&form.registration_type==="NUEVO"&&
              <button className="secondary" type="button" disabled={loading} onClick={submit}>Enviar período a revisión</button>}
          </div>
        </form>
      </div>
    </main>
  );
}
