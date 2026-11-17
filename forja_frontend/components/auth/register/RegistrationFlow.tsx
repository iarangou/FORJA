
"use client";

import { useState } from "react";

import RegisterForm from "./RegisterForm";
import VerificationCode from "./VerificationCode";
import RegistrationSuccess from "./RegistrationSuccess";

import {
  verifyEmail,
  resendVerification,
} from "@/services/verificationService";

type RegistrationStep = "form" | "verification" | "success";

export default function RegistrationFlow() {
  const [step, setStep] = useState<RegistrationStep>("form");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function handleRegistered(registeredEmail: string) {
    setEmail(registeredEmail);
    setCode("");
    setError("");
    setNotice("");
    setStep("verification");
  }

  function handleCodeChange(nextCode: string) {
    setCode(nextCode);
    setError("");
    setNotice("");
  }

  async function handleVerify() {
    if (isVerifying || isResending) return;

    if (!/^\d{6}$/.test(code)) {
      setError("Ingresa los seis dígitos del código.");
      return;
    }

    setIsVerifying(true);
    setError("");
    setNotice("");

    try {
      await verifyEmail(email, code);

      // Solo avanzar si NestJS confirma la verificación.
      setCode("");
      setStep("success");
    } catch (error: unknown) {
      if (error instanceof Error && error.message) {
        setError(error.message);
      } else {
        setError(
          "No fue posible verificar el código. Inténtalo nuevamente."
        );
      }
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (isResending || isVerifying) return;

    setIsResending(true);
    setError("");
    setNotice("");

    try {
      await resendVerification(email);

      setCode("");
      setNotice(
        "Se ha solicitado un nuevo código. Revisa tu correo institucional."
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.message) {
        setError(error.message);
      } else {
        setError(
          "No fue posible reenviar el código. Inténtalo nuevamente."
        );
      }
    } finally {
      setIsResending(false);
    }
  }

  function handleBack() {
    if (isVerifying || isResending) return;

    setCode("");
    setError("");
    setNotice("");
    setStep("form");
  }

  if (step === "success") {
    return <RegistrationSuccess email={email} />;
  }

  if (step === "verification") {
    return (
      <>
        <VerificationCode
          email={email}
          code={code}
          onCodeChange={handleCodeChange}
          onVerify={handleVerify}
          onResend={handleResend}
          onBack={handleBack}
          isLoading={isVerifying}
          isResending={isResending}
          error={error}
        />

        {notice && (
          <p
            className="verification-step__notice"
            role="status"
            aria-live="polite"
          >
            {notice}
          </p>
        )}
      </>
    );
  }

  return <RegisterForm onRegistered={handleRegistered} />;
}
