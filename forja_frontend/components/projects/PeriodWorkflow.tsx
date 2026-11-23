"use client";

import {useEffect,useState} from "react";

export type WorkflowPeriod={
 id:number;academic_year:number;academic_semester:number;
 record_type:string;approval_status:string;execution_status:string;
 results:string|null;conclusions:string|null;
};
type Evidence={id:number;review_status:"PENDIENTE"|"APROBADA"|"DEVUELTA"};
type Props={
 projectId:string;periods:WorkflowPeriod[];selectedId:number|null;
 onSelect:(id:number)=>void;revision?:number;
 projectStatus:string;
};
const stages=[
 {number:"01",label:"Creación",description:"Preparar los datos del semestre"},
 {number:"02",label:"Aprobación del proyecto",description:"El administrador revisa este semestre"},
 {number:"03",label:"Envío de evidencias",description:"Adjuntar PDF de ejecución"},
 {number:"04",label:"Aprobación de evidencias",description:"Revisión de los PDF por el administrador"},
 {number:"05",label:"Cierre semestral",description:"Resultados, conclusiones y cierre"},
] as const;

export default function PeriodWorkflow({projectId,periods,selectedId,onSelect,revision=0,projectStatus}:Props){
 const period=periods.find(p=>p.id===selectedId);
 const [evidences,setEvidences]=useState<Evidence[]>([]);
 const [loading,setLoading]=useState(false);
 const [failure,setFailure]=useState(false);
 useEffect(()=>{
  if(!period){setEvidences([]);setFailure(false);return;}
  let active=true;
  setLoading(true);setFailure(false);
  fetch(`/api/projects/${projectId}/periods/${period.id}/evidences`,{cache:"no-store"})
   .then(async response=>{
    if(!response.ok)throw new Error("No disponible");
    const data:unknown=await response.json();
    if(active)setEvidences(Array.isArray(data)?data as Evidence[]:[]);
   })
   .catch(()=>{if(active){setEvidences([]);setFailure(true);}})
   .finally(()=>{if(active)setLoading(false)});
  return ()=>{active=false};
 },[projectId,period?.id,revision]);
 if(!period)return <section className="fw-workflow" aria-label="Seguimiento semestral">
   <h2>Seguimiento del proyecto</h2><p>No hay semestres registrados todavía.</p>
 </section>;

 const historical=period.record_type==="HISTORICO";
 const closed=period.execution_status==="CERRADO";
 const approved=period.approval_status==="APROBADO";
 const inReview=period.approval_status==="EN_REVISION";
 const returned=period.approval_status==="DEVUELTO";
 const approvedCount=evidences.filter(x=>x.review_status==="APROBADA").length;
 const pendingCount=evidences.filter(x=>x.review_status==="PENDIENTE").length;
 const returnedCount=evidences.filter(x=>x.review_status==="DEVUELTA").length;
 const completeEvidence=approvedCount>0&&pendingCount===0;
 const stage=closed?5:!approved?(inReview?1:0):evidences.length===0?2:!completeEvidence?3:4;
 const status=historical?"Archivado sin revisión":
   closed?"Semestre cerrado":
   returned?"Devuelto con observaciones":
   inReview?"En revisión del administrador":
   !approved?"Borrador en elaboración":
   evidences.length===0?"Listo para cargar evidencias":
   !completeEvidence?"Evidencias en revisión o corrección":"Preparar cierre semestral";
 const explanation=historical
  ?"Este período fue digitalizado como histórico y no necesita aprobación retrospectiva. Sus documentos se conservan asociados al semestre."
  :closed
   ?"El administrador cerró este semestre. El proyecto puede continuar en otro período hasta su finalización definitiva."
   :returned
    ?"El administrador devolvió la solicitud. Revisa sus observaciones, corrige y vuelve a enviar el semestre."
    :inReview
     ?"El semestre está esperando la decisión del administrador. Aún no se pueden enviar evidencias de ejecución."
     :!approved
      ?"Completa los campos requeridos y envía el semestre para aprobación administrativa."
      :evidences.length===0
       ?"El semestre está aprobado. Puedes comenzar a adjuntar evidencias PDF."
       :pendingCount>0
        ?"Hay evidencias pendientes de revisión por el administrador."
        :returnedCount>0&&!completeEvidence
         ?"Hay evidencias devueltas. Adjunta un nuevo PDF corregido y solicita su revisión."
         :completeEvidence
          ?"Las evidencias necesarias están aprobadas. Registra resultados y conclusiones para solicitar el cierre del semestre."
          :"Revisa y completa las evidencias pendientes.";
 return <section className="fw-workflow" aria-label="Estado y seguimiento del semestre">
   <div className="fw-workflow-header">
     <div><span className="fw-eyebrow">SEGUIMIENTO ACADÉMICO</span>
      <h2>Estado del semestre</h2>
      <p>Cada semestre tiene su propia revisión, evidencias y cierre.</p>
     </div>
     <div className="fw-workflow-selector">
       <label htmlFor="fw-period-selector">Semestre seleccionado</label>
       <select id="fw-period-selector" value={period.id} onChange={event=>onSelect(Number(event.target.value))}>
        {periods.map(p=><option value={p.id} key={p.id}>
         {p.academic_year}-{p.academic_semester}{p.record_type==="HISTORICO"?" · Histórico":""}
        </option>)}
       </select>
     </div>
   </div>
   <div className="fw-workflow-status">
    <strong>{status}</strong>
    <span>{projectStatus==="FINALIZADO"?"Proyecto finalizado definitivamente":"Proyecto general activo"}</span>
   </div>
   {historical?<div className="fw-historical-notice"><strong>Registro histórico</strong><p>{explanation}</p></div>:
    <>
     <ol className="fw-workflow-track">
      {stages.map((item,index)=>{
        const number=index+1;
        const finished=stage>number||closed;
        const active=!closed&&stage===index; // stage is the zero-indexed active phase (closed=5)
        return <li key={item.number} className={finished?"fw-track-complete":active?"fw-track-active":"fw-track-pending"}>
         <span className="fw-track-number" aria-label={finished?"Etapa completada":active?"Etapa actual":"Etapa pendiente"}>
          {finished?"✓":item.number}
         </span>
         <strong>{item.label}</strong>
         <small>{item.description}</small>
        </li>;
      })}
     </ol>
     <div className="fw-workflow-note"><p>{explanation}</p>
      {!failure&&!loading&&approved&&<span>
        {approvedCount} PDF aprobados · {pendingCount} pendientes · {returnedCount} devueltos
      </span>}
      {loading&&<span>Consultando evidencias...</span>}
      {failure&&<span>No se pudo consultar el estado de los PDF. Revisa la sección «Evidencias».</span>}
     </div>
   </>}
 </section>;
}
