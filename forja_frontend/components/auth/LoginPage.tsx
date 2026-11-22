
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

            <div className="login-card__note login-card__note--register">
              <p>Si necesitas acceso, solicita al administrador FORJA que cree tu cuenta.</p>
            </div>
          </div>
        </section>

        <LoginFooter />
      </main>
    </div>
  );
}
