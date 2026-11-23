"use client";
import {useState} from "react";
interface Period {id:number;record_type:string;academic_year:number;academic_semester:number}
interface Props {projectId:string;role:number|null;status:string;periods:Period[];onSaved:()=>Promise<void>}
export default function CurrentPeriodContinuation({projectId,role,status,periods,onSaved}:Props){
  const [year,setYear]=useState("2026");
  const [semester,setSemester]=useState("2");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const existing=periods.some(p=>p.record_type==="ACTUAL"&&p.academic_year===Number(year)&&p.academic_semester===Number(semester));
  if(role!==3||status!=="ACTIVO")return null;
  async function create(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy||existing)return;
    setBusy(true);setError("");setMessage("");
    try{
      const response=await fetch(`/api/projects/${projectId}/periods`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          academic_year:Number(year),academic_semester:Number(semester),
          record_type:"ACTUAL",
        }),
      });
      const data=await response.json();
      if(!response.ok){
        const detail=Array.isArray(data.message)?data.message.join(", "):data.message;
        throw new Error(typeof detail==="string"?detail:"No se pudo crear el semestre");
      }
      await onSaved();
      setMessage("Semestre actual creado como borrador. Abre su pestaña en Períodos académicos para completar los datos.");
    }catch(e){setError(e instanceof Error?e.message:"Error de registro");}
    finally{setBusy(false);}
  }
  return <div className="forja-history-assign">
    <h3>Continuar el proyecto en un semestre actual</h3>
    <p className="forja-description">Los períodos antiguos permanecen como registros históricos. Tu semestre actual debe completarse y presentarse a revisión del administrador.</p>
    <form className="forja-form" onSubmit={create}>
      <div className="forja-fields">
        <label>Año académico
          <input type="number" min="1900" max="2200" value={year} required onChange={e=>setYear(e.target.value)}/>
        </label>
        <label>Semestre
          <select value={semester} onChange={e=>setSemester(e.target.value)}>
            <option value="1">Primero</option><option value="2">Segundo</option>
          </select>
        </label>
      </div>
      <div className="forja-actions">
        <button type="submit" disabled={busy||existing}>{busy?"Creando...":existing?"Ya existe este semestre":"Crear semestre actual"}</button>
      </div>
    </form>
    {error&&<p role="alert" className="forja-alert">{error}</p>}
    {message&&<p role="status" className="forja-ok">{message}</p>}
  </div>;
}
