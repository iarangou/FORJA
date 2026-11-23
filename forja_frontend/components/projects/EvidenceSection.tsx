"use client";
import {useEffect,useState} from "react";

type Evidence={
  id:number;original_filename:string;file_size:number;
  review_status:"PENDIENTE"|"APROBADA"|"DEVUELTA";
  uploaded_at:string;review_notes:string|null;uploaded_by_name:string;
};
interface Props{
  projectId:string;periodId:number;role:number|null;
  approvalStatus:string;recordType:string;projectStatus:string;executionStatus:string;
}
export default function EvidenceSection({projectId,periodId,role,approvalStatus,recordType,projectStatus,executionStatus}:Props){
  const [items,setItems]=useState<Evidence[]>([]);
  const [file,setFile]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);
  const [notes,setNotes]=useState<Record<number,string>>({});
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const base=`/api/projects/${projectId}/periods/${periodId}/evidences`;
  const historical=recordType==="HISTORICO";
  const canUpload=historical?(role===1||role===2):(role===3 && approvalStatus==="APROBADO" && projectStatus==="ACTIVO" && executionStatus!=="CERRADO");

  async function refresh(){
    const response=await fetch(base,{cache:"no-store"});
    const data=await response.json();
    if(!response.ok)throw new Error(typeof data.message==="string"?data.message:"No se pudieron cargar evidencias");
    setItems(Array.isArray(data)?data:[]);
  }
  useEffect(()=>{
    let mounted=true;
    fetch(base,{cache:"no-store"}).then(async response=>{
      const data=await response.json();
      if(!response.ok)throw new Error(typeof data.message==="string"?data.message:"No se pudieron cargar evidencias");
      if(mounted)setItems(Array.isArray(data)?data:[]);
    }).catch(e=>{if(mounted)setError(e instanceof Error?e.message:"Error de conexión")});
    return ()=>{mounted=false};
  },[base]);

  async function upload(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!file || busy)return;
    setMessage("");setError("");
    if(!file.name.toLowerCase().endsWith(".pdf")||file.type!=="application/pdf"){
      setError("Únicamente se aceptan archivos PDF");return;
    }
    if(file.size>20*1024*1024){setError("El archivo debe pesar máximo 20 MB");return;}
    setBusy(true);
    try{
      const body=new FormData();body.append("file",file);
      const response=await fetch(base,{method:"POST",body});
      const data=await response.json();
      if(!response.ok)throw new Error(typeof data.message==="string"?data.message:"No fue posible subir el PDF");
      setFile(null);
      const control=document.getElementById(`evidence-file-${periodId}`) as HTMLInputElement|null;
      if(control)control.value="";
      setMessage(historical?"PDF histórico archivado, sin aprobación retroactiva.":"PDF guardado. Quedó pendiente de revisión del administrador.");
      await refresh();
    }catch(e){setError(e instanceof Error?e.message:"Error al subir");}
    finally{setBusy(false);}
  }
  async function review(id:number,decision:"APROBADA"|"DEVUELTA"){
    setBusy(true);setMessage("");setError("");
    try{
      const response=await fetch(`${base}/${id}/review`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({decision,notes:notes[id]??""}),
      });
      const data=await response.json();
      if(!response.ok)throw new Error(typeof data.message==="string"?data.message:"No se pudo registrar la decisión");
      setMessage("Revisión de evidencia registrada.");
      await refresh();
    }catch(e){setError(e instanceof Error?e.message:"Error de revisión");}
    finally{setBusy(false);}
  }

  return <div className="forja-accordion-inner">
    <p className="forja-description">{historical?
      "Digitaliza evidencias antiguas en PDF. No se exige aprobación retroactiva: el documento queda archivado con el semestre correspondiente.":"Incluye fotografías en el PDF. Para videos, agrega dentro del PDF un enlace a YouTube. Cada PDF se guarda como evidencia nueva de este semestre. Si una evidencia es devuelta, carga un nuevo PDF corregido; se conserva el historial. El administrador revisa cada archivo una sola vez."}</p>
    {canUpload&&<form onSubmit={upload} className="forja-form">
      <div className="forja-fields"><label className="full">Documento de evidencia (.pdf, máximo 20 MB)
        <input id={`evidence-file-${periodId}`} type="file" accept=".pdf,application/pdf"
          onChange={e=>setFile(e.target.files?.[0]??null)} required/>
      </label></div>
      <div className="forja-actions"><button type="submit" disabled={busy||!file}>{busy?"Subiendo...":"Subir evidencia PDF"}</button></div>
    </form>}
    {!canUpload&&role===3&&!historical&&<p className="forja-note">Las evidencias se cargan cuando el semestre está aprobado.</p>}
    {error&&<p role="alert" className="forja-alert">{error}</p>}
    {message&&<p role="status" className="forja-ok">{message}</p>}
    <div className="forja-user-list">
      {items.length===0?<p>No hay evidencias registradas en este período.</p>:
        items.map(item=><div className="forja-evidence-item" key={item.id}>
          <div>
            <strong>{item.original_filename}</strong>
            <p>{Math.ceil(item.file_size/1024)} KB · {historical?"ARCHIVADA (HISTÓRICA)":item.review_status} · {item.uploaded_by_name}</p>
            {item.review_notes&&<p><strong>Observaciones:</strong> {item.review_notes}</p>}
            <a className="forja-textbutton" href={`${base}/${item.id}/download`}>Descargar PDF</a>
          </div>
          {role===1&&!historical&&item.review_status==="PENDIENTE"&&<div className="forja-evidence-review">
            <label>Observaciones
              <textarea rows={2} value={notes[item.id]??""} onChange={e=>setNotes(v=>({...v,[item.id]:e.target.value}))}/>
            </label>
            <div className="forja-actions">
              <button disabled={busy} type="button" onClick={()=>review(item.id,"APROBADA")}>Aprobar</button>
              <button disabled={busy||!(notes[item.id]??"").trim()} className="secondary" type="button" onClick={()=>review(item.id,"DEVUELTA")}>Devolver</button>
            </div>
          </div>}
        </div>)}
    </div>
  </div>;
}
