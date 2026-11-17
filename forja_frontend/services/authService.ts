
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    rol: number;
  };
}

export class AuthApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

export async function loginUser(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new AuthApiError(
      response.status,
      response.status === 401 || response.status === 403
        ? "Usuario o contraseña incorrectos."
        : "No fue posible iniciar sesión."
    );
  }

  return (await response.json()) as LoginResponse;
}
