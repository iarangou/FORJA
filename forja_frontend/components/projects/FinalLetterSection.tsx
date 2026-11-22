"use client";
import {useEffect,useState} from "react";

type Letter={id:number;original_filename:string;file_size:number;uploaded_at:string;uploaded_by_name:string};
interface Props {
  projectId:string;periodId:number;role:number|null;recordType:string;approvalStatus:string;executionStatus:string;
}
export default function FinalLetterSection({projectId,periodId,role,recordType,approvalStatus,executionStatus}:Props){
  const [letter,setLetter]=useState<Letter|null>(null);
  const [file,setFile]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);
  const base=`/api/projects/${projectId}/periods/${periodId}/final-letter`;
  const eligible=recordType==="HISTORICO" || (approvalStatus==="APROBADO"&&executionStatus==="CERRADO");
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
      setMessage("Carta final firmada guardada para este semestre.");
    }catch(e){setError(e instanceof Error?e.message:"Error al subir");}
    finally{setBusy(false);}
  }
  return <div className="forja-accordion-inner">
    <p className="forja-description">
      El administrador o monitor archiva la carta firmada al final de este semestre, en PDF.
      Cada semestre tiene su propia carta. Se redacta y firma fuera de FORJA.
    </p>
    {loading&&<p>Consultando carta...</p>}
    {letter&&<div className="forja-note">
      <strong>Carta final archivada</strong>
      <p>{letter.original_filename} · {Math.ceil(letter.file_size/1024)} KB · {letter.uploaded_by_name}</p>
      <a className="forja-textbutton" href={`${base}/${letter.id}/download`}>Descargar carta firmada PDF</a>
    </div>}
    {!loading&&!letter&&<p>Este semestre todavía no tiene una carta final firmada.</p>}
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
    {!loading&&!eligible&&!letter&&<p className="forja-note">La carta final del semestre actual se archiva después de su cierre.</p>}
    {error&&<p role="alert" className="forja-alert">{error}</p>}
    {message&&<p role="status" className="forja-ok">{message}</p>}
  </div>;
}
