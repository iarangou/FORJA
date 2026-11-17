
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL || "http://backend:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      typeof body.email !== "string" ||
      !body.email.trim()
    ) {
      return NextResponse.json(
        { message: "Ingresa un correo válido." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_URL}/auth/resend-verification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: body.email.trim().toLowerCase(),
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            response.status === 429
              ? "Demasiadas solicitudes. Inténtalo más tarde."
              : "No fue posible procesar el reenvío del código.",
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
