
export default function BrandPanel() {
  return (
    <aside
      className="brand-panel"
      aria-label="Presentación de FORJA"
    >
      <div className="brand-panel__top">
        <span className="brand-panel__eyebrow">
          PONTIFICIA UNIVERSIDAD JAVERIANA · CALI
        </span>
      </div>

      <div className="brand-panel__content">
        <div className="forja-mark">
          <img
            src="/images/auth/forja-logo.png"
            alt="FORJA — Formación Javeriana para el Cambio Social y la Paz"
          />
        </div>

        <p className="brand-panel__kicker">
          FORMACIÓN · COMUNIDAD · PAZ
        </p>

        <h1>
          Construimos
          <br />
          <span>cambio juntos.</span>
        </h1>

        <p className="brand-panel__description">
          Formación Javeriana para el Cambio Social y la Paz.
        </p>

        <div
          className="brand-panel__decoration"
          aria-hidden="true"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="brand-panel__bottom">
        FORJA <span className="dot">●</span> JAVERIANA CALI
      </div>

      <div
        className="orb orb--one"
        aria-hidden="true"
      ></div>

      <div
        className="orb orb--two"
        aria-hidden="true"
      ></div>
    </aside>
  );
}
