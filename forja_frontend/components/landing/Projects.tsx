
export default function Projects() {
  return (
    <section className="section purpose-section" id="proyectos">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / LO QUE NOS MUEVE</span>
            <h2>
              Un propósito que
              <br />
              <span className="purple">se convierte en acción.</span>
            </h2>
          </div>
          <p>
            Formación social y transformación construidas desde el diálogo,
            el encuentro y el trabajo conjunto.
          </p>
        </div>

        <div className="purpose-grid">
          <article className="purpose-card">
            <span className="card-number">01</span>
            <div className="purpose-symbol">✳</div>
            <h3>Formación social</h3>
            <p>
              Fortalecemos la capacidad de interpretar la realidad,
              comprometerse con ella y construir alternativas desde el
              sentido social de la profesión, mediante el encuentro y
              el intercambio de saberes.
            </p>
            <span className="card-bottom">APRENDER PARA TRANSFORMAR</span>
          </article>

          <article className="purpose-card highlight">
            <span className="card-number">02</span>
            <div className="purpose-symbol">↗</div>
            <h3>Impacto social</h3>
            <p>
              Construimos procesos, proyectos y estrategias que favorecen
              la transformación de comunidades y personas con necesidades
              reales, mediante el trabajo colaborativo entre estudiantes,
              profesores y actores sociales.
            </p>
            <span className="card-bottom">TRANSFORMAR EN CONJUNTO</span>
          </article>
        </div>

        <div className="features">
          <div className="feature-intro">
            <span className="eyebrow">NUESTRO ENFOQUE</span>
            <h3>Proyectos con sentido y compromiso.</h3>
          </div>

          <div className="feature-list">
            <div>
              <span className="feature-icon">01</span>
              <p>
                <strong>Carácter procesal</strong>
                <br />
                Perspectiva de trabajo a mediano y largo plazo con los
                actores vinculados.
              </p>
            </div>

            <div>
              <span className="feature-icon">02</span>
              <p>
                <strong>Vínculo relacional</strong>
                <br />
                Encuentro entre la comunidad educativa y las comunidades locales.
              </p>
            </div>

            <div>
              <span className="feature-icon">03</span>
              <p>
                <strong>Trabajo colaborativo</strong>
                <br />
                Proyectos construidos junto a actores sociales, valorando
                sus saberes y capacidades.
              </p>
            </div>

            <div>
              <span className="feature-icon">04</span>
              <p>
                <strong>Sentido de cambio</strong>
                <br />
                Transformación del contexto con sentido de justicia
                socioambiental.
              </p>
            </div>

            <div>
              <span className="feature-icon">05</span>
              <p>
                <strong>Reconciliar a desavenidos</strong>
                <br />
                Respuesta a necesidades de población vulnerable a través
                del diálogo y la amistad social.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
