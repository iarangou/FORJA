"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("No se pudo cerrar sesión.");
      router.replace("/login");
      router.refresh();
    } catch {
      setBusy(false);
      window.alert("No se pudo cerrar la sesión. Inténtalo nuevamente.");
    }
  }
  return <button type="button" onClick={logout} disabled={busy} className="forja-logout">
    {busy ? "Cerrando..." : "Cerrar sesión"}
  </button>;
}
