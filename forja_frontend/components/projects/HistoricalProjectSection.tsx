"use client";

import { useEffect,useState } from "react";
import CurrentPeriodContinuation from "./CurrentPeriodContinuation";

type HistoricalPeriod={
  id:number;academic_year:number;academic_semester:number;
  record_type:string;missing_information:string|null;
};
type Teacher={id:number;full_name:string;rol_id:number;is_active:boolean};
interface Props {
  projectId:string;role:number|null;registrationType:string;
  projectStatus:string;periods:HistoricalPeriod[];
  onSaved:()=>Promise<void>;
  onSelectPeriod:(id:number)=>void;
}

/**
 * Solo acciones de creación/continuidad. La información de TODOS los semestres
 * se edita mediante el formulario compartido «02. Períodos académicos».
 */
export default function HistoricalProjectSection({
  projectId,role,registrationType,projectStatus,periods,onSaved,onSelectPeriod,
}:Props){
  const [year,setYear]=useState("2025");
  const [semester,setSemester]=useState("2");
  const [teachers,setTeachers]=useState<Teacher[]>([]);
  const [teacherId,setTeacherId]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const active=projectStatus==="ACTIVO";
  const canDigitize=(role===1||role===2)&&active&&registrationType==="HISTORICO";
  const hasCurrent=periods.some(p=>p.record_type==="ACTUAL");
  const duplicate=periods.some(p=>p.academic_year===Number(year)&&p.academic_semester===Number(semester));

  useEffect(()=>{
    if(role!==1 || registrationType!=="HISTORICO")return;
    fetch("/api/users",{cache:"no-store"})
      .then(async r=>r.ok?await r.json():[])
      .then((v:unknown)=>setTeachers(Array.isArray(v)?v:[]))
      .catch(()=>setTeachers([]));
  },[role,registrationType]);

  async function createPeriod(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!canDigitize||duplicate||busy)return;
    setBusy(true);setError("");setMessage("");
    try{
      const response=await fetch(`/api/projects/${projectId}/periods`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          academic_year:Number(year),academic_semester:Number(semester),
          record_type:"HISTORICO",
        }),
      });
      const data=await response.json();
      if(!response.ok){
        const detail=Array.isArray(data.message)?data.message.join(", "):data.message;
        throw new Error(typeof detail==="string"?detail:"No se pudo agregar el semestre");
      }
      await onSaved();
      if(typeof data.id==="number")onSelectPeriod(data.id);
      setMessage("Semestre histórico registrado. Completa la ficha que aparece arriba y guárdala; no necesita aprobación.");
    }catch(e){setError(e instanceof Error?e.message:"Error de registro");}
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
      if(!response.ok)throw new Error(typeof data.message==="string"?data.message:"No se pudo asignar el profesor");
      await onSaved();
      setMessage("Profesor asignado para el semestre actual. Los períodos históricos no se envían a revisión.");
    }catch(e){setError(e instanceof Error?e.message:"Error al asignar profesor");}
    finally{setBusy(false);}
  }

  if(registrationType!=="HISTORICO")return null;

  return <div className="forja-history-assign">
    {canDigitize&&<>
      <h3>Agregar otro semestre histórico</h3>
      <p className="forja-description">
        Crea el año y semestre. Después selecciónalo arriba y utiliza exactamente
        el mismo formulario académico del profesor, con los campos históricos adicionales.
      </p>
      <form className="forja-form" onSubmit={createPeriod}>
        <div className="forja-fields">
          <label>Año
            <input type="number" required min="1900" max="2200" value={year}
              onChange={e=>setYear(e.target.value)}/>
          </label>
          <label>Semestre
            <select value={semester} onChange={e=>setSemester(e.target.value)}>
              <option value="1">Primero</option><option value="2">Segundo</option>
            </select>
          </label>
        </div>
        <div className="forja-actions">
          <button type="submit" disabled={busy||duplicate}>
            {busy?"Registrando...":duplicate?"El semestre ya está registrado":"Agregar semestre histórico"}
          </button>
        </div>
      </form>
    </>}
    {role===1&&active&&<div className="forja-history-assign">
      <h3>Profesor para continuar el proyecto actualmente</h3>
      <p className="forja-description">Esta asignación es para los nuevos semestres, no cambia el nombre del docente de períodos antiguos.</p>
      {hasCurrent?<p>Ya existe un semestre actual. No se modifica aquí su responsable.</p>:
        <div className="forja-fields">
          <label>Profesor responsable
            <select value={teacherId} onChange={e=>setTeacherId(e.target.value)}>
              <option value="">Seleccionar profesor</option>
              {teachers.filter(t=>t.rol_id===3&&t.is_active).map(t=>
                <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </label>
          <div className="forja-actions">
            <button type="button" disabled={busy||!teacherId} onClick={assignTeacher}>Asignar profesor</button>
          </div>
        </div>}
    </div>}
    <CurrentPeriodContinuation projectId={projectId} role={role}
      status={projectStatus} periods={periods} onSaved={onSaved}/>
    {error&&<p className="forja-alert" role="alert">{error}</p>}
    {message&&<p className="forja-ok" role="status">{message}</p>}
  </div>;
}
