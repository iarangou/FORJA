import type { Metadata } from "next";
import NewProjectForm from "@/components/projects/NewProjectForm";
import "@/styles/projects.css";
export const metadata: Metadata = {
  title: "Registrar proyecto | FORJA",
  description: "Registro general y análisis ético de proyectos FORJA",
};
export default function NewProjectPage() {
  return <NewProjectForm />;
}
