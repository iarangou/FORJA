"use client";

import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  summary?: string;
}

/**
 * Panel plegable accesible. El contenido permanece montado mientras está
 * cerrado: abrir otra sección no descarta texto escrito sin guardar.
 */
export default function ProjectAccordion({id,title,open,onToggle,summary,children}: Props) {
  const panelId = `forja-section-${id}`;
  const triggerId = `forja-trigger-${id}`;

  return <section className="forja-panel forja-editor-section forja-accordion">
    <h2 className="forja-accordion-heading">
      <button id={triggerId} type="button" className="forja-accordion-trigger"
        aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span className="forja-accordion-title">
          <span>{title}</span>
          {summary && <small>{summary}</small>}
        </span>
        <span className={`forja-accordion-chevron${open ? " is-open" : ""}`} aria-hidden="true">⌄</span>
      </button>
    </h2>
    <div id={panelId} role="region" aria-labelledby={triggerId}
      className="forja-accordion-body" hidden={!open}>
      {children}
    </div>
  </section>;
}
