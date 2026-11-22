"use client";

import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";

type Project = {
  id:number; code:string; title:string; general_problem:string|null;
  general_objective:string|null; justification:string|null;
  community_name:string|null; community_contact:string|null;
  community_location:string|null; duration:number|null;
  general_status:string; registration_type:string;
};
type Period = {
  id:number;academic_year:number;academic_semester:number;
  approval_status:string;record_type:string;
  course_id:number|null;objectives:string|null;activities:string|null;
  budget:number|null;student_count:number|null;
  start_date:string|null;end_date:string|null;
  missing_information:string|null;
};
type Review = {id:number;decision:string;notes:string|null;reviewed_at:string;reviewer:string};
type Ethics = {
  external_population:string|null; university_population:string|null;
  handles_personal_data:boolean|null;involves_vulnerable_population:boolean|null;
  identifiable_media:boolean|null;privacy_measures:string|null;
  risk_mitigation:string|null;truthful_declaration:boolean;
};
const externalCategories=[
  ["NINGUNO","Ninguno / no aplica"],["MENORES","Menores de edad"],
  ["ADULTOS_MAYORES","Adultos mayores"],["ADULTOS_MAYORES_INSTITUCIONALIZADOS","Adultos mayores institucionalizados"],
  ["DISCAPACIDAD","Personas con discapacidad"],["LGBTIQ","Comunidad LGBTIQ+"],
  ["VICTIMAS_CONFLICTO","Víctimas del conflicto armado"],["EXCOMBATIENTES","Excombatientes"],
  ["PERSONAS_ENFERMEDAD","Personas en condición de enfermedad"],["MINORIAS_ETNICAS","Minorías étnicas"],
  ["HABITANTES_CALLE","Habitantes de calle"],["MIGRANTES","Población migrante"],
  ["EMBARAZO","Personas en estado de embarazo"],["VULNERABILIDAD_SOCIOECONOMICA","Vulnerabilidad socioeconómica"],
  ["OTRO","Otro"],
];
const universityCategories=[
  ["NINGUNO","Ninguno / no aplica"],["ESTUDIANTES_INSTITUCION","Estudiantes de la institución"],
  ["ESTUDIANTES_OTRAS_INSTITUCIONES","Estudiantes de otras instituciones"],
  ["TRABAJADORES_ORGANIZACION","Trabajadores de la organización"],
  ["PERSONAS_PRIVADAS_LIBERTAD","Personas privadas de la libertad"],
  ["FUERZAS_ARMADAS_POLICIA","Fuerzas armadas / Policía"],["OTRO","Otro"],
];
async function requestJSON<T>(url:string, method:"GET"|"PATCH"|"PUT"|"POST"="GET",body?:unknown):Promise<T>{
  const res=await fetch(url,{method,credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json"},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const data=await res.json();
  if(!res.ok) {
    const details=Array.isArray(data.missing)?data.missing.join(", "):"";
    const message=typeof data.message==="string"?data.message:"Error del servidor";
    throw new Error([message,details].filter(Boolean).join(": "));
  }
  return data as T;
}
function dateOnly(value:string|null|undefined){return value?value.slice(0,10):"";}

export default function ProjectDetailEditor(){
  const params=useParams<{projectId:string}>();
  const projectId=params.projectId;
  const [project,setProject]=useState<Project|null>(null);
  const [periods,setPeriods]=useState<Period[]>([]);
  const [activeId,setActiveId]=useState<number|null>(null);
  const [reviews,setReviews]=useState<Review[]>([]);
  const [ethics,setEthics]=useState<Ethics|null>(null);
  const [courses,setCourses]=useState<{id:number;name:string}[]>([]);
  const [role,setRole]=useState<number|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  async function reload(){
    const [p,pe,e,user,c]=await Promise.all([
      requestJSON<Project>(`/api/projects/${projectId}`),
      requestJSON<Period[]>(`/api/projects/${projectId}/periods`),
      requestJSON<Ethics|null>(`/api/projects/${projectId}/ethics`),
      requestJSON<{rol_id:number}>("/api/users/me"),
      requestJSON<{id:number;name:string}[]>("/api/courses").catch(()=>[]),
    ]);
    setProject(p);setPeriods(pe);setEthics(e);setRole(user.rol_id);setCourses(c);
    setActiveId(current=>current!==null&&pe.some(x=>x.id===current)?current:(pe[0]?.id??null));
  }
  useEffect(()=>{
    let active=true;
    Promise.all([
      requestJSON<Project>(`/api/projects/${projectId}`),
      requestJSON<Period[]>(`/api/projects/${projectId}/periods`),
      requestJSON<Ethics|null>(`/api/projects/${projectId}/ethics`),
      requestJSON<{rol_id:number}>("/api/users/me"),
      requestJSON<{id:number;name:string}[]>("/api/courses").catch(()=>[]),
    ]).then(([p,pe,e,user,c])=>{
      if(!active)return;
      setProject(p);setPeriods(pe);setEthics(e);setRole(user.rol_id);setCourses(c);
      setActiveId(pe[0]?.id??null);
    }).catch(e=>{if(active)setError(e instanceof Error?e.message:"No se pudo abrir el proyecto");});
    return ()=>{active=false};
  },[projectId]);
  useEffect(()=>{
    if(activeId===null){setReviews([]);return;}
    let active=true;
    requestJSON<Review[]>(`/api/projects/${projectId}/periods/${activeId}/reviews`)
      .then(data=>{if(active)setReviews(data)})
      .catch(()=>{if(active)setReviews([])});
    return ()=>{active=false};
  },[projectId,activeId]);

  const period=periods.find(x=>x.id===activeId);
  const editable=Boolean(project&&period&&project.general_status==="ACTIVO"&&
    (role===1||role===3)&&period.record_type==="ACTUAL"&&
    ["BORRADOR","DEVUELTO"].includes(period.approval_status));
  const generalEditable=Boolean(project&&project.general_status==="ACTIVO"&&
    (role===1||role===3)&&!periods.some(x=>["EN_REVISION","APROBADO"].includes(x.approval_status)));
  const ethicsEditable=generalEditable;

  function updateProject<K extends keyof Project>(key:K,value:Project[K]) {
    setProject(v=>v?{...v,[key]:value}:v);
  }
  function updatePeriod<K extends keyof Period>(key:K,value:Period[K]) {
    setPeriods(v=>v.map(item=>item.id===activeId?{...item,[key]:value}:item));
  }
  function updateEthics<K extends keyof Ethics>(key:K,value:Ethics[K]) {
    setEthics(v=>({...v,...{[key]:value}} as Ethics));
  }
  async function saveGeneral(){
    if(!project)return;
    setBusy(true);setError("");setMessage("");
    try {
      await requestJSON(`/api/projects/${projectId}`,"PATCH",{
        title:project.title,general_problem:project.general_problem??"",
        general_objective:project.general_objective??"",
        justification:project.justification??"",
        community_name:project.community_name??"",
        community_contact:project.community_contact??"",
        community_location:project.community_location??"",
        ...(project.duration?{duration:project.duration}:{}),
      });
      setMessage("Información general actualizada.");
      await reload();
    }catch(e){setError(e instanceof Error?e.message:"Error al guardar");}finally{setBusy(false);}
  }
  async function savePeriod(){
    if(!period)return;
    setBusy(true);setError("");setMessage("");
    try {
      await requestJSON(`/api/projects/${projectId}/periods/${period.id}`,"PATCH",{
        ...(period.course_id?{course_id:period.course_id}:{}),
        objectives:period.objectives??"",activities:period.activities??"",
        ...(period.student_count!==null?{student_count:Number(period.student_count)}:{}),
        ...(period.budget!==null?{budget:Number(period.budget)}:{}),
        ...(period.start_date?{start_date:dateOnly(period.start_date)}:{}),
        ...(period.end_date?{end_date:dateOnly(period.end_date)}:{}),
        missing_information:period.missing_information??"",
      });
      setMessage("Cambios del período guardados.");
      await reload();
    }catch(e){setError(e instanceof Error?e.message:"Error al guardar período");}finally{setBusy(false);}
  }
  async function saveEthics(){
    if(!ethics)return;
    setBusy(true);setError("");setMessage("");
    try {
      await requestJSON(`/api/projects/${projectId}/ethics`,"PUT",{
        external_population:ethics.external_population??"NINGUNO",
        university_population:ethics.university_population??"NINGUNO",
        handles_personal_data:Boolean(ethics.handles_personal_data),
        involves_vulnerable_population:Boolean(ethics.involves_vulnerable_population),
        identifiable_media:Boolean(ethics.identifiable_media),
        privacy_measures:ethics.privacy_measures??"",
        risk_mitigation:ethics.risk_mitigation??"",
        truthful_declaration:Boolean(ethics.truthful_declaration),
      });
      setMessage("Análisis ético guardado.");
      await reload();
    }catch(e){setError(e instanceof Error?e.message:"Error al guardar análisis ético");}finally{setBusy(false);}
  }
  async function submit(){
    if(!period)return;
    setBusy(true);setError("");setMessage("");
    try{
      await requestJSON(`/api/projects/${projectId}/periods/${period.id}/submit`,"POST",{});
      setMessage("Período presentado para revisión del administrador.");
      await reload();
    }catch(e){setError(e instanceof Error?e.message:"No se pudo enviar");}finally{setBusy(false);}
  }
  if(!project)return <main className="forja-projects"><div className="forja-shell">
    <nav className="forja-nav"><Link href="/proyectos">← Proyectos</Link></nav>
    <p>{error||"Abriendo proyecto..."}</p></div></main>;

  return <main className="forja-projects"><div className="forja-shell">
    <nav className="forja-nav"><Link href="/proyectos">← Volver a proyectos</Link><Link href="/">FORJA</Link></nav>
    <div className="forja-heading">
      <span className="forja-eyebrow">{project.code} · {project.registration_type}</span>
      <h1>{project.title}</h1>
      <p>Consulta y completa los datos de tu proyecto. Los campos solo se pueden editar antes de la aprobación.</p>
    </div>
    {message&&<p className="forja-ok" role="status">{message}</p>}
    {error&&<p className="forja-alert" role="alert">{error}</p>}
    <section className="forja-panel forja-editor-section">
      <h2>01. Información general</h2>
      <div className="forja-fields">
        <label>Título<input disabled={!generalEditable||busy} value={project.title} onChange={e=>updateProject("title",e.target.value)}/></label>
        <label>Comunidad<input disabled={!generalEditable||busy} value={project.community_name??""} onChange={e=>updateProject("community_name",e.target.value)}/></label>
        <label>Contacto<input disabled={!generalEditable||busy} value={project.community_contact??""} onChange={e=>updateProject("community_contact",e.target.value)}/></label>
        <label>Ubicación<input disabled={!generalEditable||busy} value={project.community_location??""} onChange={e=>updateProject("community_location",e.target.value)}/></label>
        <label className="full">Problemática<textarea disabled={!generalEditable||busy} rows={3} value={project.general_problem??""} onChange={e=>updateProject("general_problem",e.target.value)}/></label>
        <label className="full">Objetivo general<textarea disabled={!generalEditable||busy} rows={3} value={project.general_objective??""} onChange={e=>updateProject("general_objective",e.target.value)}/></label>
        <label className="full">Justificación<textarea disabled={!generalEditable||busy} rows={3} value={project.justification??""} onChange={e=>updateProject("justification",e.target.value)}/></label>
      </div>
      <div className="forja-actions"><button type="button" disabled={!generalEditable||busy} onClick={saveGeneral}>Guardar información general</button></div>
      {!generalEditable&&<p className="forja-note">Los datos generales están bloqueados mientras haya períodos en revisión o aprobados.</p>}
    </section>
    <section className="forja-panel forja-editor-section">
      <h2>02. Períodos académicos</h2>
      {periods.length===0?<p>No hay períodos para este proyecto.</p>:<>
        <div className="forja-tabs">{periods.map(p=><button type="button" className={p.id===activeId?"active":""} key={p.id} onClick={()=>setActiveId(p.id)}>{p.academic_year}-{p.academic_semester}</button>)}</div>
        {period&&<><p className="forja-note"><strong>Estado:</strong> {period.approval_status} · {period.record_type}</p>
          <div className="forja-fields">
            <label>Asignatura<select disabled={!editable||busy} value={period.course_id??""} onChange={e=>updatePeriod("course_id",e.target.value?Number(e.target.value):null)}>
              <option value="">Seleccionar asignatura</option>
              {courses.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}
            </select></label>
            <label>Número de estudiantes<input type="number" min="0" disabled={!editable||busy} value={period.student_count??""} onChange={e=>updatePeriod("student_count",e.target.value===""?null:Number(e.target.value))}/></label>
            <label>Presupuesto COP<input type="number" min="0" step="0.01" disabled={!editable||busy} value={period.budget??""} onChange={e=>updatePeriod("budget",e.target.value===""?null:Number(e.target.value))}/></label>
            <label>Fecha de inicio<input type="date" disabled={!editable||busy} value={dateOnly(period.start_date)} onChange={e=>updatePeriod("start_date",e.target.value)}/></label>
            <label>Fecha de finalización<input type="date" disabled={!editable||busy} value={dateOnly(period.end_date)} onChange={e=>updatePeriod("end_date",e.target.value)}/></label>
            <label className="full">Objetivos del período<textarea rows={3} disabled={!editable||busy} value={period.objectives??""} onChange={e=>updatePeriod("objectives",e.target.value)}/></label>
            <label className="full">Actividades<textarea rows={3} disabled={!editable||busy} value={period.activities??""} onChange={e=>updatePeriod("activities",e.target.value)}/></label>
            {period.record_type==="HISTORICO"&&<label className="full">Información faltante<textarea rows={3} disabled value={period.missing_information??""}/></label>}
          </div>
          <div className="forja-actions">
            <button type="button" disabled={!editable||busy} onClick={savePeriod}>Guardar cambios del semestre</button>
            {role===3&&editable&&<button type="button" className="secondary" disabled={busy} onClick={submit}>Enviar a revisión</button>}
          </div>
          <h3>Historial de observaciones</h3>
          {reviews.length===0?<p>Aún no hay decisiones del administrador.</p>:
          <div className="forja-reviews">{reviews.map(r=><div key={r.id}><strong>{r.decision}</strong> · {new Date(r.reviewed_at).toLocaleDateString("es-CO")} · {r.reviewer}
            <p>{r.notes||"Sin observaciones adicionales"}</p></div>)}</div>}
        </>}
      </>}
    </section>
    <section className="forja-panel forja-editor-section">
      <h2>03. Consideraciones éticas</h2>
      {!ethics?<p>No se ha diligenciado un análisis ético para este proyecto.</p>:<>
        <div className="forja-fields">
          <label>Población externa predominante<select disabled={!ethicsEditable||busy} value={ethics.external_population??"NINGUNO"} onChange={e=>updateEthics("external_population",e.target.value)}>
            {externalCategories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
          <label>Grupo universitario<select disabled={!ethicsEditable||busy} value={ethics.university_population??"NINGUNO"} onChange={e=>updateEthics("university_population",e.target.value)}>
            {universityCategories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
          <label className="forja-check"><input disabled={!ethicsEditable||busy} type="checkbox" checked={Boolean(ethics.involves_vulnerable_population)} onChange={e=>updateEthics("involves_vulnerable_population",e.target.checked)}/> Población vulnerable</label>
          <label className="forja-check"><input disabled={!ethicsEditable||busy} type="checkbox" checked={Boolean(ethics.handles_personal_data)} onChange={e=>updateEthics("handles_personal_data",e.target.checked)}/> Tratamiento de datos personales</label>
          <label className="forja-check"><input disabled={!ethicsEditable||busy} type="checkbox" checked={Boolean(ethics.identifiable_media)} onChange={e=>updateEthics("identifiable_media",e.target.checked)}/> Evidencias con personas identificables</label>
          <label className="full">Medidas de privacidad<textarea rows={3} disabled={!ethicsEditable||busy} value={ethics.privacy_measures??""} onChange={e=>updateEthics("privacy_measures",e.target.value)}/></label>
          <label className="full">Mitigación de riesgos<textarea rows={3} disabled={!ethicsEditable||busy} value={ethics.risk_mitigation??""} onChange={e=>updateEthics("risk_mitigation",e.target.value)}/></label>
          <label className="forja-check full"><input disabled={!ethicsEditable||busy} type="checkbox" checked={ethics.truthful_declaration} onChange={e=>updateEthics("truthful_declaration",e.target.checked)}/> Declaro que la información es verídica</label>
        </div>
        <div className="forja-actions"><button type="button" disabled={!ethicsEditable||busy} onClick={saveEthics}>Guardar análisis ético</button></div>
      </>}
    </section>
  </div></main>;
}
