
import Link from "next/link";

export default function Closing() {
  return (
    <section className="closing" id="contacto">
      <div className="container closing-inner">
        <div>
          <span className="eyebrow light">
            TU PROYECTO, TU IMPACTO
          </span>

          <h2>
            Hagamos visible
            <br />
            <em>lo que transforma.</em>
          </h2>

          <p>
            Accede a la plataforma para la certificación
            de proyectos FORJA.
          </p>
        </div>

        <div className="closing-actions">
          <Link className="btn btn-orange" href="/login">
            Acceder a FORJA ↗
          </Link>

          <a
            className="btn btn-outline"
            href="mailto:Forja@javerianacali.edu.co?subject=Consulta%20sobre%20registro%20FORJA"
          >
            Consultar registro ↗
          </a>
        </div>
      </div>
    </section>
  );
}
