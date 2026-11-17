
import type { InputHTMLAttributes } from "react";

interface RegisterFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  error?: string;
}

export default function RegisterField({
  id,
  label,
  error,
  ...inputProps
}: RegisterFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="register-field">
      <label htmlFor={id}>
        {label}
      </label>

      <div
        className={`input-wrap ${
          error ? "input-wrap--error" : ""
        }`}
      >
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
      </div>

      {error && (
        <p
          id={errorId}
          className="field-error"
          role="alert"
        >
          <span
            className="field-error__icon"
            aria-hidden="true"
          >
            !
          </span>

          {error}
        </p>
      )}
    </div>
  );
}