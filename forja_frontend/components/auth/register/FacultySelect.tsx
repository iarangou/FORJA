
export interface Faculty {
  id: number;
  name: string;
}

interface FacultySelectProps {
  value: string;
  faculties: Faculty[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function FacultySelect({
  value,
  faculties,
  onChange,
  error,
  disabled = false,
  isLoading = false,
}: FacultySelectProps) {
  return (
    <div className="register-field">
      <label htmlFor="register-faculty">
        Facultad
      </label>

      <div
        className={`input-wrap register-select-wrap ${
          error ? "input-wrap--error" : ""
        }`}
      >
        <select
          id="register-faculty"
          name="faculty_id"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled || isLoading}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "register-faculty-error" : undefined}
        >
          <option value="">
            {isLoading
              ? "Cargando facultades..."
              : "Selecciona tu facultad"}
          </option>

          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p
          id="register-faculty-error"
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
