
"use client";

import { useState } from "react";
import type { ChangeEventHandler } from "react";

interface PasswordFieldProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  error?: string;
  disabled?: boolean;
}

export default function PasswordField({
  value,
  onChange,
  error,
  disabled = false,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="register-field">
      <label htmlFor="register-password">
        Contraseña
      </label>

      <div
        className={`input-wrap ${
          error ? "input-wrap--error" : ""
        }`}
      >
        <input
          id="register-password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "register-password-error" : undefined}
        />

        <button
          className="password-toggle"
          type="button"
          disabled={disabled}
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                d="M3 3l18 18M10.6 6.1A10.5 10.5 0 0 1 12 6c6.4 0 10 6 10 6a15 15 0 0 1-3.3 3.6M6.2 6.3C3.5 8.1 2 12 2 12s3.6 6 10 6a10.5 10.5 0 0 0 4.2-.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 10a3 3 0 0 0 4 4"
                strokeLinecap="round"
              />
            </svg>
          ) : (
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
          )}
        </button>
      </div>

      {error && (
        <p
          id="register-password-error"
          className="field-error"
          role="alert"
        >
          <span className="field-error__icon" aria-hidden="true">
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
