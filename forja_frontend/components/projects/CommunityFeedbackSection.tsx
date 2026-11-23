"use client";
import {useEffect,useState} from "react";
import {ACTION_LINES,LIKERT_ITEMS,LIKERT_OPTIONS} from "@/lib/community-questionnaire";

type Feedback={
 id:number;organization_name:string|null;relationship_to_project:string|null;
 ratings:{objectives:number;usefulness:number;participation:number};
 comments:string|null;submitted_at:string;consent_confirmed:boolean;
 form_version?:string;form_responses?:Record<string,unknown>|null;
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
   {feedback.form_version==="INSTITUCIONAL_2026"&&feedback.form_responses?(()=>{
    const data=feedback.form_responses;
    const fields=[
      ["respondent_name","1. Nombre"],["contact_details","2. Datos de contacto"],
      ["respondent_type","3. Tipo de participante"],["organization_location","5. Ubicación"],
      ["teacher_or_course","6. Profesor o asignatura"],["project_identification","7. Proyecto indicado"],
      ["addressed_problem","8. Problemática abordada"],["student_participation","9. Estudiantes"],
      ["community_participation","10. Personas de la comunidad"],
      ["meetings_activities","11. Actividades realizadas"],
      ["achievements_products","12. Logros y productos"],
      ["impact_benefits","13. Impactos y beneficios"],
      ["obstacles","16. Obstáculos"],["continuity_actions","17. Continuidad"],
      ["other_projects","18. Proyectos propuestos"],["additional_comments","19. Comentarios"],
    ];
    const likert=data.likert&&typeof data.likert==="object"?data.likert as Record<string,number>:{};
    return <>
     <p className="forja-note">Cuestionario institucional FORJA · Semestre {academicYear}-{academicSemester}</p>
     {fields.map(([key,label])=><p key={key}><strong>{label}:</strong> {String(data[key]??"Sin información")}</p>)}
     <h3>14. Valoraciones</h3>
     {LIKERT_ITEMS.map(item=><p key={item.id}><strong>{item.text}:</strong> {
      LIKERT_OPTIONS.find(o=>o.value===likert[item.id])?.label??"Sin respuesta"
     }</p>)}
     <p><strong>15. Línea de acción:</strong> {
      ACTION_LINES.find(line=>line.id===data.action_line)?.label??"No indicada"
     }</p>
    </>;
   })():<>
    <p className="forja-note">Evaluación anterior de prueba, preservada sin modificaciones.</p>
    <p><strong>Organización:</strong> {feedback.organization_name||"No indicada"}</p>
    <p><strong>Relación:</strong> {feedback.relationship_to_project||"No indicada"}</p>
    <p><strong>Cumplimiento de objetivos:</strong> {feedback.ratings.objectives}/5</p>
    <p><strong>Utilidad comunitaria:</strong> {feedback.ratings.usefulness}/5</p>
    <p><strong>Participación:</strong> {feedback.ratings.participation}/5</p>
    <p><strong>Comentarios:</strong> {feedback.comments||"Sin comentarios"}</p>
   </>}
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
