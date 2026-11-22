"use client";
import {useEffect,useState} from "react";

type Letter={id:number;original_filename:string;file_size:number;uploaded_at:string;uploaded_by_name:string};
interface Props {
  projectId:string;role:number|null;projectStatus:string;
  periods:{record_type:string;approval_status:string;execution_status:string}[];
}
export default function FinalLetterSection({projectId,role,projectStatus,periods}:Props){
  const [letter,setLetter]=useState<Letter|null>(null);
  const [file,setFile]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);
  const base=`/api/projects/${projectId}/final-letter`;
  const pending=periods.some(p=>p.record_type==="ACTUAL" &&
    (p.approval_status!=="APROBADO"||p.execution_status!=="CERRADO"));
  const eligible=periods.length>0&&!pending;
  const canUpload=(role===1||role===2)&&!letter&&eligible;
  async function refresh(){
    const response=await fetch(base,{cache:"no-store"});
    const data=await response.json();
    if(!response.ok)throw new Error(typeof data.message==="string"?data.message:"No se pudo consultar la carta");
    setLetter(data && typeof data.id==="number"?data as Letter:null);
  }
  useEffect(()=>{
    let active=true;setLoading(true);
    fetch(base,{cache:"no-store"}).then(async r=>{
      const data=await r.json();
      if(!r.ok)throw new Error(typeof data.message==="string"?data.message:"No se pudo consultar la carta");
      if(active)setLetter(data&&typeof data.id==="number"?data as Letter:null);
    }).catch(e=>{if(active)setError(e instanceof Error?e.message:"Error consultando carta")})
      .finally(()=>{if(active)setLoading(false)});
    return ()=>{active=false};
  },[base]);
  async function upload(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!file||busy)return;
    setError("");setMessage("");
    if(file.type!=="application/pdf"||!file.name.toLowerCase().endsWith(".pdf")){
      setError("La carta debe ser PDF");return;
    }
    if(file.size>20*1024*1024){setError("El PDF debe pesar máximo 20 MB");return;}
    setBusy(true);
    try{
      const data=new FormData();data.append("file",file);
      const response=await fetch(base,{method:"POST",body:data});
      const payload=await response.json();
      if(!response.ok)throw new Error(typeof payload.message==="string"?payload.message:"No se pudo cargar la carta");
      await refresh();setFile(null);
      setMessage("Carta firmada guardada como documento final del proyecto.");
    }catch(e){setError(e instanceof Error?e.message:"Error al subir");}
    finally{setBusy(false);}
  }
  return <div className="forja-accordion-inner">
    <p className="forja-description">
      El administrador o monitor incorpora únicamente la carta final firmada por la comunidad en PDF.
      La carta pertenece al proyecto completo, no a un semestre particular. No se genera ni se firma aquí.
    </p>
    {loading&&<p>Consultando carta...</p>}
    {letter&&<div className="forja-note">
      <strong>Carta final archivada</strong>
      <p>{letter.original_filename} · {Math.ceil(letter.file_size/1024)} KB · {letter.uploaded_by_name}</p>
      <a className="forja-textbutton" href={`${base}/${letter.id}/download`}>Descargar carta firmada PDF</a>
    </div>}
    {!loading&&!letter&&<p>Este proyecto todavía no tiene una carta final firmada.</p>}
    {!loading&&canUpload&&<form onSubmit={upload} className="forja-form">
      <div className="forja-fields">
        <label className="full">Carta final firmada por la comunidad (.pdf, máximo 20 MB)
          <input type="file" accept=".pdf,application/pdf" required
            onChange={e=>setFile(e.target.files?.[0]??null)}/>
        </label>
      </div>
      <div className="forja-actions">
        <button type="submit" disabled={!file||busy}>{busy?"Guardando...":"Guardar carta final firmada"}</button>
      </div>
    </form>}
    {!loading&&!eligible&&!letter&&<p className="forja-note">La carta final puede archivarse cuando todos los semestres actuales estén cerrados.</p>}
    {projectStatus==="FINALIZADO"&&<p className="forja-description">Este proyecto está finalizado. Se conserva su documentación.</p>}
    {error&&<p role="alert" className="forja-alert">{error}</p>}
    {message&&<p role="status" className="forja-ok">{message}</p>}
  </div>;
}
