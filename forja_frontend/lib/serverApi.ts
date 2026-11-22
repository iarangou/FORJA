import { NextRequest, NextResponse } from "next/server";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:3001";

export async function proxyForja(
  request: NextRequest,
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" = "GET",
) {
  const token = request.cookies.get("forja_session")?.value;
  if (!token) {
    return NextResponse.json({ message: "Debes iniciar sesión." }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${INTERNAL_API_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(method === "GET" ? {} : { "Content-Type": "application/json" }),
      },
      ...(method === "GET" ? {} : { body: await request.text() }),
      cache: "no-store",
    });
    const responseText = await upstream.text();
    let payload: unknown = {};
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = { message: upstream.ok ? "Operación completada" : "Error de servidor" };
    }
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { message: "No fue posible conectar con el backend FORJA." },
      { status: 503 },
    );
  }
}
