
import BrandPanel from "./BrandPanel";
import LoginHeader from "./LoginHeader";
import LoginFooter from "./LoginFooter";
import LoginForm from "./LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="page-shell">
      <BrandPanel />

      <main className="login-panel">
        <LoginHeader />

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
              Bienvenido
              <span className="exclamation">.</span>
            </h2>

            <p className="login-card__subtitle">
              Ingresa tus datos para iniciar sesión en tu cuenta.
            </p>

            <LoginForm />

            {/* Invitación al registro */}
            <div className="login-card__note login-card__note--register">
              <p>¿Aún no tienes una cuenta?</p>

              <Link
                href="/register"
                className="login-register__link"
              >
                <span>Regístrate aquí</span>

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
