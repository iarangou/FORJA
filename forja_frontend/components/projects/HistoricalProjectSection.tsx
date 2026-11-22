"use client";

import {useEffect,useState} from "react";

type HistoricalPeriod={
  id:number;academic_year:number;academic_semester:number;
  record_type:string;objectives:string|null;activities:string|null;
  course_id:number|null;budget:number|null;student_count:number|null;
  missing_information:string|null;start_date:string|null;end_date:string|null;
};
type User={id:number;full_name:string;rol_id:number;is_active:boolean};
type Course={id:number;name:string};
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
};
const emptyForm:FormState={
  academic_year:"2025",academic_semester:"2",course_id:"",
  objectives:"",activities:"",student_count:"",budget:"",
  start_date:"",end_date:"",missing_information:"",
};
const dateOnly=(value:string|null)=>value?.slice(0,10)??"";

export default function HistoricalProjectSection({
  projectId,role,registrationType,projectStatus,periods,courses,onSaved,
}:Props){
  const [form,setForm]=useState<FormState>(emptyForm);
  const [editing,setEditing]=useState<number|null>(null);
  const [users,setUsers]=useState<User[]>([]);
  const [teacherId,setTeacherId]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const active=projectStatus==="ACTIVO";
  const canDigitize=(role===1||role===2)&&active&&registrationType==="HISTORICO";

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
    {error&&<p className="forja-alert" role="alert">{error}</p>}
    {message&&<p className="forja-ok" role="status">{message}</p>}
  </div>;
}
