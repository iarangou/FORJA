
import type { Faculty } from "@/components/auth/register/FacultySelect";

export async function getFaculties(): Promise<Faculty[]> {
  const response = await fetch("/api/faculty", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar las facultades.");
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Formato de facultades no reconocido.");
  }

  const isFaculty = (item: unknown): item is Faculty => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const value = item as Record<string, unknown>;

    return (
      typeof value.id === "number" &&
      Number.isInteger(value.id) &&
      typeof value.name === "string"
    );
  };

  if (!data.every(isFaculty)) {
    throw new Error("Los datos de facultades no tienen el formato esperado.");
  }

  return data;
}
