
interface SubmitButtonProps {
  isLoading: boolean;
}

export default function SubmitButton({
  isLoading,
}: SubmitButtonProps) {
  return (
    <button
      className="submit-button"
      type="submit"
      disabled={isLoading}
      aria-busy={isLoading}
      aria-label={isLoading ? "Iniciando sesión" : undefined}
    >
      {isLoading ? (
        <span
          className="button-spinner"
          aria-hidden="true"
        />
      ) : (
        <>
          Iniciar sesión
          <span aria-hidden="true">→</span>
        </>
      )}
    </button>
  );
}
