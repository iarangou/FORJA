
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL || "http://backend:3001";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return NextResponse.json(
        { message: "Usuario y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            response.status === 401
              ? "Credenciales inválidas o cuenta inactiva."
              : "No fue posible iniciar sesión.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (typeof data.access_token !== "string") {
      throw new Error("El backend no devolvió un token válido.");
    }

    const result = NextResponse.json({
      user: data.user,
      message: "Inicio de sesión correcto.",
    });

    result.cookies.set("forja_session", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7200,
    });

    return result;
  } catch {
    return NextResponse.json(
      { message: "Error de comunicación con el servidor." },
      { status: 500 }
    );
  }
}
