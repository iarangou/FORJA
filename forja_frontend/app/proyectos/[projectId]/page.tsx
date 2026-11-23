import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectDetailEditor from "@/components/projects/ProjectDetailEditor";
import "@/styles/projects.css";

export const metadata: Metadata = {
  title: "Detalle y edición del proyecto | FORJA",
};
export default function ProjectDetailPage(){
  return <Suspense fallback={<main style={{padding:32}}>Cargando proyecto...</main>}><ProjectDetailEditor /></Suspense>;
}
