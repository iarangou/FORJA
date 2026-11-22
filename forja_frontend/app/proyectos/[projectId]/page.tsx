import type { Metadata } from "next";
import ProjectDetailEditor from "@/components/projects/ProjectDetailEditor";
import "@/styles/projects.css";

export const metadata: Metadata = {
  title: "Detalle y edición del proyecto | FORJA",
};
export default function ProjectDetailPage(){
  return <ProjectDetailEditor />;
}
