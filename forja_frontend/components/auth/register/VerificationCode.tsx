
"use client";

import { useRef } from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
} from "react";

interface VerificationCodeProps {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  isLoading?: boolean;
  isResending?: boolean;
  error?: string;
}

export default function VerificationCode({
  email,
  code,
  onCodeChange,
  onVerify,
  onResend,
  onBack,
  isLoading = false,
  isResending = false,
  error,
}: VerificationCodeProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = code.padEnd(6, " ").slice(0, 6).split("");

  function updateDigit(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "");

    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      onCodeChange(next.join("").trimEnd());
      return;
    }

    const next = [...digits];
    next[index] = cleaned.slice(-1);

    onCodeChange(next.join("").trimEnd());

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleChange(
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    updateDigit(index, event.target.value);
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace") {
      event.preventDefault();

      const next = [...digits];

      if (next[index]) {
        next[index] = "";
      } else if (index > 0) {
        next[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }

      onCodeChange(next.join("").trimEnd());
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedCode) {
      onCodeChange(pastedCode);
      inputRefs.current[Math.min(pastedCode.length, 5)]?.focus();
    }
  }

  return (
    <div className="verification-step">
      <div className="verification-step__icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <rect x="2" y="5" width="20" height="14" rx="3" />
          <path d="m3 7 9 7 9-7" />
        </svg>
      </div>

      <h3>Verifica tu correo</h3>

      <p className="verification-step__description">
        Hemos enviado un código de seis dígitos a:
      </p>

      <p className="verification-step__email">
        {email}
      </p>

      <p className="verification-step__instructions">
        Ingresa el código para confirmar tu correo institucional.
      </p>

      <div
        className="verification-step__digits"
        role="group"
        aria-label="Código de verificación de seis dígitos"
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit === " " ? "" : digit}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            disabled={isLoading || isResending}
            aria-label={`Dígito ${index + 1}`}
            aria-invalid={Boolean(error)}
            autoComplete={index === 0 ? "one-time-code" : "off"}
          />
        ))}
      </div>

      {error && (
        <p className="verification-step__error" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        className="submit-button verification-step__button"
        onClick={onVerify}
        disabled={isLoading || isResending || !/^\d{6}$/.test(code)}
      >
        {isLoading ? (
          <span
            className="button-spinner"
            aria-hidden="true"
          />
        ) : (
          <>
            Verificar código
            <span aria-hidden="true">→</span>
          </>
        )}
      </button>

      <p className="verification-step__resend-text">
        ¿No recibiste el código?
      </p>

      <button
        type="button"
        className="verification-step__resend"
        onClick={onResend}
        disabled={isLoading || isResending}
      >
        {isResending ? "Reenviando..." : "Reenviar código"}
      </button>

      <button
        type="button"
        className="verification-step__back"
        onClick={onBack}
        disabled={isLoading || isResending}
      >
        ← Volver al registro
      </button>
    </div>
  );
}
