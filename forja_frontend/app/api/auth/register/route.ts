
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL || "http://backend:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      typeof body.full_name !== "string" ||
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      body.password.length < 12
    ) {
      return NextResponse.json(
        { message: "Revisa los datos del formulario." },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: body.full_name,
        email: body.email,
        password: body.password,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            response.status === 400 || response.status === 409
              ? "No fue posible procesar el registro. Revisa los datos o intenta nuevamente."
              : "No fue posible completar la solicitud de registro.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: "No fue posible conectar con el servidor." },
      { status: 503 }
    );
  }
}
