// Open XML (.xlsx) sin dependencias adicionales: ZIP + XML con celdas de texto y números.
import {deflateRawSync} from "node:zlib";

type Cell=string|number|null|undefined;
type Sheet={name:string;headers:string[];rows:Cell[][]};
const encoder=new TextEncoder();
function crc32(data:Uint8Array):number{
  let crc=0xffffffff;
  for(const octet of data){
    crc^=octet;
    for(let i=0;i<8;i++)crc=(crc&1)?(crc>>>1)^0xedb88320:crc>>>1;
  }
  return (crc^0xffffffff)>>>0;
}
function xml(value:string):string{
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g,"")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
function column(index:number):string{
  let ans="",v=index+1;
  while(v>0){v--;ans=String.fromCharCode(65+(v%26))+ans;v=Math.floor(v/26);}
  return ans;
}
function sheetXml(sheet:Sheet):string{
  const rows=[sheet.headers,...sheet.rows];
  const body=rows.map((values,r)=>{
    const cells=values.map((value,c)=>{
      const ref=column(c)+(r+1);
      if(typeof value==="number"&&Number.isFinite(value)){
        return `<c r="${ref}" s="${r===0?1:0}"><v>${value}</v></c>`;
      }
      // inlineStr impide ejecutar fórmulas inyectadas desde títulos o campos libres.
      const text=xml(value==null?"":String(value));
      return `<c r="${ref}" s="${r===0?1:0}" t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`;
    }).join("");
    return `<row r="${r+1}">${cells}</row>`;
  }).join("");
  const last=column(Math.max(0,sheet.headers.length-1));
  const widths=sheet.headers.map((_,i)=>`<col min="${i+1}" max="${i+1}" width="${i<3?23:22}" customWidth="1"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<dimension ref="A1:${last}${rows.length}"/><sheetViews><sheetView workbookViewId="0">
<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="17"/><cols>${widths}</cols><sheetData>${body}</sheetData>
<autoFilter ref="A1:${last}${rows.length}"/></worksheet>`;
}
function zip(entries:{name:string;data:Uint8Array}[]):Uint8Array{
  const chunks:Uint8Array[]=[],central:Uint8Array[]=[];
  let offset=0;
  function u16(view:DataView,n:number,v:number){view.setUint16(n,v,true)}
  function u32(view:DataView,n:number,v:number){view.setUint32(n,v>>>0,true)}
  for(const entry of entries){
    const name=encoder.encode(entry.name),payload=deflateRawSync(entry.data),crc=crc32(entry.data);
    const local=new Uint8Array(30+name.length);
    const lv=new DataView(local.buffer);
    u32(lv,0,0x04034b50);u16(lv,4,20);u16(lv,6,0x800);u16(lv,8,8);
    u32(lv,14,crc);u32(lv,18,payload.length);u32(lv,22,entry.data.length);
    u16(lv,26,name.length);local.set(name,30);
    chunks.push(local,payload);
    const head=new Uint8Array(46+name.length),cv=new DataView(head.buffer);
    u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0x800);u16(cv,10,8);
    u32(cv,16,crc);u32(cv,20,payload.length);u32(cv,24,entry.data.length);
    u16(cv,28,name.length);u32(cv,42,offset);head.set(name,46);
    central.push(head);
    offset+=local.length+payload.length;
  }
  const cdLength=central.reduce((n,c)=>n+c.length,0);
  const end=new Uint8Array(22),view=new DataView(end.buffer);
  u32(view,0,0x06054b50);u16(view,8,entries.length);u16(view,10,entries.length);
  u32(view,12,cdLength);u32(view,16,offset);
  const parts=[...chunks,...central,end];
  const all=new Uint8Array(offset+cdLength+end.length);
  let k=0;for(const part of parts){all.set(part,k);k+=part.length;}
  return all;
}
export function createWorkbook(sheets:Sheet[]):Uint8Array{
  const data=(content:string)=>encoder.encode(content);
  const types=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}
</Types>`;
  const workbook=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheets.map((s,i)=>`<sheet name="${xml(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join("")}</sheets></workbook>`;
  const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join("")}
<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>
<font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF673787"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1"/></cellXfs>
</styleSheet>`;
  const entries=[
    {name:"[Content_Types].xml",data:data(types)},
    {name:"_rels/.rels",data:data(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`)},
    {name:"xl/workbook.xml",data:data(workbook)},
    {name:"xl/_rels/workbook.xml.rels",data:data(rels)},
    {name:"xl/styles.xml",data:data(styles)},
    ...sheets.map((sheet,i)=>({name:`xl/worksheets/sheet${i+1}.xml`,data:data(sheetXml(sheet))})),
  ];
  return zip(entries);
}
