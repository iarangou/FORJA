
import Link from "next/link";
import BrandPanel from "../BrandPanel";
import LoginFooter from "../LoginFooter";
import RegistrationFlow from "./RegistrationFlow";

export default function RegisterPage() {
  return (
    <div className="page-shell">
      <BrandPanel />

      <main className="login-panel">
        <header className="login-panel__header">
          <Link
            href="/login"
            className="back-link"
            aria-label="Volver al inicio de sesión"
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
          aria-labelledby="register-title"
        >
          <div className="login-card">
            <div className="login-card__eyebrow">
              <span className="accent-line"></span>
              PLATAFORMA FORJA
            </div>

            <h2 id="register-title">
              Crea tu cuenta
              <span className="exclamation">.</span>
            </h2>

            <p className="login-card__subtitle">
              Regístrate para formar parte de la comunidad FORJA.
            </p>

            {/* Formulario de registro */}
            <RegistrationFlow />
            
            <div className="register-login">
              <p className="register-login__text">
                ¿Ya tienes una cuenta?
              </p>

              <Link
                href="/login"
                className="register-login__button"
              >
                <span>Iniciar sesión</span>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
        <LoginFooter />
      </main>
    </div>
  );
}