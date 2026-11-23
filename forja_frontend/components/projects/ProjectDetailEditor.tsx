"use client";

import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import EvidenceSection from "./EvidenceSection";
import PeriodResultsSection from "./PeriodResultsSection";
import ProjectAccordion from "./ProjectAccordion";
import PeriodWorkflow from "./PeriodWorkflow";
import HistoricalProjectSection from "./HistoricalProjectSection";
import FinalLetterSection from "./FinalLetterSection";
import CommunityFeedbackSection from "./CommunityFeedbackSection";
import ClassificationPicker from "./ClassificationPicker";
import {ODS} from "@/lib/ods";

type Project = {
  id:number; code:string; title:string; general_problem:string|null;
  general_objective:string|null; justification:string|null;
  community_name:string|null; community_contact:string|null;
  community_location:string|null; duration:number|null;
  ods_ids:number[];
  general_status:string; registration_type:string;
};
type Period = {
  id:number;academic_year:number;academic_semester:number;
  approval_status:string;record_type:string;
  course_id:number|null;objectives:string|null;activities:string|null;
  budget:number|null;student_count:number|null;
  start_date:string|null;end_date:string|null;
  missing_information:string|null;
  historical_teacher_name:string|null;
  faculty_id:number|null;department_id:number|null;academic_program_id:number|null;
  community_population_description:string|null;territory_name:string|null;
  results:string|null;conclusions:string|null;execution_status:string;
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
  const [evidenceRevision,setEvidenceRevision]=useState(0);
  const [ethics,setEthics]=useState<Ethics|null>(null);
  const [courses,setCourses]=useState<{id:number;name:string}[]>([]);
  const [faculties,setFaculties]=useState<{id:number;name:string}[]>([]);
  const [programs,setPrograms]=useState<{id:number;name:string;faculty_id:number}[]>([]);
  const [departments,setDepartments]=useState<{id:number;name:string;faculty_id:number}[]>([]);
  const [role,setRole]=useState<number|null>(null);
  const [zones,setZones]=useState<{id:number;name:string}[]>([]);

  const [selectedZones,setSelectedZones]=useState<number[]>([]);
  const [selectedODS,setSelectedODS]=useState<number[]>([]);
  const [busy,setBusy]=useState(false);
  const [openSection,setOpenSection]=useState<string|null>("general");
  function toggleSection(section:string){setOpenSection(current=>current===section?null:section);}
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
    setProject(p);setPeriods(pe);setEthics(e);setRole(user.rol_id);setCourses(c);setSelectedODS(p.ods_ids??[]);
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
      setProject(p);setPeriods(pe);setEthics(e);setRole(user.rol_id);setCourses(c);setSelectedODS(p.ods_ids??[]);
      setActiveId(pe[0]?.id??null);
    }).catch(e=>{if(active)setError(e instanceof Error?e.message:"No se pudo abrir el proyecto");});
    return ()=>{active=false};
  },[projectId]);
  useEffect(()=>{
    let alive=true;
    Promise.all([fetch("/api/faculty"),fetch("/api/faculty/programs"),fetch("/api/faculty/departments")])
      .then(async ([f,p,d])=>{
        if(f.ok){const data:unknown=await f.json();if(alive)setFaculties(Array.isArray(data)?data:[]);}
        if(p.ok){const data:unknown=await p.json();if(alive)setPrograms(Array.isArray(data)?data:[]);}
        if(d.ok){const data:unknown=await d.json();if(alive)setDepartments(Array.isArray(data)?data:[]);}
      }).catch(()=>undefined);
    return ()=>{alive=false;};
  },[]);
  useEffect(()=>{
    let active=true;
    Promise.all([
      requestJSON<{id:number;name:string}[]>("/api/project-classifications/zones"),
      requestJSON<number[]>(`/api/projects/${projectId}/classifications/zones`),
    ]).then(([z,sz])=>{
      if(active){setZones(z);setSelectedZones(sz);}
    }).catch(e=>{if(active)setError(e instanceof Error?e.message:"Error cargando zonas y compromisos");});
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
  const historicalEditor=project?.registration_type==="HISTORICO" && role===2;
  const historicalPeriod=period?.record_type==="HISTORICO";
  const canEditPeriod=Boolean(period&&project?.general_status==="ACTIVO"&&(
    historicalPeriod ? (role===1||role===2) : editable
  ));
  const generalEditable=Boolean(project&&project.general_status==="ACTIVO"&&
    (role===1||role===3||historicalEditor)&&
    !periods.some(x=>x.record_type==="ACTUAL"&&["EN_REVISION","APROBADO"].includes(x.approval_status)));
  const ethicsEditable=generalEditable;
  const ethicsData:Ethics = ethics ?? {
    external_population:"NINGUNO",university_population:"NINGUNO",
    handles_personal_data:false,involves_vulnerable_population:false,
    identifiable_media:false,privacy_measures:"",risk_mitigation:"",
    truthful_declaration:false,
  };

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
      await requestJSON(`/api/projects/${projectId}/classifications/zones`,"PUT",{ids:selectedZones});
      setMessage("Información general actualizada.");
      await reload();
    }catch(e){setError(e instanceof Error?e.message:"Error al guardar");}finally{setBusy(false);}
  }
  async function savePeriod(){
    if(!period||!canEditPeriod)return;
    setBusy(true);setError("");setMessage("");
    try {
      const historical=period.record_type==="HISTORICO";
      const payload={
        ...(historical?{course_id:period.course_id,faculty_id:period.faculty_id,department_id:period.department_id,
          academic_program_id:period.academic_program_id,
          historical_teacher_name:period.historical_teacher_name??"",
          results:period.results??"",conclusions:period.conclusions??"",
          missing_information:period.missing_information??""}:
          {...(period.course_id?{course_id:period.course_id}:{}),
           ...(period.faculty_id?{faculty_id:period.faculty_id}:{}),
           ...(period.department_id?{department_id:period.department_id}:{}),
           ...(period.academic_program_id?{academic_program_id:period.academic_program_id}:{})}),
        community_population_description:period.community_population_description??"",
        territory_name:period.territory_name??"",
        objectives:period.objectives??"",activities:period.activities??"",
        ...(historical?{student_count:period.student_count,budget:period.budget}:
          {...(period.student_count!==null?{student_count:Number(period.student_count)}:{}),
           ...(period.budget!==null?{budget:Number(period.budget)}:{})}),
        ...(period.start_date?{start_date:dateOnly(period.start_date)}:{}),
        ...(period.end_date?{end_date:dateOnly(period.end_date)}:{}),
      };
      const url=historical
        ?`/api/projects/${projectId}/periods/${period.id}/historical`
        :`/api/projects/${projectId}/periods/${period.id}`;
      await requestJSON(url,"PATCH",payload);
      setMessage(historical?"Semestre histórico archivado sin aprobación administrativa.":"Cambios del semestre guardados.");
      await reload();
    }catch(e){setError(e instanceof Error?e.message:"Error al guardar período");}
    finally{setBusy(false);}
  }
  async function saveEthics(){
    if(!ethicsEditable)return;
    setBusy(true);setError("");setMessage("");
    try {
      await requestJSON(`/api/projects/${projectId}`,"PATCH",{ods_ids:selectedODS});
      await requestJSON(`/api/projects/${projectId}/ethics`,"PUT",{
        external_population:ethicsData.external_population??"NINGUNO",
        university_population:ethicsData.university_population??"NINGUNO",
        handles_personal_data:Boolean(ethicsData.handles_personal_data),
        involves_vulnerable_population:Boolean(ethicsData.involves_vulnerable_population),
        identifiable_media:Boolean(ethicsData.identifiable_media),
        privacy_measures:ethicsData.privacy_measures??"",
        risk_mitigation:ethicsData.risk_mitigation??"",
        truthful_declaration:Boolean(ethicsData.truthful_declaration),
      });
      setMessage("Análisis ético guardado.");
      await reload();
    }catch(e){setError(e instanceof Error?e.message:"Error al guardar análisis ético");}finally{setBusy(false);}
  }
  async function finalizeProject(){
    if(role!==1||!project||project.general_status!=="ACTIVO"||busy)return;
    const label=project.code;
    if(!window.confirm(`¿Finalizar definitivamente el proyecto ${label}? Esto bloqueará nuevos registros y cambios. Esta acción no equivale al cierre semestral.`))return;
    setBusy(true);setError("");setMessage("");
    try{
      await requestJSON(`/api/projects/${projectId}/finalize`,"POST",{});
      await reload();
      setMessage("Proyecto finalizado. Se conservaron los períodos, resultados y evidencias.");
    }catch(e){setError(e instanceof Error?e.message:"No se pudo finalizar");}
    finally{setBusy(false);}
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
      <p>{historicalEditor?"Completa los datos históricos que conozcas. Los semestres anteriores se archivan sin aprobación.":"Consulta y completa los datos de tu proyecto. Los campos solo se pueden editar antes de la aprobación."}</p>
    </div>
    <PeriodWorkflow projectId={projectId} periods={periods}
      selectedId={activeId} onSelect={id=>{setActiveId(id);setOpenSection("periods");}}
      revision={evidenceRevision} projectStatus={project.general_status}/>
    {message&&<p className="forja-ok" role="status">{message}</p>}
    {error&&<p className="forja-alert" role="alert">{error}</p>}
    <ProjectAccordion id="general" title="01. Información general" open={openSection==="general"} onToggle={()=>toggleSection("general")}>
      <div className="forja-fields">
        <label>Título<input disabled={!generalEditable||busy} value={project.title} onChange={e=>updateProject("title",e.target.value)}/></label>
        <label>Comunidad<input disabled={!generalEditable||busy} value={project.community_name??""} onChange={e=>updateProject("community_name",e.target.value)}/></label>
        <label>Contacto<input disabled={!generalEditable||busy} value={project.community_contact??""} onChange={e=>updateProject("community_contact",e.target.value)}/></label>
        <label>Ubicación<input disabled={!generalEditable||busy} value={project.community_location??""} onChange={e=>updateProject("community_location",e.target.value)}/></label>
        <div className="full">
          <ClassificationPicker title="Zonas territoriales identificadas por FORJA"
            items={zones} selected={selectedZones} onChange={setSelectedZones}
            disabled={!generalEditable||busy}/>
          <p className="forja-description">Selecciona todas las zonas en las que se desarrolla el proyecto. Estos datos permiten filtrar reportes.</p>
        </div>
        <label className="full">Problemática<textarea disabled={!generalEditable||busy} rows={3} value={project.general_problem??""} onChange={e=>updateProject("general_problem",e.target.value)}/></label>
        <label className="full">Objetivo general<textarea disabled={!generalEditable||busy} rows={3} value={project.general_objective??""} onChange={e=>updateProject("general_objective",e.target.value)}/></label>
        <label className="full">Justificación<textarea disabled={!generalEditable||busy} rows={3} value={project.justification??""} onChange={e=>updateProject("justification",e.target.value)}/></label>
      </div>
      <div className="forja-actions"><button type="button" disabled={!generalEditable||busy} onClick={saveGeneral}>Guardar información general</button></div>
      {historicalEditor&&<p className="forja-description">Completa únicamente lo que aparezca en los documentos antiguos. Puedes dejar vacíos los datos desconocidos y describirlos en «Digitalización histórica».</p>}
      {!generalEditable&&<p className="forja-note">Los datos generales están bloqueados mientras haya períodos actuales en revisión o aprobados.</p>}
    </ProjectAccordion>
    <ProjectAccordion id="periods" title="02. Períodos académicos" open={openSection==="periods"} onToggle={()=>toggleSection("periods")}
      summary={period?`${period.academic_year}-${period.academic_semester} · ${period.record_type==="HISTORICO"?"ARCHIVADO SIN REVISIÓN":period.approval_status}`:"Sin períodos registrados"}>
      {periods.length===0?<p>No hay períodos para este proyecto.</p>:<>
        <div className="forja-tabs">{periods.map(p=><button type="button"
          className={p.id===activeId?"active":""} key={p.id}
          onClick={()=>setActiveId(p.id)}>{p.academic_year}-{p.academic_semester}</button>)}</div>
        {period&&<>
          <p className="forja-note"><strong>Tipo:</strong> {historicalPeriod?"HISTÓRICO · Registro directo sin revisión del administrador":`ACTUAL · ${period.approval_status}`}</p>
          {historicalPeriod&&<p className="forja-description">
            Diligencia los mismos campos académicos del profesor. Los datos que desconozcas pueden quedar vacíos;
            anota cuáles faltan al final. Solo se aplican validaciones básicas de formato y fechas.
          </p>}
          <div className="forja-fields">
            {historicalPeriod&&<label>Profesor que ejecutó el semestre (si se conoce)
              <input maxLength={180} disabled={!canEditPeriod||busy} value={period.historical_teacher_name??""}
                onChange={e=>updatePeriod("historical_teacher_name",e.target.value)}/>
            </label>}
            <label>Asignatura
              <select disabled={!canEditPeriod||busy} value={period.course_id??""}
                onChange={e=>updatePeriod("course_id",e.target.value?Number(e.target.value):null)}>
                <option value="">{historicalPeriod?"Desconocida":"Seleccionar asignatura"}</option>
                {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Facultad
              <select disabled={!canEditPeriod||busy} value={period.faculty_id??""}
                onChange={e=>{
                  const facultyId=e.target.value?Number(e.target.value):null;
                  setPeriods(current=>current.map(p=>p.id===activeId?{...p,faculty_id:facultyId,department_id:null,academic_program_id:null}:p));
                }}>
                <option value="">{historicalPeriod?"Desconocida":"Seleccionar facultad"}</option>
                {faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </label>
            <label>Departamento académico de los estudiantes
              <select disabled={!canEditPeriod||busy} value={period.department_id??""}
                onChange={e=>updatePeriod("department_id",e.target.value?Number(e.target.value):null)}>
                <option value="">Seleccionar departamento</option>
                {departments.filter(d=>!period.faculty_id||d.faculty_id===period.faculty_id).map(d=>
                  <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label>Programa o carrera
              <select disabled={!canEditPeriod||busy} value={period.academic_program_id??""}
                onChange={e=>updatePeriod("academic_program_id",e.target.value?Number(e.target.value):null)}>
                <option value="">{historicalPeriod?"Desconocido":"Seleccionar programa"}</option>
                {programs.filter(p=>!period.faculty_id||p.faculty_id===Number(period.faculty_id))
                  .map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>Número de estudiantes
              <input type="number" min="0" disabled={!canEditPeriod||busy} value={period.student_count??""}
                onChange={e=>updatePeriod("student_count",e.target.value===""?null:Number(e.target.value))}/>
            </label>
            <label>Presupuesto COP
              <input type="number" min="0" step="0.01" disabled={!canEditPeriod||busy} value={period.budget??""}
                onChange={e=>updatePeriod("budget",e.target.value===""?null:Number(e.target.value))}/>
            </label>
            <label>Fecha de inicio
              <input type="date" disabled={!canEditPeriod||busy} value={dateOnly(period.start_date)}
                onChange={e=>updatePeriod("start_date",e.target.value)}/>
            </label>
            <label>Fecha de finalización
              <input type="date" disabled={!canEditPeriod||busy} value={dateOnly(period.end_date)}
                onChange={e=>updatePeriod("end_date",e.target.value)}/>
            </label>
            <label className="full">Objetivos del período
              <textarea rows={3} disabled={!canEditPeriod||busy} value={period.objectives??""}
                onChange={e=>updatePeriod("objectives",e.target.value)}/>
            </label>
            <label className="full">Actividades
              <textarea rows={3} disabled={!canEditPeriod||busy} value={period.activities??""}
                onChange={e=>updatePeriod("activities",e.target.value)}/>
            </label>
            <label className="full">Población participante o beneficiada
              <textarea rows={2} disabled={!canEditPeriod||busy} value={period.community_population_description??""}
                onChange={e=>updatePeriod("community_population_description",e.target.value)}/>
            </label>
            <label className="full">Territorio o lugar del semestre
              <input disabled={!canEditPeriod||busy} value={period.territory_name??""}
                onChange={e=>updatePeriod("territory_name",e.target.value)}/>
            </label>
            {historicalPeriod&&<>
              <label className="full">Resultados obtenidos (si se conocen)
                <textarea rows={3} disabled={!canEditPeriod||busy} value={period.results??""}
                  onChange={e=>updatePeriod("results",e.target.value)}/>
              </label>
              <label className="full">Conclusiones (si se conocen)
                <textarea rows={3} disabled={!canEditPeriod||busy} value={period.conclusions??""}
                  onChange={e=>updatePeriod("conclusions",e.target.value)}/>
              </label>
              <label className="full">Información o documentos faltantes
                <textarea rows={3} disabled={!canEditPeriod||busy} value={period.missing_information??""}
                  onChange={e=>updatePeriod("missing_information",e.target.value)}/>
              </label>
            </>}
          </div>
          <div className="forja-actions">
            {canEditPeriod&&<button type="button" disabled={busy} onClick={savePeriod}>
              {historicalPeriod?"Guardar ficha histórica":"Guardar cambios del semestre"}
            </button>}
            {role===3&&editable&&<button type="button" className="secondary" disabled={busy} onClick={submit}>
              Enviar a revisión
            </button>}
          </div>
          {!historicalPeriod&&<>
            <h3>Historial de observaciones</h3>
            {reviews.length===0?<p>Aún no hay decisiones del administrador.</p>:
              <div className="forja-reviews">{reviews.map(r=><div key={r.id}>
                <strong>{r.decision}</strong> · {new Date(r.reviewed_at).toLocaleDateString("es-CO")} · {r.reviewer}
                <p>{r.notes||"Sin observaciones adicionales"}</p>
              </div>)}</div>}
          </>}
        </>}
      </>}
    </ProjectAccordion>
    {project.registration_type==="HISTORICO"&&
      <ProjectAccordion id="history" title="03. Digitalización histórica" open={openSection==="history"} onToggle={()=>toggleSection("history")} summary={`${periods.filter(p=>p.record_type==="HISTORICO").length} semestres anteriores`}>
        <HistoricalProjectSection projectId={projectId} role={role} registrationType={project.registration_type} projectStatus={project.general_status}
          periods={periods} onSaved={reload} onSelectPeriod={(id:number)=>{setActiveId(id);setOpenSection("periods");}}/>
      </ProjectAccordion>}
    <ProjectAccordion id="ethics" title={project.registration_type==="HISTORICO"?"04. Consideraciones éticas":"03. Consideraciones éticas"} open={openSection==="ethics"} onToggle={()=>toggleSection("ethics")}>
      {<>
        <div className="forja-fields">
          <div className="full">
            <ClassificationPicker title="Objetivos de Desarrollo Sostenible (ODS)"
              items={ODS} selected={selectedODS} onChange={setSelectedODS}
              disabled={!ethicsEditable||busy}/>
            <p className="forja-description">Selecciona los ODS relacionados con el proyecto. Puedes elegir varios y usarlos en los filtros de reportes.</p>
          </div>
          <label>Población externa predominante<select disabled={!ethicsEditable||busy} value={ethicsData.external_population??"NINGUNO"} onChange={e=>updateEthics("external_population",e.target.value)}>
            {externalCategories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
          <label>Grupo universitario<select disabled={!ethicsEditable||busy} value={ethicsData.university_population??"NINGUNO"} onChange={e=>updateEthics("university_population",e.target.value)}>
            {universityCategories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
          <label className="forja-check"><input disabled={!ethicsEditable||busy} type="checkbox" checked={Boolean(ethicsData.involves_vulnerable_population)} onChange={e=>updateEthics("involves_vulnerable_population",e.target.checked)}/> Población vulnerable</label>
          <label className="forja-check"><input disabled={!ethicsEditable||busy} type="checkbox" checked={Boolean(ethicsData.handles_personal_data)} onChange={e=>updateEthics("handles_personal_data",e.target.checked)}/> Tratamiento de datos personales</label>
          <label className="forja-check"><input disabled={!ethicsEditable||busy} type="checkbox" checked={Boolean(ethicsData.identifiable_media)} onChange={e=>updateEthics("identifiable_media",e.target.checked)}/> Evidencias con personas identificables</label>
          <label className="full">Medidas de privacidad<textarea rows={3} disabled={!ethicsEditable||busy} value={ethicsData.privacy_measures??""} onChange={e=>updateEthics("privacy_measures",e.target.value)}/></label>
          <label className="full">Mitigación de riesgos<textarea rows={3} disabled={!ethicsEditable||busy} value={ethicsData.risk_mitigation??""} onChange={e=>updateEthics("risk_mitigation",e.target.value)}/></label>
          <label className="forja-check full"><input disabled={!ethicsEditable||busy} type="checkbox" checked={ethicsData.truthful_declaration} onChange={e=>updateEthics("truthful_declaration",e.target.checked)}/> Declaro que la información es verídica</label>
        </div>
        {historicalEditor&&<p className="forja-description">Para archivos históricos se registra solo la información disponible. No se exige la declaración de veracidad ni una aprobación retroactiva.</p>}
        <div className="forja-actions"><button type="button" disabled={!ethicsEditable||busy} onClick={saveEthics}>Guardar análisis ético</button></div>
      </>}
    </ProjectAccordion>
    {period&&<ProjectAccordion id="evidence" title={project.registration_type==="HISTORICO"?"05. Evidencias del semestre (solo PDF)":"04. Evidencias del semestre (solo PDF)"} open={openSection==="evidence"} onToggle={()=>toggleSection("evidence")} summary={period.execution_status==="CERRADO"?"Semestre cerrado":undefined}>
      <EvidenceSection projectId={projectId} periodId={period.id} role={role} approvalStatus={period.approval_status} recordType={period.record_type} projectStatus={project.general_status} executionStatus={period.execution_status} onChanged={()=>setEvidenceRevision(v=>v+1)}/>
    </ProjectAccordion>}
    {period&&period.record_type==="ACTUAL"&&<ProjectAccordion id="results" title={project.registration_type==="HISTORICO"?"06. Resultados, conclusiones y cierre":"05. Resultados, conclusiones y cierre"} open={openSection==="results"} onToggle={()=>toggleSection("results")} summary={period.execution_status}>
      <PeriodResultsSection projectId={projectId} period={period} role={role} projectStatus={project.general_status} onSaved={reload}/>
    </ProjectAccordion>}
    {role===1&&<ProjectAccordion id="finalize" title={project.registration_type==="HISTORICO"?"07. Finalización definitiva del proyecto":"06. Finalización definitiva del proyecto"} open={openSection==="finalize"} onToggle={()=>toggleSection("finalize")} summary={project.general_status}>
      <p className="forja-description">Solo el administrador puede finalizar el proyecto completo. Deben estar cerrados todos los períodos actuales. Los históricos y las evidencias se conservan.</p>
      <p className="forja-note"><strong>Estado general:</strong> {project.general_status}</p>
      {project.general_status==="ACTIVO"&&<div className="forja-actions">
        <button type="button" disabled={busy||periods.length===0||periods.some(p=>p.record_type==="ACTUAL"&&(p.approval_status!=="APROBADO"||p.execution_status!=="CERRADO"))}
          onClick={finalizeProject}>Finalizar proyecto definitivamente</button>
      </div>}
      {project.general_status==="FINALIZADO"&&<p>El proyecto quedó finalizado. Sus registros siguen disponibles para consulta.</p>}
    </ProjectAccordion>}
    {period&&<ProjectAccordion id="letter" title={project.registration_type==="HISTORICO"?"08. Carta final firmada del semestre":"07. Carta final firmada del semestre"} open={openSection==="letter"} onToggle={()=>toggleSection("letter")} summary={`${period.academic_year}-${period.academic_semester}`}>
      <FinalLetterSection key={period.id} projectId={projectId} periodId={period.id} role={role} recordType={period.record_type} approvalStatus={period.approval_status} executionStatus={period.execution_status}/>
    </ProjectAccordion>}
    {period&&<ProjectAccordion id="community" title={project.registration_type==="HISTORICO"?"09. Evaluación de la comunidad del semestre":"08. Evaluación de la comunidad del semestre"} open={openSection==="community"} onToggle={()=>toggleSection("community")} summary={`${period.academic_year}-${period.academic_semester}`}>
      <CommunityFeedbackSection key={period.id} projectId={projectId} periodId={period.id} role={role} academicYear={period.academic_year} academicSemester={period.academic_semester}/>
    </ProjectAccordion>}
  </div></main>;
}
