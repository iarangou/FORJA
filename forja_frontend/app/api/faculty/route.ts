
import { NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL || "http://backend:3001";

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/faculty`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "No fue posible cargar las facultades." },
        { status: response.status }
      );
    }

    const faculties = await response.json();

    return NextResponse.json(faculties);
  } catch {
    return NextResponse.json(
      { message: "Error de conexión con el servidor." },
      { status: 503 }
    );
  }
}
