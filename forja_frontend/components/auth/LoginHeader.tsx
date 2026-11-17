
import Link from "next/link";

export default function LoginHeader() {
  return (
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
  );
}
