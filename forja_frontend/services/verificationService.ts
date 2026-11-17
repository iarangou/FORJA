
export interface VerificationResponse {
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
  expires_in: number;
}

export class VerificationApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "VerificationApiError";
  }
}

async function postVerification<T>(
  endpoint: string,
  body: Record<string, string>
): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "No fue posible procesar la solicitud.";

    throw new VerificationApiError(
      response.status,
      message
    );
  }

  return data as T;
}

export async function verifyEmail(
  email: string,
  code: string
): Promise<VerificationResponse> {
  return postVerification<VerificationResponse>(
    "/api/auth/verify-email",
    { email, code }
  );
}

export async function resendVerification(
  email: string
): Promise<ResendVerificationResponse> {
  return postVerification<ResendVerificationResponse>(
    "/api/auth/resend-verification",
    { email }
  );
}
