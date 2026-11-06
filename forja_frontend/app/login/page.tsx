
import "@/styles/login.css";
import LoginPage from "@/components/auth/LoginPage";

export const metadata = {
  title: "Iniciar sesión | FORJA",
  description:
    "Acceso al espacio FORJA de la Pontificia Universidad Javeriana Cali.",
};

export default function Login() {
  return <LoginPage />;
}
