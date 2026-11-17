
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import RegisterField from "./RegisterField";
import PasswordField from "./PasswordField";
import FacultySelect from "./FacultySelect";
import type { Faculty } from "./FacultySelect";

import { getFaculties } from "@/services/facultyService";
import {
  registerUser,
  RegisterApiError,
} from "@/services/registerService";

interface RegisterErrors {
  full_name?: string;
  email?: string;
  faculty_id?: string;
  password?: string;
}

interface RegisterFormProps {
  onRegistered: (email: string) => void;
}

export default function RegisterForm({
  onRegistered,
}: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [password, setPassword] = useState("");

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(true);
  const [facultyLoadError, setFacultyLoadError] = useState("");

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadFaculties() {
      try {
        const result = await getFaculties();

        if (active) {
          setFaculties(result);
          setFacultyLoadError("");
        }
      } catch {
        if (active) {
          setFacultyLoadError(
            "No pudimos cargar las facultades. Actualiza la página."
          );
        }
      } finally {
        if (active) {
          setIsLoadingFaculties(false);
        }
      }
    }

    loadFaculties();

    return () => {
      active = false;
    };
  }, []);

  function clearError(field: keyof RegisterErrors) {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const nextErrors: RegisterErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!fullName.trim()) {
      nextErrors.full_name = "Ingresa tu nombre completo.";
    }

    if (!normalizedEmail) {
      nextErrors.email = "Ingresa tu correo institucional.";
    } else if (
      !/^[^\s@]+@javerianacali\.edu\.co$/i.test(normalizedEmail)
    ) {
      nextErrors.email =
        "Utiliza tu correo institucional @javerianacali.edu.co.";
    }

    if (
      !facultyId ||
      !faculties.some(
        (faculty) => faculty.id === Number(facultyId)
      )
    ) {
      nextErrors.faculty_id = "Selecciona una facultad válida.";
    }

    if (!password) {
      nextErrors.password = "Ingresa una contraseña.";
    } else if (password.length < 8) {
      nextErrors.password =
        "La contraseña debe tener mínimo 8 caracteres.";
    }

    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await registerUser({
        full_name: fullName.trim(),
        email: normalizedEmail,
        password,
        faculty_id: Number(facultyId),
      });

      // Solo avanzamos cuando NestJS confirma el registro pendiente.
      onRegistered(normalizedEmail);
    } catch (error: unknown) {
      if (error instanceof RegisterApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError(
          "No fue posible conectar con el servidor. Inténtalo nuevamente."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="register-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <RegisterField
        id="register-name"
        name="full_name"
        label="Nombre completo"
        type="text"
        autoComplete="name"
        placeholder="Escribe tu nombre completo"
        value={fullName}
        disabled={isSubmitting}
        onChange={(event) => {
          setFullName(event.target.value);
          clearError("full_name");
        }}
        error={errors.full_name}
      />

      <RegisterField
        id="register-email"
        name="email"
        label="Correo institucional"
        type="email"
        autoComplete="email"
        placeholder="nombre@javerianacali.edu.co"
        value={email}
        disabled={isSubmitting}
        onChange={(event) => {
          setEmail(event.target.value);
          clearError("email");
        }}
        error={errors.email}
      />

      <FacultySelect
        value={facultyId}
        faculties={faculties}
        isLoading={isLoadingFaculties}
        disabled={isSubmitting || Boolean(facultyLoadError)}
        onChange={(value) => {
          setFacultyId(value);
          clearError("faculty_id");
        }}
        error={errors.faculty_id}
      />

      {facultyLoadError && (
        <p className="field-error" role="alert">
          {facultyLoadError}
        </p>
      )}

      <PasswordField
        value={password}
        disabled={isSubmitting}
        onChange={(event) => {
          setPassword(event.target.value);
          clearError("password");
        }}
        error={errors.password}
      />

      {submitError && (
        <p className="form-message form-message--error" role="alert">
          {submitError}
        </p>
      )}

      <button
        className="submit-button"
        type="submit"
        disabled={
          isSubmitting ||
          isLoadingFaculties ||
          Boolean(facultyLoadError)
        }
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <span
            className="button-spinner"
            aria-hidden="true"
          />
        ) : (
          <>
            Continuar
            <span aria-hidden="true">→</span>
          </>
        )}
      </button>
    </form>
  );
}
