
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-texture" aria-hidden="true">
        <span className="orbit orbit-one"></span>
        <span className="orbit orbit-two"></span>
        <span className="hero-sun"></span>
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow light">
            <span className="eyebrow-line"></span>
            FORMACIÓN · COMUNIDAD · TRANSFORMACIÓN
          </span>

          <h1>
            Los proyectos que <em>transforman</em> realidades merecen ser reconocidos.
          </h1>

          <p>
            Un espacio para registrar, documentar y dar visibilidad a las
            iniciativas que construyen cambio social y paz desde las comunidades.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-orange" href="/login">
              Acceder a la plataforma <span aria-hidden="true">↗</span>
            </Link>

            <a className="btn btn-outline" href="#nosotros">
              Conoce FORJA <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="art-outline"></div>
          <div className="art-disk">
            <span className="disk-ring ring-a"></span>
            <span className="disk-ring ring-b"></span>
            <span className="disk-ring ring-c"></span>
          </div>

          <div className="art-note note-one">
            <span className="note-mark">✳</span>
            <span>Aprender con otros</span>
          </div>

          <div className="art-note note-two">
            <span className="note-mark">↗</span>
            <span>Transformar en comunidad</span>
          </div>

          <span className="art-spark spark-one">✦</span>
          <span className="art-spark spark-two">✺</span>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="container hero-bottom-inner">
          <span>PROGRAMA FORJA</span>
          <span>FORMACIÓN JAVERIANA PARA EL CAMBIO SOCIAL Y LA PAZ</span>
          <a href="#nosotros" aria-label="Desplazarse hacia abajo">
            ↓
          </a>
        </div>
      </div>
    </section>
  );
}
