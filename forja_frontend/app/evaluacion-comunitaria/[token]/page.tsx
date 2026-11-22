"use client";

import {useParams} from "next/navigation";
import {Suspense,useEffect,useState} from "react";
import "@/styles/projects.css";

type ProjectInfo={title:string;code:string;academic_year:number;academic_semester:number;expires_at:string};
type Answer={organization_name:string;relationship_to_project:string;
 objectives_rating:number;usefulness_rating:number;participation_rating:number;
 comments:string;consent_confirmed:boolean};
const initial:Answer={
 organization_name:"",relationship_to_project:"",
 objectives_rating:0,usefulness_rating:0,participation_rating:0,
 comments:"",consent_confirmed:false,
};
const questions:[keyof Answer,string][]=[
 ["objectives_rating","¿En qué medida se cumplieron los objetivos del proyecto?"],
 ["usefulness_rating","¿Qué tan útil fue el proyecto para la comunidad?"],
 ["participation_rating","¿Cómo valora la participación y el trabajo conjunto?"],
];

function CommunityEvaluationPageContent(){
 const {token}=useParams<{token:string}>();
 const [info,setInfo]=useState<ProjectInfo|null>(null);
 const [answer,setAnswer]=useState<Answer>(initial);
 const [busy,setBusy]=useState(false);
 const [done,setDone]=useState(false);
 const [error,setError]=useState("");
 useEffect(()=>{
  let active=true;
  fetch(`/api/community-feedback/${token}`,{cache:"no-store"})
   .then(async response=>{
     const data=await response.json();
     if(!response.ok)throw new Error(typeof data.message==="string"?data.message:"Enlace no disponible");
     if(active)setInfo(data as ProjectInfo);
   }).catch(e=>{if(active)setError(e instanceof Error?e.message:"Enlace no disponible")});
  return ()=>{active=false};
 },[token]);
 async function send(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy||done)return;
  setError("");setBusy(true);
  try{
   const response=await fetch(`/api/community-feedback/${token}`,{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(answer),
   });
   const data=await response.json();
   if(!response.ok)throw new Error(typeof data.message==="string"?data.message:"No se pudo enviar");
   setDone(true);
  }catch(e){setError(e instanceof Error?e.message:"Error al enviar");}
  finally{setBusy(false);}
 }
 return <main className="forja-projects"><div className="forja-shell">
  <div className="forja-heading"><span className="forja-eyebrow">FORJA · EVALUACIÓN COMUNITARIA</span>
   <h1>Tu experiencia con el proyecto</h1>
   <p>Este formulario se responde una sola vez por semestre. No necesitas crear una cuenta.</p>
  </div>
  {done?<section className="forja-panel">
    <h2>¡Gracias por tu participación!</h2>
    <p>Tu evaluación quedó registrada. El enlace ya no podrá utilizarse nuevamente.</p>
   </section>:info&&<section className="forja-panel forja-editor-section">
   <h2>{info.code} · {info.title}</h2>
   <p className="forja-note"><strong>Semestre evaluado:</strong> {info.academic_year}-{info.academic_semester}</p>
   <p className="forja-description">Valora del 1 (muy bajo) al 5 (muy alto). Estas preguntas son una propuesta para la etapa de pruebas.</p>
   <form className="forja-form" onSubmit={send}>
    <div className="forja-fields">
     <label>Organización o comunidad (opcional)
      <input maxLength={200} value={answer.organization_name}
       onChange={e=>setAnswer(v=>({...v,organization_name:e.target.value}))}/>
     </label>
     <label>Relación con el proyecto (opcional)
      <input maxLength={300} value={answer.relationship_to_project}
       onChange={e=>setAnswer(v=>({...v,relationship_to_project:e.target.value}))}/>
     </label>
     {questions.map(([key,question])=><fieldset key={key} className="full forja-rating-field">
       <legend>{question}</legend>
       <div className="forja-rating-options">
        {[1,2,3,4,5].map(n=><label key={n}>
         <input required type="radio" name={key} value={n} checked={answer[key]===n}
          onChange={()=>setAnswer(v=>({...v,[key]:n}))}/>{n}
        </label>)}
       </div>
      </fieldset>)}
     <label className="full">Comentarios o sugerencias (opcional)
      <textarea rows={4} maxLength={3000} value={answer.comments}
       onChange={e=>setAnswer(v=>({...v,comments:e.target.value}))}/>
     </label>
     <label className="forja-check full">
      <input type="checkbox" required checked={answer.consent_confirmed}
       onChange={e=>setAnswer(v=>({...v,consent_confirmed:e.target.checked}))}/>
      Autorizo a FORJA a almacenar estas respuestas para evaluar el proyecto.
     </label>
    </div>
    {error&&<p className="forja-alert" role="alert">{error}</p>}
    <div className="forja-actions">
     <button type="submit" disabled={busy||!answer.consent_confirmed||
       !answer.objectives_rating||!answer.usefulness_rating||!answer.participation_rating}>
      {busy?"Enviando...":"Enviar evaluación"}
     </button>
    </div>
   </form>
  </section>}
  {!info&&!done&&<p role="alert" className="forja-alert">{error||"Cargando evaluación..."}</p>}
 </div></main>;
}

export default function CommunityEvaluationPage(){
 return <Suspense fallback={<main className="forja-projects"><p>Cargando evaluación comunitaria...</p></main>}>
  <CommunityEvaluationPageContent/>
 </Suspense>;
}
