
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL || "http://backend:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      typeof body.email !== "string" ||
      !body.email.trim() ||
      typeof body.code !== "string" ||
      !/^\d{6}$/.test(body.code)
    ) {
      return NextResponse.json(
        { message: "Ingresa un código válido de seis dígitos." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_URL}/auth/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: body.email.trim().toLowerCase(),
          code: body.code,
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            response.status === 400 ||
            response.status === 401
              ? "El código es incorrecto, venció o ya fue utilizado."
              : response.status === 429
                ? "Demasiados intentos. Inténtalo más tarde."
                : "No fue posible verificar el correo.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Error de comunicación con el servidor." },
      { status: 503 }
    );
  }
}
