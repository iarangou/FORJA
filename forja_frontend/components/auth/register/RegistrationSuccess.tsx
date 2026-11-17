
import Link from "next/link";

interface RegistrationSuccessProps {
  email: string;
}

export default function RegistrationSuccess({
  email,
}: RegistrationSuccessProps) {
  return (
    <div className="registration-success" role="status">
      <div
        className="registration-success__icon"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M5 12.5 10 17l9-10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h3>¡Correo verificado!</h3>

      <p className="registration-success__description">
        Hemos verificado correctamente tu correo institucional.
      </p>

      <p className="registration-success__email">
        {email}
      </p>

      <div className="registration-success__notice">
        <strong>Tu cuenta está pendiente de aprobación.</strong>

        <p>
          Un administrador de FORJA deberá aprobar tu cuenta
          antes de que puedas iniciar sesión.
        </p>
      </div>

      <Link
        href="/login"
        className="registration-success__link"
      >
        Volver al inicio de sesión
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
