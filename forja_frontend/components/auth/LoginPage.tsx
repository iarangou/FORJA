
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
              <p>¿Todavía no tienes cuenta? Regístrate con tu correo institucional; después el administrador aprobará tu acceso.</p>
              <Link href="/register" className="register-login__button">Crear cuenta <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        <LoginFooter />
      </main>
    </div>
  );
}
