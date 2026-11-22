"use client";

import {useEffect,useState} from "react";
import CurrentPeriodContinuation from "./CurrentPeriodContinuation";

type HistoricalPeriod={
  id:number;academic_year:number;academic_semester:number;
  record_type:string;objectives:string|null;activities:string|null;
  course_id:number|null;budget:number|null;student_count:number|null;
  missing_information:string|null;start_date:string|null;end_date:string|null;
  historical_teacher_name:string|null;faculty_id:number|null;academic_program_id:number|null;
  community_population_description:string|null;territory_name:string|null;
  results:string|null;conclusions:string|null;
};
type User={id:number;full_name:string;rol_id:number;is_active:boolean};
type Course={id:number;name:string};
type Faculty={id:number;name:string};
type Program={id:number;name:string;faculty_id:number};
interface Props{
  projectId:string;
  role:number|null;
  registrationType:string;
  projectStatus:string;
  periods:HistoricalPeriod[];
  courses:Course[];
  onSaved:()=>Promise<void>;
}
type FormState={
  academic_year:string;academic_semester:string;course_id:string;
  objectives:string;activities:string;student_count:string;budget:string;
  start_date:string;end_date:string;missing_information:string;
  historical_teacher_name:string;faculty_id:string;academic_program_id:string;
  community_population_description:string;territory_name:string;
  results:string;conclusions:string;
};
const emptyForm:FormState={
  academic_year:"2025",academic_semester:"2",course_id:"",
  objectives:"",activities:"",student_count:"",budget:"",
  start_date:"",end_date:"",missing_information:"",
  historical_teacher_name:"",faculty_id:"",academic_program_id:"",
  community_population_description:"",territory_name:"",
  results:"",conclusions:"",
};
const dateOnly=(value:string|null)=>value?.slice(0,10)??"";

export default function HistoricalProjectSection({
  projectId,role,registrationType,projectStatus,periods,courses,onSaved,
}:Props){
  const [form,setForm]=useState<FormState>(emptyForm);
  const [editing,setEditing]=useState<number|null>(null);
  const [users,setUsers]=useState<User[]>([]);
  const [faculties,setFaculties]=useState<Faculty[]>([]);
  const [programs,setPrograms]=useState<Program[]>([]);
  const [teacherId,setTeacherId]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const active=projectStatus==="ACTIVO";
  const canDigitize=(role===1||role===2)&&active&&registrationType==="HISTORICO";

  useEffect(()=>{
    if(registrationType!=="HISTORICO")return;
    Promise.all([fetch("/api/faculty"),fetch("/api/faculty/programs")])
      .then(async ([f,p])=>{
        if(f.ok){const d:unknown=await f.json();setFaculties(Array.isArray(d)?d:[]);}
        if(p.ok){const d:unknown=await p.json();setPrograms(Array.isArray(d)?d:[]);}
      }).catch(()=>undefined);
  },[registrationType]);

  useEffect(()=>{
    if(role!==1||registrationType!=="HISTORICO")return;
    fetch("/api/users",{cache:"no-store"}).then(async r=>{
      if(!r.ok)return [];
      const data:unknown=await r.json();
      return Array.isArray(data)?data as User[]:[];
    }).then(setUsers).catch(()=>setUsers([]));
  },[role,registrationType]);

  function update<K extends keyof FormState>(key:K,value:FormState[K]){
    setForm(s=>({...s,[key]:value}));
  }
  function startEdit(period:HistoricalPeriod){
    setEditing(period.id);
    setForm({
      academic_year:String(period.academic_year),
      academic_semester:String(period.academic_semester),
      course_id:period.course_id?String(period.course_id):"",
      objectives:period.objectives??"",activities:period.activities??"",
      student_count:period.student_count===null?"":String(period.student_count),
      budget:period.budget===null?"":String(period.budget),
      start_date:dateOnly(period.start_date),end_date:dateOnly(period.end_date),
      missing_information:period.missing_information??"",
      historical_teacher_name:period.historical_teacher_name??"",
      faculty_id:period.faculty_id?String(period.faculty_id):"",
      academic_program_id:period.academic_program_id?String(period.academic_program_id):"",
      community_population_description:period.community_population_description??"",
      territory_name:period.territory_name??"",
      results:period.results??"",conclusions:period.conclusions??"",
    });
    setError("");setMessage("");
  }
  async function save(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!canDigitize||busy)return;
    setBusy(true);setError("");setMessage("");
    try{
      const payload={
        ...(!editing?{
          academic_year:Number(form.academic_year),
          academic_semester:Number(form.academic_semester),
          record_type:"HISTORICO",
        }:{}),
        ...(form.course_id?{course_id:Number(form.course_id)}:{}),
        ...(form.faculty_id?{faculty_id:Number(form.faculty_id)}:{}),
        ...(form.academic_program_id?{academic_program_id:Number(form.academic_program_id)}:{}),
        historical_teacher_name:form.historical_teacher_name,
        community_population_description:form.community_population_description,
        territory_name:form.territory_name,
        results:form.results,conclusions:form.conclusions,
        ...(form.student_count?{student_count:Number(form.student_count)}:{}),
        ...(form.budget?{budget:Number(form.budget)}:{}),
        ...(form.start_date?{start_date:form.start_date}:{}),
        ...(form.end_date?{end_date:form.end_date}:{}),
        objectives:form.objectives,activities:form.activities,
        missing_information:form.missing_information,
      };
      const url=editing
        ?`/api/projects/${projectId}/periods/${editing}/historical`
        :`/api/projects/${projectId}/periods`;
      const response=await fetch(url,{
        method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload),
      });
      const data=await response.json();
      if(!response.ok){
        const msg=Array.isArray(data.message)?data.message.join(", "):data.message;
        throw new Error(typeof msg==="string"?msg:"No se pudo guardar el período histórico");
      }
      setEditing(null);setForm(emptyForm);
      await onSaved();
      setMessage("Período histórico guardado sin aprobación retroactiva.");
    }catch(e){setError(e instanceof Error?e.message:"Error guardando histórico");}
    finally{setBusy(false);}
  }
  async function assignTeacher(){
    if(role!==1||!teacherId||busy)return;
    setBusy(true);setError("");setMessage("");
    try{
      const response=await fetch(`/api/projects/${projectId}/responsible-teacher`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({user_id:Number(teacherId)}),
      });
      const data=await response.json();
      if(!response.ok)throw new Error(typeof data.message==="string"?data.message:"No se pudo asignar profesor");
      setMessage("Profesor responsable asignado. Podrá registrar el semestre actual desde su cuenta.");
      await onSaved();
    }catch(e){setError(e instanceof Error?e.message:"Error asignando profesor");}
    finally{setBusy(false);}
  }

  if(registrationType!=="HISTORICO")return null;
  const history=periods.filter(p=>p.record_type==="HISTORICO");
  const hasCurrent=periods.some(p=>p.record_type==="ACTUAL");
  return <div className="forja-accordion-inner">
    <p className="forja-description">Los registros anteriores se digitalizan con la información disponible, sin someterlos a aprobación retroactiva. No inventes datos desconocidos: anótalos en «Información faltante».</p>
    <h3>Semestres históricos registrados</h3>
    {history.length===0?<p>No se han registrado semestres anteriores.</p>:
      <div className="forja-user-list">{history.map(period=>
        <div className="forja-user-item" key={period.id}>
          <div><strong>{period.academic_year}-{period.academic_semester}</strong><p>{period.missing_information?"Información faltante registrada":"Sin observaciones de datos faltantes"}</p></div>
          {canDigitize&&<button type="button" className="forja-textbutton" onClick={()=>startEdit(period)}>Completar datos</button>}
        </div>
      )}</div>}
    {canDigitize&&<>
      <h3>{editing?"Completar un semestre histórico":"Agregar otro semestre histórico"}</h3>
      <p className="forja-description">Todos los campos académicos son opcionales salvo el año y el semestre. El docente puede escribirse por nombre aunque no tenga usuario activo.</p>
      <form onSubmit={save} className="forja-form">
        <div className="forja-fields">
          <label>Año
            <input type="number" min="1900" max="2200" required disabled={editing!==null}
              value={form.academic_year} onChange={e=>update("academic_year",e.target.value)}/>
          </label>
          <label>Semestre
            <select disabled={editing!==null} value={form.academic_semester} onChange={e=>update("academic_semester",e.target.value)}>
              <option value="1">Primero</option><option value="2">Segundo</option>
            </select>
          </label>
          <label>Profesor responsable histórico (si se conoce)
            <input type="text" maxLength={180} value={form.historical_teacher_name}
              placeholder="Nombre del profesor del semestre"
              onChange={e=>update("historical_teacher_name",e.target.value)}/>
          </label>
          <label>Facultad (si se conoce)
            <select value={form.faculty_id} onChange={e=>{
              update("faculty_id",e.target.value);
              update("academic_program_id","");
            }}>
              <option value="">Desconocida</option>
              {faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>
          <label>Programa o carrera (si se conoce)
            <select value={form.academic_program_id}
              onChange={e=>update("academic_program_id",e.target.value)}>
              <option value="">Desconocido</option>
              {programs.filter(p=>!form.faculty_id||p.faculty_id===Number(form.faculty_id))
                .map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>Asignatura (si se conoce)
            <select value={form.course_id} onChange={e=>update("course_id",e.target.value)}>
              <option value="">Desconocida</option>
              {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Estudiantes (si se conoce)
            <input type="number" min="0" value={form.student_count} onChange={e=>update("student_count",e.target.value)}/>
          </label>
          <label>Presupuesto COP (si se conoce)
            <input type="number" min="0" step="0.01" value={form.budget} onChange={e=>update("budget",e.target.value)}/>
          </label>
          <label>Fecha de inicio (opcional)
            <input type="date" value={form.start_date} onChange={e=>update("start_date",e.target.value)}/>
          </label>
          <label>Fecha final (opcional)
            <input type="date" value={form.end_date} onChange={e=>update("end_date",e.target.value)}/>
          </label>
          <label className="full">Objetivos documentados
            <textarea rows={2} value={form.objectives} onChange={e=>update("objectives",e.target.value)}/>
          </label>
          <label className="full">Actividades documentadas
            <textarea rows={2} value={form.activities} onChange={e=>update("activities",e.target.value)}/>
          </label>
          <label className="full">Población participante o beneficiada (si se conoce)
            <textarea rows={2} value={form.community_population_description}
              onChange={e=>update("community_population_description",e.target.value)}/>
          </label>
          <label className="full">Territorio o lugar del semestre (si se conoce)
            <input type="text" value={form.territory_name}
              onChange={e=>update("territory_name",e.target.value)}/>
          </label>
          <label className="full">Resultados documentados (si se conocen)
            <textarea rows={3} value={form.results} onChange={e=>update("results",e.target.value)}/>
          </label>
          <label className="full">Conclusiones documentadas (si se conocen)
            <textarea rows={3} value={form.conclusions} onChange={e=>update("conclusions",e.target.value)}/>
          </label>
          <label className="full">Información o documentos faltantes
            <textarea rows={3} value={form.missing_information} onChange={e=>update("missing_information",e.target.value)}/>
          </label>
        </div>
        <div className="forja-actions">
          <button type="submit" disabled={busy}>{busy?"Guardando...":editing?"Guardar correcciones":"Agregar semestre histórico"}</button>
          {editing&&<button type="button" className="secondary" disabled={busy} onClick={()=>{setEditing(null);setForm(emptyForm)}}>Cancelar edición</button>}
        </div>
      </form>
    </>}
    {role===1&&active&&<div className="forja-history-assign">
      <h3>Continuidad en el semestre actual</h3>
      <p className="forja-description">Si el proyecto sigue activo, asigna el docente responsable. El profesor registrará el semestre actual y lo enviará a aprobación como cualquier proyecto nuevo.</p>
      {hasCurrent?<p>Ya existe un semestre actual registrado. No es posible reasignar el responsable desde este formulario.</p>:
      <div className="forja-fields">
        <label>Profesor responsable
          <select value={teacherId} onChange={e=>setTeacherId(e.target.value)}>
            <option value="">Seleccionar profesor</option>
            {users.filter(u=>u.rol_id===3&&u.is_active).map(u=><option value={u.id} key={u.id}>{u.full_name}</option>)}
          </select>
        </label>
        <div className="forja-actions"><button type="button" disabled={busy||!teacherId} onClick={assignTeacher}>Asignar profesor</button></div>
      </div>}
    </div>}
    <CurrentPeriodContinuation projectId={projectId} role={role} status={projectStatus}
      periods={periods} onSaved={onSaved}/>
    {error&&<p className="forja-alert" role="alert">{error}</p>}
    {message&&<p className="forja-ok" role="status">{message}</p>}
  </div>;
}
