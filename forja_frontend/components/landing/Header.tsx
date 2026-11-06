"use client";
import Link from "next/link";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header" id="inicio">
      <div className="container header-inner">
        <Link
          className="brand"
          href="/"
          aria-label="FORJA - ir al inicio"
        >
          <img
            src="/images/landing/forja-logo.png"
            alt="Logo FORJA"
          />
        </Link>

        <button
          className="menu-toggle"
          aria-controls="nav-primary"
          aria-label="Abrir menú"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          className={`nav ${menuOpen ? "is-open" : ""}`}
          id="nav-primary"
          aria-label="Navegación principal"
        >
          <a href="#nosotros">Sobre FORJA</a>
          <a href="#proyectos">Proyectos</a>
          <a href="#alianzas">Alianzas</a>
          <a href="#equipo">Equipo</a>

          <Link href="/login" className="nav-access">
            Acceder <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}