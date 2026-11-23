import {Suspense} from "react";
import WorkspaceShell from "@/components/navigation/WorkspaceShell";
export default function AdministrationLayout({children}:{children:React.ReactNode}){
 return <Suspense fallback={<div role="status">Cargando FORJA...</div>}><WorkspaceShell>{children}</WorkspaceShell></Suspense>;
}
