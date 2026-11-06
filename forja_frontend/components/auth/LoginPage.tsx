
"use client";

import { useState } from "react";
import Link from "next/link";
import type { FormEvent } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Inicio de sesión de demostración. Backend pendiente.");
  }

  return (
    <div className="page-shell">
      <aside className="brand-panel" aria-label="Presentación de FORJA">
        <div className="brand-panel__top">
          <span className="brand-panel__eyebrow">
            PONTIFICIA UNIVERSIDAD JAVERIANA · CALI
          </span>
        </div>

        <div className="brand-panel__content">
          <div className="forja-mark">
            <img
              src="/images/auth/forja-logo.png"
              alt="FORJA — Formación Javeriana para el Cambio Social y la Paz"
            />
          </div>

          <p className="brand-panel__kicker">
            FORMACIÓN · COMUNIDAD · PAZ
          </p>

          <h1>
            Construimos
            <br />
            <span>cambio juntos.</span>
          </h1>

          <p className="brand-panel__description">
            Formación Javeriana para el Cambio Social y la Paz.
          </p>

          <div className="brand-panel__decoration" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="brand-panel__bottom">
          FORJA <span className="dot">●</span> JAVERIANA CALI
        </div>

        <div className="orb orb--one" aria-hidden="true"></div>
        <div className="orb orb--two" aria-hidden="true"></div>
      </aside>

      <main className="login-panel">
        <header className="login-panel__header">
          <Link
            href="/"
            className="back-link"
            aria-label="Volver al inicio"
            title="Volver al inicio"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                d="M19 12H5m7 7-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Volver</span>
          </Link>

          <img
            className="university-logo"
            src="/images/auth/javeriana-logo.png"
            alt="Pontificia Universidad Javeriana Cali"
          />
        </header>

        <section
          className="login-content"
          id="inicio"
          aria-labelledby="login-title"
        >
          <div className="login-card">
            <div className="login-card__eyebrow">
              <span className="accent-line"></span>
              PLATAFORMA FORJA
            </div>

            <h2 id="login-title">
              Bienvenido<span className="exclamation">.</span>
            </h2>

            <p className="login-card__subtitle">
              Ingresa tus datos para iniciar sesión en tu cuenta.
            </p>

            <form id="login-form" noValidate onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="username">Usuario</label>
                <div className="input-wrap">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="3.5" />
                    <path
                      d="M5.5 20c0-3.6 2.7-6 6.5-6s6.5 2.4 6.5 6"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Escribe tu usuario"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrap">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Escribe tu contraseña"
                    required
                  />

                  <button
                    className="password-toggle"
                    type="button"
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <button className="submit-button" type="submit">
                Iniciar sesión <span aria-hidden="true">→</span>
              </button>

              <p
                id="form-message"
                role="status"
                aria-live="polite"
                className="form-message"
              >
                {message}
              </p>
            </form>

            <div className="login-card__note">
              <span className="note-icon" aria-hidden="true">✳</span>
              Acceso exclusivo a la comunidad FORJA.
            </div>
          </div>
        </section>

        <footer className="login-footer">
          <span>© 2026 FORJA. Todos los derechos reservados.</span>
          <span>Javeriana Cali</span>
        </footer>
      </main>
    </div>
  );
}
