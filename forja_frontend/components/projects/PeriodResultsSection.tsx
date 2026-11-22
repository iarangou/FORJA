"use client";
import {useEffect,useState} from "react";

type PeriodReport={
  id:number;
  approval_status:string;
  execution_status:string;
  record_type:string;
  results:string|null;
  conclusions:string|null;
};
interface Props{
  projectId:string;
  period:PeriodReport;
  role:number|null;
  projectStatus:string;
  onSaved:()=>Promise<void>;
}
export default function PeriodResultsSection({projectId,period,role,projectStatus,onSaved}:Props){
  const [results,setResults]=useState(period.results??"");
  const [conclusions,setConclusions]=useState(period.conclusions??"");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  useEffect(()=>{
    setResults(period.results??"");
    setConclusions(period.conclusions??"");
    setError("");
    setMessage("");
  },[period.id,period.results,period.conclusions]);
  const approved=period.approval_status==="APROBADO";
  const closed=period.execution_status==="CERRADO";
  const isCurrent=period.record_type==="ACTUAL";
  const editable=role===3 && approved && isCurrent && !closed && projectStatus==="ACTIVO";
  const canClose=role===1 && approved && isCurrent && !closed && projectStatus==="ACTIVO";
  const base=`/api/projects/${projectId}/periods/${period.id}`;

  async function sendRequest(url:string,method:"PUT"|"POST",body:unknown){
    const response=await fetch(url,{
      method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body),
    });
    const data=await response.json();
    if(!response.ok){
      const msg=Array.isArray(data.message)?data.message.join(", "):data.message;
      throw new Error(typeof msg==="string"?msg:"No se pudo realizar la operación");
    }
  }
  async function save(){
    if(!editable||busy)return;
    setBusy(true);setError("");setMessage("");
    try{
      if(!results.trim()||!conclusions.trim()){
        throw new Error("Completa tanto los resultados como las conclusiones.");
      }
      await sendRequest(`${base}/results`,"PUT",{results,conclusions});
      await onSaved();
      setMessage("Resultados y conclusiones guardados.");
    }catch(e){setError(e instanceof Error?e.message:"Error al guardar");}
    finally{setBusy(false);}
  }
  async function close(){
    if(!canClose||busy)return;
    if(!window.confirm("¿Confirmas el cierre del semestre? Los resultados quedarán bloqueados y el proyecto seguirá ACTIVO."))return;
    setBusy(true);setError("");setMessage("");
    try{
      await sendRequest(`${base}/close`,"POST",{});
      await onSaved();
      setMessage("Semestre cerrado. El proyecto general continúa activo.");
    }catch(e){setError(e instanceof Error?e.message:"Error al cerrar período");}
    finally{setBusy(false);}
  }
  return <section className="forja-panel forja-editor-section">
    <h2>05. Resultados, conclusiones y cierre</h2>
    <p className="forja-description">El profesor registra qué se logró durante este semestre. El administrador revisa y cierra el período cuando la evidencia PDF esté aprobada.</p>
    <p className="forja-note"><strong>Estado de ejecución:</strong> {period.execution_status}</p>
    <div className="forja-fields">
      <label className="full">Resultados obtenidos
        <textarea rows={4} maxLength={10000} disabled={!editable||busy}
          value={results} onChange={e=>setResults(e.target.value)}
          placeholder="Describe los resultados concretos alcanzados en el semestre"/>
      </label>
      <label className="full">Conclusiones
        <textarea rows={4} maxLength={10000} disabled={!editable||busy}
          value={conclusions} onChange={e=>setConclusions(e.target.value)}
          placeholder="Resume los aprendizajes y las conclusiones del trabajo realizado"/>
      </label>
    </div>
    <div className="forja-actions">
      {editable&&<button disabled={busy} type="button" onClick={save}>
        {busy?"Guardando...":"Guardar resultados y conclusiones"}
      </button>}
      {canClose&&<button disabled={busy||!results.trim()||!conclusions.trim()}
        type="button" onClick={close}>{busy?"Procesando...":"Cerrar semestre"}</button>}
    </div>
    {closed&&<p className="forja-ok">Este semestre está cerrado. La finalización definitiva del proyecto se gestiona por separado.</p>}
    {error&&<p className="forja-alert" role="alert">{error}</p>}
    {message&&<p className="forja-ok" role="status">{message}</p>}
  </section>;
}
