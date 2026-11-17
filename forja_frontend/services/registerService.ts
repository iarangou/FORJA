
export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  faculty_id: number;
}

export interface RegisterResponse {
  message: string;
  expires_in: number;
}

export class RegisterApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "RegisterApiError";
  }
}

export async function registerUser(
  data: RegisterData
): Promise<RegisterResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new RegisterApiError(
      response.status,
      response.status === 429
        ? "Demasiadas solicitudes. Inténtalo más tarde."
        : "No fue posible procesar el registro. Inténtalo nuevamente."
    );
  }

  return (await response.json()) as RegisterResponse;
}
