
export default function About() {
  return (
    <section className="section intro-section" id="nosotros">
      <div className="container intro-grid">
        <div>
          <span className="eyebrow">01 / NUESTRA ESENCIA</span>
          <h2>
            ¿Qué es <span className="purple">FORJA?</span>
          </h2>
          <div className="accent-rule"></div>
        </div>

        <div className="intro-content">
          <p className="lead">
            Somos un programa institucional que busca generar
            espacios de aprendizaje y transformación social.
          </p>

          <p>
            A través del intercambio de saberes entre comunidades,
            profesores y estudiantes, promovemos un impacto positivo
            en el contexto como expresión de la responsabilidad y
            el compromiso de la comunidad Javeriana con la región.
          </p>

          <a href="#proyectos" className="text-link">
            Descubre lo que nos mueve
            <span aria-hidden="true"> ↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
