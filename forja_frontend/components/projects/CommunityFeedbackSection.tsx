"use client";
import {useEffect,useState} from "react";

type Feedback={
 id:number;organization_name:string|null;relationship_to_project:string|null;
 ratings:{objectives:number;usefulness:number;participation:number};
 comments:string|null;submitted_at:string;consent_confirmed:boolean;
};
type Summary={
 feedback:Feedback|null;
 link:{created_at:string;expires_at:string;used_at:string|null}|null;
};
interface Props{projectId:string;periodId:number;role:number|null;academicYear:number;academicSemester:number}
export default function CommunityFeedbackSection({projectId,periodId,role,academicYear,academicSemester}:Props){
 const [summary,setSummary]=useState<Summary|null>(null);
 const [issuedUrl,setIssuedUrl]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const base=`/api/projects/${projectId}/periods/${periodId}/community-feedback`;
 useEffect(()=>{
  let active=true;
  fetch(base,{cache:"no-store"}).then(async r=>{
   const data=await r.json();
   if(!r.ok)throw new Error(typeof data.message==="string"?data.message:"No se pudo consultar");
   if(active)setSummary(data as Summary);
  }).catch(e=>{if(active)setError(e instanceof Error?e.message:"Error de conexión")});
  return ()=>{active=false};
 },[base]);
 async function issueLink(){
  if(role!==1||busy)return;
  if(summary?.link&&!window.confirm("Se invalidará el enlace anterior. ¿Deseas generar uno nuevo?"))return;
  setError("");setMessage("");setBusy(true);
  try{
   const r=await fetch(`${base}/link`,{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
   const data=await r.json();
   if(!r.ok)throw new Error(typeof data.message==="string"?data.message:"No se pudo generar el enlace");
   const url=`${window.location.origin}/evaluacion-comunitaria/${data.token}`;
   setIssuedUrl(url);
   setSummary(v=>({feedback:v?.feedback??null,link:{
    created_at:new Date().toISOString(),expires_at:data.expires_at,used_at:null,
   }}));
   setMessage("Copia el enlace ahora. Por seguridad, no volverá a mostrarse después de cerrar esta página.");
  }catch(e){setError(e instanceof Error?e.message:"Error de generación");}
  finally{setBusy(false);}
 }
 const feedback=summary?.feedback;
 return <div className="forja-accordion-inner">
  <p className="forja-description">La comunidad diligencia una evaluación para cada semestre mediante un enlace privado. Semestre seleccionado: {academicYear}-{academicSemester}. No necesita usuario. La carta firmada también pertenece al semestre, pero se archiva como PDF independiente.</p>
  {feedback?<div className="forja-user-list">
   <p><strong>Evaluación recibida:</strong> {new Date(feedback.submitted_at).toLocaleDateString("es-CO")}</p>
   <p><strong>Organización:</strong> {feedback.organization_name||"No indicada"}</p>
   <p><strong>Relación:</strong> {feedback.relationship_to_project||"No indicada"}</p>
   <p><strong>Cumplimiento de objetivos:</strong> {feedback.ratings.objectives}/5</p>
   <p><strong>Utilidad comunitaria:</strong> {feedback.ratings.usefulness}/5</p>
   <p><strong>Participación:</strong> {feedback.ratings.participation}/5</p>
   <p><strong>Comentarios:</strong> {feedback.comments||"Sin comentarios"}</p>
  </div>:<>
   {summary?.link&&<p className="forja-note">
    Enlace generado. Vence el {new Date(summary.link.expires_at).toLocaleDateString("es-CO")}.
    {summary.link.used_at?" Ya fue utilizado.":" Si lo perdiste, el administrador puede generar otro."}
   </p>}
   {role===1&&<div className="forja-actions">
    <button type="button" disabled={busy} onClick={issueLink}>
     {busy?"Generando...":summary?.link?"Regenerar enlace privado":"Generar enlace para la comunidad"}
    </button>
   </div>}
   {issuedUrl&&<div className="forja-note">
    <p><strong>Enlace privado para compartir</strong></p>
    <input type="text" readOnly value={issuedUrl} aria-label="Enlace de evaluación comunitaria"/>
    <button type="button" className="forja-textbutton" onClick={()=>navigator.clipboard.writeText(issuedUrl).then(()=>setMessage("Enlace copiado.")).catch(()=>setError("No se pudo copiar el enlace."))}>Copiar enlace</button>
   </div>}
  </>}
  {error&&<p className="forja-alert" role="alert">{error}</p>}
  {message&&<p className="forja-ok" role="status">{message}</p>}
 </div>;
}
