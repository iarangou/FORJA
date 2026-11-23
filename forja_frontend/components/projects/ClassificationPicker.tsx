"use client";

type Item={id:number;name:string};
interface Props {
  title:string;
  items:readonly Item[];
  selected:number[];
  onChange:(value:number[])=>void;
  disabled?:boolean;
  emptyText?:string;
}
export default function ClassificationPicker({
 title,items,selected,onChange,disabled=false,emptyText="El administrador debe configurar este catálogo.",
}:Props){
 function toggle(id:number,checked:boolean){
  onChange(checked?[...selected,id]:selected.filter(value=>value!==id));
 }
 const chosen=items.filter(item=>selected.includes(item.id));
 return <fieldset className="forja-classification-field">
  <legend>{title}</legend>
  <details className="forja-multiselect">
    <summary aria-label={title}>{chosen.length===0?"Seleccionar opciones":
      chosen.length===1?chosen[0].name:`${chosen.length} opciones seleccionadas`}</summary>
    <div className="forja-multiselect-menu">
      {items.length===0?<p className="forja-description">{emptyText}</p>:
       items.map(item=><label className="forja-check" key={item.id}>
        <input type="checkbox" checked={selected.includes(item.id)} disabled={disabled}
          onChange={event=>toggle(item.id,event.target.checked)}/>
        {item.name}
       </label>)}
    </div>
  </details>
  {chosen.length>0&&<p className="forja-description">Seleccionados: {chosen.map(i=>i.name).join(", ")}</p>}
 </fieldset>;
}
