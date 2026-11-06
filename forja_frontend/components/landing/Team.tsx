
const teamMembers = [
  {
    name: "Víctor Martínez",
    role: "Director",
    image: "/images/landing/victor.png",
    email: "vctrmrtnz@javerianacali.edu.co",
  },
  {
    name: "Alexandra Trochez",
    role: "Coordinadora de Territorios",
    image: "/images/landing/alexandra.png",
    email: "maria.trochez@javerianacali.edu.co",
  },
  {
    name: "Jhonattan Mauricio Blanco",
    role: "Profesional en RSU y aprendizaje-servicio",
    image: "/images/landing/jhonattan.png",
    email: "jhonattan.blanco@javerianacali.edu.co",
  },
];

export default function Team() {
  return (
    <section className="section team-section" id="equipo">
      <div className="container">
        <div className="section-heading team-heading">
          <div>
            <span className="eyebrow">
              04 / LAS PERSONAS DETRÁS DEL CAMBIO
            </span>

            <h2>
              Conoce al <span className="purple">equipo FORJA.</span>
            </h2>
          </div>

          <p>
            Personas que acompañan procesos, conectan saberes y
            construyen comunidad.
          </p>
        </div>

        <div className="team-grid">
          {teamMembers.map((member) => (
            <article className="team-card" key={member.email}>
              <img
                src={member.image}
                alt={`Retrato de ${member.name}`}
                loading="lazy"
              />

              <div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
                <a href={`mailto:${member.email}`}>
                  {member.email}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
