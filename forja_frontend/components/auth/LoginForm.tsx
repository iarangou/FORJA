
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { loginUser, AuthApiError } from "@/services/authService";
import SubmitButton from "./SubmitButton";

type MessageType = "error" | "success" | null;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<MessageType>(null);

  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function clearMessage() {
    setMessage("");
    setMessageType(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    const formData = new FormData(event.currentTarget);

    const username = String(
      formData.get("username") ?? ""
    ).trim();

    const password = String(
      formData.get("password") ?? ""
    );

    const isUsernameEmpty = username.length === 0;
    const isPasswordEmpty = password.length === 0;

    setUsernameError(isUsernameEmpty);
    setPasswordError(isPasswordEmpty);
    clearMessage();

    if (isUsernameEmpty || isPasswordEmpty) {
      return;
    }

    setIsLoading(true);

    try {
      // Se conserva la autenticación real con NestJS.
      const response = await loginUser({
        username,
        password,
      });

      setMessageType("success");
      setMessage(
        `Inicio de sesión correcto. Bienvenido, ${response.user.username}.`
      );
      window.location.assign("/proyectos");
    } catch (error: unknown) {
      setMessageType("error");

      if (error instanceof AuthApiError) {
        if (error.status === 401 || error.status === 403) {
          setMessage("Usuario o contraseña incorrectos.");
        } else if (error.status === 429) {
          setMessage(
            "Demasiados intentos. Inténtalo nuevamente más tarde."
          );
        } else {
          setMessage(
            "No fue posible iniciar sesión. Inténtalo nuevamente."
          );
        }
      } else {
        setMessage(
          "No fue posible conectar con el servidor. Inténtalo nuevamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      id="login-form"
      noValidate
      onSubmit={handleSubmit}
    >
      {/* Usuario */}

      <div className="field">
        <label htmlFor="username">
          Usuario
        </label>

        <div
          className={`input-wrap ${
            usernameError ? "input-wrap--error" : ""
          }`}
        >
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
            disabled={isLoading}
            aria-invalid={usernameError}
            aria-describedby={
              usernameError ? "username-error" : undefined
            }
            onChange={() => {
              setUsernameError(false);
              clearMessage();
            }}
          />
        </div>

        {usernameError && (
          <p
            id="username-error"
            className="field-error"
            role="alert"
          >
            <span
              className="field-error__icon"
              aria-hidden="true"
            >
              !
            </span>
            El usuario es obligatorio.
          </p>
        )}
      </div>

      {/* Contraseña */}

      <div className="field">
        <label htmlFor="password">
          Contraseña
        </label>

        <div
          className={`input-wrap ${
            passwordError ? "input-wrap--error" : ""
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect
              x="5"
              y="10"
              width="14"
              height="11"
              rx="2"
            />
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
            disabled={isLoading}
            aria-invalid={passwordError}
            aria-describedby={
              passwordError ? "password-error" : undefined
            }
            onChange={() => {
              setPasswordError(false);
              clearMessage();
            }}
          />

          <button
            className="password-toggle"
            type="button"
            disabled={isLoading}
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

        {passwordError && (
          <p
            id="password-error"
            className="field-error"
            role="alert"
          >
            <span
              className="field-error__icon"
              aria-hidden="true"
            >
              !
            </span>
            La contraseña es obligatoria.
          </p>
        )}
      </div>

      {/* Botón de acceso */}

      <SubmitButton isLoading={isLoading} />

      {/* Mensajes del formulario */}

      {message && (
        <p
          id="form-message"
          role={messageType === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`form-message ${
            messageType === "error"
              ? "form-message--error"
              : "form-message--success"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
