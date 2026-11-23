"use client";

import {useParams} from "next/navigation";
import {Suspense,useEffect,useState} from "react";
import {ACTION_LINES,LIKERT_ITEMS,LIKERT_OPTIONS} from "@/lib/community-questionnaire";
import "@/styles/projects.css";

type ProjectInfo={title:string;code:string;academic_year:number;academic_semester:number;expires_at:string};
type FieldKey=typeof textQuestions[number]["key"];
const textQuestions=[
 {key:"respondent_name",label:"1. ¿Cuál es tu nombre completo?",max:180},
 {key:"contact_details",label:"2. ¿Nos regalas por favor tus datos de contacto: correo electrónico y número de celular?",max:300},
 {key:"organization_location",label:"5. Indica tu entidad o barrio, comuna, ciudad y departamento",max:500},
 {key:"teacher_or_course",label:"6. ¿Cuál es el nombre del profesor y/o la asignatura del proyecto de A + S del que participaste?",max:300},
 {key:"project_identification",label:"7. ¿Cuál es el nombre del proyecto o cómo lo identificabas?",max:300},
 {key:"addressed_problem",label:"8. ¿Cuál es la problemática o necesidad que se abordó en el proyecto?",max:3000},
 {key:"student_participation",label:"9. ¿Cuántos estudiantes participaron en el proyecto y/o las actividades?",max:500},
 {key:"community_participation",label:"10. ¿Cuántas personas de la comunidad participaron en la formulación, desarrollo y cierre?",max:500},
 {key:"meetings_activities",label:"11. ¿Qué encuentros y/o actividades (descripción y cantidad) se realizaron durante el proyecto?",max:5000},
 {key:"achievements_products",label:"12. ¿Cuáles fueron los logros y productos entregados (tangibles e intangibles)?",max:5000},
 {key:"impact_benefits",label:"13. ¿Cuál fue el impacto y/o beneficios del proceso y productos/servicios entregados?",max:5000},
 {key:"obstacles",label:"16. ¿Qué obstáculos o limitaciones tuvo el desarrollo del proyecto de servicio vinculado al Programa FORJA?",max:5000},
 {key:"continuity_actions",label:"17. ¿Qué acciones en beneficio de la comunidad podrían complementar o dar continuidad al proyecto?",max:5000},
 {key:"other_projects",label:"18. ¿Qué otro tipo de proyectos podrían realizarse entre su comunidad / organización y el Programa FORJA?",max:5000},
] as const;
type Answer=Record<FieldKey,string>&{
 respondent_type:string;likert:Record<string,number>;action_line:string;
 additional_comments:string;consent_confirmed:boolean;
};
const initial:Answer={
 respondent_name:"",contact_details:"",respondent_type:"",
 organization_location:"",teacher_or_course:"",project_identification:"",
 addressed_problem:"",student_participation:"",community_participation:"",
 meetings_activities:"",achievements_products:"",impact_benefits:"",
 likert:{},action_line:"",obstacles:"",continuity_actions:"",
 other_projects:"",additional_comments:"",consent_confirmed:false,
};
const questionsByNumber=new Map<string,typeof textQuestions[number]>(
 textQuestions.map(q=>[q.key,q])
);

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
 function changeText(key:FieldKey,value:string){
  setAnswer(a=>({...a,[key]:value}));
 }
 function renderText(key:FieldKey,large=false){
  const q=questionsByNumber.get(key);
  if(!q)return null;
  return <label key={q.key} className={large?"full":""}>{q.label} *
   {large?<textarea required rows={3} maxLength={q.max} value={answer[q.key]} onChange={e=>changeText(q.key,e.target.value)}/>:
    <input required maxLength={q.max} value={answer[q.key]} onChange={e=>changeText(q.key,e.target.value)}/>}
  </label>;
 }
 async function send(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy||done)return;
  setError("");setBusy(true);
  try{
   const response=await fetch(`/api/community-feedback/${token}`,{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(answer),
   });
   const data=await response.json();
   if(!response.ok)throw new Error(Array.isArray(data.message)?data.message.join(", "):
    typeof data.message==="string"?data.message:"No se pudo enviar");
   setDone(true);
  }catch(e){setError(e instanceof Error?e.message:"Error al enviar")}
  finally{setBusy(false)}
 }
 return <main className="forja-projects"><div className="forja-shell">
  <div className="forja-heading"><span className="forja-eyebrow">PROGRAMA FORJA · EVALUACIÓN COMUNITARIA</span>
   <h1>Programa de Formación Javeriana para el Cambio Social y la Paz – FORJA</h1>
   <p>Este cuestionario busca valorar la calidad metodológica de la implementación del proyecto de Aprendizaje + Servicio para identificar oportunidades de mejora.</p>
   <p>Una evaluación por semestre. No necesitas una cuenta para responder.</p>
  </div>
  {done?<section className="forja-panel"><h2>Evaluación recibida</h2>
    <p>Muchas gracias por compartir tu experiencia. Tu respuesta quedó registrada y este enlace ya no se puede usar otra vez.</p>
  </section>:info&&<form className="forja-form" onSubmit={send}>
   <section className="forja-panel">
    <h2>Proyecto evaluado</h2>
    <p><strong>{info.code} · {info.title}</strong></p>
    <p className="forja-note"><strong>4. Período del proyecto:</strong> {info.academic_year}-{info.academic_semester}. Esta información se completa automáticamente por el enlace del semestre, para evitar confusiones.</p>
   </section>
   <section className="forja-panel">
    <h2>Datos de identificación y contexto</h2>
    <p className="forja-description">Los campos señalados con * son obligatorios, como en el formulario original de FORJA. No uses datos ficticios cuando se trate de una evaluación real.</p>
    <div className="forja-fields">
     {renderText("respondent_name")}
     {renderText("contact_details")}
     <fieldset className="full forja-rating-field">
      <legend>3. ¿Te identificas como? *</legend>
      <div className="forja-rating-options">
       {[["SOCIO_COMUNITARIO","Socio Comunitario (líder o lideresa)"],["ALIADO_INSTITUCIONAL","Aliado Institucional (fundaciones, instituciones educativas u otros)"]].map(([value,label])=>
        <label key={value}><input type="radio" required name="respondent_type" value={value}
          checked={answer.respondent_type===value} onChange={()=>setAnswer(a=>({...a,respondent_type:value}))}/>{label}</label>)}
      </div>
     </fieldset>
     {renderText("organization_location",true)}
     {renderText("teacher_or_course",true)}
     {renderText("project_identification",true)}
     {renderText("addressed_problem",true)}
     {renderText("student_participation")}
     {renderText("community_participation")}
    </div>
   </section>
   <section className="forja-panel">
    <h2>Actividades, productos e impacto</h2>
    <div className="forja-fields">
     {renderText("meetings_activities",true)}
     {renderText("achievements_products",true)}
     {renderText("impact_benefits",true)}
    </div>
   </section>
   <section className="forja-panel">
    <h2>14. Valoración del desarrollo del proyecto *</h2>
    <p className="forja-description">Indica tu nivel de acuerdo con cada afirmación. Responde las 14 para enviar tu evaluación.</p>
    <div className="forja-questionnaire-matrix">
     {LIKERT_ITEMS.map((item,index)=><fieldset className="forja-rating-field" key={item.id}>
      <legend>{index+1}. {item.text}</legend>
      <div className="forja-likert-options">
       {LIKERT_OPTIONS.map(option=><label key={option.value}>
        <input type="radio" required name={item.id} value={option.value}
         checked={answer.likert[item.id]===option.value}
         onChange={()=>setAnswer(a=>({...a,likert:{...a.likert,[item.id]:option.value}}))}/>
        <span>{option.label}</span>
       </label>)}
      </div>
     </fieldset>)}
    </div>
   </section>
   <section className="forja-panel">
    <h2>Líneas de acción y oportunidades de mejora</h2>
    <fieldset className="forja-rating-field">
     <legend>15. Señale a cuál de las siguientes líneas de acción se vincula el proyecto implementado *</legend>
     <div className="forja-action-options">
      {ACTION_LINES.map(line=><label key={line.id}>
       <input required type="radio" name="action_line" value={line.id}
        checked={answer.action_line===line.id}
        onChange={()=>setAnswer(a=>({...a,action_line:line.id}))}/>
       <span><strong>{line.label}</strong>: {line.description}</span>
      </label>)}
     </div>
    </fieldset>
    <div className="forja-fields">
     {renderText("obstacles",true)}
     {renderText("continuity_actions",true)}
     {renderText("other_projects",true)}
     <label className="full">19. ¿Tienen alguna recomendación o comentario adicional? (opcional)
      <textarea maxLength={3000} rows={3} value={answer.additional_comments}
       onChange={e=>setAnswer(a=>({...a,additional_comments:e.target.value}))}/>
     </label>
     <label className="forja-check full">
      <input required type="checkbox" checked={answer.consent_confirmed}
       onChange={e=>setAnswer(a=>({...a,consent_confirmed:e.target.checked}))}/>
      Autorizo que FORJA almacene estos datos de contacto y mis respuestas para la evaluación del proyecto.
     </label>
    </div>
   </section>
   {error&&<p className="forja-alert" role="alert">{error}</p>}
   <div className="forja-actions"><button disabled={busy||!answer.consent_confirmed||
     Object.keys(answer.likert).length!==LIKERT_ITEMS.length} type="submit">
     {busy?"Enviando...":"Enviar evaluación"}
   </button></div>
  </form>}
  {!info&&!done&&<p role="alert" className="forja-alert">{error||"Cargando formulario..."}</p>}
 </div></main>;
}
export default function CommunityEvaluationPage(){
 return <Suspense fallback={<main className="forja-projects"><p>Cargando evaluación comunitaria...</p></main>}>
  <CommunityEvaluationPageContent/>
 </Suspense>;
}
