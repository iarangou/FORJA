"use client";
import {useState} from "react";
import type {FormEvent} from "react";
import RegisterField from "./RegisterField";
import PasswordField from "./PasswordField";
import {registerUser,RegisterApiError} from "@/services/registerService";

interface Props {onRegistered:(email:string)=>void}
export default function RegisterForm({onRegistered}:Props){
 const [fullName,setFullName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [errors,setErrors]=useState<Record<string,string>>({});
 const [submitError,setSubmitError]=useState("");
 const [busy,setBusy]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;
  const normalized=email.trim().toLowerCase();
  const next:Record<string,string>={};
  if(!fullName.trim())next.full_name="Ingresa tu nombre completo.";
  if(!/^[^\s@]+@javerianacali\.edu\.co$/.test(normalized))next.email="Usa un correo @javerianacali.edu.co.";
  if(password.length<12)next.password="La contraseña debe tener al menos 12 caracteres.";
  setErrors(next);setSubmitError("");
  if(Object.keys(next).length)return;
  setBusy(true);
  try{
   await registerUser({full_name:fullName.trim(),email:normalized,password});
   onRegistered(normalized);
  }catch(e){setSubmitError(e instanceof RegisterApiError?e.message:"No fue posible completar el registro.");}
  finally{setBusy(false);}
 }
 return <form className="register-form" onSubmit={submit} noValidate>
  <RegisterField id="register-name" name="full_name" label="Nombre completo" type="text" autoComplete="name"
   placeholder="Escribe tu nombre completo" value={fullName} disabled={busy}
   onChange={e=>setFullName(e.target.value)} error={errors.full_name}/>
  <RegisterField id="register-email" name="email" label="Correo institucional" type="email"
   autoComplete="email" placeholder="nombre@javerianacali.edu.co"
   value={email} disabled={busy} onChange={e=>setEmail(e.target.value)} error={errors.email}/>
  <PasswordField value={password} disabled={busy} onChange={e=>setPassword(e.target.value)} error={errors.password}/>
  <p className="form-message">Después de verificar el correo, el administrador decidirá si te asigna el rol de profesor o monitor. Si eres profesor, también seleccionará tu facultad.</p>
  {submitError&&<p className="form-message form-message--error" role="alert">{submitError}</p>}
  <button type="submit" className="submit-button" disabled={busy}>
   {busy?"Enviando...":"Enviar código de verificación"}<span aria-hidden="true"> →</span>
  </button>
 </form>;
}
