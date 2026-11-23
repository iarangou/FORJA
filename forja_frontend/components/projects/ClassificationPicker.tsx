"use client";

type Item={id:number;name:string};
interface Props {
  title:string;
  items:Item[];
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
 return <fieldset className="forja-classification-field">
  <legend>{title}</legend>
  {items.length===0?<p className="forja-description">{emptyText}</p>:
   <div className="forja-classification-options">
    {items.map(item=><label className="forja-check" key={item.id}>
      <input type="checkbox" checked={selected.includes(item.id)} disabled={disabled}
        onChange={event=>toggle(item.id,event.target.checked)}/>
      {item.name}
    </label>)}
   </div>}
 </fieldset>;
}
